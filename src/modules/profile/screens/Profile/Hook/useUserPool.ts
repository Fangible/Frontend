import { Axios } from 'modules/common/conts';
import { IGoods, SolAuctionState } from 'modules/market/types';
import { useEffect, useState } from 'react';
import { PAGE_LIMIT } from './useUserOwnedNft';

export enum JoinType {
  'allType',
  'created',
  'participated',
}

export const useUserPool = (
  userAddress: string,
  currentPageIndex: number,
  joinType: JoinType,
  isOther?: boolean,
) => {
  const [list, setList] = useState<IGoods[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageConfig, setPageConfig] = useState({
    pageIndex: currentPageIndex,
    pageCount: 1,
    total: 0,
  });

  useEffect(() => {
    if (!userAddress) return;
    fetchUserPool(userAddress, joinType, currentPageIndex)
      .catch(error => {
        console.error('');
        setList([]);
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [userAddress, currentPageIndex, joinType]);

  const fetchUserPool = async (
    myAddress: string,
    joinType: JoinType,
    currentPageIndex: number = 1,
  ) => {
    const _params = {
      myAddress: myAddress,
      joinType: joinType,
      offset: (currentPageIndex - 1) * PAGE_LIMIT,
      limit: PAGE_LIMIT,
    };

    const params = isOther
      ? { ..._params, state: SolAuctionState.STARTED }
      : _params;

    const res = (await Axios.get('/auctions/my', { params })) as any;
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
