import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import GroupIcon from '../assets/icons/group.svg?react';
import WriteIcon from '../assets/icons/write.svg?react';
import BackButton from '../components/common/BackButton';

export default function WriteChoicePage() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  // 로그인 확인 함수
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  const handleSelect = (type, path) => {
    setSelected(type);

    // 로그인 확인
    if (!checkAuth()) {
      // 로그인되지 않은 경우 로그인 알림 페이지로 이동
      setTimeout(() => navigate('/login-alert'), 120);
      return;
    }

    // 로그인된 경우 해당 페이지로 이동
    setTimeout(() => navigate(path), 120);
  };

  const yellowHex = '#FFD600';

  // 선택된 타입에 따라 색상 동적으로 지정
  const getButtonStyle = (type) => {
    if (selected === type) {
      return {
        border: `2px solid ${yellowHex}`,
        boxShadow: `0 0 0 4px ${yellowHex}33`,
        transform: 'scale(1.02)',
        transition: '0.15s',
      };
    }
    return {
      border: 'none',
      boxShadow: 'none',
      transition: '0.15s',
    };
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-black px-4 relative">
      {/* 뒤로가기 버튼 */}
      <BackButton className="absolute top-6 left-4" />

      <div className="w-full max-w-md">
        <h1 className="text-white text-2xl md:text-3xl font-bold text-center mb-2">
          무엇을 하실 계획이신가요?
        </h1>
        <p className="text-gray-400 text-center mb-8 text-base">
          게시글 작성, 모임 제작 중 선택하실 수 있어요
        </p>
        <div className="space-y-4">
          {/* 모임 만들기 */}
          <button
            type="button"
            onClick={() => handleSelect('group', '/groups/write')}
            className="flex items-center p-4 rounded-2xl w-full bg-[#222] hover:bg-[#292929] transition shadow mb-2"
            style={getButtonStyle('group')}
          >
            <GroupIcon
              className="w-8 h-8 mr-4 transition-all duration-150"
              style={{ color: yellowHex }}
            />
            <div className="flex-1 text-left">
              <div className="font-bold text-white text-base mb-1">
                모임 만들기
              </div>
              <div className="text-gray-400 text-sm">
                대화를 나눌 사람들을 찾아보세요!
              </div>
            </div>
            <svg
              className="w-6 h-6 ml-2"
              style={{
                color: selected === 'group' ? yellowHex : '#ccc',
                transition: '0.15s',
              }}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* 게시글 작성하기 */}
          <button
            type="button"
            onClick={() => handleSelect('board', '/boards/write')}
            className="flex items-center p-4 rounded-2xl w-full bg-[#222] hover:bg-[#292929] transition shadow"
            style={getButtonStyle('board')}
          >
            <WriteIcon
              className="w-8 h-8 mr-4 transition-all duration-150"
              style={{ color: yellowHex }}
            />
            <div className="flex-1 text-left">
              <div className="font-bold text-white text-base mb-1">
                게시글 작성하기
              </div>
              <div className="text-gray-400 text-sm">
                다채로운 내용이 담긴 글을 작성해보세요!
              </div>
            </div>
            <svg
              className="w-6 h-6 ml-2"
              style={{
                color: selected === 'board' ? yellowHex : '#ccc',
                transition: '0.15s',
              }}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
