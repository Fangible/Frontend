import { Box } from '@material-ui/core';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAccount } from 'modules/account/hooks/useAccount';
import { SOL_NFT_TYPE } from 'modules/api/common/NftType';
import { Info } from 'modules/buyNFT/components/Info';
import { InfoDescr } from 'modules/buyNFT/components/InfoDescr';
import {
  InfoTabs,
  NftInfoDetailOption,
} from 'modules/buyNFT/components/InfoTabs';
import { InfoTabsList } from 'modules/buyNFT/components/InfoTabsList';
import { MediaContainer } from 'modules/buyNFT/components/MediaContainer';
import { ScanBtn } from 'modules/buyNFT/components/ScanBtn';
import { TokenInfo } from 'modules/buyNFT/components/TokenInfo';
import { useArt } from 'modules/common/hooks/useArt';
import { RoutesConfiguration } from 'modules/createNFT/Routes';
import { t } from 'modules/i18n/utils/intl';
import { NotificationActions } from 'modules/notification/store/NotificationActions';
import { useNftInfo } from 'modules/profile/screens/Profile/Hook/useNftInfo';
import { Button } from 'modules/uiKit/Button';
import {
  MetadataCategory,
  // programIds,
  useConnection,
  useUserAccounts,
} from 'npms/oystoer';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { BuyNFTSkeleton } from './BuyNFTSkeleton';
import { mintEditionsToWallet } from './metaplex/mintEditionsIntoWallet';
import { useBuyNFTStyles } from './useBuyNFTStyles';
import { MintToDialog } from '../../components/MintToDialog';
import { TransitionCacheName } from 'modules/cacheLocalStage/types';
import { CardTranstionCache } from 'modules/cacheLocalStage';
import { ProfileRoutesConfig } from 'modules/profile/ProfileRoutes';
import { FCAttribute } from 'modules/form/components/Attributes';

export const ShowNftDetail = () => {
  const classes = useBuyNFTStyles();
  const history = useHistory();
  const { mintKey } = useParams<{ mintKey: string }>();
  const { data: nftInfo, loading } = useNftInfo(mintKey);
  const storeDispatch = useDispatch();
  // MintTo 弹框
  const [openMintToDialog, setOpenMintToDialog] = useState(false);
  const [mintToLoading, setMintToLoading] = useState(false);
  const { address } = useAccount();

  const isMintTo = (() => {
    return (
      nftInfo &&
      nftInfo.owner === address &&
      !nftInfo?.edition &&
      (nftInfo?.masterEdition.supply || 0) <
        (nftInfo?.masterEdition.maxSupply || 0)
    );
  })();

  const wallet = useWallet();
  const connection = useConnection();
  const { accountByMint } = useUserAccounts();
  const artMintTokenAccount = accountByMint.get(mintKey);
  const editionType = nftInfo?.edition
    ? SOL_NFT_TYPE.Edition
    : SOL_NFT_TYPE.MasterEdition;
  const art = useArt(editionType, mintKey);

  const saleTime = false;
  const onChangeTime = () => {};
  const renderedComingSoon = <Box mt={2}>{t('common.coming-soon')}</Box>;

  const handelSubmitMintTo = useCallback(
    async values => {
      setMintToLoading(true);
      const { amount, destination: toAddress } = values;

      if (!art?.mint) return;
      try {
        const res = await mintEditionsToWallet(
          art,
          wallet!,
          connection,
          artMintTokenAccount!,
          amount, // mint的数量
          toAddress || '',
          address || '',
          // 成功后的提示
          () => {
            storeDispatch(
              NotificationActions.showNotification({
                message:
                  'Congratulations, you have MInt out a copy of Edition  ',
                severity: 'success',
              }),
            );
          },
        );
        console.log('mintTo', res);
        // 缓存 MintTo 结果
        if (res.length !== 0 && address) {
          const cache_mintNFT = new CardTranstionCache(
            TransitionCacheName.CretedItems,
            address,
          );
          res.forEach(item => {
            cache_mintNFT.set(item, {
              auction: '-',
              mintToken: item,
              image: nftInfo?.image || '',
              name: nftInfo?.name || '',
            });
          });
        }

        history.push(ProfileRoutesConfig.UserProfile.generatePath());
      } catch (error) {
        console.error(error);
      } finally {
        setMintToLoading(false);
        setOpenMintToDialog(false);
      }
    },
    [
      art,
      wallet,
      connection,
      artMintTokenAccount,
      address,
      storeDispatch,
      history,
      nftInfo,
    ],
  );

  const attributes = nftInfo?.metadata?.attributes ?? [];
  const listView = [
    <FCAttribute attributes={attributes} />,
    <TokenInfo
      name={nftInfo?.name}
      itemSymbol={nftInfo?.symbol}
      contractAddress={nftInfo?.mintAddress}
      standard={
        nftInfo?.edition ? SOL_NFT_TYPE.Edition : SOL_NFT_TYPE.MasterEdition
      }
      copiesIndex={nftInfo?.edition?.edition}
      supply={nftInfo?.masterEdition.supply}
      maxSupply={nftInfo?.masterEdition.maxSupply}
      ownerAddress={nftInfo?.owner}
    />,
  ];
  const renderedTokenInfoList = (
    <InfoTabsList>
      <ScanBtn contractAddress={nftInfo?.mintAddress || ''} />
      {attributes.length === 0 ? listView[1] : <>{listView.map(e => e)}</>}
    </InfoTabsList>
  );

  return useMemo(() => {
    if (loading) return <BuyNFTSkeleton />;

    if (!loading && !nftInfo) {
      history.push('/404');
    }

    return (
      nftInfo && (
        <div className={classes.root}>
          <MediaContainer
            className={classes.imgContainer}
            src={nftInfo.image || ''}
            title={''}
            description={''}
            category={
              nftInfo.metadata.category === MetadataCategory.Video
                ? 'video'
                : 'image'
            }
            isOpenSaleTime={saleTime}
            onchange={onChangeTime}
            LikeBtn={<></>}
          />

          <Info className={classes.info}>
            <InfoDescr
              title={nftInfo.name || '---'}
              description={nftInfo.metadata.description || '---'}
              nftType={
                nftInfo.edition
                  ? SOL_NFT_TYPE.Edition
                  : SOL_NFT_TYPE.MasterEdition
              }
              currentPage="itemDetail"
              copiesIndex={nftInfo.edition?.edition}
              supply={nftInfo.masterEdition.supply}
              maxSupply={nftInfo.masterEdition.maxSupply}
              // creator={renderedCreator}
              // owner={renderedCollection()}
              LikeBtn={<></>}
            />

            <div>
              {nftInfo.owner === address && (
                <Button
                  href={RoutesConfiguration.PublishNft.generatePath(
                    nftInfo.mintAddress,
                  )}
                >
                  Put On Sale
                </Button>
              )}
              &nbsp; &nbsp; &nbsp; &nbsp;
              {isMintTo && (
                <Button onClick={() => setOpenMintToDialog(true)}>
                  Mint To
                </Button>
              )}
            </div>

            <InfoTabs
              tokenInfo={nftInfo ? renderedTokenInfoList : renderedComingSoon}
              tabs={[NftInfoDetailOption]}
            />
          </Info>

          {/* MintTo 弹框 */}
          <MintToDialog
            isOpen={openMintToDialog}
            onClose={() => {
              setMintToLoading(false);
              setOpenMintToDialog(false);
            }}
            onSubmit={handelSubmitMintTo}
            loading={mintToLoading}
            initialValues={{
              amount: 1,
              destination: address || '',
            }}
            initBalances={{
              available:
                nftInfo.masterEdition.maxSupply - nftInfo.masterEdition.supply,
              maxSupply: nftInfo.masterEdition.maxSupply,
            }}
          />
        </div>
      )
    );
    // eslint-disable-next-line
  }, [nftInfo, loading, art, wallet, connection]);
};
