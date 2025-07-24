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
        <div className="bg-[#FFBB02] rounded-[10px] mb-4 overflow-hidden">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#FFB000] transition-colors"
            onClick={handleAuthRequired}
          >
            <div className="flex items-center space-x-4">
              {/* 기본 프로필 아이콘 */}
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <mask
                    id="mask0_4_2739"
                    style={{ maskType: 'alpha' }}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="24"
                    height="24"
                  >
                    <rect width="24" height="24" fill="#D9D9D9" />
                  </mask>
                  <g mask="url(#mask0_4_2739)">
                    <path
                      d="M5 17.471C5.9 16.5876 6.94583 15.8918 8.1375 15.3835C9.32917 14.8751 10.6167 14.621 12 14.621C13.3833 14.621 14.6708 14.8751 15.8625 15.3835C17.0542 15.8918 18.1 16.5876 19 17.471V4.73646C19 4.65946 18.9679 4.58896 18.9037 4.52496C18.8397 4.46079 18.7692 4.42871 18.6922 4.42871H5.30775C5.23075 4.42871 5.16025 4.46079 5.09625 4.52496C5.03208 4.58896 5 4.65946 5 4.73646V17.471ZM12 12.4672C12.9025 12.4672 13.6698 12.1512 14.302 11.5192C14.934 10.887 15.25 10.1197 15.25 9.21721C15.25 8.31471 14.934 7.54738 14.302 6.91521C13.6698 6.28321 12.9025 5.96721 12 5.96721C11.0975 5.96721 10.3302 6.28321 9.698 6.91521C9.066 7.54738 8.75 8.31471 8.75 9.21721C8.75 10.1197 9.066 10.887 9.698 11.5192C10.3302 12.1512 11.0975 12.4672 12 12.4672ZM5.30775 19.9287C4.80258 19.9287 4.375 19.7537 4.025 19.4037C3.675 19.0537 3.5 18.6261 3.5 18.121V4.73646C3.5 4.23129 3.675 3.80371 4.025 3.45371C4.375 3.10371 4.80258 2.92871 5.30775 2.92871H18.6922C19.1974 2.92871 19.625 3.10371 19.975 3.45371C20.325 3.80371 20.5 4.23129 20.5 4.73646V18.121C20.5 18.6261 20.325 19.0537 19.975 19.4037C19.625 19.7537 19.1974 19.9287 18.6922 19.9287H5.30775ZM6.177 18.4287H17.823C16.9743 17.6505 16.0491 17.0714 15.0472 16.6912C14.0452 16.311 13.0295 16.121 12 16.121C10.9833 16.121 9.96567 16.311 8.947 16.6912C7.9285 17.0714 7.00517 17.6505 6.177 18.4287ZM12 10.9672C11.5192 10.9672 11.1073 10.7957 10.7645 10.4527C10.4215 10.1099 10.25 9.69804 10.25 9.21721C10.25 8.73638 10.4215 8.32454 10.7645 7.98171C11.1073 7.63871 11.5192 7.46721 12 7.46721C12.4808 7.46721 12.8927 7.63871 13.2355 7.98171C13.5785 8.32454 13.75 8.73638 13.75 9.21721C13.75 9.69804 13.5785 10.1099 13.2355 10.4527C12.8927 10.7957 12.4808 10.9672 12 10.9672Z"
                      fill="#1D1D1D"
                    />
                  </g>
                </svg>
              </div>

              {/* 로그인 유도 텍스트 */}
              <div className="flex flex-col min-w-0">
                <span className="text-black text-lg font-medium">
                  로그인이 되어있지 않아요!
                </span>
              </div>
            </div>

            {/* 화살표 아이콘 */}
            <div className="flex-shrink-0">
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
            <button
              className="w-full flex items-center justify-between p-2 rounded-lg cursor-not-allowed"
              disabled
            >
              <span className="text-[#D3D3D3]">내가 쓴 글 보기</span>
              <ArrowIcon />
            </button>
            <button
              className="w-full flex items-center justify-between p-2 rounded-lg cursor-not-allowed"
              disabled
            >
              <span className="text-[#D3D3D3]">내가 좋아한 글 보기</span>
              <ArrowIcon />
            </button>
            <button
              className="w-full flex items-center justify-between p-2 rounded-lg cursor-not-allowed"
              disabled
            >
              <span className="text-[#D3D3D3]">내가 찜한 모임 보기</span>
              <ArrowIcon />
            </button>
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
              className="w-full flex items-center justify-between hover:bg-[#2A2A2A] transition-colors p-2 rounded-lg"
              onClick={handleTermsClick}
            >
              <span className="text-[#D3D3D3]">약관 및 개인정보 처리 동의</span>
              <ArrowIcon />
            </button>
            <button
              className="w-full flex items-center justify-between hover:bg-[#2A2A2A] transition-colors p-2 rounded-lg"
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
