import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useGetBannedMembers= (id) => {
  const BASE_URL = 'https://eridanus.econo.mooo.com';
  return useQuery({
    queryKey: ['bannedMember', id],
    queryFn: async () => {
      const res = await axios.get(
        `${BASE_URL}/groups/${id}/members/bans`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return res.data;
    },
  });
};

