import BigNumber from 'bignumber.js';
import { SOL_NFT_TYPE } from 'modules/api/common/NftType';
import { BuyNFTRoutesConfig } from 'modules/buyNFT/BuyNFTRoutes';
import { SolMarketCard } from 'modules/common/components/ProductCard/SolMarketCard';
import { CardProfileInfo } from 'modules/common/components/ProfileInfo';
import { SceneType } from 'modules/common/components/QueryEmpty/QueryEmpty';
import { t } from 'modules/i18n/utils/intl';
import useFetchUri from 'modules/market/actions/useFetchUri';
import {
  IGoods,
  PriceType,
  SolAuctionType,
  SOL_NFT_KEY_TYPE,
} from 'modules/market/types';

export const MarketNftCard = ({
  good,
  scene,
  isOther,
}: {
  good: IGoods;
  scene: SceneType;
  isOther?: boolean;
}) => {
  const metaData = useFetchUri(good?.tokenMints[0]?.uri);
  const getShowPrice = () => {
    const poolType = good.auctionType;
    const lastPrice = (() => {
      try {
        if (poolType === SolAuctionType.AUCTION && good.bidState.bids) {
          // 英式拍需要计算最高价格
          return new BigNumber(
            good.bidState.bids[good.bidState.bids.length - 1].value
          )
        }
        // 英式拍未出价或固定拍均返回低价
        return new BigNumber(good.priceFloor.price)
      } catch (error) {
        return new BigNumber(0);
      }
    })();
    return {
      type: good?.priceFloor.type ?? PriceType.No_FLOOR,
      value: new BigNumber(lastPrice).div(1e9),
      symbol: 'SOL',
    }
  };

  return (
    <SolMarketCard
      MediaProps={{
        category: 'image',
        src: metaData?.image,
        objectFit: 'contain',
        loading: 'lazy'
      }}
      profileInfo={
        <CardProfileInfo
          subTitle={t('product-card.owner')}
          title={metaData?.name || '---'}
          users={[]}
        />
      }
      price={getShowPrice()}
      href={BuyNFTRoutesConfig.DetailsNFT.generatePath(good.auctionAddress)}
      auctionType={good.auctionType}
      auctionState={good.state}
      nftType={
        good.tokenMints[0]?.key === SOL_NFT_KEY_TYPE.EditionV1
          ? SOL_NFT_TYPE.Edition
          : SOL_NFT_TYPE.MasterEdition
      }
      supply={{
        edition: good.tokenMints[0]?.edition || 0,
        maxSupply: good.tokenMints[0]?.maxSupply || 0,
      }}
      scene={scene}
      participant={good.participant}
      auctionDetail={good}
      metaData={metaData}
      isOther={isOther}
    />
  );
};
