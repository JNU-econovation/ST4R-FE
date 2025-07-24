import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchBar from '../components/common/SearchBar';
import FortuneIcon from '../assets/icons/fortune.svg?react';
import {
  useWeather,
  useGeolocation,
  getWeatherKorean,
  getWeatherIcon,
} from '../hooks/useWeather';

export default function Header({
  onSearch,
  onSearchTypeChange,
  isSearchLoading = false,
  searchType = 'titleAndContent',
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 인증 상태 관리
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // 지도 검색 활성 상태 확인 (URL 파라미터로)
  const isMapSearchActive = searchParams.has('lat') && searchParams.has('lng');

  // 위치 정보 가져오기
  const { data: location, isLoading: isLocationLoading } = useGeolocation();

  // 지도 검색이 활성화된 경우 URL에서 위치 정보 사용, 아니면 현재 위치 사용
  const weatherLocation = isMapSearchActive
    ? {
        latitude: parseFloat(searchParams.get('lat')),
        longitude: parseFloat(searchParams.get('lng')),
      }
    : location;

  // 날씨 정보 가져오기
  const {
    data: weatherData,
    isLoading: isWeatherLoading,
    error: weatherError,
  } = useWeather(
    weatherLocation?.latitude,
    weatherLocation?.longitude,
    !!weatherLocation
  );

  // 인증 상태 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsAuthenticated(false);
        setAuthChecked(true);
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp && payload.exp > currentTime) {
          setIsAuthenticated(true);
        } else {
          // 토큰 만료
          console.log('헤더: 토큰 만료 감지');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('헤더: 토큰 파싱 에러:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }

      setAuthChecked(true);
    };

    checkAuthStatus();

    // storage 이벤트 리스너 (다른 탭에서 로그인/로그아웃 시)
    const handleStorageChange = () => {
      console.log('헤더: storage 변경 감지');
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);

    // 주기적으로 토큰 상태 확인 (5분마다)
    const tokenCheckInterval = setInterval(checkAuthStatus, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(tokenCheckInterval);
    };
  }, []);

  // 로그인 버튼 클릭 핸들러
  const handleLoginClick = () => {
    // 현재 페이지를 returnUrl로 저장
    const currentPath = window.location.pathname + window.location.search;
    if (
      currentPath !== '/login' &&
      currentPath !== '/login-alert' &&
      currentPath !== '/register' &&
      !currentPath.includes('/profile') // 프로필 관련 경로는 제외
    ) {
      sessionStorage.setItem('returnUrl', currentPath);
    }

    // 카카오 로그인 URL로 직접 이동
    const isDevelopment = window.location.hostname === 'localhost';
    const redirectUrl = isDevelopment
      ? 'http://localhost:5173'
      : window.location.origin;

    const loginUrl = `https://eridanus.econo.mooo.com/oauth/kakao?redirect=${redirectUrl}`;
    window.location.href = loginUrl;
  };

  // 운세 버튼 클릭 핸들러
  const handleFortuneClick = () => {
    // 운세 기능 구현 예정
    alert('운세 기능은 준비 중입니다.');
  };

  // 알림 버튼 클릭 핸들러
  const handleNotificationClick = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요한 기능입니다.');
      handleLoginClick();
      return;
    }
    // 알림 기능 구현 예정
    alert('알림 기능은 준비 중입니다.');
  };

  // 로고 클릭 핸들러
  const handleLogoClick = () => {
    const currentPath = window.location.pathname;

    // 홈 페이지에 있는 경우 새로고침
    if (currentPath === '/home' || currentPath === '/') {
      window.location.reload();
    } else {
      // 다른 페이지에 있는 경우 홈으로 이동
      navigate('/home');
    }
  };

  // 지도 검색 버튼 클릭 핸들러
  const handleMapSearchClick = () => {
    if (isMapSearchActive) {
      // 지도 검색 모드 해제 - 홈으로 리다이렉트
      navigate('/home');
    } else {
      // 지도 검색 페이지로 이동
      navigate('/map-search');
    }
  };

  // 검색 핸들러 개선
  const handleSearch = (query) => {
    console.log('헤더에서 검색 실행:', { query, searchType });
    if (onSearch) {
      onSearch(query);
    }
  };

  // 검색 타입 변경 핸들러 개선
  const handleSearchTypeChange = (type) => {
    console.log('헤더에서 검색 타입 변경:', type);
    if (onSearchTypeChange) {
      onSearchTypeChange(type);
    }
  };

  // 위치 정보 표시 로직
  const getLocationDisplay = () => {
    if (isMapSearchActive) {
      return searchParams.get('locationName') || '선택된 위치';
    }

    if (weatherData?.address) {
      const { level1, level2 } = weatherData.address;
      return level2 ? `${level1} ${level2}` : level1;
    }

    if (isLocationLoading) {
      return '위치 확인중';
    }

    return '광주광역시'; // 기본값
  };

  // 날씨 정보 표시 로직
  const getWeatherDisplay = () => {
    if (isWeatherLoading) {
      return (
        <div className="flex items-center">
          <div className="w-2 h-2 border border-gray-400 border-t-transparent rounded-full animate-spin mr-1"></div>
          로딩중
        </div>
      );
    }

    if (weatherError || !weatherData) {
      return '19°C / 맑음'; // 기본값
    }

    const temp = Math.round(weatherData.temp);
    const weatherKorean = getWeatherKorean(weatherData.weather);
    const weatherIcon = getWeatherIcon(weatherData.weather);

    return `${temp}°C / ${weatherIcon} ${weatherKorean}`;
  };

  // 인증 상태 확인이 완료되지 않은 경우 기본적으로 비로그인 상태로 렌더링
  const shouldShowLoginButton = !authChecked || !isAuthenticated;

  return (
    <header className="bg-black text-white">
      <div>
        {/* 상단 타이틀과 알림 영역 */}
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-2xl font-bold text-white cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          >
            Starlight
          </h1>
          <div className="flex items-center space-x-2">
            {/* 알림 아이콘 */}
            <button
              onClick={handleNotificationClick}
              className="bg-[#2A2A2A] rounded-full p-2 hover:bg-[#3A3A3A] transition-colors"
              type="button"
              aria-label="알림"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>

            {/* 로그인 상태에 따른 조건부 렌더링 */}
            {shouldShowLoginButton ? (
              <button
                onClick={handleLoginClick}
                className="bg-[#FFBB02] rounded-full px-4 py-2 hover:bg-[#E6A500] transition-colors flex items-center space-x-1"
                type="button"
                aria-label="로그인"
              >
                <svg
                  className="w-4 h-4 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-black text-sm font-medium">로그인</span>
              </button>
            ) : (
              <button
                onClick={handleFortuneClick}
                className="bg-[#2A2A2A] rounded-full px-3 py-2 hover:bg-[#3A3A3A] transition-colors flex items-center space-x-1"
                type="button"
                aria-label="운세"
              >
                <FortuneIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">운세</span>
              </button>
            )}
          </div>
        </div>

        {/* 위치와 날씨 정보 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {/* 위치 정보 */}
            <div className="flex items-center bg-[#2A2A2A] rounded-full px-2 py-1 text-gray-300 text-xs">
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {getLocationDisplay()}
            </div>

            {/* 날씨 정보 */}
            <div className="flex items-center bg-[#2A2A2A] rounded-full px-2 py-1 text-gray-300 text-xs">
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
              {getWeatherDisplay()}
            </div>
          </div>

          {/* 지도 검색 버튼 */}
          <button
            onClick={handleMapSearchClick}
            className={`rounded-full p-2 transition-colors flex items-center space-x-1 ${
              isMapSearchActive
                ? 'bg-yellow-500 text-black'
                : 'bg-[#2A2A2A] text-gray-400 hover:bg-[#3A3A3A]'
            }`}
            title={isMapSearchActive ? '지도 검색 해제' : '지도로 검색'}
            type="button"
            aria-label={isMapSearchActive ? '지도 검색 해제' : '지도로 검색'}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m-6 3l6-3"
              />
            </svg>
          </button>
        </div>

        {/* 지도 검색 활성 상태 표시 */}
        {isMapSearchActive && (
          <div className="mb-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-yellow-500 text-sm font-medium">
                  지도 검색 활성화됨
                </span>
              </div>
              <div className="text-xs text-yellow-400">
                {parseInt(searchParams.get('searchRadius')) >= 1000
                  ? `${parseInt(searchParams.get('searchRadius')) / 1000}km`
                  : `${searchParams.get('searchRadius')}m`}{' '}
                반경
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {searchParams.get('roadAddress')}
            </div>
          </div>
        )}

        {/* 검색바 */}
        <div className="mb-5">
          <div className="relative">
            <SearchBar
              onSearch={handleSearch}
              onSearchTypeChange={handleSearchTypeChange}
              isLoading={isSearchLoading}
              placeholder="별자리에 관해 궁금한 글들을 검색해보세요."
              showSearchTypeSelector={true}
              currentSearchType={searchType}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
