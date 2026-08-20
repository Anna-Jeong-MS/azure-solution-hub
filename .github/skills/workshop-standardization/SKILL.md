---
name: workshop-standardization
description: >
  Standardize a hands-on workshop into this site's common step-viewer format.
  USE WHEN docs/workshops/workshops.md is edited and a workshop entry contains
  `included: true`, or when the user asks to 표준화/standardize a workshop.
  Reads the workshop's GitHub repo, generates docs/workshops/<slug>/index.md
  (step manifest), wires `folder: <slug>` in workshops.md, and updates the SEO
  files. DO NOT USE FOR solution pages (solutions/) or unrelated content.
---

# Workshop standardization

이 스킬은 `docs/workshops/workshops.md` 의 워크샵 항목을 **사이트 공통 단계형(step) 포맷**으로
표준화합니다. 트리거는 워크샵 항목의 `included: true` 마커입니다.

## 트리거 판별

`docs/workshops/workshops.md` 에서 아래 조건을 모두 만족하는 `### 워크샵 제목` 항목이 대상입니다.

- `included: true` 줄이 있음
- 같은 항목에 GitHub 레포 링크(`https://github.com/<owner>/<repo>`)가 있음

이미 `docs/workshops/<slug>/index.md` 가 최신 상태라면 건너뜁니다(중복 생성 금지).

## 슬러그(slug) 결정

1. 항목에 `folder: <slug>` 가 있으면 그 값을 사용합니다.
2. 없으면 레포 이름을 kebab-case 로 변환해 슬러그를 만들고(`AzureBasicWorkshop` → `azure-basic-workshop`),
   표준화 후 `folder: <slug>` 를 항목에 추가합니다.
   슬러그는 `[a-z0-9-]` 만 사용합니다.

## 단계(step) 수집

대상 레포의 기본 브랜치 트리(`https://api.github.com/repos/<owner>/<repo>/git/trees/<branch>?recursive=1`)를
조회한 뒤, 아래 우선순위로 단계 구조를 판별합니다. **첫 단계는 항상 '개요'로 통일**하고,
개요 다음부터 실제 실습 단계를 배치합니다.

### 유형 A — 단계 폴더 방식 (예: Azure Basic Workshop)

- 최상위에 `README.md` 를 가진 폴더가 여러 개 있는 경우.
  보통 `1. …`, `2. …` 처럼 숫자로 시작합니다.
- 폴더 이름 앞의 숫자 기준 **오름차순 정렬**로 순서를 정합니다.
- 각 단계 source: `https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<폴더명>/README.md`

### 유형 B — 단계 .md 파일 방식 (예: Azure Landing Zone Workshop)

- 최상위에 단계별 `.md` 파일이 여러 개 있고 폴더 분리는 없는 경우.
- **순서는 루트 `README.md` 하단의 `## Contents`(목차) 목록을 그대로 따릅니다.**
  예: `1. Network Resource Deployment` → `Network Resource Deployment.md`.
  Contents 항목 이름과 파일명을 매칭합니다(대소문자·공백 무시하고 근접 매칭).
- Contents 가 없으면 파일명을 사람이 읽기 좋은 순서(숫자 접두 → 이름)로 정렬합니다.
- 각 단계 source: `https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<파일명>.md`
  (경로/파일명의 공백은 `%20` 로 URL 인코딩)
- 루트 `README.md` 는 단계로 넣지 않고 **개요**의 출처로만 사용합니다.

### 유형 C — 구조가 불명확한 경우 (분석 필요)

- 폴더/목차/다중 md 로 단계가 명확히 나뉘지 않으면, README 와 주요 문서를 읽어
  **워크샵을 분석**한 뒤 논리적 단계(예: 준비 → 배포 → 검증 → 정리)를 직접 구성합니다.
- 이때도 첫 단계는 개요이며, 각 단계 본문이 원본 특정 파일에 대응되면 그 파일을 source 로,
  대응 파일이 없으면 source 없이 분석한 요약을 단계 본문으로 작성합니다.

## 매니페스트 생성: docs/workshops/<slug>/index.md

`docs/workshops/_template/index.md` 형식을 따릅니다. **개요는 매니페스트 본문(첫 `## ` 이전)에
작성**하며, 뷰어가 이를 왼쪽의 첫 항목 '개요'로 표시합니다(첫 단계 = 개요 통일).

```
# <워크샵 제목>
repo: https://github.com/<owner>/<repo>

> <한 줄 요약>

<개요 1~2 문단>          ← 루트 README 의 소개를 분석·요약

### 실습 목표
- …                     ← 워크샵을 분석해 3개 내외로 작성

### 실습 전 준비사항
- …

### 진행 방법
왼쪽의 실습 단계를 순서대로 진행합니다. …

## <1번째 실습 단계 제목>
source: https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<폴더 또는 파일>
<단계 한 줄 설명>        ← 해당 문서를 분석해 한 줄로 요약

## <2번째 …>
source: …
…
```

규칙:

- `## 단계 제목` 은 사람이 읽기 좋은 한국어 제목을 사용합니다(원본 폴더/파일명의 의미를 반영,
  필요하면 `1.`, `2.` 번호를 붙입니다). 개요는 `## ` 단계가 아니라 본문으로 둡니다.
- 본문은 손으로 옮기지 않습니다. `source:` 만 지정하면 뷰어가 원본을 실시간 렌더링하고
  이미지/링크 상대 경로를 자동 보정합니다.
- 각 단계의 '한 줄 설명'은 해당 문서를 분석해 작성합니다(파일명 그대로 두지 않음).
- 원본에 단계가 하나뿐이면 개요 + 단계 하나(`## 실습`)로 구성합니다.
- Azure Basic Workshop / Azure Landing Zone Workshop 의 index.md 를 **참고 예시**로 삼아
  동일한 톤·구조를 유지합니다.

## workshops.md 연결

대상 항목에 아래가 있는지 확인하고, 없으면 추가합니다(순서 무관).

```
### <워크샵 제목> (배지)
included: true
folder: <slug>
<카드 설명>
https://github.com/<owner>/<repo>
```

- `folder: <slug>` 가 있어야 카드의 '워크샵 바로가기' 가 `workshop.html?slug=<slug>` 로 연결됩니다.
- GitHub 링크는 유지합니다('실습 레포' 버튼으로도 노출).

## SEO / 분석 반영 (필수)

새 뷰어 URL 이 생기므로 아래를 함께 갱신합니다. 정식 호스트는
`https://microsoft.github.io/azure-solution-hub/` 입니다.

- `docs/sitemap.xml` — `<loc>…/workshop.html?slug=<slug></loc>` 항목 추가/`<lastmod>` 갱신.
- `docs/llms.txt` — "Hands-on Workshops" 목록에 링크 추가.
- `docs/workshop.html` 에는 Clarity/GA4 스니펫이 이미 포함되어 있으므로 별도 작업 불필요.

## 검증

- `get_errors` 로 편집한 파일 확인.
- 로컬 프리뷰(live-server)에서 `workshop.html?slug=<slug>` 를 열어
  좌측 단계 네비 + 각 단계 원본 렌더링을 확인합니다.

## 자동 실행 (workshops.md 변경 시)

레포에는 `docs/workshops/workshops.md` 가 변경될 때마다 표준화를 수행하는 자동화가 있습니다.

- 워크플로: `.github/workflows/standardize-workshops.yml`
  (push 시 `docs/workshops/workshops.md` 경로 변경 감지, 수동 실행 가능)
- 스크립트: `scripts/standardize-workshops.mjs`
  (`included: true` 항목을 찾아 레포를 분석하고 `docs/workshops/<slug>/index.md` 를
   **baseline** 으로 생성, `folder:` 연결, sitemap/llms 갱신 후 커밋)

역할 분담:

- **스크립트(자동)** — 유형 A/B 를 판별해 단계 골격을 만들고 링크/SEO 를 맞춥니다.
  이미 `index.md` 가 있으면 콘텐츠는 건드리지 않고 연결만 보정합니다.
- **이 스킬(에이전트)** — baseline 개요/단계 설명을 한국어로 다듬고, 유형 C(구조 불명확)
  처럼 분석이 필요한 경우를 처리합니다. 품질 기준은 Basic/Landing Zone 예시를 따릅니다.

로컬에서 직접 돌리려면: `node scripts/standardize-workshops.mjs`

## 하지 말 것

- 원본 README 본문/이미지를 로컬로 복제하지 않습니다(`source:` 로 실시간 렌더링).
- solutions/ 쪽에는 등록하지 않습니다(워크샵 전용).
- 콘텐츠를 임의로 재작성하지 않습니다. 개요 요약과 단계 한 줄 설명만 작성합니다.
