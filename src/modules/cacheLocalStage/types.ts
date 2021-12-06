export enum TransitionCacheName {
  CretedItems = 'CretedItems',
  TransferItems = 'TransferItems',
  BurnItems = 'BurnItems',
  PublishItems = 'PublishItems',
  ClaimItems = 'ClaimItems',
}

export interface ICacheNftInfo {
  auction: string;
  mintToken: string;
  image: string;
  name: string;
}
