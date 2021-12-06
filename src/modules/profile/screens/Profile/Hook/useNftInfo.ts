import { Axios } from 'modules/common/conts';
import { useEffect, useState } from 'react';
import { INftInfoSchema } from './types';

export const useNftInfo = (mintKey: string) => {
  const [info, setInfo] = useState<INftInfoSchema | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mintKey) return;
    fetchTargetNftInfoBymint(mintKey)
      .catch(() => {
        // setInfo(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [mintKey]);

  const fetchTargetNftInfoBymint = async (mintKey: string) => {
    const params = {
      mintAddress: mintKey,
    };

    const res = (await Axios.get('/tokens/info', { params })) as any;

    if (res.status === 200) {
      const data = res.data;

      if (data.code === 0) {
        setInfo(data.data);
      } else {
        console.error(data.msg);
      }
    } else {
      console.error('error: /tokens/owned');
    }
  };

  return {
    data: info,
    loading: loading,
  };
};
