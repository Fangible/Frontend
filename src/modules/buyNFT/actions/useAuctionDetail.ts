import { UserRoleEnum } from 'modules/common/actions/queryAccountInfo';
import { Axios, Axios_old } from 'modules/common/conts';
import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import { IGoods } from 'modules/market/types';
import { INftInfoSchema } from 'modules/profile/screens/Profile/Hook/types';
import { useCallback, useEffect, useState } from 'react';

interface IRoleInfo_SOL {
  userAccount: string;
  userName: string;
  avatar: string;
  isVerify: boolean;
}

export default function useAuctionDetail(auctionKey: string) {
  const [auctionDetail, setAuctionDetail] = useState<IGoods>();
  const [itemNftInfo, setItemNftInfo] = useState<INftInfoSchema>();
  const [roleInfo_seller, setRoleInfo_seller] = useState<IRoleInfo_SOL>({
    userAccount: '',
    userName: '',
    avatar: '',
    isVerify: false,
  });

  const { address: myAddress } = useReactWeb3();

  const fetch = useCallback(() => {
    // if (!myAddress) {
    //   return console.error('not wallet');
    // }
    if (!auctionKey) {
      return console.error('not auctionKey');
    }
    console.log('-auctionKey--------->', auctionKey);
    // 请求 auctionDetail 信息
    Axios.get('/auctions/info', {
      params: {
        auctionAddress: auctionKey,
        myAddress,
      },
    })
      .then(res => {
        if (res.status !== 200 || res.data.code !== 0) return;
        const _auctionDetail: IGoods = res.data.data;
        setAuctionDetail(_auctionDetail);

        // 解析 uri 携带的 MetaData 信息
        const tokenMint = _auctionDetail.tokenMints[0].tokenMint;
        if (tokenMint) {
          Axios.get('/tokens/info', { params: { mintAddress: tokenMint } })
            .then(res => {
              if (res.status !== 200 || res.data.code !== 0) return;
              const _itemNftInfo = res.data.data;
              setItemNftInfo(_itemNftInfo);
            })
            .catch(err => {
              throw err;
            });
        }

        // 请求 Creater 信息
        const userAccount = _auctionDetail.creator;
        setRoleInfo_seller({ ...roleInfo_seller, userAccount });
        if (userAccount) {
          Axios_old.get('/accountinfo/getaccount', {
            params: {
              accountaddress: userAccount,
            },
          })
            .then(res => {
              if (res.status !== 200 || res.data.code !== 0) return;
              const userInfo = res.data.data;
              const roleInfo = {
                userName: userInfo.username,
                userAccount: userInfo.accountaddress,
                avatar: userInfo.imgurl,
                isVerify: userInfo.identity === UserRoleEnum.Verified,
              };
              setRoleInfo_seller(roleInfo);
            })
            .catch(err => {
              throw err;
            });
        }
      })
      .catch(err => {
        console.error(err.msg);
      })
      .finally(() => {
        //
      });
    // eslint-disable-next-line
  }, [auctionKey, myAddress]);
  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    auctionDetail,
    itemNftInfo,
    rolesInfo: {
      seller: roleInfo_seller,
    },
    fetch,
  };
}
