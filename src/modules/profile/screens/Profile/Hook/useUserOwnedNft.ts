import { Axios } from 'modules/common/conts';
import { useEffect, useState } from 'react';
import { INftInfoSchema } from './types';
export const PAGE_LIMIT = 15;

export const useUserOwnedNft = (
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
    fetchOwnedNftByUser(userAddress, currentPageIndex)
      .catch(error => {
        console.error(error);
        setList([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userAddress, currentPageIndex]);

  const fetchOwnedNftByUser = async (
    pubkey: string,
    currentPageIndex: number,
  ) => {
    const params = {
      pubkey,
      offset: (currentPageIndex - 1) * PAGE_LIMIT,
      limit: PAGE_LIMIT,
      parseURI: false,
    };

    const res = (await Axios.get('/tokens/owned', { params })) as any;
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
