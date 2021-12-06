export enum PriceType {
  'No_FLOOR',
  'MINIMUM_PRICE',
  'BLIND_PRICE',
}

export enum SOL_NFT_KEY_TYPE {
  Uninitialized,
  EditionV1 = 1,
  MasterEditionV1 = 2,
  MasterEditionV2 = 6,
}

export interface ITokenMint {
  creators: string[];
  description: string;
  edition: number;
  maxSupply: number;
  image: string;
  name: string;
  symbol: string;
  tokenMint: string;
  uri: string;
  key: SOL_NFT_KEY_TYPE;
}

type TypeParticipant = {
  isBidder: 0 | 1;
  isCreator: 0 | 1;
  isQuoteTokenClaimed: 0 | 1;
  isTokenClaimed: 0 | 1;
  isWinner: 0 | 1;
  quoteTokenAmount: number;
};

export enum SolAuctionState {
  CREATED,
  STARTED,
  ENDED,
}

export enum SolAuctionType {
  AUCTION,
  OPEN_EDITION,
}

export interface SolBidItem {
  bidder: string;
  timestamp: number;
  value: number;
  signature?: string;
}

export interface IGoods {
  participant: TypeParticipant;
  auctionAddress: string;
  auctionName: string;
  // 0 English Auction, 1 Open Edition.
  auctionType: SolAuctionType;
  beganAt: number;
  bidHistories: SolBidItem[];
  bidState: {
    bids: SolBidItem[];
    max: number;
  };
  instantSalePrice?: number;
  // 暂无此属性
  bids: null;
  // 暂无此属性
  max: number;
  creator: string;
  endAuctionAt: null;
  endAuctionGap: null;
  endedAt: number;
  lastBid: number;
  priceFloor: {
    type: PriceType;
    price: number;
  };
  quoteToken: string;
  resource: string;
  state: SolAuctionState;
  tokenMints: ITokenMint[];
  winnerLimit: number;
}
