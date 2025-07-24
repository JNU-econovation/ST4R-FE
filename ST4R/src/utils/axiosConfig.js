import axios from 'axios';

const BASE_URL = 'https://eridanus.econo.mooo.com';

// JWT 토큰 검증 함수 - 버퍼 시간 제거
const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    // 버퍼 시간 제거 - 실제 만료 시간만 확인
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('토큰 검증 실패:', error);
    return false;
  }
};

// 토큰 정리 함수
const clearAuthData = () => {
  const hadToken = !!localStorage.getItem('token');
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  if (hadToken) {
    console.log('토큰이 정리되었습니다.');
  }

  return hadToken;
};

// 로그인 리다이렉트 함수
const redirectToLogin = (reason = 'token_expired') => {
  console.log('로그인 리다이렉트:', reason);

  // 현재 페이지 정보 저장 (로그인 후 돌아오기 위해)
  const returnUrl = window.location.pathname + window.location.search;
  if (
    returnUrl !== '/login' &&
    returnUrl !== '/login-alert' &&
    returnUrl !== '/register' &&
    !returnUrl.includes('/profile') // 프로필 관련 경로는 제외
  ) {
    sessionStorage.setItem('returnUrl', returnUrl);
  }

  // 개발/배포 환경에 따른 카카오 로그인 URL
  const isDevelopment = window.location.hostname === 'localhost';
  const redirectUrl = isDevelopment
    ? 'http://localhost:5173'
    : window.location.origin;

  const loginUrl = `https://eridanus.econo.mooo.com/oauth/kakao?redirect=${redirectUrl}`;

  // 직접 카카오 로그인으로 이동
  window.location.href = loginUrl;
};

// Axios 기본 설정
axios.defaults.baseURL = BASE_URL;
axios.defaults.timeout = 10000; // 10초 타임아웃

// Request 인터셉터 - 단순화
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // 토큰이 있으면 검증 없이 바로 사용 (서버에서 검증)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('Request 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// Response 인터셉터 - 단순화
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API 에러:', error.response?.status, error.config?.url);

    // 회원가입 페이지에서는 401 에러를 그대로 전달
    const currentPath = window.location.pathname;
    if (currentPath === '/register') {
      console.log('회원가입 페이지에서 401 에러 - 그대로 전달');
      return Promise.reject(error);
    }

    // 401 에러 처리
    if (error.response?.status === 401) {
      const hadToken = clearAuthData();

      // 로그인이 필수인 페이지들
      const authRequiredPaths = [
        '/boards/write',
        '/boards/edit',
        '/groups/write',
        '/groups/edit',
        '/writechoice',
        '/profile/edit',
        '/profile/my-posts',
        '/profile/liked-posts',
        '/profile/liked-groups',
      ];

      // 프로필 페이지는 특별 처리
      if (currentPath === '/profile') {
        // 프로필 페이지에서는 컴포넌트에서 처리하도록 에러만 전달
        const authError = new Error('Authentication required');
        authError.isAuthError = true;
        authError.shouldRedirectToLogin = false; // false로 변경
        return Promise.reject(authError);
      }

      // 인증이 필수인 페이지에서 401 에러
      if (authRequiredPaths.some((path) => currentPath.startsWith(path))) {
        if (hadToken) {
          // 토큰이 있었다면 자동으로 재로그인
          redirectToLogin('auth_required_page');
        } else {
          // 토큰이 없었다면 로그인 알림 페이지로
          window.location.href = '/login-alert';
        }
        return Promise.reject(error);
      }

      // 홈 페이지나 게시글 상세 등에서는 비로그인 상태로 계속 진행
      if (
        currentPath === '/home' ||
        currentPath === '/' ||
        currentPath.startsWith('/boards/') ||
        currentPath.startsWith('/groups/')
      ) {
        const authError = new Error('Token expired');
        authError.isAuthError = true;
        authError.shouldRetryWithoutAuth = true;
        authError.originalError = error;
        return Promise.reject(authError);
      }
    }

    // 네트워크 에러 처리
    if (!error.response) {
      console.error('네트워크 에러 또는 서버 무응답');
      const networkError = new Error('네트워크 연결을 확인해주세요.');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }

    return Promise.reject(error);
  }
);

export default axios;
