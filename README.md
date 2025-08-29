<img width="1267" height="707" alt="image" src="https://github.com/user-attachments/assets/3308e4bc-c748-4a51-b87c-714a6b772818" />

<img width="1274" height="714" alt="image" src="https://github.com/user-attachments/assets/b634a8c5-84f1-4226-8123-3024b5086cd1" />

## 🌟 1. 프로젝트 개요

ST4R는 별을 사랑하는 사람들을 위한 커뮤니티 공간입니다<br> 
별자리에 대한 지식이나 감상을 나누고, 자유롭게 소통하며, 함께 관심사를 공유할 모임을 만들 수 있습니다

## 🛠️ 2. 기술 스택

### 주요 기술

- **React 18.2.0**: 선언적이고 컴포넌트 기반의 UI를 구축하기 위한 핵심 JavaScript 라이브러리입니다
- **Vite 5.2.0**: 개발 서버와 번들링을 위한 차세대 프론트엔드 빌드 도구로, 빠른 HMR(Hot Module Replacement)을 제공합니다
- **Tailwind CSS 3.4.4**: 유틸리티 우선(utility-first) CSS 프레임워크로, 빠르고 유연한 UI 스타일링을 가능하게 합니다
- **Zustand 4.4.7**: 가볍고 빠르며 확장 가능한 React 상태 관리 라이브러리입니다 전역 상태 관리에 사용됩니다
- **React Query (TanStack Query) 4.36.1**: 서버 상태(데이터 페칭, 캐싱, 동기화, 업데이트) 관리를 위한 강력한 라이브러리입니다
  API 호출 및 데이터 관리를 효율적으로 처리합니다
- **React Router DOM 6.26.1**: SPA(Single Page Application)에서 클라이언트 측 라우팅을 구현하여 페이지 전환을 관리합니다
- **Axios 1.6.8**: Promise 기반의 HTTP 클라이언트로, 백엔드 API와의 통신을 담당합니다
- **SockJS-client 1.6.1, Stompjs 2.3.3**: 웹소켓(WebSocket) 통신을 위한 라이브러리로, 실시간 채팅 기능 구현에 사용됩니다
- **React Datepicker 8.4.0**: 날짜 선택 UI를 제공하는 컴포넌트입니다
- **React Slick 0.30.3, Slick Carousel 1.8.1**: 이미지 슬라이드 및 캐러셀 기능을 구현하는 데 사용됩니다

### 개발 도구

- **ESLint 8.57.0**: 코드 품질을 유지하고 잠재적인 오류를 방지하기 위한 JavaScript 린터입니다
- **Prettier 3.2.5**: 일관된 코드 스타일을 유지하기 위한 코드 포맷터입니다
- **Vite Plugin PWA 0.20.0**: Progressive Web App (PWA) 기능을 프로젝트에 쉽게 통합할 수 있도록 지원합니다

## 🗄️ 3. 프로젝트 구조

```
ST4R/
├── public/                 # 정적 파일 (웹 폰트, 파비콘, PWA manifest, robots.txt 등)
├── src/
│   ├── api/                # 백엔드 API 호출 로직을 모아둔 디렉토리. 각 기능별로 파일을 분리하여 관리합니다
│   │   ├── auth.js         # 사용자 인증 (로그인, 회원가입) 관련 API 요청
│   │   ├── boardDetail.js  # 게시글 상세 조회, 수정, 삭제 관련 API 요청
│   │   ├── chat/           # 채팅방 생성, 메시지 전송, 멤버 관리 등 채팅 관련 API 요청
│   │   ├── group/          # 모임 생성, 조회, 수정, 삭제, 참여/탈퇴 등 모임 관련 API 요청
│   │   └── ...             # 기타 API (이미지 업로드, 검색 등)
│   ├── assets/             # 프로젝트에서 사용되는 이미지, SVG 아이콘 등 정적 자원
│   │   └── icons/          # 다양한 UI 아이콘 (홈, 검색, 글쓰기 등)
│   ├── components/         # 재사용 가능한 UI 컴포넌트들을 모아둔 디렉토리.
│   │   ├── board/          # 게시판 관련 특정 컴포넌트 (예: 게시글 상세 헤더, 댓글 목록)
│   │   ├── common/         # 프로젝트 전반에 걸쳐 사용되는 공통 컴포넌트 (예: BackButton, Kakaomap, Carousel)
│   │   ├── mobile/         # 모바일 환경에 특화된 컴포넌트 (예: mobileNavBar)
│   │   └── modals/         # 다양한 알림, 확인, 입력 모달 컴포넌트 (예: LoginRequiredModal, DeleteModal)
│   ├── guards/             # 라우트 접근을 제어하는 컴포넌트 (예: 로그인 여부 확인)
│   │   └── AuthGuard.jsx   # 인증된 사용자만 특정 페이지에 접근하도록 보호
│   ├── hooks/              # 커스텀 React Hooks. 컴포넌트 로직을 재사용 가능한 형태로 추상화합니다
│   │   ├── useBoardDetailActions.js # 게시글 상세 페이지의 액션(좋아요, 댓글 등) 관련 훅
│   │   ├── useChatPreview.js # 채팅 미리보기 관련 훅
│   │   └── ...
│   ├── layouts/            # 페이지의 공통 레이아웃을 정의하는 컴포넌트
│   │   ├── Header.jsx      # 전역 헤더 컴포넌트
│   │   └── MobileLayout.jsx # 모바일 환경에 최적화된 레이아웃 (하단 네비게이션 바 포함)
│   ├── pages/              # 각 라우트 경로에 매핑되는 최상위 컴포넌트 (페이지 단위)
│   │   ├── auth/           # 인증 관련 페이지 (예: CompleteRegistrationPage)
│   │   ├── board/          # 게시판 관련 페이지 (예: BoardPage, BoardDetailPage, BoardWritePage)
│   │   ├── chat/           # 채팅 관련 페이지 (예: ChatPage, ChatMembersPage)
│   │   ├── group/          # 모임 관련 페이지 (예: GroupPage, GroupDetailPage, GroupWritePage)
│   │   ├── login/          # 로그인 관련 페이지 (예: LoginPage, LoginAlertPage)
│   │   ├── profile/        # 사용자 프로필 관련 페이지 (예: ProfilePage, ProfileEditPage, MyPostsPage)
│   │   └── ...             # 기타 페이지 (HomePage, MapSearchPage, NotFoundPage 등)
│   ├── routes/             # React Router DOM을 사용하여 애플리케이션의 라우팅을 정의
│   │   └── Router.jsx      # 모든 라우트 경로 및 컴포넌트 매핑
│   └── utils/              # 프로젝트 전반에 걸쳐 사용되는 유틸리티 함수 및 설정
│       ├── axiosConfig.js  # Axios 인스턴스 설정 (인터셉터, 기본 URL 등)
│       └── kakaoMapLoader.js # 카카오맵 API 스크립트 로드 및 초기화
├── .eslintrc.cjs           # ESLint 설정 파일
├── .gitignore              # Git 버전 관리에서 제외할 파일 및 디렉토리 목록
├── .prettierrc             # Prettier 코드 포맷팅 설정 파일
├── index.html              # 애플리케이션의 진입점 HTML 파일
├── package.json            # 프로젝트 메타데이터 및 의존성 관리 파일
├── postcss.config.js       # PostCSS 설정 파일 (Tailwind CSS 처리)
├── tailwind.config.js      # Tailwind CSS 커스터마이징 설정 파일
├── vercel.json             # Vercel 배포 설정 파일
└── vite.config.js          # Vite 빌드 도구 설정 파일
```

## 🔥 4. 주요 기능
<img width="1265" height="709" alt="image" src="https://github.com/user-attachments/assets/301c300f-383d-439e-83c8-94675218d677" />

### 4.1. 인증 및 사용자 관리

<img width="1264" height="706" alt="image" src="https://github.com/user-attachments/assets/4176eed0-e2a2-4f8d-ad36-6631c789c2d1" />

- **로그인**: 카카오 소셜 로그인을 통해 간편하게 서비스에 접근할 수 있습니다
  `src/pages/login/LoginPage.jsx`와 `src/api/auth.js`를 통해 구현됩니다
- **회원가입**: 카카오 로그인 후 `src/pages/auth/CompleteRegistrationPage.jsx`에서 추가 정보를 입력하여 회원가입을 완료합니다
- **프로필 관리**: `src/pages/ProfilePage.jsx`에서 사용자 프로필을 조회하고, `src/pages/profile/ProfileEditPage.jsx`에서 프로필 정보를 수정할 수 있습니다 `MyPostsPage`, `MyLikedPostsPage`, `MyLikedGroupsPage`를 통해 내가 작성한 게시글, 좋아요한 게시글/모임 목록을 확인할 수 있습니다
- **인증 가드**: `src/guards/AuthGuard.jsx` 컴포넌트를 사용하여 로그인 사용자만 접근 가능한 페이지를 보호합니다. 미인증 사용자는 로그인 페이지로 리다이렉트됩니다

### 4.2. 게시판 기능
<img width="1263" height="701" alt="image" src="https://github.com/user-attachments/assets/f9ff1eb5-9078-47eb-8be5-4a4d6a4c9c33" />
<img width="1260" height="703" alt="image" src="https://github.com/user-attachments/assets/5fa04a44-e4b6-48db-babb-248ae2e45db4" />


- **게시글 목록**: `src/pages/board/BoardPage.jsx`에서 다양한 필터링 옵션(위치, 카테고리, 검색어 등)을 통해 게시글을 조회할 수 있습니다 `src/components/PostCard.jsx`가 각 게시글을 표시합니다
- **게시글 작성/수정/삭제**: `src/pages/board/BoardWritePage.jsx`에서 새로운 게시글을 작성하고, `src/pages/board/BoardEditPage.jsx`에서 기존 게시글을 수정할 수 있습니다 삭제 기능은 `src/components/modals/BoardDeleteModal.jsx`를 통해 제공됩니다. 관련 API는 `src/api/postboard.jsx`에 정의되어 있습니다
- **게시글 상세**: `src/pages/board/BoardDetailPage.jsx`에서 게시글의 상세 내용을 확인하고, `src/components/board/BoardDetailComments.jsx`를 통해 댓글을 작성하고 관리할 수 있습니다
- **지도 연동**: 게시글 작성 시 `src/components/common/Kakaomap.jsx`와 `src/pages/MapSearchPage.jsx`를 활용하여 카카오맵을 통해 특정 위치 정보를 추가할 수 있습니다

### 4.3. 모임 기능
<img width="1283" height="712" alt="image" src="https://github.com/user-attachments/assets/d97bd373-8cfe-4340-8348-219ed84bfa71" />
<img width="1263" height="711" alt="image" src="https://github.com/user-attachments/assets/b2e99a67-a344-471d-80bf-1a529072e002" />

- **모임 목록**: `src/pages/group/GroupPage.jsx`에서 모임 목록을 조회하고 필터링할 수 있습니다 `src/components/GroupCard.jsx`가 각 모임을 표시합니다
- **모임 생성/수정/삭제**: `src/pages/group/GroupWritePage.jsx`에서 모임을 생성하고, `src/pages/group/GroupEditPage.jsx`에서 수정할 수 있습니다 삭제는 `src/api/group/groupDelete.js`를 통해 이루어집니다
- **모임 상세**: `src/pages/group/GroupDetailPage.jsx`에서 모임의 상세 정보를 확인하고 참여/탈퇴할 수 있습니다 `src/api/group/getGroupDetail.js` 및 `groupOut.js`와 연동됩니다
- **모임 북마크**: `src/components/common/Bookmark.jsx` 컴포넌트를 사용하여 관심 있는 모임을 북마크할 수 있습니다

### 4.4. 채팅 기능
<img width="1269" height="695" alt="image" src="https://github.com/user-attachments/assets/1ca7a197-e23c-4e03-8d4f-67d0f8f3e819" />

- **실시간 채팅**: `src/pages/chat/ChatPage.jsx`에서 모임 내에서 실시간으로 메시지를 주고받을 수 있습니다 `SockJS-client`와 `Stompjs`를 사용하여 웹소켓 통신을 구현합니다
- **멤버 관리**: `src/pages/chat/ChatMembersPage.jsx`에서 모임 멤버 목록을 조회하고, 리더 변경(`src/components/modals/ChangeLeaderModal.jsx`), 멤버 강퇴(`src/components/modals/BanModal.jsx`) 기능을 제공합니다 관련 API는 `src/api/chat/` 디렉토리에 있습니다

### 4.5. 공통 기능

- **모바일 반응형 레이아웃**: `src/layouts/MobileLayout.jsx`를 통해 모바일 환경에 최적화된 UI와 하단 네비게이션 바를 제공합니다
- **모달 시스템**: `src/components/modals/` 디렉토리에 다양한 알림, 확인, 성공 메시지 모달이 구현되어 있습니다. `src/components/common/ModalPortal.jsx`를 통해 모달을 효율적으로 렌더링합니다
- **이미지 업로드**: `src/api/imgupload.js`를 통해 게시글 및 프로필 이미지 업로드를 지원합니다
- **검색 기능**: `src/components/common/SearchBar.jsx`를 통해 게시글 및 모임 검색 기능을 제공합니다

## 😄 5. 라우팅

`ST4R/src/routes/Router.jsx` 파일에서 `react-router-dom`을 사용하여 모든 라우팅이 관리됩니다

- **네비게이션 바가 없는 페이지**: 로그인 (`/login`), 회원가입 (`/register`), 지도 검색 (`/map-search`), 게시글/모임 작성/수정/상세 (`/boards/write`, `/boards/:id`, `/groups/write`, `/groups/:id`), 채팅 (`/groups/:id/chats`), 프로필 수정 (`/profile/edit`) 등 특정 기능에 집중하는 페이지들입니다
- **네비게이션 바가 있는 페이지**: `/` 경로에 `MobileLayout`을 적용하여 홈 (`/home`), 모임 목록 (`/groups`), 프로필 조회 (`/profile`) 페이지에 공통 레이아웃과 하단 네비게이션 바를 제공합니다 `AuthGuard`를 통해 인증이 필요한 라우트에 대한 접근을 제어합니다

## 🚀  6. 설치 및 실행

### 6.1. 프로젝트 클론

```bash
git clone https://github.com/Superkid0714/ST4R-FE.git
cd ST4R-FE/ST4R
```

### 6.2. 의존성 설치

```bash
npm install
```

### 6.3. 개발 서버 실행

```bash
npm run dev
```

### 6.4. 빌드

```bash
npm run build
```

## 🥳 7. DEV 

<img width="1103" height="625" alt="image" src="https://github.com/user-attachments/assets/91f997c9-5cec-49e1-8c50-e34ef8bdb14f" />
<img width="1280" height="960" alt="image" src="https://github.com/user-attachments/assets/a6594f89-4b07-49d8-a7ba-08a0b51bdce2" />

[DEV 발표 영상](https://www.youtube.com/watch?v=Cnu_gPENZgs)<br>
[프로젝트 인터뷰](https://jnu-econovation.github.io/summer/winter_dev/2025/08/12/%EC%8D%B8%EB%A8%B8%EB%8D%B0%EB%B8%8C-%ED%9A%8C%EA%B3%A0%EB%A1%9D_ST4R.html)<br>
[백엔드 저장소](https://github.com/rdme0/ST4R-BE?tab=readme-ov-file#-%EA%B8%B0%EC%88%A0-%EC%8A%A4%ED%83%9D)











