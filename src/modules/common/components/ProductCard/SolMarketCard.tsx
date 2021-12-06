import { Card, CardContent, Tooltip } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import classNames from 'classnames';
import { ConditionalWrapper } from 'modules/common/components/ConditionalWrapper';
import { IImgProps, Img } from 'modules/uiKit/Img';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { VideoPlayer } from '../VideoPlayer';
import { useProductCardStyles } from './useProductCardStyles';
import { formatUnitNumber } from 'modules/common/utils/number';
import {
  IGoods,
  PriceType,
  SolAuctionState,
  SolAuctionType,
} from 'modules/market/types';
import { SOL_NFT_TYPE } from 'modules/api/common/NftType';
import { SolanaText } from 'modules/uiKit/Text';
import { LayersIcon } from '../Icons/LayersIcon';
import { SceneType } from '../QueryEmpty/QueryEmpty';
import { Button } from 'modules/uiKit/Button';
import {
  EnumNftState,
  useNFTButtonState,
} from 'modules/common/hooks/useNFTButtonState';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { onBid } from 'modules/buyNFT/actions/bidSol';
import { onClaim, onCreatorEnd } from 'modules/buyNFT/actions/claim';
import { useDispatchRequest } from '@redux-requests/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from 'npms/oystoer';
import { CardTranstionCache } from 'modules/cacheLocalStage';
import { TransitionCacheName } from 'modules/cacheLocalStage/types';
import { IMetaData } from 'modules/market/actions/useFetchUri';
import { ProfileRoutesConfig } from 'modules/profile/ProfileRoutes';
import { useUpdateUserBalance } from 'modules/common/store/user/hooks';
import { fetchBidderClaimSol } from 'modules/buyNFT/actions/onBidderCliam';
import { NotificationActions } from 'modules/notification/store/NotificationActions';
import { t } from 'modules/i18n/utils/intl';
import { useAccount } from 'modules/account/hooks/useAccount';
import { onCreatorClaim } from 'modules/buyNFT/actions/creatorClaim';
import { extractMessage } from 'modules/common/utils/extractError';
import { NftCardHelps } from 'modules/common/utils/nftCard';
import { NftCardTimer } from './Timer';
import BidsState, { BidsType } from './BidsState';
// import { Button } from 'modules/uiKit/Button';

export type ProductCardCategoryType = 'image' | 'video';

export enum ProductCardStatuses {
  Minting,
  OnSalePending,
}

export interface ISoldData {
  sold: number;
  quantity: number;
  supply?: number;
}

export interface IProductCardComponentProps {
  className?: string;
  MediaProps: IImgProps & { category: ProductCardCategoryType };
  profileInfo?: ReactNode;
  price: {
    type: PriceType;
    value: BigNumber;
    symbol: string;
  };
  auctionType: SolAuctionType;
  auctionState: SolAuctionState;
  href?: string;
  nftType: SOL_NFT_TYPE;
  scene: SceneType;
  participant?: {
    isBidder: number;
    isCreator: number;
    isQuoteTokenClaimed: number;
    isTokenClaimed: number;
    isWinner: number;
    quoteTokenAmount: number;
  };
  supply: {
    edition: number;
    maxSupply: number;
  };
  auctionDetail: IGoods;
  metaData: IMetaData | undefined;
  isOther?: boolean;
}

export const SolMarketCard = ({
  className,
  MediaProps,
  profileInfo,
  price,
  href,
  auctionType,
  nftType,
  scene,
  // participant,
  supply,
  auctionDetail,
  metaData,
  isOther,
}: IProductCardComponentProps) => {
  const classes = useProductCardStyles();

  // eslint-disable-next-line
  const TooltipClasses = {
    tooltip: classes.avatarTips,
    arrow: classes.avatarTipsText,
  };

  const { push } = useHistory();
  const storeDispatch = useDispatch();
  const { onUpdateBalance } = useUpdateUserBalance();
  const dispatch = useDispatchRequest();
  const wallet = useWallet();
  const connection = useConnection();
  const { address } = useSelector((state: RootState) => state.user);
  const nftState = useNFTButtonState({
    auctionDetail,
    address,
  });
  const auctionKey = auctionDetail.auctionAddress;
  const mintAddress = auctionDetail?.tokenMints[0]?.tokenMint;
  const [claimLoading, setClaimLoading] = useState(false);
  const onBidderClaim = useCallback(async () => {
    if (!auctionDetail) {
      console.error('error: not auctionDetail');
      return;
    }
    setClaimLoading(true);
    let claimSign: true | Error | undefined;
    try {
      console.log('-----onBidderClaim------');
      if (auctionDetail.state === SolAuctionState.STARTED) {
        console.log('--------place bid 0-------');
        const txId = await onBid({
          price: 0,
          walletAddress: address,
          dispatch,
          connection,
          wallet,
          auctionKey,
        });
        console.log('txId->', txId);
        if (typeof txId === 'string') {
          try {
            await connection.confirmTransaction(txId, 'max');
          } catch {
            // ignore
          }
          await connection.getParsedConfirmedTransaction(txId, 'confirmed');
        }
      }
      claimSign = await onClaim({
        walletAddress: address,
        connection,
        mintAddress,
        wallet,
        auctionKey,
      });
    } catch (error) {
      console.log(error);
    }
    setClaimLoading(false);
    if (claimSign === true && address) {
      // claim 后 Myowned 和 My Bids 添加过渡
      const claimTranstionCard = new CardTranstionCache(
        TransitionCacheName.ClaimItems,
        address,
      );
      claimTranstionCard.set(mintAddress as string, {
        auction: auctionKey,
        mintToken: mintAddress as unknown as string,
        image: MediaProps.src || '',
        name: metaData?.name || '',
      });
      push(ProfileRoutesConfig.UserProfile.generatePath());
      onUpdateBalance();
    }
    // eslint-disable-next-line
  }, [MediaProps.src, address, auctionDetail?.state, auctionKey]);
  const onBidderClaimSol = useCallback(async () => {
    const res = await fetchBidderClaimSol({
      setClaimLoading,
      address,
      auctionState: auctionDetail?.state,
      auctionKey,
      connection,
      wallet,
      dispatch,
    });
    if (res) {
      storeDispatch(
        NotificationActions.showNotification({
          message: 'Claim SOL Success',
          severity: 'success',
        }),
      );
      onUpdateBalance();
      push(ProfileRoutesConfig.UserProfile.generatePath());
    } else {
      // TODO
    }
    // eslint-disable-next-line
  }, [address, auctionDetail?.state, auctionKey]);
  const _onCreatorEnd = async () => {
    if (!auctionDetail || auctionDetail?.auctionType === undefined) {
      console.error('error: not auctionType');
      return;
    }
    setClaimLoading(true);
    let claimSign: true | Error | void;
    try {
      claimSign = await onCreatorEnd({
        walletAddress: address,
        connection,
        mintAddress: mintAddress,
        wallet,
        auctionKey,
        auctionType: auctionDetail.auctionType,
        dispatch,
        state: auctionDetail.state,
      });
    } catch (error: any) {
      const isUserCancel =
        typeof error === 'object'
          ? (error as Error).message.indexOf('4001') !== -1
          : false;
      if (isUserCancel) {
        return setClaimLoading(false);
      }
      storeDispatch(
        NotificationActions.showNotification({
          message: extractMessage(
            new Error(
              isUserCancel ? 'User rejected the request' : 'cancel error',
            ),
          ),
          severity: 'error',
        }),
      );
    }
    setClaimLoading(false);
    if (claimSign === true && address) {
      onUpdateBalance();
      storeDispatch(
        NotificationActions.showNotification({
          message: 'cancel Success👏👏👏',
          severity: 'success',
        }),
      );
      const claimTranstionCard = new CardTranstionCache(
        TransitionCacheName.ClaimItems,
        address,
      );
      claimTranstionCard.set(mintAddress as string, {
        auction: auctionKey,
        mintToken: mintAddress as unknown as string,
        image: MediaProps.src || '',
        name: metaData?.name || '',
      });

      await new Promise(ok => setTimeout(ok, 1e3));
      return push(ProfileRoutesConfig.UserProfile.generatePath());
    }
  };
  const _onCreatorClaim = async () => {
    if (!auctionDetail) {
      console.error('error: not auctionDetail');
      return;
    }
    setClaimLoading(true);
    let claimSign: true | Error | void;
    try {
      console.log('-----_onCreatorClaim------');
      if (auctionDetail.state === SolAuctionState.STARTED) {
        console.log('--------place bid 0-------');
        const txId = await onBid({
          price: 0,
          walletAddress: address,
          dispatch,
          connection,
          wallet,
          auctionKey,
        });
        console.log('txId->', txId);
        if (typeof txId === 'string') {
          try {
            await connection.confirmTransaction(txId, 'max');
          } catch {
            // ignore
          }
          await connection.getParsedConfirmedTransaction(txId, 'confirmed');
        }
      }

      const getWinnerList = () => {
        if (!auctionDetail) {
          console.error('not auction');
          return [];
        }
        const bids = auctionDetail?.bidState?.bids ?? [];
        const bidsSort = bids.sort((a, b) => {
          return a.value - b.value;
        });
        const mayBidSort = bidsSort.filter(
          e => e.value >= (auctionDetail?.priceFloor?.price ?? 0),
        );
        const winnerList = mayBidSort
          .reverse()
          .slice(0, auctionDetail.winnerLimit);
        return winnerList;
      };

      claimSign = await onCreatorClaim({
        walletAddress: address,
        connection,
        mintAddress: mintAddress,
        wallet,
        auctionKey,
        winnerList: getWinnerList().map(e => e.bidder),
      });
    } catch (error) {
      console.log(error);
    }
    setClaimLoading(false);
    if (claimSign === true) {
      onUpdateBalance();
      push(ProfileRoutesConfig.UserProfile.generatePath());
    }
  };

  const { handleConnect, isConnected } = useAccount();
  const checkLogin = useCallback(
    (cb?: () => void) => () => {
      if (!isConnected) {
        return handleConnect();
      }
      cb?.();
    },
    [isConnected, handleConnect],
  );
  const isLost = Boolean(
    scene === SceneType.MyBids &&
      nftState === EnumNftState.BIDER_CLAIM_SOL_AUCTION,
  );
  const isWon = Boolean(
    scene === SceneType.MyBids &&
      Boolean(
        nftState === EnumNftState.BIDER_CLAIM_TOKEN_AUCTION ||
          nftState === EnumNftState.BIDER_CLAIM_TOKEN_OPEN_EDITION,
      ),
  );
  const bids = auctionDetail?.bidState?.bids ?? [];
  const myBidList = address ? bids.filter(e => e.bidder === address) : [];
  const isOutBid = Boolean(
    !isLost &&
      myBidList.length > 0 &&
      auctionDetail?.bidState?.bids?.[auctionDetail?.bidState.bids.length - 1]
        ?.bidder !== address,
  );
  const renderRight = useMemo(() => {
    switch (scene) {
      case SceneType.MarketPlace:
        //  市场的卡片右边显示 edition相关信息
        return (
          <>
            <div>
              {' '}
              {nftType === SOL_NFT_TYPE.MasterEdition ? (
                <SolanaText context="Master" />
              ) : (
                <SolanaText context="Edition" />
              )}
            </div>
            <Tooltip
              title={
                nftType === SOL_NFT_TYPE.MasterEdition
                  ? 'Max supply'
                  : 'Copies number / Max supply'
              }
              arrow
              placement="top"
              classes={TooltipClasses}
            >
              <div className={classes.info}>
                <LayersIcon
                  className={classes.copiesIcon}
                  style={{ width: 16, marginRight: 5 }}
                />
                {nftType === SOL_NFT_TYPE.MasterEdition
                  ? `${supply.maxSupply}`
                  : `${supply.edition} of ${supply.maxSupply}`}
              </div>
            </Tooltip>
          </>
        );
      case SceneType.MyBids: {
        if (nftState === EnumNftState.BIDER_CLAIM_SOL_AUCTION) {
          return (
            <Button
              rounded
              variant="outlined"
              fullWidth
              loading={claimLoading}
              onClick={checkLogin(() => onBidderClaimSol?.())}
            >
              {t('details-nft.ClaimSol')}
            </Button>
          );
        }
        if (
          nftState === EnumNftState.BIDER_CLAIM_TOKEN_AUCTION ||
          nftState === EnumNftState.BIDER_CLAIM_TOKEN_OPEN_EDITION
        ) {
          return (
            <Button
              rounded
              variant="outlined"
              fullWidth
              loading={claimLoading}
              onClick={checkLogin(() => onBidderClaim?.())}
            >
              {t('details-nft.ClaimToken')}
            </Button>
          );
        }
        return <></>;
      }
      case SceneType.MySells: {
        if (nftState === EnumNftState.SELLER_CLAIM_SOL) {
          return (
            <Button
              rounded
              variant="outlined"
              fullWidth
              loading={claimLoading}
              onClick={checkLogin(() => _onCreatorClaim?.())}
            >
              {t('details-nft.ClaimSol')}
            </Button>
          );
        }
        if (nftState === EnumNftState.SELLER_CLAIM_BACK) {
          return (
            <Button
              rounded
              variant="outlined"
              fullWidth
              loading={claimLoading}
              onClick={checkLogin(() => _onCreatorEnd?.())}
            >
              {t('product-card.claim-back')}
            </Button>
          );
        }
        if (nftState === EnumNftState.SELLER_CANCEL) {
          return (
            <Button
              rounded
              variant="outlined"
              fullWidth
              loading={claimLoading}
              onClick={checkLogin(() => _onCreatorEnd?.())}
            >
              {t('info-prices.cancel')}
            </Button>
          );
        }
        return <></>;
      }
      default:
        return <></>;
    }
    // eslint-disable-next-line
  }, [
    TooltipClasses,
    classes,
    nftType,
    scene,
    supply,
    nftState,
    checkLogin,
    onBidderClaim,
    onBidderClaimSol,
    claimLoading,
  ]);

  const renderMediaContent = useCallback(
    () => (
      <>
        {MediaProps.category === 'image' ? (
          <Img
            {...MediaProps}
            className={classNames(MediaProps.className, classes.imgWrap)}
            ratio="1x1"
          />
        ) : (
          <div className={classes.videoWrapper}>
            <div className={classes.video}>
              {MediaProps.src && (
                <VideoPlayer
                  src={MediaProps.src}
                  objectFit={MediaProps.objectFit}
                />
              )}
            </div>
          </div>
        )}
      </>
    ),
    [MediaProps, classes.imgWrap, classes.video, classes.videoWrapper],
  );

  const beganAt = auctionDetail?.beganAt ?? 0;
  const endAuctionAt = auctionDetail?.endAuctionAt ?? 0;
  const isBidderClaimed = Boolean(
    nftState === EnumNftState.BIDER_CLAIM_SOL_AUCTION ||
      nftState === EnumNftState.BIDER_CLAIM_TOKEN_AUCTION,
  );
  const isCreatorClaimed = Boolean(
    nftState === EnumNftState.SELLER_CLAIM_BACK ||
      nftState === EnumNftState.SELLER_CLAIM_SOL,
  );

  const endTimeAt = useMemo(() => {
    return new Date((beganAt + endAuctionAt) * 1000);
  }, [beganAt, endAuctionAt]);
  const [nftCardHelps, setNftCardHelps] = useState<NftCardHelps>();
  useEffect(() => {
    setNftCardHelps(
      new NftCardHelps({
        openAt: new Date(beganAt * 1000),
        closeAt: endTimeAt,
        now: Date.now(),
        isBidderClaimed,
        isCreatorClaimed,
        isOnSale: true,
      }),
    );
  }, [beganAt, endTimeAt, nftState, isBidderClaimed, isCreatorClaimed]);

  return (
    <Card className={classNames(classes.root, className)} variant="outlined">
      <div className={classes.relative}>
        <ConditionalWrapper
          condition={!!href}
          wrapper={<Link to={href || '#'} className={classes.imgBox} />}
        >
          {renderMediaContent()}

          {!isOther && scene === SceneType.MyBids && (
            <div className={classes.relative}>
              {isOutBid && <BidsState type={BidsType.OUTBID} />}
              {isLost && <BidsState type={BidsType.LOST} />}
              {isWon && <BidsState type={BidsType.WON} />}
            </div>
          )}
        </ConditionalWrapper>
      </div>

      <CardContent className={classes.content}>
        <div className={classes.contentInfo}>
          {/*  显示NFT名称 */}
          {profileInfo}

          <div style={{ marginTop: 10 }}>
            {Boolean(nftCardHelps?.getIsAuctionLastTime() && endAuctionAt) && (
              <NftCardTimer endDate={endTimeAt} />
            )}
          </div>
        </div>

        <hr className={classes.devider} />

        <div className={classes.meta}>
          <div className={classes.saleMeta}>
            <div className={classes.saleContainer}>
              {/*  显示价格 */}
              <div className={classes.saleType}>
                {auctionType === SolAuctionType.AUCTION ? 'Top Bid' : 'Price'}
              </div>

              <div className={classes.price}>
                {formatUnitNumber(price.value.toNumber(), 4)} {price.symbol}
              </div>

              {scene !== SceneType.MarketPlace && (
                <div className={classes.nftTypeInProfile}>
                  {nftType === SOL_NFT_TYPE.MasterEdition ? (
                    <SolanaText context="Master" />
                  ) : (
                    <SolanaText context="Edition" />
                  )}
                  <Tooltip
                    title={
                      nftType === SOL_NFT_TYPE.MasterEdition
                        ? 'Max supply'
                        : 'Copies number / Max supply'
                    }
                    arrow
                    placement="top"
                    classes={TooltipClasses}
                  >
                    <div className={classes.info}>
                      <LayersIcon
                        className={classes.copiesIcon}
                        style={{ width: 16, marginRight: 5 }}
                      />
                      {nftType === SOL_NFT_TYPE.MasterEdition
                        ? `${supply.maxSupply}`
                        : `${supply.edition} of ${supply.maxSupply}`}
                    </div>
                  </Tooltip>
                </div>
              )}

              {/*  根据状态显示池子 */}
              <div className={classes.infoRight}>{!isOther && renderRight}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
