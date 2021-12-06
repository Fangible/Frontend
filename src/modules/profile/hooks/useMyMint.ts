import {
  Edition,
  MasterEditionV1,
  MasterEditionV2,
  MAX_CREATOR_LEN,
  MAX_NAME_LENGTH,
  MAX_SYMBOL_LENGTH,
  MAX_URI_LENGTH,
  Metadata,
  METADATA_PROGRAM_ID,
  ParsedAccount,
  useConnection,
} from 'npms/oystoer';
import { getProgramAccounts } from 'contexts/meta/loadAccounts';
import { useEffect } from 'react';
import { useState } from 'react';
import { IShowNftInfo } from 'modules/common/utils/db';
import { GetAndCacheNftInfo } from './GetAndCacheNftInfo';

const offset =
  1 + // key
  32 + // update auth
  32 + // mint
  4 + // name string length
  MAX_NAME_LENGTH + // name
  4 + // uri string length
  MAX_URI_LENGTH + // uri
  4 + // symbol string length
  MAX_SYMBOL_LENGTH + // symbol
  2 + // seller fee basis points
  1 + // whether or not there is a creators vec
  4 + // creators vec length
  0 * MAX_CREATOR_LEN;

type MasterAndEditionsType = {
  editions: ParsedAccount<Edition>[];
  masterEditionsInfo: MasterEditionV1 | MasterEditionV2;
  editionInfo?: Edition;
};
export interface IMyMintItem {
  name: string;
  uri: string;
  sellerFeeBasisPoints: number;
  pubkey: string;
  info: Metadata;
  masterAndEditions: MasterAndEditionsType;
}

export const useMintMetaData = (address: string) => {
  const connection = useConnection();
  const [list, setList] = useState<IShowNftInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (address) {
        setLoading(true);
        // 第一步：根据 RPC 请求 MetaData Account
        const data = await getProgramAccounts(connection, METADATA_PROGRAM_ID, {
          filters: [
            {
              memcmp: {
                offset,
                bytes: address,
              },
            },
          ],
        });
        // ===> [ MetaData Accou

        const showInfoList: IShowNftInfo[] = await GetAndCacheNftInfo(
          connection,
          data,
        );

        setList(showInfoList);
        setLoading(false);
      }
    };
    init();
  }, [connection, address]);

  return {
    data: list,
    loading,
  };
};

export const useMyCrateMetaData = (address: string) => {
  const connection = useConnection();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (address) {
        setLoading(true);
        const data = await getProgramAccounts(
          connection,
          METADATA_PROGRAM_ID,
          {},
        );

        const showInfoList: IShowNftInfo[] = (
          await GetAndCacheNftInfo(connection, data)
        ).filter(item => {
          return item.creator.find(item => item === address);
        });
        setLoading(false);
        setList(showInfoList);
      }
    };
    init();
  }, [connection, address]);

  return {
    data: list,
    loading,
  };
};
