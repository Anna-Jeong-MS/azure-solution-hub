// @ts-nocheck
/**
 * 워크샵 표준화 (baseline 자동화)
 * ---------------------------------------------------------------------------
 * docs/workshops/workshops.md 에서 `included: true` 로 표시된 워크샵을 찾아,
 * 사이트 공통 단계형(step) 포맷으로 표준화합니다.
 *   1) GitHub 레포 구조를 분석해 단계를 판별
 *      - 유형 A: 단계 폴더(각 폴더에 README.md)
 *      - 유형 B: 루트 단계 .md 파일(README 하단 'Contents' 순서)
 *   2) docs/workshops/<slug>/index.md 를 생성 (개요 + 단계, 첫 단계는 개요)
 *   3) workshops.md 항목에 `folder: <slug>` 연결
 *   4) docs/sitemap.xml, docs/llms.txt 에 뷰어 URL 반영
 *
 * 이미 index.md 가 있으면 콘텐츠는 건드리지 않고 folder/SEO 연결만 보정합니다.
 * (사람이 다듬은 매니페스트를 덮어쓰지 않기 위함)
 *
 * 실행: GitHub Actions(workshops.md 변경 시) 또는 로컬 `node scripts/standardize-workshops.mjs`
 * 상세 규칙은 .github/skills/workshop-standardization/SKILL.md 를 참고하세요.
 */

import { writeFile, readFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DOCS = join(ROOT, 'docs');
const WORKSHOPS_MD = join(DOCS, 'workshops', 'workshops.md');
const SITEMAP = join(DOCS, 'sitemap.xml');
const LLMS = join(DOCS, 'llms.txt');
const HOST = 'https://microsoft.github.io/azure-solution-hub';

const GH_HEADERS = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'azure-solution-hub-standardizer',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

const exists = (p) => access(p).then(() => true).catch(() => false);
const today = () => new Date().toISOString().slice(0, 10);

/** 레포 URL 에서 owner/repo 추출 */
function repoOf(url) {
  const m = String(url).match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/i);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, '') };
}

/** kebab-case 슬러그 */
function slugify(name) {
  return String(name)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/** URL 경로 인코딩 (세그먼트별) */
function encodePath(p) {
  return p.split('/').map(encodeURIComponent).join('/');
}

/** workshops.md 파싱 → included 항목 목록 */
function parseIncluded(text) {
  const lines = text.split(/\r?\n/);
  const items = [];
  let cur = null;
  const flush = () => { if (cur) items.push(cur); cur = null; };
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (line.startsWith('### ')) {
      flush();
      let title = line.slice(4).trim().replace(/\s*\([^)]*\)\s*$/, '');
      cur = { title, headerLine: i, included: false, folder: '', repo: '', lastLine: i };
      continue;
    }
    if (!cur) continue;
    if (line.startsWith('## ') || line.startsWith('<!--')) { flush(); continue; }
    cur.lastLine = i;
    if (/^included\s*:/i.test(line)) { cur.included = /^(true|yes|1)$/i.test(line.split(':')[1].trim()); continue; }
    const fm = line.match(/^folder\s*:\s*([A-Za-z0-9_-]+)/i);
    if (fm) { cur.folder = fm[1]; continue; }
    const gh = line.match(/https?:\/\/github\.com\/[^\s)\]]+/i);
    if (gh && !cur.repo) cur.repo = gh[0];
  }
  flush();
  return items.filter((w) => w.included && w.repo);
}

/** README 하단 Contents 목록(표시명) 순서 추출 */
function parseContentsOrder(readme) {
  const m = readme.match(/^#{1,6}\s*Contents\s*$([\s\S]*?)(?:^#{1,6}\s|\Z)/im);
  if (!m) return [];
  const names = [];
  for (const l of m[1].split(/\r?\n/)) {
    const t = l.replace(/<br\s*\/?>/gi, '').trim();
    const mm = t.match(/^(?:\d+[.)]\s*|[-*]\s*)(.+)$/);
    if (mm) names.push(mm[1].trim());
  }
  return names;
}

/** README 에서 개요(제목 다음 ~ 첫 '## ' 이전) 추출 */
function parseOverview(readme) {
  const noComments = readme.replace(/<!--[\s\S]*?-->/g, '');
  const lines = noComments.split(/\r?\n/);
  let title = '';
  const body = [];
  let started = false;
  for (const l of lines) {
    const t = l.trim();
    if (!title && /^#\s+/.test(t)) { title = t.replace(/^#\s+/, '').trim(); started = true; continue; }
    if (!started) continue;
    if (/^#{2,6}\s+/.test(t)) break; // 첫 하위 섹션에서 개요 종료
    body.push(l);
  }
  const clean = body
    .filter((l) => !/^!\[/.test(l.trim())) // 이미지 라인 제외
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { title, overview: clean };
}

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

/** 레포 구조 분석 → { title, overview, steps:[{title, source, desc}] } */
async function analyzeRepo(owner, repo) {
  const meta = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: GH_HEADERS }).then((r) => (r.ok ? r.json() : null));
  const branch = (meta && meta.default_branch) || 'main';
  const tree = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { headers: GH_HEADERS }).then((r) => (r.ok ? r.json() : null));
  if (!tree || !Array.isArray(tree.tree)) throw new Error(`레포 트리를 읽지 못했습니다: ${owner}/${repo}`);

  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
  const readme = await fetch(`${rawBase}/README.md`, { cache: 'no-cache' }).then((r) => (r.ok ? r.text() : '')).catch(() => '');
  const { title: readmeTitle, overview } = parseOverview(readme);
  const title = readmeTitle || repo;

  const blobs = tree.tree.filter((n) => n.type === 'blob');
  const dirsWithReadme = [
    ...new Set(
      blobs
        .filter((n) => /^[^/]+\/README\.md$/i.test(n.path))
        .map((n) => n.path.split('/')[0])
    ),
  ];

  let steps = [];

  if (dirsWithReadme.length >= 1) {
    // 유형 A: 단계 폴더
    const leadNum = (s) => { const m = s.match(/^\s*(\d+)/); return m ? parseInt(m[1], 10) : 999; };
    dirsWithReadme.sort((a, b) => leadNum(a) - leadNum(b) || a.localeCompare(b));
    steps = dirsWithReadme.map((d) => ({
      title: d.replace(/^\s*\d+[.)]\s*/, (m) => m).trim(),
      source: `${rawBase}/${encodePath(d)}/README.md`,
      desc: '',
    }));
  } else {
    // 유형 B: 루트 단계 .md 파일
    const rootMd = blobs
      .map((n) => n.path)
      .filter((p) => /^[^/]+\.md$/i.test(p) && !/^readme\.md$/i.test(p));
    const order = parseContentsOrder(readme);
    const ordered = [];
    const used = new Set();
    for (const name of order) {
      const hit = rootMd.find((p) => !used.has(p) && norm(p.replace(/\.md$/i, '')).includes(norm(name)));
      if (hit) { ordered.push(hit); used.add(hit); }
    }
    for (const p of rootMd) if (!used.has(p)) ordered.push(p);
    steps = ordered.map((p) => ({
      title: p.replace(/\.md$/i, ''),
      source: `${rawBase}/${encodePath(p)}`,
      desc: '',
    }));
  }

  return { title, overview, steps };
}

/** index.md 매니페스트 텍스트 생성 (baseline) */
function renderManifest({ repoUrl, title, overview, steps }) {
  const head = [
    '<!-- 자동 생성(baseline). 개요/단계 설명은 필요 시 다듬으세요. 형식: workshops/_template/index.md -->',
    '',
    `# ${title}`,
    `repo: ${repoUrl}`,
    '',
    overview ? overview : '> 이 워크샵의 개요입니다.',
    '',
    '### 진행 방법',
    '',
    '왼쪽의 **실습 단계**를 순서대로 선택하며 진행합니다. 각 단계의 상세 지침과 화면은 원본 저장소에서 실시간으로 불러옵니다.',
    '',
  ].join('\n');
  const body = steps
    .map((s, i) => `## ${i + 1}. ${s.title}\nsource: ${s.source}${s.desc ? `\n${s.desc}` : ''}`)
    .join('\n\n');
  return `${head}\n${body}\n`;
}

/** workshops.md 항목에 folder 줄 추가 (없을 때) */
function ensureFolderLine(text, item, slug) {
  if (item.folder) return text;
  const lines = text.split(/\r?\n/);
  // included 줄 바로 다음에 삽입, 없으면 헤더 다음
  let insertAt = item.headerLine + 1;
  for (let i = item.headerLine + 1; i <= item.lastLine; i++) {
    if (/^\s*included\s*:/i.test(lines[i])) { insertAt = i + 1; break; }
  }
  lines.splice(insertAt, 0, `folder: ${slug}`);
  return lines.join('\n');
}

/** sitemap.xml 에 뷰어 URL 추가 (없을 때) */
function ensureSitemap(xml, slug) {
  const loc = `${HOST}/workshop.html?slug=${slug}`;
  if (xml.includes(loc)) return xml;
  const entry = `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today()}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  return xml.replace(/<\/urlset>/, `${entry}</urlset>`);
}

/** llms.txt 에 뷰어 링크 추가 (없을 때) */
function ensureLlms(txt, slug, title) {
  const url = `${HOST}/workshop.html?slug=${slug}`;
  if (txt.includes(url)) return txt;
  const line = `- [${title}](${url}): 단계별 실습 워크샵.`;
  if (/##\s*Hands-on Workshops/i.test(txt)) {
    return txt.replace(/(##\s*Hands-on Workshops[^\n]*\n)/i, `$1${line}\n`);
  }
  return `${txt.trimEnd()}\n\n## Hands-on Workshops\n\n${line}\n`;
}

async function main() {
  let wsText = await readFile(WORKSHOPS_MD, 'utf8');
  const items = parseIncluded(wsText);
  if (!items.length) {
    console.log('included: true 워크샵이 없습니다. 종료합니다.');
    return;
  }

  let sitemap = await readFile(SITEMAP, 'utf8').catch(() => '');
  let llms = await readFile(LLMS, 'utf8').catch(() => '');

  for (const item of items) {
    const info = repoOf(item.repo);
    if (!info) { console.warn(`레포 URL 파싱 실패: ${item.title}`); continue; }
    const slug = item.folder || slugify(info.repo);
    const dir = join(DOCS, 'workshops', slug);
    const manifestPath = join(dir, 'index.md');

    if (await exists(manifestPath)) {
      console.log(`유지: ${slug} (index.md 이미 존재) — 연결만 확인`);
    } else {
      console.log(`생성: ${slug} ← ${info.owner}/${info.repo}`);
      try {
        const analyzed = await analyzeRepo(info.owner, info.repo);
        const manifest = renderManifest({ repoUrl: item.repo, ...analyzed });
        await mkdir(dir, { recursive: true });
        await writeFile(manifestPath, manifest, 'utf8');
      } catch (e) {
        console.error(`  분석 실패(${slug}): ${e.message}`);
        continue;
      }
    }

    // 연결(folder) + SEO 보정
    wsText = ensureFolderLine(wsText, item, slug);
    sitemap = ensureSitemap(sitemap, slug);
    llms = ensureLlms(llms, slug, item.title);
  }

  await writeFile(WORKSHOPS_MD, wsText, 'utf8');
  if (sitemap) await writeFile(SITEMAP, sitemap, 'utf8');
  if (llms) await writeFile(LLMS, llms, 'utf8');
  console.log('완료.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
