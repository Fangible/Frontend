import { Connection, PublicKey } from '@solana/web3.js';
import { AccountAndPubkey } from 'contexts/meta/types';
import localforage from 'localforage';
import {
  DB_TABLES,
  getDbTableStoreName,
  INFT_TYPE,
  IShowNftInfo,
} from 'modules/common/utils/db';
import {
  accountGetEditionInfo,
  getMasterEdition,
} from 'modules/common/utils/solanaAccount';
import {
  decodeEdition,
  decodeMasterEdition,
  decodeMetadata,
} from 'npms/oystoer';

export const GetAndCacheNftInfo = async (
  connection: Connection,
  metaDataAccounts: AccountAndPubkey[],
): Promise<IShowNftInfo[]> => {
  const showInfoList: IShowNftInfo[] = [];

  for (const { account, pubkey } of metaDataAccounts) {
    // 有缓存取缓存
    const showNftInfoCache = await localforage.getItem(
      getDbTableStoreName(DB_TABLES.showNftInfos, pubkey),
    );

    if (showNftInfoCache) {
      const parseData = JSON.parse(showNftInfoCache as string);
      showInfoList.push(parseData);
      continue;
    }

    // 无缓存
    try {
      // 第二步：根据 MetaData Account 解析出 MetaData 具体信息
      const metaDataInfo = decodeMetadata(account.data); // 解析 MateData
      const fetchMetaData = await (await fetch(metaDataInfo.data.uri))
        .json()
        .catch(() => {
          return {};
        });
      // ===> mint address , isMutable (masterEdition: 1, Edition； 0)

      // 第三步：根据 mint 解析出 MasterEdition 的地址
      const masterKey = (
        await getMasterEdition(new PublicKey(metaDataInfo.mint))
      ).toBase58();

      // ===> MasterEdition address

      let masterEditionAccount = await connection.getAccountInfo(
        new PublicKey(masterKey),
      );
      if (masterEditionAccount) {
        // masterEdition
        const masterEditionData = decodeMasterEdition(
          masterEditionAccount.data,
        );
        if (metaDataInfo.isMutable) {
          const showInfo: IShowNftInfo = {
            name: metaDataInfo.data.name,
            symbol: metaDataInfo.data.symbol,
            type: INFT_TYPE.MasterEdition,
            uri: metaDataInfo.data.uri,
            sellerFeeBasisPoints: metaDataInfo.data.sellerFeeBasisPoints,
            metaDataAccount: pubkey,
            mint: metaDataInfo.mint,
            masterKey: masterKey,
            metaData: fetchMetaData,
            creator:
              metaDataInfo.data.creators?.map(item => item.address) || [],

            // MasterEdition 特有属性
            supply: masterEditionData.supply?.toNumber() || 0,
            MaxSupply: masterEditionData.maxSupply?.toNumber() || 0,
          };

          showInfoList.push(showInfo);

          localforage.setItem(
            getDbTableStoreName(DB_TABLES.showNftInfos, pubkey),
            JSON.stringify(showInfo),
          );
        } else {
          const editionData = decodeEdition(masterEditionAccount.data);
          const editions = await accountGetEditionInfo({
            connection,
            parentPubkey: editionData.parent,
          });

          const showInfo: IShowNftInfo = {
            name: metaDataInfo.data.name,
            symbol: metaDataInfo.data.symbol,
            type: INFT_TYPE.Edition,
            uri: metaDataInfo.data.uri,
            sellerFeeBasisPoints: metaDataInfo.data.sellerFeeBasisPoints,
            metaDataAccount: pubkey,
            mint: metaDataInfo.mint,
            masterKey: masterKey,
            metaData: fetchMetaData,
            creator:
              metaDataInfo.data.creators?.map(item => item.address) || [],

            // Edition 特有属性
            supply: editions.length,
            supplyIndex: editionData.edition.toNumber() || 0,
            prentKey: editionData.parent,
          };
          showInfoList.push(showInfo);

          // localforage.setItem(
          //   getDbTableStoreName(DB_TABLES.masterEditions, editionData.parent),
          //   JSON.stringify(masterEditionData),
          // );
          // localforage.setItem(
          //   getDbTableStoreName(DB_TABLES.editions, editionData.parent),
          //   JSON.stringify(editionData),
          // );
          localforage.setItem(
            getDbTableStoreName(DB_TABLES.showNftInfos, pubkey),
            JSON.stringify(showInfo),
          );
        }
      }
    } catch (error) {
      console.log(error);
      continue;
    }
  }
  return showInfoList;
};
