<!--
  워크샵 매니페스트 (공통 포맷) — workshop.html?slug=azure-landing-zone-workshop
  형식 안내는 workshops/_template/index.md 를 참고하세요.
  · 첫 단계는 항상 '개요'(이 주석 아래 ~ 첫 '## ' 전까지)로 통일합니다.
  · 각 단계는 원본 저장소의 단계별 .md 를 source 로 실시간 렌더링합니다.
    (원본 README 하단 'Contents' 순서를 따릅니다.)
-->

# Azure Landing Zone Workshop
repo: https://github.com/Azure-Samples/AzureLandingZoneWorkshop

> Azure Virtual WAN 기반의 Hub-Spoke 네트워크 위에 Application Gateway(WAF v2)와 Azure Firewall 을 적용한 랜딩 존(Landing Zone)을 단계별로 구성해 보는 실습 워크샵입니다.

![Azure Landing Zone 아키텍처](https://raw.githubusercontent.com/Azure-Samples/AzureLandingZoneWorkshop/main/images/ALZ-image.png)

Azure Virtual WAN 은 복잡한 서비스 구조를 포용하기 위해 네트워킹·보안·라우팅 기능을 하나의 운영 인터페이스로 결합한 네트워킹 서비스입니다. 이 워크샵에서는 WAF 와 Firewall 을 적용한 가장 기본적인 랜딩 존 네트워크 구성을 직접 배포하고 연결성을 검증합니다.

### 실습 목표

- Hub-Spoke 구조의 가상 네트워크와 라우팅(사용자 정의 경로)을 배포합니다.
- Application Gateway(WAF v2) 와 Azure Firewall 등 보안 리소스를 구성합니다.
- 테스트 시스템(VM) 을 배포하고 엔드-투-엔드 네트워크 연결성을 확인합니다.

### 실습 전 준비사항

- **Azure 구독** 및 리소스 생성 권한
- **Azure Portal** 사용 환경 (웹 브라우저)
- 가상 네트워크·라우팅·방화벽에 대한 기본 이해

### 진행 방법

왼쪽의 **실습 단계**를 순서대로 선택하며 진행합니다. 각 단계의 상세 지침과 화면은 원본 저장소에서 실시간으로 불러옵니다.

## 1. 네트워크 리소스 배포
source: https://raw.githubusercontent.com/Azure-Samples/AzureLandingZoneWorkshop/main/Network%20Resource%20Deployment.md
Hub-Spoke 가상 네트워크, 서브넷, 공용 IP, 라우팅 테이블 등 랜딩 존의 기반 네트워크 리소스를 배포합니다.

## 2. 보안 리소스 배포
source: https://raw.githubusercontent.com/Azure-Samples/AzureLandingZoneWorkshop/main/Security%20Resource%20Deployment.md
Application Gateway(WAF v2) 와 Azure Firewall 등 보안 리소스를 배포하고 라우팅을 연결합니다.

## 3. 테스트 시스템 배포
source: https://raw.githubusercontent.com/Azure-Samples/AzureLandingZoneWorkshop/main/Test%20system%20Deployment.md
연결성 검증에 사용할 테스트용 가상 머신을 배포합니다.

## 4. 네트워크 연결성 확인
source: https://raw.githubusercontent.com/Azure-Samples/AzureLandingZoneWorkshop/main/Network%20Connectivity%20Check.md
프런트엔드 → 백엔드 경로와 라우팅이 의도대로 동작하는지 엔드-투-엔드로 확인합니다.
