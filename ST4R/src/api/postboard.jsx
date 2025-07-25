import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

// 게시글 작성
export const useCreateBoardMutation = () => {
  return useMutation({
    mutationFn: async (data) => {
      console.log('받은 프론트엔드 데이터:', data);

      // imageUrls 처리 - null이나 빈 배열 처리
      let finalImageUrls = [];
      if (
        data.imageUrls &&
        Array.isArray(data.imageUrls) &&
        data.imageUrls.length > 0
      ) {
        // 빈 문자열이나 null 값들을 필터링
        const validUrls = data.imageUrls.filter(
          (url) => url && url.trim() !== ''
        );
        if (validUrls.length > 0) {
          finalImageUrls = validUrls;
        }
      }

      console.log('처리된 이미지 URLs:', finalImageUrls);

      // 프론트엔드 데이터
      const transformedData = {
        title: data.title?.trim() || '',
        imageUrls: finalImageUrls, // 빈 배열로 전송
        content: {
          text: data.content?.trim() || '',
          map: data.location
            ? {
                marker: {
                  latitude: data.location.marker.latitude,
                  longitude: data.location.marker.longitude,
                  locationName: data.location.marker.locationName,
                  roadAddress: data.location.marker.roadAddress,
                },
                zoomLevel: data.location.zoomLevel || 13,
              }
            : null,
        },
        category: data.category ? data.category.toLowerCase() : 'general',
      };

      // 필수 필드 검증
      if (!transformedData.title) {
        throw new Error('제목을 입력해주세요.');
      }

      if (!transformedData.content.text) {
        throw new Error('내용을 입력해주세요.');
      }

      console.log('백엔드로 전송할 데이터:', transformedData);

      const response = await axios.post(
        'https://eridanus.econo.mooo.com/home/boards',
        transformedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('서버 응답:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('게시글 작성 성공:', data);
      // 성공 시에는 모달을 표시하도록 변경
      return { success: true, data };
    },
    onError: (error) => {
      console.error('게시글 작성 실패:', error);
      console.error('에러 상세:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      // 구체적인 에러 메시지 처리
      if (
        error.message === '제목을 입력해주세요.' ||
        error.message === '내용을 입력해주세요.'
      ) {
        throw error; // 에러를 다시 던져서 컴포넌트에서 처리
      }

      if (error.response?.status === 401) {
        // 로그인 필요 알림 제거하고 홈으로 리다이렉트
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/home';
      } else if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message ||
          '잘못된 데이터입니다. 모든 필드를 확인해주세요.';
        throw new Error(errorMessage);
      } else if (error.response?.status === 422) {
        const errorMessage =
          error.response?.data?.message || '입력한 데이터가 올바르지 않습니다.';
        throw new Error(errorMessage);
      } else if (error.message.includes('imageUrls')) {
        throw new Error('이미지 처리 중 오류가 발생했습니다.');
      } else {
        throw new Error('게시글 작성에 실패했습니다. 다시 시도해주세요.');
      }
    },
  });
};

export const usePostBoardMutation = useCreateBoardMutation;

// 로그아웃
export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        'https://eridanus.econo.mooo.com/oauth/kakao/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/home'; // 홈으로 리다이렉트
    },
    onError: (error) => {
      console.error('로그아웃 실패', error);
      // 에러가 발생해도 로컬 데이터는 삭제하고 홈으로 이동
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/home';
    },
  });
};
