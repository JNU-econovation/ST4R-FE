import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import BackButton from '../../components/common/BackButton';
import ModalPortal from '../../components/common/ModalPortal';
import ProfileUpdateSuccessModal from '../../components/modals/ProfileUpdateSuccessModal';
import uploadImagesToS3 from '../../api/imgupload';

// 사용자 정보 조회 API
const useUserInfo = () => {
  return useQuery({
    queryKey: ['userInfo'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await axios.get('https://eridanus.econo.mooo.com/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!localStorage.getItem('token'),
  });
};

// 닉네임 중복 확인 API
const useCheckNicknameMutation = () => {
  return useMutation({
    mutationFn: async (nickname) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await axios.get(
        `https://eridanus.econo.mooo.com/members/exists?nickname=${encodeURIComponent(nickname)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    },
  });
};

// 프로필 수정 API
const useUpdateProfileMutation = () => {
  return useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      // API 요청 형식에 맞게 데이터 변환
      const requestData = {};

      // 프로필 이미지 변경 여부 확인
      if (data.profileImageUrl !== undefined) {
        requestData.changeProfileImage = true;
        requestData.profileImageUrlToChange = data.profileImageUrl;
      } else {
        requestData.changeProfileImage = false;
      }

      // 닉네임 변경 여부 확인
      if (
        data.nickname !== undefined &&
        data.nickname !== data.originalNickname
      ) {
        requestData.changeNickname = true;
        requestData.nicknameToChange = data.nickname;
      } else {
        requestData.changeNickname = false;
      }

      // 둘 다 false면 에러 처리
      if (!requestData.changeProfileImage && !requestData.changeNickname) {
        throw new Error('변경할 항목이 없습니다.');
      }

      const response = await axios.patch(
        'https://eridanus.econo.mooo.com/my/profile',
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      // 업데이트된 사용자 정보 저장
      if (data) {
        localStorage.setItem('user', JSON.stringify(data));
      }
    },
  });
};

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const imageInputRef = useRef(null);

  const { data: userInfo, isLoading: isLoadingUserInfo } = useUserInfo();
  const checkNicknameMutation = useCheckNicknameMutation();
  const updateProfileMutation = useUpdateProfileMutation();

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
  const [isNicknameChecked, setIsNicknameChecked] = useState(true); // 기존 닉네임은 체크된 상태
  const [nicknameCheckResult, setNicknameCheckResult] = useState('');
  const [originalNickname, setOriginalNickname] = useState('');

  // 성공 모달 상태
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 사용자 정보로 폼 초기화
  useEffect(() => {
    if (userInfo) {
      setFormData({
        nickname: userInfo.nickname || '',
        birthDate: userInfo.birthDate || '',
        gender: userInfo.gender || 'UNKNOWN',
        profileImageUrl: userInfo.profileImageUrl || '',
      });
      setOriginalNickname(userInfo.nickname || '');
      setProfileImagePreview(userInfo.profileImageUrl || '');
    }
  }, [userInfo]);

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

    // 닉네임이 변경되면 중복 확인 리셋 (원래 닉네임과 다른 경우만)
    if (field === 'nickname' && value !== originalNickname) {
      setIsNicknameChecked(false);
      setNicknameCheckResult('');
    } else if (field === 'nickname' && value === originalNickname) {
      setIsNicknameChecked(true);
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

    // 원래 닉네임과 같으면 중복 확인 불필요
    if (formData.nickname === originalNickname) {
      setIsNicknameChecked(true);
      setNicknameCheckResult('available');
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

      if (response.isSuccess) {
        if (response.exists) {
          setErrors((prev) => ({
            ...prev,
            nickname: '이미 존재하는 닉네임입니다.',
          }));
          setNicknameCheckResult('unavailable');
          setIsNicknameChecked(false);
        } else {
          setIsNicknameChecked(true);
          setNicknameCheckResult('available');
          setErrors((prev) => ({ ...prev, nickname: '' }));
        }
      }
    } catch (error) {
      console.error('닉네임 중복 확인 에러:', error);
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
    } else if (!isNicknameChecked && formData.nickname !== originalNickname) {
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

  // 프로필 수정 제출
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      let imageUrl = formData.profileImageUrl;

      // 새 이미지가 선택된 경우 S3 업로드
      if (profileImage) {
        setIsImageUploading(true);
        try {
          const uploadedUrls = await uploadImagesToS3([{ img: profileImage }]);
          if (uploadedUrls && uploadedUrls.length > 0) {
            imageUrl = uploadedUrls[0];
          }
        } catch (uploadError) {
          console.error('이미지 업로드 실패:', uploadError);
          alert('이미지 업로드에 실패했습니다.');
          setIsImageUploading(false);
          return;
        }
        setIsImageUploading(false);
      }

      const submitData = {
        nickname: formData.nickname.trim(),
        birthDate: formData.birthDate,
        gender: formData.gender,
        profileImageUrl: imageUrl,
      };

      await updateProfileMutation.mutateAsync(submitData);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('프로필 수정 실패:', error);
      alert('프로필 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 로딩 중 표시
  const isLoading =
    isLoadingUserInfo ||
    checkNicknameMutation.isLoading ||
    updateProfileMutation.isLoading ||
    isImageUploading;

  if (isLoadingUserInfo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-['Pretendard']">
      <div className="px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center mb-6">
          <BackButton />
          <h1 className="text-xl font-bold text-white ml-3">프로필 수정</h1>
        </div>

        {/* 폼 */}
        <div className="space-y-5">
          {/* 프로필 이미지 */}
          <div className="text-center">
            <label className="block text-sm font-medium text-white mb-4">
              프로필 이미지
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
              닉네임
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
                  formData.nickname === originalNickname ||
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
            {nicknameCheckResult === 'available' &&
              !errors.nickname &&
              formData.nickname !== originalNickname && (
                <p className="text-green-400 text-sm mt-1">
                  ✓ 사용 가능한 닉네임입니다
                </p>
              )}
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              생년월일
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
              : updateProfileMutation.isLoading
                ? '수정중...'
                : '수정 완료'}
          </button>
        </div>
      </div>

      {/* 성공 모달 */}
      {showSuccessModal && (
        <ModalPortal>
          <ProfileUpdateSuccessModal
            onNavigateToProfile={() => navigate('/profile')}
          />
        </ModalPortal>
      )}
    </div>
  );
}
