import { useDispatchRequest } from '@redux-requests/react';
import { useConnection } from 'npms/oystoer';
import { onBid } from 'modules/buyNFT/actions/bidSol';
import { Info } from 'modules/buyNFT/components/Info';
import { InfoDescr } from 'modules/buyNFT/components/InfoDescr';
import { InfoPrices } from 'modules/buyNFT/components/InfoPrices';
import { MediaContainer } from 'modules/buyNFT/components/MediaContainer';
import { ProfileInfo } from 'modules/common/components/ProfileInfo';
import { truncateWalletAddr } from 'modules/common/utils/truncateWalletAddr';
import { t } from 'modules/i18n/utils/intl';
import { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { SOL_NFT_TYPE } from '../../../api/common/NftType';
import { BuyNFTSkeleton } from './BuyNFTSkeleton';
import { useBuyNFTStyles } from './useBuyNFTStyles';
import { useWallet } from '@solana/wallet-adapter-react';
import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import useAuctionDetail from 'modules/buyNFT/actions/useAuctionDetail';
import BigNumber from 'bignumber.js';
import { FixedSwapState } from 'modules/api/common/FixedSwapState';
import {
  BlockchainNetworkId,
  featuresConfig,
  getBlockChainExplorerAddress,
} from 'modules/common/conts';
import { InfoTabs } from 'modules/buyNFT/components/InfoTabs';
import { InfoTabsList } from 'modules/buyNFT/components/InfoTabsList';
import { ScanBtn } from 'modules/buyNFT/components/ScanBtn/ScanBtn';
import { TokenInfo } from 'modules/buyNFT/components/TokenInfo/TokenInfo';
import useTokenOraclePrice from 'modules/buyNFT/actions/useTokenOraclePrice';
import { BuyDialog } from 'modules/buyNFT/components/BuyDialog';
import { onClaim, onCreatorEnd } from 'modules/buyNFT/actions/claim';
import { onCreatorClaim } from 'modules/buyNFT/actions/creatorClaim';
import { ProfileRoutesConfig } from 'modules/profile/ProfileRoutes';
import { NotificationActions } from 'modules/notification/store/NotificationActions';
import { useDispatch } from 'react-redux';
import { extractMessage } from 'modules/common/utils/extractError';
import { BidDialog, IBidFormValues } from 'modules/buyNFT/components/BidDialog';
import { SolAuctionState } from 'modules/market/types';
import { TransactionSignature } from '@solana/web3.js';
import { InfoTabsItem } from 'modules/buyNFT/components/InfoTabsItem';
import { CardTranstionCache } from 'modules/cacheLocalStage';
import { TransitionCacheName } from 'modules/cacheLocalStage/types';
import { useUpdateUserBalance } from 'modules/common/store/user/hooks';
import { fetchBidderClaimSol } from 'modules/buyNFT/actions/onBidderCliam';
import { FCAttribute } from 'modules/form/components/Attributes';
import useHistoryList, { IHistoryList } from './useHistoryList';
import { uid } from 'react-uid';

export const BuyNFT = () => {
  const classes = useBuyNFTStyles();
  // SOL
  const { auctionKey } = useParams<{ auctionKey: string }>();
  const {
    auctionDetail,
    itemNftInfo,
    rolesInfo,
    fetch: reloadFetch,
  } = useAuctionDetail(auctionKey);
  const { loading: historyLoading, historyList } = useHistoryList({
    auctionAddress: auctionKey,
  });
  const solPrice = useTokenOraclePrice();
  const storeDispatch = useDispatch();
  const { onUpdateBalance } = useUpdateUserBalance();

  // console.log('solPrice----->', solPrice);
  // console.log('itemNftInfo---->', itemNftInfo);
  // console.log('rolesInfo---->', rolesInfo);

  const dispatch = useDispatchRequest();
  const wallet = useWallet();
  const { address } = useReactWeb3();
  const connection = useConnection();
  // TODO
  const maxQuantity = new BigNumber(1);
  const bids = auctionDetail?.bidState.bids ? auctionDetail?.bidState.bids : [];
  // TODO 这个可能有问题  出价的不一定小于当前价
  const lastestBidAmount = new BigNumber(
    auctionDetail?.bidState.bids
      ? auctionDetail?.bidState.bids[auctionDetail?.bidState.bids.length - 1]
          .value
      : auctionDetail?.priceFloor.price ?? 1,
  ).div(1e9);
  // TODO TickSize
  const minIncrease = new BigNumber(bids.length > 0 ? 0.01 : 0);
  const currentPrice = new BigNumber(auctionDetail?.priceFloor.price ?? -1).div(
    1e9,
  );
  const wrapperTitle = (name: string, address: string) => {
    return name || truncateWalletAddr(address);
  };

  const renderedCreator = (
    <ProfileInfo
      subTitle={t('details-nft.role.minter')}
      title={wrapperTitle(
        rolesInfo.seller.userName,
        rolesInfo.seller.userAccount,
      )}
      users={[
        {
          name: wrapperTitle(
            rolesInfo.seller.userName,
            rolesInfo.seller.userAccount,
          ),
          href:
            rolesInfo.seller.userAccount &&
            ProfileRoutesConfig.OtherProfile.generatePath(
              auctionDetail?.creator,
            ),
          avatar: rolesInfo.seller.avatar,
          verified: rolesInfo.seller.isVerify,
        },
      ]}
    />
  );

  const attributes = itemNftInfo?.metadata?.attributes ?? [];
  const listView = [
    <FCAttribute attributes={attributes} />,
    <TokenInfo
      name={itemNftInfo?.name}
      itemSymbol={itemNftInfo?.metadata.symbol}
      standard={
        itemNftInfo?.edition ? SOL_NFT_TYPE.Edition : SOL_NFT_TYPE.MasterEdition
      }
      contractAddress={itemNftInfo?.mintAddress || ''}
      copiesIndex={itemNftInfo?.edition?.edition}
      supply={itemNftInfo?.masterEdition.supply}
      maxSupply={itemNftInfo?.masterEdition.maxSupply}
      ownerAddress={itemNftInfo?.owner}
    />,
  ];
  const renderedTokenInfoList = (
    <InfoTabsList>
      <ScanBtn contractAddress={itemNftInfo?.mintAddress || ''} />
      {attributes.length === 0 ? listView[1] : <>{listView.map(e => e)}</>}
    </InfoTabsList>
  );

  // const renderedComingSoon = <Box mt={2}>{t('common.coming-soon')}</Box>;

  const itemName = itemNftInfo?.name || '';
  const fileUrl = itemNftInfo?.image || '';
  const category = 'image';

  const [openedBuy, setOpenedBuy] = useState(false);
  const [openedBid, setOpenedBid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const closeBuyDialog = () => {
    setOpenedBuy(false);
  };
  const closeBidDialog = () => {
    setOpenedBid(false);
  };
  const { push } = useHistory();
  useEffect(() => {
    onUpdateBalance();
    // eslint-disable-next-line
  }, []);

  const onBidSubmit = async (values: IBidFormValues) => {
    onUpdateBalance();
    onSubmit(new BigNumber(values.bid).multipliedBy(1e9).toNumber());
  };
  const onBuySubmit = () => {
    onUpdateBalance();
    onSubmit(auctionDetail?.priceFloor.price ?? -1);
  };
  const onBidBuyClick = async () => {
    if (!auctionDetail?.instantSalePrice) {
      console.error('nft error: not instantSalePrice');
      return;
    }
    setBuyLoading(true);
    onUpdateBalance();
    await onSubmit(auctionDetail?.instantSalePrice ?? -1);
    setBuyLoading(false);
  };
  const onSubmit = async (price: number) => {
    setLoading(true);
    let bidTxId: TransactionSignature | Error | undefined;
    try {
      bidTxId = await onBid({
        price,
        walletAddress: address,
        dispatch,
        connection,
        wallet,
        auctionKey,
      });
      console.log('bidTxId->', bidTxId);
      if (typeof bidTxId === 'string') {
        try {
          await connection.confirmTransaction(bidTxId, 'max');
        } catch {
          // ignore
        }
        await connection.getParsedConfirmedTransaction(bidTxId, 'confirmed');
      }
    } catch (error: any) {
      console.log('cancel buy', error);
      setLoading(false);
      if (error?.code === -32603 || error?.code === 4001) {
        console.log('User rejected the request');
        return;
      }
      storeDispatch(
        NotificationActions.showNotification({
          message: extractMessage(new Error('place bid error')),
          severity: 'error',
        }),
      );
      return;
    }
    closeBidDialog();
    closeBuyDialog();
    storeDispatch(
      NotificationActions.showNotification({
        message: 'Place bid success👏👏👏',
        severity: 'success',
      }),
    );
    onUpdateBalance();
    await new Promise(ok => setTimeout(ok, 2e3));
    setLoading(false);
    if (typeof bidTxId === 'string') {
      console.log('bid success');
      reloadFetch();
    }
  };

  const [claimLoading, setClaimLoading] = useState(false);
  const mintAddress = itemNftInfo?.mintAddress;
  const onBidderClaim = async () => {
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
    if (claimSign === true) {
      // claim 后 Myowned 和 My Bids 添加过渡
      const claimTranstionCard = new CardTranstionCache(
        TransitionCacheName.ClaimItems,
        address as string,
      );
      claimTranstionCard.set(mintAddress as string, {
        auction: auctionKey,
        mintToken: mintAddress as unknown as string,
        image: itemNftInfo?.image || '',
        name: itemNftInfo?.name || '',
      });
      push(ProfileRoutesConfig.UserProfile.generatePath());
      onUpdateBalance();
    }
  };
  const onBidderClaimSol = async () => {
    const res = await fetchBidderClaimSol({
      setClaimLoading,
      address,
      auctionState: auctionDetail?.state,
      auctionKey,
      connection,
      wallet,
      dispatch,
    });
    storeDispatch(
      NotificationActions.showNotification({
        message: 'Claim SOL Success',
        severity: 'success',
      }),
    );
    onUpdateBalance();
    if (res) {
      push(ProfileRoutesConfig.UserProfile.generatePath());
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
        mintAddress: itemNftInfo?.mintAddress,
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
        mintAddress: itemNftInfo?.mintAddress,
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
    if (claimSign === true) {
      onUpdateBalance();
      storeDispatch(
        NotificationActions.showNotification({
          message: 'cancel Success👏👏👏',
          severity: 'success',
        }),
      );
      const claimTranstionCard = new CardTranstionCache(
        TransitionCacheName.ClaimItems,
        address as string,
      );
      claimTranstionCard.set(mintAddress as string, {
        auction: auctionKey,
        mintToken: mintAddress as unknown as string,
        image: itemNftInfo?.image || '',
        name: itemNftInfo?.name || '',
      });

      await new Promise(ok => setTimeout(ok, 1e3));
      return push(ProfileRoutesConfig.UserProfile.generatePath());
    }
  };

  const renderedBidsList = useMemo(() => {
    console.log('auctionDetail', auctionDetail);
    const _bidsListData = auctionDetail?.bidHistories || [];
    const bidsListData = _bidsListData.sort(
      (a, b) => b.timestamp - a.timestamp,
    );
    return (
      <InfoTabsList>
        {bidsListData.length ? (
          bidsListData.map(item => {
            return (
              <InfoTabsItem
                key={new Date().getTime()}
                title={t('details-nft.bid.bid-placed')}
                author={truncateWalletAddr(item.bidder)}
                date={new Date(item.timestamp * 1000)}
                price={new BigNumber(item.value * solPrice).div(1e9)}
                cryptoCurrency={'SOL'}
                cryptoPrice={new BigNumber(item.value).div(1e9)}
                href={
                  item.signature &&
                  (process.env.REACT_APP_BASE_ENV === 'test'
                    ? `${getBlockChainExplorerAddress(
                        BlockchainNetworkId.solana,
                      )}/tx/${item.signature}`
                    : `${getBlockChainExplorerAddress(
                        BlockchainNetworkId.solana,
                      )}/tx/${item.signature}?cluster=devnet`)
                }
              />
            );
          })
        ) : (
          <div>Looking forward to your bids ...</div>
        )}
      </InfoTabsList>
    );
    // eslint-disable-next-line
  }, [auctionDetail]);

  const renderedHistory = useMemo(() => {
    const getHistoryTitle = (historyItem: IHistoryList) => {
      console.log('historyItem', historyItem);
      switch (historyItem.action) {
        case 'CreateAuction':
          return `Put on sale for ${new BigNumber(historyItem.amount)
            .div(1e9)
            .dp(4)
            .toString()} SOL`;
        case 'EndAuction':
          return `Cancel this sale`;
        case 'WinAuction':
          return `Offered ${new BigNumber(historyItem.amount)
            .div(1e9)
            .dp(4)
            .toString()} SOL for 1 edition`;
        case 'ClaimFund':
          return `Claim fund`;
        case 'ClaimToken':
          return `Claim token`;
        default:
          return '-----------';
      }
    };

    const historyComponent = (() => {
      return historyLoading ? (
        <p>Loading...</p>
      ) : (
        historyList.map(historyItem => {
          return (
            <InfoTabsItem
              key={uid(historyItem.signature)}
              title={getHistoryTitle(historyItem)}
              author={truncateWalletAddr(historyItem.userAddress)}
              date={new Date(historyItem.blockTs * 1000)}
            />
          );
        })
      );
    })();

    return <InfoTabsList>{historyComponent}</InfoTabsList>;
  }, [historyList, historyLoading]);

  return !auctionDetail ? (
    <BuyNFTSkeleton />
  ) : (
    <>
      <div className={classes.root}>
        <MediaContainer
          className={classes.imgContainer}
          src={fileUrl}
          title={itemName}
          description={itemNftInfo?.metadata.description || ''}
          category={category}
          isOpenSaleTime={false}
          onchange={() => {}}
          LikeBtn={<></>}
        />

        <Info className={classes.info}>
          <InfoDescr
            title={itemName}
            description={itemNftInfo?.metadata.description || ''}
            currentPage="poolDetail"
            nftType={
              itemNftInfo?.edition
                ? SOL_NFT_TYPE.Edition
                : SOL_NFT_TYPE.MasterEdition
            }
            copiesIndex={itemNftInfo?.edition?.edition}
            supply={itemNftInfo?.masterEdition.supply}
            maxSupply={itemNftInfo?.masterEdition.maxSupply}
            creator={renderedCreator}
            owner={<></>}
            LikeBtn={<></>}
          />

          <InfoPrices
            price={lastestBidAmount.times(solPrice)} // 转换美元后价格
            hasSetDirectPrice={true}
            cryptoPrice={lastestBidAmount} // 以 SOL 计价
            cryptoCurrency={'SOL'}
            onBuyClick={() => {
              onUpdateBalance();
              setOpenedBuy(true);
            }}
            onBidBuyClick={onBidBuyClick}
            disabled={false}
            saleTime={false}
            loading={claimLoading}
            buyLoading={buyLoading}
            onBidderClaim={onBidderClaim}
            onBidderClaimSol={onBidderClaimSol}
            onCreatorClaim={_onCreatorClaim}
            state={FixedSwapState.Live}
            onCancel={_onCreatorEnd}
            onBidClick={() => setOpenedBid(true)}
            auctionDetail={auctionDetail}
            poolType={undefined}
            address={address}
            royaltyFee={
              itemNftInfo?.sellerFeeBasisPoints
                ? new BigNumber(itemNftInfo.sellerFeeBasisPoints / 100)
                : undefined
            }
          />
          {featuresConfig.infoTabs && (
            <InfoTabs
              history={renderedHistory}
              bids={renderedBidsList}
              tokenInfo={renderedTokenInfoList}
            />
          )}
        </Info>
        <BuyDialog
          name={itemName}
          filepath={fileUrl}
          onSubmit={onBuySubmit}
          isOpen={openedBuy}
          onClose={closeBuyDialog}
          owner={wrapperTitle(
            rolesInfo.seller.userName,
            rolesInfo.seller.userAccount,
          )}
          ownerAvatar={rolesInfo.seller.avatar}
          isOwnerVerified={rolesInfo.seller.isVerify}
          category={category}
          loading={loading}
          maxQuantity={maxQuantity.toNumber()}
          currentPrice={currentPrice}
          readonly
        />
        <BidDialog
          name={itemName}
          filepath={fileUrl}
          onSubmit={onBidSubmit}
          isOpen={openedBid}
          onClose={closeBidDialog}
          owner={wrapperTitle(
            rolesInfo.seller.userName,
            rolesInfo.seller.userAccount,
          )}
          ownerAvatar={rolesInfo.seller.avatar}
          isOwnerVerified={rolesInfo.seller.isVerify}
          category={category}
          loading={loading}
          maxQuantity={maxQuantity.toNumber()}
          // currentPrice={currentPrice}
          minIncrease={minIncrease}
          lastestBidAmount={lastestBidAmount}
        />
      </div>
    </>
  );
};
