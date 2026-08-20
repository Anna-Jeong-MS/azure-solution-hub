/**
 * 검색 약어집 (동의어 사전)
 * ============================================================
 * 같은 배열(그룹)에 있는 단어는 서로 동의어로 확장 검색됩니다.
 *   예) "MS" 검색 → "Microsoft", "마이크로소프트" 결과도 포함
 *       "VNet" 검색 → "Virtual Network", "가상 네트워크" 결과도 포함
 *
 * 규칙
 *  - 모든 항목은 소문자로 작성합니다. (검색 시 대소문자 무시)
 *  - 그룹(배열)에 표현을 추가하면 서로 확장 검색됩니다.
 *  - 새 약어는 아래 배열에 ['약어', '정식명칭', '한글표현'] 형태로 추가하세요.
 * ============================================================
 */
window.SEARCH_SYNONYMS = [
  ['ms', 'microsoft', '마이크로소프트'],
  ['vnet', 'virtual network', '가상 네트워크'],
  ['aks', 'azure kubernetes service', 'kubernetes', '쿠버네티스'],
  ['ai', 'artificial intelligence', '인공지능'],
  ['ml', 'machine learning', '머신러닝', '기계학습'],
  ['k8s', 'kubernetes', '쿠버네티스'],
  ['db', 'database', '데이터베이스'],
  ['vm', 'virtual machine', '가상 머신'],
  ['lb', 'load balancer', '로드 밸런서'],
  ['rg', 'resource group', '리소스 그룹'],
  ['func', 'functions', 'azure functions', '함수'],
  ['aca', 'azure container apps', '컨테이너 앱'],
  ['acr', 'azure container registry', '컨테이너 레지스트리'],
  ['appgw', 'application gateway', '애플리케이션 게이트웨이'],
  ['waf', 'web application firewall', '웹 방화벽'],
  ['rbac', 'role based access control', '역할 기반 액세스 제어'],
  ['iac', 'infrastructure as code', '코드형 인프라'],
  ['ci/cd', 'ci cd', 'continuous integration', 'continuous delivery'],
  ['foundry', 'microsoft foundry', 'azure ai foundry'],
  ['aoai', 'azure openai', 'openai'],
  ['pg', 'postgresql', 'postgres'],
  ['sql', 'azure sql', 'sql database'],
  ['m365', 'microsoft 365', 'office 365', 'o365'],
  ['copilot', '코파일럿'],
  ['sec', 'security', '보안'],
  ['gov', 'governance', '거버넌스'],
];
