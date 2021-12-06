import { AuctionType } from 'modules/api/common/auctionType';
import { Days } from 'modules/common/types/unit';
import { ISaleTime } from 'modules/createNFT/actions/publishNft';

export interface IPublishFixedSwap {
  type: AuctionType.FixedSwap;
  price: string;
  quantity: string;
  unitContract: string;
  img?: string;
  saleTimeFS: ISaleTime;
}

export interface IPublishEnglishAuction {
  type: AuctionType.EnglishAuction;
  minBid: string;
  purchasePrice: string;
  reservePrice: string;
  quantity: string;
  duration: Days;
  unitContract: string;
  saleTimeEA: ISaleTime;
}
