import { IGoods, SolAuctionState, SolAuctionType } from 'modules/market/types';
import {
  UserNftRoleEnum,
  UserRole,
} from 'modules/overview/actions/fetchWeb3PoolDetails';
import { useEffect, useMemo, useState } from 'react';
import { useCount } from './useTimer';

export enum EnumNftState {
  NULL,
  SELLER_CANCEL,
  SELLER_CLAIM_SOL,
  SELLER_CLAIM_BACK,
  SELLER_SELLING,
  SOLD_OUT,
  BIDER_ABLE_BID,
  BIDER_ABLE_BUY_NOW,
  BIDER_CLAIM_TOKEN_OPEN_EDITION,
  BIDER_CLAIM_TOKEN_AUCTION,
  BIDER_CLAIM_SOL_AUCTION,
  OVERDUE,
}
export interface nftButtonStateParams {
  auctionDetail?: IGoods;
  address?: string;
}
export const useNFTButtonState = ({
  auctionDetail,
  address,
}: nftButtonStateParams): EnumNftState => {
  const role: UserRole = auctionDetail?.participant.isCreator
    ? UserNftRoleEnum.CREATOR
    : auctionDetail?.participant.isBidder
    ? UserNftRoleEnum.BUYER
    : UserNftRoleEnum.OTHERS;

  const endTimeAt = useMemo(() => {
    return new Date(
      ((auctionDetail?.beganAt ?? 0) + (auctionDetail?.endAuctionAt ?? 0)) *
        1000,
    );
  }, [auctionDetail]);
  // TODO 英式延拍
  const [isOverdue, setIsOverdue] = useState(Date.now() >= +endTimeAt);
  const notBid = (auctionDetail?.bidState?.bids?.length ?? 0) === 0;
  const count = useCount();
  useEffect(() => {
    if (!isOverdue) {
      setIsOverdue(Date.now() >= +endTimeAt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, endTimeAt]);
  const myParticipantInfo = useMemo(() => {
    const bids = auctionDetail?.bidState?.bids ?? [];
    const myBidList = address ? bids.filter(e => e.bidder === address) : [];
    const bidMax: number = Math.max(...bids.map(e => e.value));
    const myBidMax: number = Math.max(...myBidList.map(e => e.value));
    if (!auctionDetail?.priceFloor?.price) {
      console.error('auctionDetail?.priceFloor?.price error ');
    }
    return {
      myBidList,
      isParticipant: myBidList.length > 0,
      bidMax,
      myBidMax,
      // 使用bigNumber做对比
      isWinner:
        myBidMax === bidMax &&
        myBidMax >= (auctionDetail?.priceFloor?.price ?? 0),
    };
  }, [address, auctionDetail]);
  // 当前winner
  const isWinner = myParticipantInfo.isWinner;

  // --------------卖家
  if (
    role === UserNftRoleEnum.CREATOR &&
    (auctionDetail?.participant.quoteTokenAmount ?? 0) === 0 &&
    !auctionDetail?.participant.isTokenClaimed &&
    auctionDetail?.state === SolAuctionState.STARTED &&
    auctionDetail?.auctionType === SolAuctionType.OPEN_EDITION
  ) {
    return EnumNftState.SELLER_CANCEL;
  }

  const isOpenEditionClaimSol =
    auctionDetail?.auctionType === SolAuctionType.OPEN_EDITION &&
    (auctionDetail?.participant.quoteTokenAmount ?? 0) ===
      auctionDetail?.priceFloor.price;
  // TODO 可能会有问题
  const isAuctionClaimSol =
    auctionDetail?.auctionType === SolAuctionType.AUCTION &&
    (auctionDetail?.participant.quoteTokenAmount ?? 0) !== 0 &&
    auctionDetail.participant.isQuoteTokenClaimed === 0 &&
    auctionDetail?.state === SolAuctionState.ENDED;
  if (
    role === UserNftRoleEnum.CREATOR &&
    (isOpenEditionClaimSol || isAuctionClaimSol)
  ) {
    return EnumNftState.SELLER_CLAIM_SOL;
  }

  // 英式拍  有人拍 时间结束了，但是没人取回状态未改变（买家claim后会，卖家会走上面条件），卖家需要claim资金
  if (
    role === UserNftRoleEnum.CREATOR &&
    (auctionDetail?.bidState?.bids ?? []).length > 0 &&
    auctionDetail?.auctionType === SolAuctionType.AUCTION &&
    auctionDetail.state === SolAuctionState.STARTED &&
    auctionDetail.participant.isQuoteTokenClaimed === 0 &&
    auctionDetail.participant.isTokenClaimed === 0 &&
    isOverdue
  ) {
    return EnumNftState.SELLER_CLAIM_SOL;
  }

  // Time is up. No bid
  if (
    role === UserNftRoleEnum.CREATOR &&
    (auctionDetail?.participant.quoteTokenAmount ?? 0) === 0 &&
    !auctionDetail?.participant.isTokenClaimed &&
    auctionDetail?.state === SolAuctionState.STARTED &&
    auctionDetail?.auctionType === SolAuctionType.AUCTION
  ) {
    return notBid && isOverdue
      ? EnumNftState.SELLER_CLAIM_BACK
      : EnumNftState.SELLER_SELLING;
  }

  // ------------统一售完
  // TODO 英氏拍结束状态不会立刻改变
  if (
    Boolean(
      role === UserNftRoleEnum.CREATOR &&
        auctionDetail?.state === SolAuctionState.ENDED &&
        auctionDetail?.participant.isQuoteTokenClaimed,
    ) ||
    Boolean(
      role === UserNftRoleEnum.BUYER &&
        auctionDetail?.state === SolAuctionState.ENDED &&
        auctionDetail?.participant.isTokenClaimed,
    ) ||
    // 输家
    Boolean(
      role === UserNftRoleEnum.BUYER &&
        auctionDetail?.state === SolAuctionState.ENDED &&
        auctionDetail?.participant.isQuoteTokenClaimed,
    ) ||
    Boolean(
      role === UserNftRoleEnum.OTHERS &&
        auctionDetail?.state === SolAuctionState.ENDED,
    ) ||
    // 英氏拍状态没结束  但是时间已经到了
    Boolean(
      role === UserNftRoleEnum.OTHERS &&
        auctionDetail?.auctionType === SolAuctionType.AUCTION &&
        isOverdue,
    )
  ) {
    return EnumNftState.SOLD_OUT;
  }

  // 流拍已取回
  if (
    Boolean(
      role === UserNftRoleEnum.CREATOR &&
        auctionDetail?.state === SolAuctionState.ENDED &&
        auctionDetail?.participant.isTokenClaimed,
    )
  ) {
    return EnumNftState.NULL;
  }

  if (
    auctionDetail?.participant.isCreator &&
    !auctionDetail.participant.isTokenClaimed &&
    auctionDetail.state === SolAuctionState.ENDED
  ) {
    // 流拍后只处理一半，也就是只place bid 0 但是没有end跟claim.  TODO 这时候应该只执行claim 不需要重复执行place bid
    return EnumNftState.SELLER_CLAIM_BACK;
  }

  // -------------不是卖家
  if (
    // auctionDetail?.state !== SolAuctionState.ENDED &&
    !auctionDetail?.participant.isTokenClaimed &&
    auctionDetail?.auctionType === SolAuctionType.AUCTION &&
    !isOverdue
  ) {
    return EnumNftState.BIDER_ABLE_BID;
  }
  if (
    !auctionDetail?.participant.isTokenClaimed &&
    auctionDetail?.auctionType === SolAuctionType.OPEN_EDITION &&
    !auctionDetail.participant.isWinner
  ) {
    return EnumNftState.BIDER_ABLE_BUY_NOW;
  }
  if (
    // (auctionDetail?.participant.quoteTokenAmount ?? 0) > 0 &&
    !auctionDetail?.participant.isTokenClaimed &&
    auctionDetail?.participant.isBidder &&
    auctionDetail?.participant.isWinner &&
    auctionDetail?.auctionType === SolAuctionType.OPEN_EDITION
  ) {
    return EnumNftState.BIDER_CLAIM_TOKEN_OPEN_EDITION;
  }
  //  英氏拍 Claim
  const auctionEnd =
    auctionDetail?.state === SolAuctionState.ENDED || isOverdue;
  if (
    auctionDetail?.auctionType === SolAuctionType.AUCTION &&
    auctionEnd &&
    isWinner &&
    !auctionDetail.participant.isTokenClaimed
  ) {
    return EnumNftState.BIDER_CLAIM_TOKEN_AUCTION;
  }
  if (
    auctionDetail?.auctionType === SolAuctionType.AUCTION &&
    auctionEnd &&
    myParticipantInfo.isParticipant &&
    !isWinner &&
    !auctionDetail.participant.isQuoteTokenClaimed
  ) {
    return EnumNftState.BIDER_CLAIM_SOL_AUCTION;
  }

  if (isOverdue && notBid) {
    return EnumNftState.OVERDUE;
  }
  return EnumNftState.NULL;
};
