<!--
  워크샵 매니페스트 (공통 포맷)
  ─────────────────────────────────────────────────────────────
  workshop.html?slug=azure-basic-workshop 로 렌더링됩니다.

  형식:
    # <워크샵 제목>
    repo: <GitHub 저장소 URL>
    (여기부터 첫 '## ' 전까지가 '개요' 탭 콘텐츠)

    ## <단계 제목>
    source: <해당 단계 원본 README 의 raw URL>   ← 있으면 실시간으로 불러와 렌더링
    (source 아래 텍스트는 단계 상단에 표시되는 짧은 설명 — 선택)

  · source 를 지정하면 원본 저장소 콘텐츠(이미지 포함)를 그대로 표시하므로
    본문을 중복 관리할 필요가 없습니다. 이미지 상대경로는 자동 보정됩니다.
  · source 없이 설명만 적으면 그 텍스트가 본문으로 표시됩니다.
-->

# Azure Basic Workshop
repo: https://github.com/Anna-Jeong-MS/AzureBasicWorkshop

> 가상 네트워크, 가상 머신, SQL Database, Load Balancer 를 활용해 Azure 위에 웹 애플리케이션을 직접 배포해 보는 실습형 워크샵입니다.

Azure Portal 을 사용해 인프라를 구성하고, 웹 애플리케이션을 배포한 뒤 외부에서 접속하고, 부하 분산과 가용성까지 경험해 봅니다.

### 실습 목표

- 가상 머신·가상 네트워크·SQL Database 등 핵심 Azure 리소스를 직접 구성합니다.
- 웹 애플리케이션을 배포하고 외부에서 정상 접속되는지 확인합니다.
- Load Balancer 와 가상 머신 확장 집합(VMSS) 으로 부하 분산과 가용성을 구성합니다.

### 실습 전 준비사항

- **Azure 구독** — 사전에 전달받은 계정 또는 개인 구독
- **Azure Portal** 사용 환경 (웹 브라우저)
- 가상 머신 원격 접속을 위한 **SSH / RDP** 기본 이해
- 클라우드 컴퓨팅에 대한 기본적인 이해

### 진행 방법

왼쪽의 **실습 단계**를 순서대로 선택하며 진행합니다. 각 단계의 상세 지침과 화면은 원본 저장소에서 실시간으로 불러옵니다.

## 1. 사전 준비
source: https://raw.githubusercontent.com/Anna-Jeong-MS/AzureBasicWorkshop/main/1.%20%EC%82%AC%EC%A0%84%20%EC%A4%80%EB%B9%84/README.md
Microsoft Authenticator 앱 설치, Azure Portal 접속·MFA 구성, 언어 설정과 구독 확인까지 실습 환경을 준비합니다.

## 2. 웹 애플리케이션 배포하기
source: https://raw.githubusercontent.com/Anna-Jeong-MS/AzureBasicWorkshop/main/2.%20%EC%9B%B9%20%EC%95%A0%ED%94%8C%EB%A6%AC%EC%BC%80%EC%9D%B4%EC%85%98%20%EB%B0%B0%ED%8F%AC%ED%95%98%EA%B8%B0/README.md
가상 네트워크·가상 머신·SQL Database 를 구성하고 웹 애플리케이션을 배포한 뒤 외부에서 접속을 확인합니다.

## 3. 추가 실습 - VMSS
source: https://raw.githubusercontent.com/Anna-Jeong-MS/AzureBasicWorkshop/main/3.%20%EC%B6%94%EA%B0%80%20%EC%8B%A4%EC%8A%B5%20-%20VMSS/README.md
가상 머신 이미지를 캡처해 가상 머신 확장 집합(VMSS) 을 만들고, Load Balancer 로 부하 분산을 구성합니다. (Advanced 리소스가 먼저 생성되어 있어야 합니다.)
