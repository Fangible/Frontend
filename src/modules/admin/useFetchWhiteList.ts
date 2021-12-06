import axios from 'axios';
import { Axios } from 'modules/common/conts';
import { useEffect, useState } from 'react';

const PAGE_LIMIT = 10;

export interface IApi_whiteListItem {
  activated: boolean;
  address: string;
  id: number;
  image: string;
  name: string;
}

export const useFetchWhiteList = (currentPageIndex: number) => {
  const [loading, setLoading] = useState(true);
  const [whiteList, setWhiteList] = useState<IApi_whiteListItem[]>([]);
  const [pageConfig, setPageConfig] = useState({
    pageIndex: currentPageIndex,
    pageCount: 1,
    total: 0,
  });

  useEffect(() => {
    const source = axios.CancelToken.source();

    const fetchWhiteList = async (params: IParams_fetchWhiteList) => {
      const result = await Axios.get('/whitelist/users', {
        params,
        cancelToken: source.token,
      });
      if (result.status === 200 && result.data.code === 0)
        return Promise.resolve(result.data);
      return Promise.reject(result.data || result);
    };

    fetchWhiteList({
      activated: true,
      limit: PAGE_LIMIT,
      offset: (currentPageIndex - 1) * PAGE_LIMIT,
    })
      .then(res => {
        setWhiteList(res.data);
        setPageConfig({
          ...pageConfig,
          total: res.total,
          pageCount: Math.ceil(res.total / PAGE_LIMIT),
        });
      })
      .catch(err => {
        console.error('fetchWhiteList', err);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      source.cancel();
    };

    // eslint-disable-next-line
  }, [currentPageIndex]);

  return { loading, whiteList, pageConfig };
};

interface IParams_fetchWhiteList {
  activated?: boolean;
  address?: string;
  offset: number;
  limit: number;
}
