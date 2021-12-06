import { Grid } from '@material-ui/core';
import { CardTranstionCache } from 'modules/cacheLocalStage';
import { TransitionCacheName } from 'modules/cacheLocalStage/types';
import { MarketNftCard } from 'modules/market/components/Products/nftCard';
import { IGoods } from 'modules/market/types';
import { INftInfoSchema } from 'modules/profile/screens/Profile/Hook/types';
import React, { ReactNode, useCallback, useMemo } from 'react';
import { uid } from 'react-uid';
import { ItemCard } from '../ProductCard/ItemCard';
import { ProductCardSkeleton } from '../ProductCard/ProductCardSkeleton';
import { SolTranstionCard } from '../ProductCard/SolTranstionCard';
import { SceneType } from '../QueryEmpty/QueryEmpty';
import { useProductCardsStyles } from './useProductCardsStyles';

interface ISolProductCardsProps {
  isLoading: boolean;
  scene: SceneType;
  list: IGoods[] | INftInfoSchema[];
  noItemComponent: ReactNode;
  isOther?: boolean;
  userAddress?: string;
}

export const SolProductCards = ({
  isLoading,
  scene,
  list,
  noItemComponent,
  isOther,
  userAddress,
}: ISolProductCardsProps) => {
  const classes = useProductCardsStyles();
  const modifyChildren = useCallback(
    (child: any) => {
      return (
        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
          xl={3}
          className={classes.col}
          key={uid(child)}
        >
          {child}
        </Grid>
      );
    },
    [classes.col],
  );

  const renderedSkeletons = [...Array(10)].map((_, i) =>
    modifyChildren(<ProductCardSkeleton key={uid(i)} />),
  );

  const rednerList = useMemo(() => {
    switch (scene) {
      // 展示为 Pool 卡片形态
      case SceneType.MyBids:
      case SceneType.MySells:
      case SceneType.MarketPlace:
        let reList_pool = list as IGoods[];
        let cacheList_pools: JSX.Element[] = [];
        if (!isOther && userAddress) {
          /**
           * 上架 缓存
           * 触发场景：PublishNFT
           * 结果：tabOwned 卡片消失  TabSell和 AuctionList 增加过渡卡片
           * 结束场景：TabSell 和 AuctionList 接口数据有该卡片数据出现即删除
           */
          const cache_PublishNFT = new CardTranstionCache(
            TransitionCacheName.PublishItems,
            userAddress,
          );
          const cache_PublishNFT_Array = cache_PublishNFT.toArray();

          if (
            cache_PublishNFT_Array &&
            cache_PublishNFT_Array.length &&
            scene === SceneType.MySells
          ) {
            const cache_PublishNFT_Array_ = cache_PublishNFT_Array.filter(
              item => {
                const cacheAuction = item.auction;
                const tar = reList_pool.find(pool_ => {
                  return pool_.auctionAddress === cacheAuction;
                });
                if (tar) {
                  cache_PublishNFT.del(cacheAuction);
                  return false;
                }
                return true;
              },
            );

            const cacheList_pools_temp = cache_PublishNFT_Array_.map(item =>
              modifyChildren(
                <SolTranstionCard item={item} key={uid(item)} scene={scene} />,
              ),
            );
            cacheList_pools.unshift(...cacheList_pools_temp);
          }
        }

        const normal_pools = reList_pool.map(item =>
          modifyChildren(
            <MarketNftCard
              good={item}
              key={uid(item)}
              scene={scene}
              isOther={isOther}
            />,
          ),
        );

        return [...cacheList_pools, ...normal_pools];

      // 展示为 Item 卡片形态
      case SceneType.MyCreated:
      case SceneType.MyOwned:
        // 正常 Item
        let reList_item = list as INftInfoSchema[];
        let cacheList_items: JSX.Element[] = [];

        if (!isOther && userAddress) {
          /**
           * cache_CreatNFT 缓存
           * 触发场景：CreateNewNFT、MintToNFT
           * 结果：tabCreated 和 tabOwned 加上过渡卡片效果
           * 结束场景：tabCreated 和 tabOwned 接口数据有改卡片数据出现即删除
           */
          const cache_CreatNFT = new CardTranstionCache(
            TransitionCacheName.CretedItems,
            userAddress,
          );
          const cache_CreatNFT_Array = cache_CreatNFT.toArray();

          if (cache_CreatNFT_Array && cache_CreatNFT_Array.length) {
            const cache_CreatNFT_Array_ = cache_CreatNFT_Array.filter(item => {
              const cacheMintToken = item.mintToken;
              const tar = reList_item.find(item_ => {
                return item_.mintAddress === cacheMintToken;
              });
              if (tar) {
                cache_CreatNFT.del(cacheMintToken);
                return false;
              }
              return true;
            });

            const cacheList_items_temp = cache_CreatNFT_Array_.map(item =>
              modifyChildren(
                <SolTranstionCard item={item} key={uid(item)} scene={scene} />,
              ),
            );
            cacheList_items.unshift(...cacheList_items_temp);
          }

          /**
           * cache_ClaimNFT 缓存
           * 触发场景：ClaimNFT
           * 结果：tabOwned 加上过渡卡片效果
           * 结束场景：tabOwned 接口数据有改卡片数据出现即删除
           */
          const cache_ClaimNFT = new CardTranstionCache(
            TransitionCacheName.ClaimItems,
            userAddress,
          );
          const cache_claimNFT_Array = cache_ClaimNFT.toArray();

          if (
            cache_claimNFT_Array &&
            cache_claimNFT_Array.length &&
            scene === SceneType.MyOwned
          ) {
            const cache_claimNFT_Array_ = cache_claimNFT_Array.filter(item => {
              const cacheMintToken = item.mintToken;
              const tar = reList_item.find(item_ => {
                return item_.mintAddress === cacheMintToken;
              });
              if (tar) {
                cache_ClaimNFT.del(cacheMintToken);
                return false;
              }
              return true;
            });

            const cache_claimNFT_List = cache_claimNFT_Array_.map(item =>
              modifyChildren(
                <SolTranstionCard item={item} key={uid(item)} scene={scene} />,
              ),
            );

            cacheList_items.unshift(...cache_claimNFT_List);
          }

          /**
           * 上架 缓存
           * 触发场景：PublishNFT
           * 结果：tabOwned 卡片消失  TabSell和 AuctionList 增加过渡卡片
           * 结束场景：TabSell 和 AuctionList 接口数据有该卡片数据出现即删除
           */
          const cache_PublishNFT = new CardTranstionCache(
            TransitionCacheName.PublishItems,
            userAddress,
          );
          const cache_PublishNFT_Array = cache_PublishNFT.toArray();

          if (
            cache_PublishNFT_Array &&
            cache_PublishNFT_Array.length &&
            scene === SceneType.MyOwned
          ) {
            reList_item = reList_item.filter(item => {
              let flag = true;
              cache_PublishNFT_Array.forEach(cacheItem => {
                if (cacheItem.mintToken === item.mintAddress)
                  return (flag = false);
              });
              return flag;
            });
          }
        }

        const normal_items = reList_item.map(item => {
          return modifyChildren(
            <ItemCard
              key={uid(item)}
              item={item}
              scene={scene}
              isOther={isOther}
            />,
          );
        });

        return [...cacheList_items, ...normal_items];
      default:
        break;
    }
  }, [list, scene, modifyChildren, isOther, userAddress]);

  return (
    <Grid container className={classes.row}>
      {
        /* 如果是 loading 状态， 渲染骨架屏 */
        isLoading
          ? renderedSkeletons
          : /* 如果 Children 有数据 ，则渲染卡片 */
          list.length !== 0
          ? rednerList
          : /* 如果 Children 为 notItem，渲染空列表组件*/
            noItemComponent
      }
    </Grid>
  );
};
