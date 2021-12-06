import { Box, Container } from '@material-ui/core';
import { NoItems } from 'modules/common/components/NoItems';
import { ProductCards } from 'modules/common/components/ProductCards';
import { MarketRoutesConfig } from 'modules/market/Routes';
// import { ProductsPanel } from 'modules/overview/components/ProductsPanel';
import { useIsSMDown } from 'modules/themes/useTheme';
import { ISectionProps, Section } from 'modules/uiKit/Section';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import { Pagination } from '../../../uiKit/Pagination';
import { useProductsStyles } from './useProductsStyles';
import { useMarketList } from 'modules/market/actions/useMarketList';
import { MarketNftCard } from './nftCard';
import { uid } from 'react-uid';
import { SceneType } from 'modules/common/components/QueryEmpty/QueryEmpty';
import { SolTranstionCard } from 'modules/common/components/ProductCard/SolTranstionCard';
import { CardTranstionCache } from 'modules/cacheLocalStage';
import { ProductsPanel } from 'modules/overview/components/ProductsPanel';
import { ItemsChannel } from 'modules/overview/actions/fetchItemsByFilter';
import { useAccount } from 'modules/account/hooks/useAccount';
import { TransitionCacheName } from 'modules/cacheLocalStage/types';
import { IGoods } from 'modules/market/types';

const ITEMS_PORTION_COUNT = 20;
const DEFAULT_PAGE = 1;

export enum LiveAuctionViewState {
  All = '0',
  Participated = '1',
  Ended = '2',
  Resale = '3',
}

export const Products = ({ ...sectionProps }: ISectionProps) => {
  let { page, channel: defaultChannel } = MarketRoutesConfig.Market.useParams();
  const [channel, setChannel] = useState<ItemsChannel>(
    defaultChannel || ItemsChannel.all,
  );
  const { address } = useAccount();

  const history = useHistory();
  const [sortBy, setSortBy] = useState<string>('1');
  const isMobile = useIsSMDown();
  const classes = useProductsStyles();
  // 获取市场列表数据
  const {
    list: nftItems,
    loading: nftItemsLoading,
    pagesCount,
  } = useMarketList({ pageIndex: page || 1, channel });

  const onPaginationChange = (event: ChangeEvent<unknown>, value: number) => {
    history.push(MarketRoutesConfig.Market.generatePath(value, channel));
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const hasItems = !!nftItems.length;

  const rendrerdCards = useMemo(() => {
    const reList_pool = nftItems as IGoods[];
    const cache_List: JSX.Element[] = [];

    if (address) {
      /**
       * 上架 缓存
       * 触发场景：PublishNFT
       * 结果：tabOwned 卡片消失  TabSell和 AuctionList 增加过渡卡片
       * 结束场景：TabSell 和 AuctionList 接口数据有该卡片数据出现即删除
       */
      const cache_PublishNFT = new CardTranstionCache(
        TransitionCacheName.PublishItems,
        address,
      );
      const cache_PublishNFT_Array = cache_PublishNFT.toArray();

      if (cache_PublishNFT_Array && cache_PublishNFT_Array.length) {
        const cache_PublishNFT_Array_ = cache_PublishNFT_Array.filter(item => {
          const cacheAuction = item.auction;
          const tar = reList_pool.find(pool_ => {
            return pool_.auctionAddress === cacheAuction;
          });
          if (tar) {
            cache_PublishNFT.del(cacheAuction);
            return false;
          }
          return true;
        });

        const cacheList_pools_temp = cache_PublishNFT_Array_.map(item => {
          return (
            <SolTranstionCard
              item={item}
              scene={SceneType.MarketPlace}
              key={uid(item)}
            />
          );
        });
        cache_List.unshift(...cacheList_pools_temp);
      }
    }

    const normalPools = nftItems.map(good => (
      <MarketNftCard
        good={good}
        key={uid(good)}
        scene={SceneType.MarketPlace}
      />
    ));
    return [...cache_List, ...normalPools];
  }, [nftItems, address]);

  const renderedPagination = (
    <Pagination
      disabled={nftItemsLoading}
      page={page || 1}
      count={pagesCount}
      onChange={onPaginationChange}
    />
  );

  const renderedBottomPagination = (
    <div className={classes.paginationBottom}>{renderedPagination}</div>
  );

  // Channel 分类
  const onSortChange = useCallback((value: string) => {
    setSortBy(value);
  }, []);

  const onCategoryChange = useCallback(
    (value: string) => {
      setChannel(value as ItemsChannel);
      history.push(
        MarketRoutesConfig.Market.generatePath(1, value as ItemsChannel),
      );
    },
    [history],
  );

  return (
    <Section {...sectionProps}>
      <Container>
        <Box mb={6}>
          <ProductsPanel
            onSortChange={onSortChange}
            onCategoryChange={onCategoryChange}
            catergory={channel}
            sortBy={sortBy}
            disabled={nftItemsLoading}
          />
        </Box>

        <Box mb={{ xs: 4, md: 6 }}></Box>

        {nftItemsLoading || hasItems ? (
          <>
            {isMobile && (
              <div className={classes.paginationTop}>{renderedPagination}</div>
            )}

            <ProductCards
              isLoading={nftItemsLoading}
              skeletonsCount={ITEMS_PORTION_COUNT}
            >
              {rendrerdCards}
            </ProductCards>

            {renderedBottomPagination}
          </>
        ) : (
          <>
            <NoItems />
            {page !== DEFAULT_PAGE && renderedBottomPagination}
          </>
        )}
      </Container>
    </Section>
  );
};
