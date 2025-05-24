import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

function AuthGuard({ children }) {
  // 토큰 존재 여부로 로그인 상태 확인
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  // 로그인되지 않은 경우 로그인 알림 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login-alert" replace />;
  }

  // 로그인된 경우 자식 컴포넌트 렌더링
  return children;
}

// props 유효성 검사 추가
AuthGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthGuard;
