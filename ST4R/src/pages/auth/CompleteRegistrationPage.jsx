import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import uploadImagesToS3 from '../../api/imgupload';

// 닉네임 중복 확인 API - 수정됨
const useCheckNicknameMutation = () => {
  return useMutation({
    mutationFn: async (nickname) => {
      const response = await axios.get(
        `http://eridanus.econo.mooo.com:8080/members/exists`,
        {
          params: { nickname },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    },
  });
};

// 회원가입 완료 API
const useCompleteRegistrationMutation = () => {
  return useMutation({
    mutationFn: async (data) => {
      console.log('회원가입 완료 요청:', data);

      const response = await axios.patch(
        'http://eridanus.econo.mooo.com:8080/members/completeRegistration',
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('회원가입 완료 응답:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('회원가입 완료 성공');
      alert('회원가입이 완료되었습니다!');
      window.location.href = '/home';
    },
    onError: (error) => {
      console.error('회원가입 완료 실패:', error);
      console.error('에러 상세:', error.response?.data);

      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login';
      } else if (error.response?.status === 400) {
        alert('입력한 정보를 확인해주세요.');
      } else if (error.response?.status === 409) {
        // 409 Conflict 에러 처리 - 이미 회원가입이 완료된 상태일 수 있음
        const errorMessage =
          error.response?.data?.message ||
          '이미 회원가입이 완료되었거나 중복된 정보입니다.';
        alert(errorMessage);
        // 이미 완료된 경우 홈으로 이동
        window.location.href = '/home';
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

  // 유효성 검사 상태
  const [errors, setErrors] = useState({});
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [nicknameCheckResult, setNicknameCheckResult] = useState('');

  // URL에서 토큰 확인 및 저장
  useEffect(() => {
    const token = searchParams.get('accessToken');
    if (token) {
      localStorage.setItem('token', token);
      // URL에서 토큰 제거
      navigate('/complete-registration', { replace: true });
    } else if (!localStorage.getItem('token')) {
      // 토큰이 없으면 로그인 페이지로 이동
      navigate('/login');
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

    try {
      const response = await checkNicknameMutation.mutateAsync(
        formData.nickname
      );
      console.log('닉네임 중복 확인 응답:', response);

      if (response.isSuccess) {
        if (response.exists) {
          // 닉네임이 이미 존재하는 경우
          setErrors((prev) => ({
            ...prev,
            nickname: '이미 존재하는 닉네임입니다.',
          }));
          setNicknameCheckResult('unavailable');
          setIsNicknameChecked(false);
        } else {
          // 닉네임을 사용할 수 있는 경우
          setIsNicknameChecked(true);
          setNicknameCheckResult('available');
          setErrors((prev) => ({ ...prev, nickname: '' }));
        }
      } else {
        // API 응답에서 isSuccess가 false인 경우
        setErrors((prev) => ({
          ...prev,
          nickname: response.message || '닉네임 확인에 실패했습니다.',
        }));
        setNicknameCheckResult('error');
        setIsNicknameChecked(false);
      }
    } catch (error) {
      console.error('닉네임 중복 확인 에러:', error);

      if (error.response?.status === 404) {
        console.warn('닉네임 중복 확인 API 엔드포인트를 확인해주세요.');
        alert(
          '닉네임 중복 확인 기능을 사용할 수 없습니다. 고유한 닉네임을 입력해주세요.'
        );
        setErrors((prev) => ({
          ...prev,
          nickname: '닉네임 중복 확인을 할 수 없습니다.',
        }));
        setNicknameCheckResult('error');
      } else {
        setErrors((prev) => ({
          ...prev,
          nickname: '닉네임 확인에 실패했습니다.',
        }));
        setNicknameCheckResult('error');
      }
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
    } else if (!isNicknameChecked || nicknameCheckResult !== 'available') {
      // 닉네임 중복 확인이 실패했거나 에러인 경우는 통과시킴 (404 에러 대응)
      if (nicknameCheckResult === 'error') {
        // 에러인 경우 경고만 표시하고 진행 허용
        console.warn('닉네임 중복 확인 없이 진행');
      } else {
        newErrors.nickname = '닉네임 중복 확인을 해주세요.';
      }
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

  // 회원가입 완료 제출
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      let finalProfileImageUrl = formData.profileImageUrl;

      // 이미지가 업로드된 경우 S3에 업로드
      if (profileImage) {
        console.log('프로필 이미지 업로드 시작');
        const imageUrls = await uploadImagesToS3([{ img: profileImage }]);
        if (imageUrls && imageUrls.length > 0) {
          finalProfileImageUrl = imageUrls[0];
          console.log('프로필 이미지 업로드 완료:', finalProfileImageUrl);
        }
      }

      const submitData = {
        nickname: formData.nickname.trim(),
        birthDate: formData.birthDate,
        gender: formData.gender,
        profileImageUrl: finalProfileImageUrl || null,
      };

      completeRegistrationMutation.mutate(submitData);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

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
              />
              <button
                type="button"
                onClick={checkNickname}
                disabled={
                  !formData.nickname.trim() || checkNicknameMutation.isLoading
                }
                className="px-4 h-12 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            {nicknameCheckResult === 'unavailable' && (
              <p className="text-red-400 text-sm mt-1">
                이미 존재하는 닉네임입니다.
              </p>
            )}
            {nicknameCheckResult === 'error' && !errors.nickname && (
              <p className="text-yellow-400 text-sm mt-1">
                ⚠ 닉네임 중복 확인을 할 수 없습니다. 고유한 닉네임을
                사용해주세요.
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
                  className={`h-12 rounded-lg border transition-colors ${
                    formData.gender === option.value
                      ? 'bg-yellow-500 border-yellow-500 text-black font-medium'
                      : 'bg-[#1D1D1D] border-gray-600 text-white hover:border-gray-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 제출 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={completeRegistrationMutation.isLoading}
            className={`w-full h-14 rounded-lg font-bold text-lg transition-colors ${
              completeRegistrationMutation.isLoading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-500 text-black hover:bg-yellow-400'
            }`}
          >
            {completeRegistrationMutation.isLoading ? '처리중...' : '가입 완료'}
          </button>
        </div>
      </div>
    </div>
  );
}
