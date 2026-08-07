# 🎱 로또 6/45 행운의 번호 생성기 (Lotto Generator)

실시간 볼 추출 애니메이션, 3D 볼 렌더링, 홀짝/총합 균형 필터, 포함 및 제외 수 지정을 지원하는 최첨단 **로또 6/45 번호 추천 웹 애플리케이션**입니다.

![Lotto Generator](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 🌟 주요 기능
1. **공식 색상 반영 3D 로또 볼 추출**:
   - 1~10번: 🟡 노란색
   - 11~20번: 🔵 파란색
   - 21~30번: 🔴 빨간색
   - 31~40번: 🟣 보라색
   - 41~45번: 🟢 초록색
2. **다채로운 번호생성 필터 옵션**:
   - **게임 수 선택**: 1게임, 3게임, 5게임(1세트) 선택 생성
   - **고정 수 / 제외 수 지정**: 원하는 번호를 직접 포함(최대 5개)하거나 제외(최대 15개)
   - **홀짝 비율 필터 (2:4 ~ 4:2)** & **총합 범주 필터 (100 ~ 175)** 자동 적용
3. **사용자 편의 기능**:
   - Web Audio 기반 사운드 효과 (사운드 켜기/끄기 기능)
   - 다크 모드 / 라이트 모드 테마 전환
   - 생성 내역 히스토리 저장 & 즐겨찾기 보관함 (Local Storage)
   - 클립보드 원클릭 복사

---

## 🚀 Cloudflare Pages 배포 방법

이 프로젝트는 별도의 빌드 과정(Build Step) 없이 바로 동작하는 정적(Static) Web App입니다.

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)에 로그인합니다.
2. 좌측 메뉴에서 **Workers & Pages** -> **Create Application** -> **Pages**를 선택합니다.
3. **Connect to Git**을 클릭하고 GitHub 계정을 연결합니다.
4. 리파지토리 목록에서 **`jslee-gses/test-cf`**를 선택하고 **Begin setup**을 누릅니다.
5. Build 설정:
   - **Framework preset**: `None`
   - **Build command**: *(비워둠)*
   - **Build output directory**: `/` (또는 `.`)
6. **Save and Deploy** 버튼을 클릭하면 즉시 배포가 완료됩니다!