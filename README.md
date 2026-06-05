# MojiDay Prototype

MojiDay는 이웃과 친구의 오늘 상태를 가볍게 확인하고, 도움이 필요한 순간 1:1 대화와 주변 의료기관 탐색으로 이어지도록 설계한 React 기반 UI/UX 프로토타입입니다.

## 주요 기능

- 오늘의 상태 기록: 이모지와 짧은 메시지로 상태를 남기고 체크인 포인트를 받을 수 있습니다.
- 상태 피드: 친구와 주변 이웃의 상태를 확인하고 `봤어요` 리액션 또는 도움 대화로 이어갈 수 있습니다.
- 1:1 도움 대화: 도움을 준 사람이 먼저 완료를 요청하고, 받은 사람이 확인하면 포인트와 도움 온도가 기록됩니다.
- 내 근처: Kakao Maps SDK로 선택 위치 기준 주변 의료기관을 검색합니다.
- 커뮤니티: 동네 이야기, 맛집/장소, 안부 나눔 글을 보고 직접 작성할 수 있습니다.
- 마이페이지: 포인트, 도움 온도, 상태 기록 캘린더, 친구 목록을 확인할 수 있습니다.

## 기술 스택

- React 19
- TypeScript
- Vite
- lucide-react
- Kakao Maps JavaScript SDK

## 시작하기

```bash
npm install
npm run dev
```

기본 개발 서버는 Vite 설정에 따라 `http://localhost:5173`에서 실행됩니다.

## 환경 변수

프로젝트 루트에 `.env` 파일을 만들고 Kakao Maps JavaScript Key를 설정합니다.

```env
VITE_KAKAO_MAPS_JAVASCRIPT_KEY=your_kakao_javascript_key
```

지도와 의료기관 검색은 Kakao Maps SDK의 `libraries=services`를 사용합니다. 키가 없거나 SDK 로드에 실패하면 프로토타입용 fallback 화면이 표시됩니다.

## 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # TypeScript 빌드 및 Vite 번들 생성
npm run preview  # 프로덕션 빌드 미리보기
```

## 프로젝트 구조

```text
src/
  components/       # 공통 UI와 위치/지도 관련 컴포넌트
  css/              # 화면별 스타일
  data/             # 프로토타입 mock 데이터
  hooks/            # localStorage, 대화, 알림 상태 훅
  pages/            # 온보딩, 홈, 지도, 커뮤니티, 채팅, 마이페이지
  utils/            # 포인트/활동 기록 유틸
```

## 빌드 확인

```bash
npm run build
```

현재 프로젝트에는 별도 lint/test 스크립트가 없으므로, 배포 전 최소 검증은 `npm run build`로 수행합니다.
