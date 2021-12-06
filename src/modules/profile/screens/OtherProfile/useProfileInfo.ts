import { Axios_old } from 'modules/common/conts';
import { mapProfileInfo } from 'modules/profile/api/profileInfo';
import { useEffect, useState } from 'react';

function useProfileInfo(tarUserAddress: string, initialize: any) {
  const [loading, setLoading] = useState(true);
  const [profileInfo, setProfileInfo] = useState(initialize || {});

  useEffect(() => {
    if (!tarUserAddress) return;

    fetchAccountProfile(tarUserAddress)
      .then(res => {
        setProfileInfo(mapProfileInfo({ code: 200, data: res }));
      })
      .catch(err => {
        console.error('fetchAccountProfile');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tarUserAddress]);

  return {
    loading,
    data: profileInfo,
  };
}

export default useProfileInfo;

// 根据用户地址请求账户设置数据
const fetchAccountProfile = async (accountaddress: string) => {
  const params = {
    params: {
      accountaddress,
    },
  };
  const result = await Axios_old.get('/accountinfo/getaccount', params);
  if (result.status === 200 && result.data.code === 0) {
    return Promise.resolve(result.data.data);
  }
  return Promise.reject(result.data || result);
};
