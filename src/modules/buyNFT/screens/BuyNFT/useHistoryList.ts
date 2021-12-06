import axios from 'axios';
import { Axios } from 'modules/common/conts';
import { useEffect, useState } from 'react';

export type Action_Type =
  | 'CreateAuction'
  | 'EndAuction'
  | 'WinAuction'
  | 'ClaimFund'
  | 'ClaimToken';

export interface IHistoryList {
  action: Action_Type;
  amount: number;
  blockTs: number;
  mintAddress: string;
  signature: string;
  userAddress: string;
}

export default function useHistoryList(props: { auctionAddress: string }) {
  const [loading, setLoading] = useState(true);
  const [historyList, setHistoryList] = useState<IHistoryList[]>([]);

  useEffect(() => {
    const source = axios.CancelToken.source();
    const params = {
      auctionAddress: props.auctionAddress,
    };

    const fetchHistoryList = async () => {
      try {
        const result = await Axios.get('/auctions/histories', {
          cancelToken: source.token,
          params,
        });

        if (result.status === 200 && result.data.code === 0) {
          setHistoryList(result.data.data);
        } else {
          throw new Error('Error: /auctions/histories');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryList();

    return () => {
      source.cancel();
    };
  }, [props.auctionAddress]);

  return {
    loading,
    historyList,
  };
}
