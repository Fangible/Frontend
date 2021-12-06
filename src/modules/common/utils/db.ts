export const _DB_TABLES = {
  masterEditions: 'masterEditions', // MasterEdtion
  editions: 'editions',
  showNftInfos: 'showNftInfos',
  MetaData: 'MetaData',
};

type tableName = {
  [key in keyof typeof _DB_TABLES]: keyof typeof _DB_TABLES;
};
export const DB_TABLES: tableName = _DB_TABLES as tableName;

export const getDbTableStoreName = (
  storeName: keyof typeof _DB_TABLES,
  pubkey: string,
) => {
  return [DB_TABLES[storeName], pubkey].join('-');
};

export enum INFT_TYPE {
  MasterEdition = 'MasterEdition',
  Edition = 'Edition',
}

export interface IShowNftInfo {
  type: INFT_TYPE;
  name: string;
  symbol: string;
  sellerFeeBasisPoints: number;
  uri: string;
  MaxSupply?: number;
  supply?: number;
  supplyIndex?: number;
  metaDataAccount: string;
  mint: string;
  masterKey: string;
  prentKey?: string;
  creator: string[];
  metaData: any;
}
