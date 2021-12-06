import { useConnection } from 'npms/oystoer';
import { useEffect } from 'react';
import { useState } from 'react';
import { Axios } from 'modules/common/conts';
import { IGoods, SolAuctionState } from '../types';
import { ItemsChannel } from 'modules/overview/actions/fetchItemsByFilter';

export interface IMyMintItem {
  name: string;
  uri: string;
  sellerFeeBasisPoints: number;
  pubkey: string;
}

const PAGECOUNT_LIMIT = 15;

export const useMarketList = (props: {
  pageIndex: number;
  channel: ItemsChannel;
}) => {
  console.log('useMarketList', props);
  const connection = useConnection();
  const [list, setList] = useState<IGoods[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagesCount, setPagesCount] = useState(1);

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const params_ = {
        state: SolAuctionState.STARTED,
        limit: PAGECOUNT_LIMIT,
        offset: (props.pageIndex - 1) * PAGECOUNT_LIMIT,
      };
      let params = {};
      if (props.channel && props.channel !== ItemsChannel.all) {
        params = { ...params_, channel: props.channel };
      } else {
        params = params_;
      }

      Axios.get('/auctions', { params })
        .then(res => {
          if (res.status === 200) {
            if (res.data.code === 0) {
              const list = res.data.data;
              setList(list);

              const total = res.data.total;
              if (!total) {
                setPagesCount(1);
              } else {
                setPagesCount(Math.ceil(total / PAGECOUNT_LIMIT));
              }
            } else {
              throw new Error('Error: /auctions' + res.data.msg);
            }
          } else {
            throw new Error('Error: /auctions' + res.status);
          }
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });

      setList([]);
    };
    init();
  }, [connection, props.channel, props.pageIndex]);

  return {
    list,
    loading,
    pagesCount,
  };
};
