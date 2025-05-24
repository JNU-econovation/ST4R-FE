import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        'http://eridanus.econo.mooo.com:8080/oauth/kakao/logout',
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
      window.location.href = '/login';
    },
    onError: (error) => {
      console.error('로그아웃 실패', error);
    },
  });
};
