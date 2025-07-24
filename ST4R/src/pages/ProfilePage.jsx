import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ModalPortal from '../components/common/ModalPortal';
import LogoutModal from '../components/modals/LogoutModal';
import DeleteMemberModal from '../components/modals/DeleteMemberModal';
import GuestProfilePage from './profile/GuestProfilePage';

// 프로필 아이콘 컴포넌트
const ProfileIcon = ({ className = 'w-[18px] h-[18px]' }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      fill="#FFBB02"
    />
  </svg>
);

// 화살표 아이콘 컴포넌트
const ArrowIcon = () => (
  <svg
    width="13"
    height="12"
    viewBox="0 0 13 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.8558 6.62501H1.375C1.19764 6.62501 1.04917 6.56515 0.929583 6.44542C0.809861 6.32584 0.75 6.17737 0.75 6.00001C0.75 5.82265 0.809861 5.67417 0.929583 5.55459C1.04917 5.43487 1.19764 5.37501 1.375 5.37501H10.8558L6.54812 1.0673C6.42424 0.943408 6.36306 0.798408 6.36458 0.632297C6.36625 0.466186 6.43167 0.318479 6.56083 0.189173C6.69014 0.0684785 6.83653 0.00597852 7 0.00167296C7.16347 -0.0026326 7.30986 0.0598674 7.43917 0.189173L12.7227 5.47271C12.8008 5.55077 12.8558 5.33306 12.8877 5.71959C12.9198 5.80612 12.9358 5.89959 12.9358 6.00001C12.9358 6.10042 12.9198 6.19389 12.8877 6.28042C12.8558 6.36695 12.8008 6.44924 12.7227 6.5273L7.43917 11.8108C7.32375 11.9263 7.18083 11.9853 7.01042 11.9879C6.84 11.9906 6.69014 11.9315 6.56083 11.8108C6.43167 11.6815 6.36708 11.5331 6.36708 11.3654C6.36708 11.1976 6.43167 11.0491 6.56083 10.9198L10.8558 6.62501Z"
      fill="#D3D3D3"
    />
  </svg>
);

// 별자리 매핑 객체
const CONSTELLATION_NAMES = {
  ARIES: '양자리',
  TAURUS: '황소자리',
  GEMINI: '쌍둥이자리',
  CANCER: '게자리',
  LEO: '사자자리',
  VIRGO: '처녀자리',
  LIBRA: '천칭자리',
  SCORPIO: '전갈자리',
  SAGITTARIUS: '사수자리',
  CAPRICORN: '염소자리',
  AQUARIUS: '물병자리',
  PISCES: '물고기자리',
};

export default function ProfilePage() {
  const navigate = useNavigate();

  // 로그인 상태 확인 - 동기적으로 처리
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  // 모달 상태 관리
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false);

  // 로컬 상태로 프로필 이미지 관리
  const [localProfileImage, setLocalProfileImage] = useState('');

  // 사용자 정보 조회 API - 로그인한 경우에만
  const {
    data: userInfo,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userInfo'],
    queryFn: async () => {
      // 토큰 재확인
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        throw new Error('No token available');
      }

      // axios 인터셉터를 우회하기 위해 새로운 인스턴스 생성
      const apiClient = axios.create({
        baseURL: 'https://eridanus.econo.mooo.com',
        timeout: 10000,
      });

      const response = await apiClient.get('/my', {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      console.log('사용자 정보 조회 성공:', response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    },
    enabled: isAuthenticated, // 로그인한 경우에만 실행
    staleTime: 1000 * 60 * 10,
    retry: false, // 재시도하지 않음
    onError: (error) => {
      console.error('사용자 정보 조회 실패:', error);
      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
  });

  // 로그인하지 않은 경우 GuestProfilePage 표시
  if (!isAuthenticated) {
    return <GuestProfilePage />;
  }

  // localStorage에서 프로필 이미지 확인
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.profileImageUrl) {
          setLocalProfileImage(parsedUser.profileImageUrl);
        }
      } catch (e) {
        console.error('localStorage 파싱 에러:', e);
      }
    }
  }, []);

  // 프로필 이미지 가져오기 함수
  const getProfileImageUrl = () => {
    return userInfo?.profileImageUrl || localProfileImage;
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // 회원 탈퇴 핸들러
  const handleDeleteMember = () => {
    setShowDeleteMemberModal(true);
  };

  // 프로필 수정 페이지로 이동
  const handleProfileEdit = () => {
    navigate('/profile/edit');
  };

  // 별자리 이름 표시 함수
  const getConstellationName = (constellation) => {
    return CONSTELLATION_NAMES[constellation] || '별자리 정보 없음';
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 에러 상태 (401 에러 등)
  if (error && error?.response?.status === 401) {
    // 토큰이 만료된 경우 GuestProfilePage 표시
    return <GuestProfilePage />;
  }

  // 기타 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">
            오류가 발생했습니다
          </h2>
          <p className="text-gray-400 mb-4">
            사용자 정보를 불러올 수 없습니다. 다시 시도해주세요.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => refetch()}
              className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
            >
              다시 시도
            </button>
            <button
              onClick={() => navigate('/home')}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-500 transition-colors"
            >
              홈으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 사용자 정보가 없는 경우
  if (!userInfo) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            사용자 정보를 불러올 수 없습니다
          </h2>
          <p className="text-gray-400 mb-4">다시 로그인해주세요.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
          >
            로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-['Pretendard']">
      <div className="px-4 py-6">
        {/* 헤더 */}
        <h1 className="text-2xl font-normal mb-8">프로필</h1>

        {/* 사용자 정보 섹션 */}
        <div className="bg-[#1D1D1D] rounded-[10px] mb-4">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#2A2A2A] transition-colors"
            onClick={handleProfileEdit}
          >
            <div className="flex items-center space-x-4">
              {/* 프로필 이미지 또는 아이콘 */}
              <div className="flex-shrink-0">
                {getProfileImageUrl() ? (
                  <img
                    src={getProfileImageUrl()}
                    alt="프로필 이미지"
                    className="w-12 h-12 rounded-full object-cover"
                    onError={() => {
                      setLocalProfileImage('');
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center">
                    <ProfileIcon className="w-8 h-8" />
                  </div>
                )}
              </div>

              {/* 사용자 정보 */}
              <div className="flex flex-col min-w-0">
                <span className="text-white text-lg font-medium truncate">
                  {userInfo?.nickname || userInfo?.name || '사용자'}님
                </span>
                {userInfo?.constellation && (
                  <span className="text-[#8F8F8F] text-sm">
                    {getConstellationName(userInfo.constellation)}
                  </span>
                )}
              </div>
            </div>

            {/* 화살표 아이콘 */}
            <div className="flex-shrink-0">
              <ArrowIcon />
            </div>
          </div>
        </div>

        {/* 게시글 설정 섹션 */}
        <div className="bg-[#1D1D1D] rounded-[10px] mb-4">
          <h2 className="text-[#8F8F8F] text-sm p-4 pb-0">게시글 설정</h2>
          <div className="p-4 pt-4 space-y-4">
            <button
              className="w-full flex items-center justify-between hover:bg-[#2A2A2A] transition-colors p-2 rounded-lg"
              onClick={() => navigate('/profile/my-posts')}
            >
              <span className="text-[#D3D3D3]">내가 쓴 글 보기</span>
              <ArrowIcon />
            </button>
            <button
              className="w-full flex items-center justify-between hover:bg-[#2A2A2A] transition-colors p-2 rounded-lg"
              onClick={() => navigate('/profile/liked-posts')}
            >
              <span className="text-[#D3D3D3]">내가 좋아한 글 보기</span>
              <ArrowIcon />
            </button>
            <button
              className="w-full flex items-center justify-between hover:bg-[#2A2A2A] transition-colors p-2 rounded-lg"
              onClick={() => navigate('/profile/liked-groups')}
            >
              <span className="text-[#D3D3D3]">내가 찜한 모임 보기</span>
              <ArrowIcon />
            </button>
          </div>
        </div>

        {/* 계정 설정 섹션 */}
        <div className="bg-[#1D1D1D] rounded-[10px] mb-4">
          <h2 className="text-[#8F8F8F] text-sm p-4 pb-0">계정 설정</h2>
          <div className="p-4 pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[#D3D3D3]">닉네임</span>
              <span className="text-[#8F8F8F]">
                {userInfo.nickname || '닉네임 없음'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#D3D3D3]">이메일</span>
              <span className="text-[#8F8F8F]">
                {userInfo.email || '이메일 없음'}
              </span>
            </div>
            {userInfo.birthDate && (
              <div className="flex justify-between items-center">
                <span className="text-[#D3D3D3]">생년월일</span>
                <span className="text-[#8F8F8F]">
                  {new Date(userInfo.birthDate).toLocaleDateString('ko-KR')}
                </span>
              </div>
            )}
            {userInfo.gender && (
              <div className="flex justify-between items-center">
                <span className="text-[#D3D3D3]">성별</span>
                <span className="text-[#8F8F8F]">
                  {userInfo.gender === 'MAN'
                    ? '남성'
                    : userInfo.gender === 'WOMAN'
                      ? '여성'
                      : '선택안함'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 법적 정보 및 기타 섹션 */}
        <div className="bg-[#1D1D1D] rounded-[10px] mb-4">
          <h2 className="text-[#8F8F8F] text-sm p-4 pb-0">법적 정보 및 기타</h2>
          <div className="p-4 pt-4 space-y-4">
            <button
              className="w-full flex items-center justify-between hover:bg-[#2A2A2A] transition-colors p-2 rounded-lg"
              onClick={() => navigate('/legal/terms')}
            >
              <span className="text-[#D3D3D3]">약관 및 개인정보 처리 동의</span>
              <ArrowIcon />
            </button>
            <button
              className="w-full flex items-center justify-between hover:bg-[#2A2A2A] transition-colors p-2 rounded-lg"
              onClick={() => navigate('/legal/privacy')}
            >
              <span className="text-[#D3D3D3]">개인정보 처리방침</span>
              <ArrowIcon />
            </button>
          </div>
        </div>

        {/* 계정 관리 섹션 */}
        <div className="bg-[#1D1D1D] rounded-[10px] mb-4">
          <h2 className="text-[#8F8F8F] text-sm p-4 pb-0">계정 관리</h2>
          <div className="p-4 pt-4 space-y-4">
            {/* 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-2 hover:bg-[#2A2A2A] transition-colors rounded-lg"
            >
              <span className="text-[#D3D3D3]">로그아웃하기</span>
              <ArrowIcon />
            </button>

            {/* 회원 탈퇴 버튼 */}
            <button
              onClick={handleDeleteMember}
              className="w-full flex items-center justify-between p-2 hover:bg-[#2A2A2A] transition-colors rounded-lg"
            >
              <span className="text-[#FF4343]">회원 탈퇴하기</span>
              <ArrowIcon />
            </button>
          </div>
        </div>

        {/* 하단 여백 (네비게이션 바 공간) */}
        <div className="h-10"></div>
      </div>

      {/* 모달들 */}
      {showLogoutModal && (
        <ModalPortal>
          <LogoutModal onClose={() => setShowLogoutModal(false)} />
        </ModalPortal>
      )}

      {showDeleteMemberModal && (
        <ModalPortal>
          <DeleteMemberModal onClose={() => setShowDeleteMemberModal(false)} />
        </ModalPortal>
      )}
    </div>
  );
}
