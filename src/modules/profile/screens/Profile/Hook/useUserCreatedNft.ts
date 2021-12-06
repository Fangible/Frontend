import { Axios } from 'modules/common/conts';
import { useEffect, useState } from 'react';
import { INftInfoSchema } from './types';
import { PAGE_LIMIT } from './useUserOwnedNft';

export const useUserCreatedNft = (
  userAddress: string,
  currentPageIndex: number,
) => {
  const [list, setList] = useState<INftInfoSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageConfig, setPageConfig] = useState({
    pageIndex: currentPageIndex,
    pageCount: 1,
    total: 0,
  });

  useEffect(() => {
    if (!userAddress) return;
    fetchCreatedNftByUser(userAddress, currentPageIndex)
      .catch(error => {
        console.error('');
        setList([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userAddress, currentPageIndex]);

  const fetchCreatedNftByUser = async (
    pubkey: string,
    currentPageIndex: number = 1,
  ) => {
    const params = {
      pubkey,
      offset: (currentPageIndex - 1) * PAGE_LIMIT,
      limit: PAGE_LIMIT,
      parseURI: false,
    };

    const res = (await Axios.get('/tokens/created', { params })) as any;
    if (res.status === 200) {
      const data = res.data;
      if (data.code === 0) {
        setList(data.data);
        setPageConfig({
          pageIndex: data.offset + 1,
          pageCount: Math.ceil(data.total / PAGE_LIMIT),
          total: data.total,
        });
      } else {
        throw new Error(`Interface Error： ${data.msg}`);
      }
    } else {
      throw new Error(`Interface Error： ${res.status}`);
    }
  };

  return {
    list: list,
    loading: loading,
    pageConfig,
  };
};
