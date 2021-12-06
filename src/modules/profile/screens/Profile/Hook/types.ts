import { Attribute, MetadataCategory } from 'npms/oystoer';

export interface IMasterEdition {
  key: number;
  supply: number;
  maxSupply: number;
}

export interface IEdition {
  edition: number;
  key: number;
  parent: string;
}

// IMetadataExtension
export interface IMetaData {
  category: MetadataCategory;
  name: string;
  symbol: string;
  image: string;
  description: string;
  attributes?: Attribute[];
  properties: any;
}
interface creator {
  address: string;
  share: number;
  verified: boolean;
}
export interface INftInfoSchema {
  mintAddress: string;
  programId: string;
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  primarySaleHappened: boolean;
  creators: creator[];
  owner: string;
  image: string;
  metadata: IMetaData;
  masterEdition: IMasterEdition;
  edition: IEdition | null;
}
