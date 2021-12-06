import { IMetadataExtension } from 'npms/oystoer';
import { useMintMetaData } from 'modules/profile/hooks/useMyMint';
import { useEffect, useState } from 'react';

export interface IAccountInfo {
  name: string;
  pubkey: string;
  sellerFeeBasisPoints: number;
  uri: string;
}

export const LOCAL_DATA = 'LOCAL_CACHE_DATA';

export interface ILOCAL_METADATA {
  attributes: [];
  description: string;
  external_url: string;
  image: string;
  name: string;
  ownerPublic: string;
  properties: {
    files: [];
    category: string;
    creators: [];
  };
  pubkey: string;
  sellerFeeBasisPoints: number;
  seller_fee_basis_points: string;
  symbol: string;
  uri: string;
}

interface ICacheDataArgs {
  ownerPublic: string;
  accountInfo?: IAccountInfo;
  tokenInfo?: IAccountInfo;
  metaData?: IMetadataExtension;
}

// 访问自己的 NFT详情情况 直接通过列表处将数据缓存
export const cacheData = ({
  ownerPublic,
  accountInfo,
  tokenInfo,
  metaData,
}: ICacheDataArgs) => {
  const assembleArgs = (currentAssemble = {}, tarAssemble = {}) => {
    return { ...currentAssemble, ...tarAssemble };
  };
  let assembleRes = {};

  assembleRes = assembleArgs(assembleRes, { ownerPublic });
  if (accountInfo) {
    assembleRes = assembleArgs(assembleRes, accountInfo);
  }
  if (tokenInfo) {
    assembleRes = assembleArgs(assembleRes, tokenInfo);
  }
  if (metaData) {
    assembleRes = assembleArgs(assembleRes, metaData);
  }

  // 缓存机制
  const localData = JSON.parse(window.localStorage.getItem(LOCAL_DATA) || '{}');
  const accountKey = String(accountInfo?.pubkey).toLocaleLowerCase();

  // 第一种缓存机制

  // if (accountKey && ownerPublic) {
  //     localData[ownerPublic] = localData[ownerPublic] || {}
  //     localData[ownerPublic][accountKey] = assembleRes
  //     window.localStorage.setItem(LOCAL_DATA, JSON.stringify(localData))
  // }

  // 第二种缓存机制

  if (accountKey) {
    localData[accountKey] = assembleRes;
    window.localStorage.setItem(LOCAL_DATA, JSON.stringify(localData));
  }
};

// 查询缓存信息
const getCacheMetaData: (accountKey: string) => ILOCAL_METADATA | null = (
  accountKey: string,
) => {
  const localData = JSON.parse(window.localStorage.getItem(LOCAL_DATA) || '{}');
  let backData = localData[accountKey] as ILOCAL_METADATA;

  return backData;
};

// 查询缓存信息 Hook 函数
export const useCacheMetaData = (accountKey: string, artAddress: string) => {
  const [backData, setBackData] = useState<ILOCAL_METADATA>();
  accountKey = String(accountKey).toLocaleLowerCase();
  // 如果没有缓存的情况下，需要根据创建者地址重新获取
  const { data: list } = useMintMetaData(artAddress);

  useEffect(() => {
    if (!list) return;
    (async () => {
      const tarItem = list.find(
        item => String(item.metaDataAccount).toLocaleLowerCase() === accountKey,
      );
      const fetchData = await (await fetch(tarItem?.uri || '')).json();
      setBackData({ ...fetchData });
      // 缓存一份
      cacheData({
        ownerPublic: artAddress,
        accountInfo: undefined,

        tokenInfo: undefined,
        metaData: fetchData,
      });
    })();
  }, [list, accountKey, artAddress]);

  // 事先有缓存的情况下，直接取得数据返回
  const hasCacheData = getCacheMetaData(accountKey);
  if (hasCacheData) {
    return hasCacheData;
  }

  console.log('useEffect', backData);

  return backData || null;
};
