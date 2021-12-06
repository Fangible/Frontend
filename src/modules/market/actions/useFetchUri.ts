import axios from 'axios';
import localforage from 'localforage';
import { DB_TABLES, getDbTableStoreName } from 'modules/common/utils/db';
import { MetadataCategory } from 'npms/oystoer';
import { useEffect, useState } from 'react';

export interface IMetaData {
  category: MetadataCategory;
  description: string;
  external_url: string;
  image: string;
  name: string;
  properties: any;
  seller_fee_basis_points?: number;
  symbol?: string;
}

export default function useFetchUri(uri?: string) {
  const [metaData, setMetaData] = useState<IMetaData>();

  useEffect(() => {
    if (!uri) return;
    (async () => {
      // 有缓存先取缓存
      const cacheMetaData: string | null = await localforage.getItem(
        getDbTableStoreName(DB_TABLES.MetaData, uri),
      );
      if (cacheMetaData) {
        const _metaData = JSON.parse(cacheMetaData);
        return setMetaData(_metaData);
      }

      axios
        .get(uri)
        .then(res => {
          if (res.status === 200) {
            setMetaData(res.data);
            // 缓存 MetaData
            localforage.setItem(
              getDbTableStoreName(DB_TABLES.MetaData, uri),
              JSON.stringify(res.data),
            );
          }
        })
        .catch(err => {
          console.error(err.msg);
        });
    })();
  }, [uri]);

  return metaData;
}
