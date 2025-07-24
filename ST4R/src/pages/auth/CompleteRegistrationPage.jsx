import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import uploadImagesToS3 from '../../api/imgupload';

// 닉네임 중복 확인 API
const useCheckNicknameMutation = () => {
  return useMutation({
    mutationFn: async (nickname) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      console.log('닉네임 중복 확인 요청:', nickname);
      console.log('사용 중인 토큰:', token ? '존재' : '없음');

      try {
        // axios 인터셉터를 우회하여 직접 요청
        const response = await axios
          .create({
            baseURL: 'https://eridanus.econo.mooo.com',
            timeout: 15000,
          })
          .get(`/members/exists?nickname=${encodeURIComponent(nickname)}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

        console.log('닉네임 중복 확인 응답:', response.data);
        return response.data;
      } catch (error) {
        console.error('닉네임 중복 확인 에러:', error);
        console.error('에러 응답:', error.response?.data);
        console.error('에러 상태:', error.response?.status);

        // 401 에러는 토큰 문제
        if (error.response?.status === 401) {
          throw new Error('인증이 만료되었습니다.');
        }

        throw error;
      }
    },
  });
};

// 회원가입 완료 API
const useCompleteRegistrationMutation = () => {
  return useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      console.log('회원가입 완료 요청 데이터:', data);
      console.log('토큰 상태:', token ? '존재' : '없음');

      try {
        // axios 인터셉터를 우회하여 직접 요청
        const response = await axios
          .create({
            baseURL: 'https://eridanus.econo.mooo.com',
            timeout: 15000,
          })
          .patch('/members/completeRegistration', data, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

        console.log('회원가입 완료 응답:', response.data);
        return response.data;
      } catch (error) {
        console.error('회원가입 완료 에러 전체:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('회원가입 완료 성공:', data);

      // 사용자 정보를 localStorage에 저장
      if (data) {
        localStorage.setItem('user', JSON.stringify(data));
      }

      alert('회원가입이 완료되었습니다!');

      // returnUrl 확인 후 이동
      const returnUrl = sessionStorage.getItem('returnUrl');
      console.log('저장된 returnUrl:', returnUrl);

      // returnUrl이 있고 유효한 경우
      if (
        returnUrl &&
        returnUrl !== '/login' &&
        returnUrl !== '/login-alert' &&
        returnUrl !== '/register' &&
        !returnUrl.includes('/profile') // 프로필 관련 URL은 제외
      ) {
        sessionStorage.removeItem('returnUrl');
        console.log('returnUrl로 이동:', returnUrl);
        window.location.href = returnUrl;
      } else {
        // 그 외의 경우 홈으로 이동
        console.log('홈으로 이동');
        sessionStorage.removeItem('returnUrl'); // 혹시 남아있을 수 있는 returnUrl 제거
        window.location.href = '/home';
      }
    },
    onError: (error) => {
      console.error('회원가입 완료 실패:', error);
      console.error('에러 상세:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });

      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response?.status === 400) {
        const errorData = error.response?.data;
        const errorMessage =
          errorData?.message || '입력한 정보를 확인해주세요.';
        alert(errorMessage);
      } else if (error.response?.status === 409) {
        const errorMessage =
          error.response?.data?.message ||
          '이미 회원가입이 완료되었거나 중복된 정보입니다.';
        alert(errorMessage);
        // 이미 완료된 경우 홈으로 이동
        window.location.href = '/home';
      } else if (error.response?.status >= 500) {
        alert(
          '서버 오류로 회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.'
        );
      } else {
        alert('회원가입 완료에 실패했습니다. 다시 시도해주세요.');
      }
    },
  });
};

export default function CompleteRegistrationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const imageInputRef = useRef(null);

  const checkNicknameMutation = useCheckNicknameMutation();
  const completeRegistrationMutation = useCompleteRegistrationMutation();

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    nickname: '',
    birthDate: '',
    gender: 'UNKNOWN',
    profileImageUrl: '',
  });

  // 이미지 업로드 상태
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [isImageUploading, setIsImageUploading] = useState(false);

  // 유효성 검사 상태
  const [errors, setErrors] = useState({});
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [nicknameCheckResult, setNicknameCheckResult] = useState('');

  // 토큰 유효성 검사
  const validateToken = () => {
    const token = localStorage.getItem('token');
    console.log('저장된 토큰 확인:', token ? '있음' : '없음');

    if (!token) return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('잘못된 JWT 토큰 형식');
        return false;
      }

      // 기본적인 payload 파싱 확인
      const payload = JSON.parse(atob(parts[1]));
      console.log('토큰 payload:', payload);
      console.log(
        '토큰 만료 시간:',
        new Date(payload.exp * 1000).toLocaleString()
      );

      // 현재 시간과 비교
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        console.error('토큰이 만료되었습니다');
        return false;
      }

      return true;
    } catch (error) {
      console.error('토큰 검증 실패:', error);
      return false;
    }
  };

  // URL에서 토큰 확인 및 저장
  useEffect(() => {
    const token = searchParams.get('accessToken');

    if (token) {
      console.log('URL에서 토큰 확인됨');
      localStorage.setItem('token', token);

      // URL에서 토큰 제거
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('accessToken');
      const newUrl = newSearchParams.toString()
        ? `/register?${newSearchParams.toString()}`
        : '/register';

      window.history.replaceState({}, '', newUrl);
    } else {
      // URL에 토큰이 없는 경우, localStorage 확인
      if (!validateToken()) {
        console.log('유효한 토큰이 없음, 로그인 페이지로 이동');
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }
    }
  }, [searchParams, navigate]);

  // 입력 핸들러
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 에러 상태 초기화
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }

    // 닉네임이 변경되면 중복 확인 리셋
    if (field === 'nickname') {
      setIsNicknameChecked(false);
      setNicknameCheckResult('');
    }
  };

  // 이미지 업로드 핸들러
  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하만 가능합니다.');
        return;
      }

      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      setProfileImage(file);

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setProfileImage(null);
    setProfileImagePreview('');
    setFormData((prev) => ({ ...prev, profileImageUrl: '' }));
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // 닉네임 중복 확인
  const checkNickname = async () => {
    if (!formData.nickname.trim()) {
      setErrors((prev) => ({ ...prev, nickname: '닉네임을 입력해주세요.' }));
      return;
    }

    if (formData.nickname.length < 2 || formData.nickname.length > 10) {
      setErrors((prev) => ({
        ...prev,
        nickname: '닉네임은 2-10자 사이여야 합니다.',
      }));
      return;
    }

    // 닉네임 유효성 검사 (한글, 영문, 숫자만 허용)
    const nicknameRegex = /^[가-힣a-zA-Z0-9]*$/;
    if (!nicknameRegex.test(formData.nickname)) {
      setErrors((prev) => ({
        ...prev,
        nickname: '닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.',
      }));
      return;
    }

    try {
      const response = await checkNicknameMutation.mutateAsync(
        formData.nickname
      );
      console.log('닉네임 중복 확인 결과:', response);

      // API 응답 형식에 따라 처리
      if (response.isSuccess) {
        if (response.exists) {
          // 닉네임이 이미 존재
          setErrors((prev) => ({
            ...prev,
            nickname: '이미 존재하는 닉네임입니다.',
          }));
          setNicknameCheckResult('unavailable');
          setIsNicknameChecked(false);
        } else {
          // 사용 가능한 닉네임
          setIsNicknameChecked(true);
          setNicknameCheckResult('available');
          setErrors((prev) => ({ ...prev, nickname: '' }));
        }
      } else {
        // API 에러 응답
        setErrors((prev) => ({
          ...prev,
          nickname: response.message || '닉네임 확인에 실패했습니다.',
        }));
        setNicknameCheckResult('error');
        setIsNicknameChecked(false);
      }
    } catch (error) {
      console.error('닉네임 중복 확인 에러:', error);

      if (
        error.message === '인증이 만료되었습니다.' ||
        error.response?.status === 401
      ) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      // 기타 에러는 사용자에게 알림
      setErrors((prev) => ({
        ...prev,
        nickname: '닉네임 확인 중 오류가 발생했습니다.',
      }));
      setNicknameCheckResult('error');
      setIsNicknameChecked(false);
    }
  };

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    // 닉네임 검사
    if (!formData.nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요.';
    } else if (formData.nickname.length < 2 || formData.nickname.length > 10) {
      newErrors.nickname = '닉네임은 2-10자 사이여야 합니다.';
    } else if (!isNicknameChecked) {
      newErrors.nickname = '닉네임 중복 확인을 해주세요.';
    } else if (nicknameCheckResult === 'unavailable') {
      newErrors.nickname = '이미 존재하는 닉네임입니다.';
    }

    // 생년월일 검사
    if (!formData.birthDate) {
      newErrors.birthDate = '생년월일을 입력해주세요.';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 14 || age > 100) {
        newErrors.birthDate = '올바른 생년월일을 입력해주세요.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 회원가입 완료 제출 - 이미지 업로드는 회원가입 완료 후에 처리
  const handleSubmit = async () => {
    // 토큰 재검증
    if (!validateToken()) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      // 1. 먼저 이미지 없이 회원가입 완료
      const submitData = {
        nickname: formData.nickname.trim(),
        birthDate: formData.birthDate,
        gender: formData.gender,
        profileImageUrl: null,
      };

      console.log('회원가입 완료 데이터:', submitData);
      const userData =
        await completeRegistrationMutation.mutateAsync(submitData);

      // 2. 회원가입이 성공한 후에 이미지가 있다면 업로드 시도
      if (profileImage && userData) {
        console.log('회원가입 완료 후 프로필 이미지 업로드 시작');
        // 여기서 프로필 업데이트 API를 호출하거나
        // 홈으로 이동 후 프로필 수정 페이지에서 업로드하도록 안내
      }
    } catch (error) {
      console.error('회원가입 제출 중 에러:', error);
      // 에러는 mutation의 onError에서 처리됨
    }
  };

  // 로딩 중 표시
  const isLoading =
    checkNicknameMutation.isLoading ||
    completeRegistrationMutation.isLoading ||
    isImageUploading;

  return (
    <div className="min-h-screen bg-black text-white font-['Pretendard'] flex items-center justify-center">
      <div className="w-full max-w-md px-4 py-6">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">추가 정보 입력</h1>
          <p className="text-gray-400 text-sm">
            서비스 이용을 위한 기본 정보를 입력해주세요
          </p>
        </div>

        {/* 폼 */}
        <div className="space-y-5">
          {/* 프로필 이미지 */}
          <div className="text-center">
            <label className="block text-sm font-medium text-white mb-6">
              프로필 이미지 <span className="text-gray-400">(선택사항)</span>
            </label>

            <div className="flex flex-col items-center mb-2">
              <div
                onClick={handleImageClick}
                className="relative w-32 h-32 rounded-full bg-[#1D1D1D] border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-yellow-500 transition-colors group"
              >
                {profileImagePreview ? (
                  <>
                    <img
                      src={profileImagePreview}
                      alt="프로필 미리보기"
                      className="w-full h-full rounded-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageRemove();
                      }}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white text-sm hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <svg
                      className="w-10 h-10 text-gray-400 group-hover:text-yellow-500 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span className="text-xs text-gray-400 group-hover:text-yellow-500">
                      사진 추가
                    </span>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />

              {profileImage && (
                <p className="text-xs text-yellow-500 mt-2">
                  가입 후 프로필에서 사진을 설정할 수 있습니다
                </p>
              )}
            </div>
          </div>

          {/* 닉네임 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              닉네임 <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                placeholder="2-10자 사이로 입력해주세요"
                maxLength={10}
                className={`flex-1 h-12 px-3 bg-[#1D1D1D] rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-gray-500 ${
                  errors.nickname ? 'border border-red-400' : ''
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={checkNickname}
                disabled={
                  !formData.nickname.trim() ||
                  checkNicknameMutation.isLoading ||
                  isLoading
                }
                className="px-3 h-12 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap flex-shrink-0"
              >
                {checkNicknameMutation.isLoading ? '확인중...' : '중복확인'}
              </button>
            </div>
            {errors.nickname && (
              <p className="text-red-400 text-sm mt-1">{errors.nickname}</p>
            )}
            {nicknameCheckResult === 'available' && !errors.nickname && (
              <p className="text-green-400 text-sm mt-1">
                ✓ 사용 가능한 닉네임입니다
              </p>
            )}
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              생년월일 <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full h-12 px-3 bg-[#1D1D1D] rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white ${
                errors.birthDate ? 'border border-red-400' : ''
              }`}
              disabled={isLoading}
            />
            {errors.birthDate && (
              <p className="text-red-400 text-sm mt-1">{errors.birthDate}</p>
            )}
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              성별
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'MAN', label: '남성' },
                { value: 'WOMAN', label: '여성' },
                { value: 'UNKNOWN', label: '선택안함' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('gender', option.value)}
                  disabled={isLoading}
                  className={`h-12 rounded-lg border transition-colors ${
                    formData.gender === option.value
                      ? 'bg-yellow-500 border-yellow-500 text-black font-medium'
                      : 'bg-[#1D1D1D] border-gray-600 text-white hover:border-gray-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 제출 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full h-14 rounded-lg font-bold text-lg transition-colors ${
              isLoading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-500 text-black hover:bg-yellow-400'
            }`}
          >
            {isImageUploading
              ? '이미지 업로드 중...'
              : completeRegistrationMutation.isLoading
                ? '처리중...'
                : '가입 완료'}
          </button>
        </div>

        {/* 하단 안내 텍스트 */}
        <div className="mt-4 text-center text-xs text-gray-500">
          가입 완료 후 언제든지 프로필에서 정보를 수정할 수 있습니다.
        </div>
      </div>
    </div>
  );
}
