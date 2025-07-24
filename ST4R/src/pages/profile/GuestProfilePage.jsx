import { useNavigate } from 'react-router-dom';

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
      fill="#FFBB02"
    />
  </svg>
);

export default function GuestProfilePage() {
  const navigate = useNavigate();

  // 로그인이 필요한 기능 클릭 시 경고 표시
  const handleAuthRequired = () => {
    navigate('/login-alert');
  };

  // 약관 페이지로 이동
  const handleTermsClick = () => {
    navigate('/legal/terms');
  };

  const handlePrivacyClick = () => {
    navigate('/legal/privacy');
  };

  return (
    <div className="min-h-screen bg-black text-white font-['Pretendard']">
      <div className="px-4 py-6">
        {/* 헤더 */}
        <h1 className="text-2xl font-normal mb-8">프로필</h1>
        {/* 로그인 유도 섹션 */}
        <div className="bg-[#FFBB02] rounded-[10px] mb-4">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#FFB000] transition-colors"
            onClick={handleAuthRequired}
          >
            <div className="flex items-center space-x-4">
              {/* 프로필 아이콘 */}
              <div className="w-12 h-12 flex items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
                >
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    fill="black"
                  />
                </svg>
              </div>

              {/* 로그인 유도 텍스트 */}
              <div className="flex flex-col min-w-0">
                <span className="text-black text-lg font-medium truncate">
                  로그인이 되어있지 않아요!
                </span>
              </div>
            </div>

            {/* 화살표 아이콘 */}
            <div className="flex-shrink-0 flex items-center">
              <svg
                width="13"
                height="12"
                viewBox="0 0 13 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.8558 6.62501H1.375C1.19764 6.62501 1.04917 6.56515 0.929583 6.44542C0.809861 6.32584 0.75 6.17737 0.75 6.00001C0.75 5.82265 0.809861 5.67417 0.929583 5.55459C1.04917 5.43487 1.19764 5.37501 1.375 5.37501H10.8558L6.54812 1.0673C6.42424 0.943408 6.36306 0.798408 6.36458 0.632297C6.36625 0.466186 6.43167 0.318479 6.56083 0.189173C6.69014 0.0684785 6.83653 0.00597852 7 0.00167296C7.16347 -0.0026326 7.30986 0.0598674 7.43917 0.189173L12.7227 5.47271C12.8008 5.55077 12.8558 5.33306 12.8877 5.71959C12.9198 5.80612 12.9358 5.89959 12.9358 6.00001C12.9358 6.10042 12.9198 6.19389 12.8877 6.28042C12.8558 6.36695 12.8008 6.44924 12.7227 6.5273L7.43917 11.8108C7.32375 11.9263 7.18083 11.9853 7.01042 11.9879C6.84 11.9906 6.69014 11.9315 6.56083 11.8108C6.43167 11.6815 6.36708 11.5331 6.36708 11.3654C6.36708 11.1976 6.43167 11.0491 6.56083 10.9198L10.8558 6.62501Z"
                  fill="black"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 로그인이 필요한 기능들 */}
        <div className="bg-[#1D1D1D] rounded-[10px] mb-4 opacity-50">
          <h2 className="text-[#8F8F8F] text-sm p-4 pb-0">게시글 설정</h2>
          <div className="p-4 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#D3D3D3] p-2">내가 쓴 글 보기</span>
              <ArrowIcon />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#D3D3D3] p-2">내가 좋아한 글 보기</span>
              <ArrowIcon />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#D3D3D3] p-2">내가 찜한 모임 보기</span>
              <ArrowIcon />
            </div>
          </div>
        </div>

        {/* 계정 설정 */}
        <div className="bg-[#1D1D1D] rounded-[10px] mb-4 opacity-50">
          <h2 className="text-[#8F8F8F] text-sm p-4 pb-0">계정 설정</h2>
          <div className="p-4 pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[#D3D3D3]">닉네임</span>
              <span className="text-[#8F8F8F]">-</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#D3D3D3]">이메일</span>
              <span className="text-[#8F8F8F]">-</span>
            </div>
          </div>
        </div>

        {/* 법적 정보 및 기타 섹션 */}
        <div className="bg-[#1D1D1D] rounded-[10px] mb-4">
          <h2 className="text-[#8F8F8F] text-sm p-4 pb-0">법적 정보 및 기타</h2>
          <div className="p-4 pt-4 space-y-4">
            <button
              className="flex items-center justify-between hover:bg-[#2A2A2A] transition-colors p-2 rounded-lg w-full"
              onClick={handleTermsClick}
            >
              <span className="text-[#D3D3D3]">약관 및 개인정보 처리 동의</span>
              <ArrowIcon />
            </button>
            <button
              className="flex items-center justify-between hover:bg-[#2A2A2A] transition-colors p-2 rounded-lg w-full"
              onClick={handlePrivacyClick}
            >
              <span className="text-[#D3D3D3]">개인정보 처리방침</span>
              <ArrowIcon />
            </button>
          </div>
        </div>

        {/* 하단 여백 (네비게이션 바 공간) */}
        <div className="h-10"></div>
      </div>
    </div>
  );
}
