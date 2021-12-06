import { Box, Grid, Typography } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { AuctionType } from 'modules/api/common/auctionType';
import { t } from 'modules/i18n/utils/intl';
import { Button } from 'modules/uiKit/Button';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AuctionState } from '../../../api/common/AuctionState';
import { FixedSwapState } from '../../../api/common/FixedSwapState';
import {
  UserNftRoleEnum,
  UserRole,
} from '../../../overview/actions/fetchWeb3PoolDetails';
import { Timer } from '../Timer';
import { useInfoPricesStyles } from './useInfoPricesStyles';
import { useAccount } from 'modules/account/hooks/useAccount';
import { IGoods, SolAuctionState, SolAuctionType } from 'modules/market/types';
import { useCount } from 'modules/common/hooks/useTimer';
// import { NftCardHelps } from 'modules/common/utils/nftCard';
// import {
//   EnumNftState,
//   useNFTButtonState,
// } from 'modules/common/hooks/useNFTButtonState';

interface IInfoPricesProps {
  price: BigNumber;
  hasSetDirectPrice: boolean;
  cryptoPrice: BigNumber;
  cryptoCurrency: string;
  disabled: boolean;
  loading: boolean;
  buyLoading: boolean;
  onBuyClick?: () => void;
  onBidClick?: () => void;
  onBidBuyClick?: () => void;
  onBidderClaim?: () => void;
  onCreatorClaim?: () => void;
  onBidderClaimSol?: () => void;
  state: AuctionState | FixedSwapState;
  onCancel?: () => void;
  poolType?: AuctionType;
  saleTime: boolean;
  auctionDetail?: IGoods;
  address?: string;
  royaltyFee?: BigNumber;
}

export const InfoPrices = ({
  royaltyFee,
  price,
  cryptoPrice,
  cryptoCurrency,
  loading,
  buyLoading,
  onBuyClick,
  onBidClick,
  onBidBuyClick,
  onBidderClaim,
  onCreatorClaim,
  onBidderClaimSol,
  onCancel,
  saleTime,
  auctionDetail,
  address,
}: IInfoPricesProps) => {
  const role: UserRole = auctionDetail?.participant.isCreator
    ? UserNftRoleEnum.CREATOR
    : auctionDetail?.participant.isBidder
    ? UserNftRoleEnum.BUYER
    : UserNftRoleEnum.OTHERS;

  // const endTimeAt = useMemo(() => {
  //   return new Date(
  //     ((auctionDetail?.beganAt ?? 0) + (auctionDetail?.endAuctionAt ?? 0)) *
  //       1000,
  //   );
  // }, [auctionDetail]);

  const beganAt = auctionDetail?.beganAt ?? 0;
  const endAuctionAt = auctionDetail?.endAuctionAt ?? 0;
  const endTimeAt = useMemo(() => {
    return new Date((beganAt + endAuctionAt) * 1000);
  }, [beganAt, endAuctionAt]);
  // const nftState = useNFTButtonState({
  //   auctionDetail,
  //   address,
  // });
  // const isBidderClaimed = Boolean(
  //   nftState === EnumNftState.BIDER_CLAIM_SOL_AUCTION ||
  //     nftState === EnumNftState.BIDER_CLAIM_TOKEN_AUCTION,
  // );
  // const isCreatorClaimed = Boolean(
  //   nftState === EnumNftState.SELLER_CLAIM_BACK ||
  //     nftState === EnumNftState.SELLER_CLAIM_SOL,
  // );
  // const [nftCardHelps, setNftCardHelps] = useState<NftCardHelps>();
  // useEffect(() => {
  //   setNftCardHelps(
  //     new NftCardHelps({
  //       openAt: new Date(beganAt * 1000),
  //       closeAt: endTimeAt,
  //       now: Date.now(),
  //       isBidderClaimed,
  //       isCreatorClaimed,
  //       isOnSale: true,
  //     }),
  //   );
  // }, [beganAt, endTimeAt, nftState, isBidderClaimed, isCreatorClaimed]);

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

  console.log(
    `---isOverdue: ${isOverdue}; endTimeAt: ${endTimeAt}; isWinner： ${isWinner}; role: ${role}`,
  );

  const { handleConnect, isConnected } = useAccount();
  const classes = useInfoPricesStyles();
  const checkLogin = useCallback(
    (cb?: () => void) => () => {
      if (!isConnected) {
        return handleConnect();
      }
      cb?.();
    },
    [isConnected, handleConnect],
  );

  const renderButtons = useCallback(() => {
    // --------------卖家
    if (
      role === UserNftRoleEnum.CREATOR &&
      (auctionDetail?.participant.quoteTokenAmount ?? 0) === 0 &&
      !auctionDetail?.participant.isTokenClaimed &&
      auctionDetail?.state === SolAuctionState.STARTED &&
      auctionDetail?.auctionType === SolAuctionType.OPEN_EDITION
    ) {
      return (
        <Button
          variant="outlined"
          fullWidth
          onClick={checkLogin(() => onCancel?.())}
          loading={loading}
        >
          {t('info-prices.cancel')}
        </Button>
      );
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
      return (
        <Button
          variant="outlined"
          fullWidth
          onClick={checkLogin(() => onCreatorClaim?.())}
          loading={loading}
        >
          {t('details-nft.ClaimSol')}
        </Button>
      );
    }

    // TODO
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
      return (
        <Button
          variant="outlined"
          fullWidth
          // TODO 如果买家没有claim需要先all claim再执行
          onClick={checkLogin(() => onCreatorClaim?.())}
          loading={loading}
        >
          {t('details-nft.ClaimSol')}
        </Button>
      );
    }

    // Time is up. No bid
    if (
      role === UserNftRoleEnum.CREATOR &&
      (auctionDetail?.participant.quoteTokenAmount ?? 0) === 0 &&
      !auctionDetail?.participant.isTokenClaimed &&
      auctionDetail?.state === SolAuctionState.STARTED &&
      auctionDetail?.auctionType === SolAuctionType.AUCTION
    ) {
      return notBid && isOverdue ? (
        <>
          {/* <div style={{ textAlign: 'center', paddingBottom: 10 }}>
            Time is up. No bid
          </div> */}
          <Button
            variant="outlined"
            fullWidth
            onClick={checkLogin(() => onCancel?.())}
            loading={loading}
          >
            {t('product-card.claim-back')}
          </Button>
        </>
      ) : (
        <div style={{ display: 'none' }}>selling</div>
      );
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
      return <Typography>{t('details-nft.sold-out')}</Typography>;
    }
    // 流拍
    if (
      Boolean(
        role === UserNftRoleEnum.CREATOR &&
          auctionDetail?.state === SolAuctionState.ENDED &&
          auctionDetail?.participant.isTokenClaimed,
      )
    ) {
      return <div></div>;
    }

    if (
      auctionDetail?.participant.isCreator &&
      !auctionDetail.participant.isTokenClaimed &&
      auctionDetail.state === SolAuctionState.ENDED
    ) {
      // 流拍后只处理一半，也就是只place bid 0 但是没有end跟claim.  TODO 这时候应该只执行claim 不需要重复执行place bid
      return (
        <Button
          variant="outlined"
          fullWidth
          onClick={checkLogin(() => onCancel?.())}
          loading={loading}
        >
          {t('product-card.claim-back')}
        </Button>
      );
    }

    // -------------不是卖家
    if (
      // auctionDetail?.state !== SolAuctionState.ENDED &&
      !auctionDetail?.participant.isTokenClaimed &&
      auctionDetail?.auctionType === SolAuctionType.AUCTION &&
      !isOverdue
    ) {
      return (
        <>
          <Button
            disabled={saleTime || buyLoading || isWinner}
            loading={loading}
            variant="outlined"
            fullWidth
            onClick={checkLogin(() => onBidClick?.())}
          >
            {t('details-nft.place-a-bid')}
          </Button>
          {/* <Box mt={2}>
              <Button
                disabled={saleTime || isWinner}
                loading={buyLoading}
                variant="outlined"
                fullWidth
                onClick={checkLogin(() => onBidBuyClick?.())}
              >
                {t('details-nft.buy-now')}
              </Button>
            </Box> */}
        </>
      );
    }
    if (
      !auctionDetail?.participant.isTokenClaimed &&
      auctionDetail?.auctionType === SolAuctionType.OPEN_EDITION &&
      !auctionDetail.participant.isWinner
    ) {
      return (
        <Box mt={2}>
          <Button
            disabled={saleTime}
            loading={loading}
            variant="outlined"
            fullWidth
            onClick={checkLogin(() => onBuyClick?.())}
          >
            {t('details-nft.buy-now')}
          </Button>
        </Box>
      );
    }
    if (
      // (auctionDetail?.participant.quoteTokenAmount ?? 0) > 0 &&
      !auctionDetail?.participant.isTokenClaimed &&
      auctionDetail?.participant.isBidder &&
      auctionDetail?.participant.isWinner &&
      auctionDetail?.auctionType === SolAuctionType.OPEN_EDITION
    ) {
      return (
        <Box mt={2}>
          <Button
            variant="outlined"
            fullWidth
            loading={loading}
            onClick={checkLogin(() => onBidderClaim?.())}
          >
            {t('details-nft.ClaimToken')}
          </Button>
        </Box>
      );
    }
    // TODO 英氏拍 Claim
    const auctionEnd =
      auctionDetail?.state === SolAuctionState.ENDED || isOverdue;
    if (
      auctionDetail?.auctionType === SolAuctionType.AUCTION &&
      auctionEnd &&
      isWinner &&
      !auctionDetail.participant.isTokenClaimed
    ) {
      return (
        <Box mt={2}>
          <Button
            variant="outlined"
            fullWidth
            loading={loading}
            onClick={checkLogin(() => onBidderClaim?.())}
          >
            {t('details-nft.ClaimToken')}
          </Button>
        </Box>
      );
    }
    if (
      auctionDetail?.auctionType === SolAuctionType.AUCTION &&
      auctionEnd &&
      myParticipantInfo.isParticipant &&
      !isWinner &&
      !auctionDetail.participant.isQuoteTokenClaimed
    ) {
      return (
        <Box mt={2}>
          <Button
            variant="outlined"
            fullWidth
            loading={loading}
            onClick={checkLogin(() => onBidderClaimSol?.())}
          >
            {t('details-nft.ClaimSol')}
          </Button>
        </Box>
      );
    }

    if (isOverdue && notBid) {
      return <div>Overdue</div>;
    }
    return <></>;
  }, [
    auctionDetail,
    checkLogin,
    loading,
    buyLoading,
    onBidClick,
    onBidderClaim,
    onBuyClick,
    // onBidBuyClick,
    onCancel,
    onCreatorClaim,
    onBidderClaimSol,
    role,
    saleTime,
    isOverdue,
    notBid,
    isWinner,
    myParticipantInfo,
  ]);

  const renderRoyalty = () => {
    if (!royaltyFee) {
      return <></>;
    }
    return (
      <Box display="flex" alignItems="center" className={classes.rateDesc}>
        {t('info-prices.royalty.rate-desc', {
          rate: `${royaltyFee.dp(2).toNumber()} %`,
        })}

        {/* <Tooltip title={t('info-prices.royalty.rate-desc-tip')}>
          <Box component="i" ml={1}>
            <QuestionIcon />
          </Box>
        </Tooltip> */}
      </Box>
    );
  };

  return (
    <Grid container spacing={3} alignItems="center">
      <Grid item xs={12} sm>
        {endTimeAt && auctionDetail?.auctionType === SolAuctionType.AUCTION && (
          <div className={classes.bid}>
            {t('details-nft.top-bid')}
            {saleTime || (
              <>
                <i className={classes.bidDevider} />
                <Timer endDate={endTimeAt} />
              </>
            )}
          </div>
        )}

        <Typography variant="h2" component="h4" className={classes.cryptoPrice}>
          {`${cryptoPrice.toFormat()} ${cryptoCurrency}`}
        </Typography>

        <Typography className={classes.price} color="textSecondary">
          {t('unit.$-value', { value: price.toFormat() })}
        </Typography>
      </Grid>

      <Grid item xs={12} sm={5}>
        {isConnected ? (
          renderButtons()
        ) : (
          <>
            <Button
              onClick={() => {
                handleConnect();
              }}
              loading={loading}
              fullWidth
              rounded
            >
              {t('header.connect')}
            </Button>
          </>
        )}
      </Grid>

      <Grid item xs={12} md={12} sm={12}>
        {royaltyFee && royaltyFee.isGreaterThan(0) && renderRoyalty()}
      </Grid>
    </Grid>
  );
};
