import { Card, CardContent } from '@material-ui/core';
import classNames from 'classnames';
import { ConditionalWrapper } from 'modules/common/components/ConditionalWrapper';
import { Img } from 'modules/uiKit/Img';
import { useCallback } from 'react';
import { useProductCardStyles } from './useProductCardStyles';
import { SceneType } from '../QueryEmpty/QueryEmpty';
import { ICacheNftInfo } from 'modules/cacheLocalStage/types';
import { CardProfileInfo } from '../ProfileInfo';
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
  item: ICacheNftInfo;
  scene: SceneType;
}

export const SolTranstionCard = ({
  item,
  scene,
}: IProductCardComponentProps) => {
  const classes = useProductCardStyles();

  const renderMediaContent = useCallback(() => {
    return (
      <Img
        src={item.image}
        className={classNames(classes.imgWrap)}
        ratio="1x1"
        loading="lazy"
      />
    );
  }, [classes.imgWrap, item]);

  return (
    <Card className={classNames(classes.root)} variant="outlined">
      <div className={classes.relative}>
        <ConditionalWrapper condition={false} wrapper={<></>}>
          {renderMediaContent()}
        </ConditionalWrapper>
      </div>

      <CardContent className={classes.content}>
        {/*  显示NFT名称 */}
        <CardProfileInfo title={item.name} users={[]} subTitle={''} />

        <hr className={classes.devider} />

        <div className={classes.meta}>
          <div>Pending...(Please refresh after a while) </div>
        </div>
      </CardContent>
    </Card>
  );
};
