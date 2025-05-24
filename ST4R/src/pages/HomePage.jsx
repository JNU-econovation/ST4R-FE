import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../api/auth';
import SearchBar from '../components/common/SearchBar';

export default function HomePage() {
  const navigate = useNavigate();
  const logout = useLogoutMutation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('accessToken');
    console.log(token);

    if (token) {
      localStorage.setItem('token', token);
      console.log('토큰 저장 완료:', token);
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <>
      {/* 검색바 컴포넌트 추가 */}
      <div className="mb-6 px-2">
        <SearchBar />
      </div>

      <span className="text-white">홈화면</span>

      {/* 테스트 로그아웃 버튼 */}
      <div
        onClick={handleLogout}
        className="absolute left-3 right-3 bottom-20 h-15 bg-star-yellow rounded-lg cursor-pointer"
      >
        <div className="absolute left-5 top-4 text-base font-extrabold">
          <span className="text-black">로그아웃</span>
        </div>
      </div>
    </>
  );
}
