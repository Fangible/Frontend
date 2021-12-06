import { Button } from 'modules/uiKit/Button';
import { useProductCardStyles } from 'modules/common/components/ProductCard/useProductCardStyles';
import { t } from 'modules/i18n/utils/intl';
import { Link, Link as RouterLink, useHistory } from 'react-router-dom';
import { RoutesConfiguration } from 'modules/createNFT/Routes';
import { Img } from 'modules/uiKit/Img';
import { MetadataCategory } from 'npms/oystoer';
import { VideoPlayer } from 'modules/common/components/VideoPlayer';
import { useItemCardStyles } from './ItemCardStyles';
import { ConditionalWrapper } from 'modules/common/components/ConditionalWrapper';
import classNames from 'classnames';
import { useCallback, useState } from 'react';
import {
  Box,
  ButtonBase,
  Card,
  CardContent,
  ClickAwayListener,
  MenuItem,
  MenuList,
  Popover,
  Tooltip,
} from '@material-ui/core';
import { INftInfoSchema } from 'modules/profile/screens/Profile/Hook/types';
import { BuyNFTRoutesConfig } from 'modules/buyNFT/BuyNFTRoutes';
import useFetchUri from 'modules/market/actions/useFetchUri';
import { SceneType } from '../QueryEmpty/QueryEmpty';
import { LayersIcon } from '../Icons/LayersIcon';
import { SOL_NFT_TYPE } from 'modules/api/common/NftType';
import { SolanaText } from 'modules/uiKit/Text';
import { VerticalDotsIcon } from '../Icons/VerticalDotsIcon';

export const ItemCard: React.FC<{
  item: INftInfoSchema;
  scene: SceneType;
  isOther?: boolean;
}> = ({ item, scene, isOther }) => {
  const cardClasses = useProductCardStyles();
  const history = useHistory();
  const classes = useItemCardStyles();
  let metaData = useFetchUri(String(item.uri).trim());
  if (!metaData && item.metadata) {
    metaData = item.metadata as unknown as any;
  }
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isPopoverOpened = Boolean(anchorEl);

  const nftType = item.edition
    ? SOL_NFT_TYPE.Edition
    : SOL_NFT_TYPE.MasterEdition;

  let putOnSaleHref = BuyNFTRoutesConfig.Details_ITEM_NFT.generatePath(
    item.mintAddress,
  );

  const RenderMediaContent = useCallback(() => {
    return (
      <>
        {metaData?.category === MetadataCategory.Video ? (
          // 渲染视频
          metaData?.category === MetadataCategory.Video ? (
            <div className={cardClasses.videoWrapper}>
              <div className={cardClasses.video}>
                {metaData.image && (
                  <VideoPlayer src={metaData.image} objectFit={'cover'} />
                )}
              </div>
            </div>
          ) : (
            // 渲染视频出错默认缺省图处理
            <Img
              ratio="1x1"
              className={classNames(cardClasses.imgWrap)}
              src={'xxx'}
            />
          )
        ) : (
          // 默认渲染图片
          <Img
            ratio="1x1"
            className={classNames(cardClasses.imgWrap)}
            src={metaData?.image || ''}
          />
        )}
      </>
    );
  }, [cardClasses, metaData]);

  const handleClose = useCallback(e => {
    e.stopPropagation();
    setAnchorEl(null);
  }, []);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    },
    [],
  );

  const isGoMintTO =
    nftType === SOL_NFT_TYPE.MasterEdition &&
    item.masterEdition.maxSupply !== 0 &&
    item.masterEdition.supply < item.masterEdition.maxSupply;
  return (
    <Card className={classNames(classes.root)} variant="outlined">
      <div className={cardClasses.relative}>
        <ConditionalWrapper
          condition={!!putOnSaleHref}
          wrapper={
            <Link to={putOnSaleHref || '#'} className={cardClasses.imgBox} />
          }
        >
          <RenderMediaContent />
        </ConditionalWrapper>
      </div>

      <CardContent className={cardClasses.relative}>
        <h2 className={classes.nftName}>{item.name}</h2>
        <hr className={cardClasses.devider} />
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={'center'}
          style={{ position: 'relative' }}
        >
          <div className={classes.saleType}>
            {nftType === SOL_NFT_TYPE.Edition ? (
              <SolanaText context={'Edition'} />
            ) : (
              <SolanaText context={'Master'} />
            )}

            <Tooltip
              title={
                nftType === SOL_NFT_TYPE.MasterEdition
                  ? 'Circulated / Max supply'
                  : 'Copies number / Max supply'
              }
              arrow
              placement="top"
            >
              <div className={classes.showNftType}>
                <LayersIcon style={{ width: 16, marginRight: 5 }} />
                {nftType === SOL_NFT_TYPE.Edition
                  ? `${item.edition?.edition} of ${item.masterEdition.maxSupply}`
                  : `${item.masterEdition.supply} / ${item.masterEdition.maxSupply}`}
              </div>
            </Tooltip>
          </div>

          {scene === SceneType.MyOwned && (
            <div className={classes.rightOption} style={{ width: '100px' }}>
              {!isOther && (
                <Button
                  size={'small'}
                  // className={isGoMintTO ? cardClasses.saleBtn : ''}
                  component={RouterLink}
                  variant="outlined"
                  rounded
                  to={RoutesConfiguration.PublishNft.generatePath(
                    item.mintAddress,
                  )}
                >
                  {t('product-card.put-on-sale')}
                </Button>
              )}

              <div onClick={e => e.stopPropagation()}>
                <ClickAwayListener onClickAway={handleClose}>
                  <ButtonBase
                    className={cardClasses.menuBtn}
                    onClick={handleClick}
                  >
                    <VerticalDotsIcon className={cardClasses.menuIcon} />
                  </ButtonBase>
                </ClickAwayListener>
                <Popover
                  className={cardClasses.menuPopover}
                  // style={{top: -100}}
                  open={isPopoverOpened}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    variant: 'outlined',
                  }}
                >
                  <MenuList>
                    <MenuItem
                      className={cardClasses.menuItem}
                      onClick={() => {
                        history.push(putOnSaleHref);
                      }}
                      disabled={isOther || !isGoMintTO}
                    >
                      Go MintTo
                    </MenuItem>

                    {/* <MenuItem
                      className={classes.menuItem}
                      onClick={onBurnClick}
                    >
                      {t('product-card.burn')}
                    </MenuItem> */}
                  </MenuList>
                </Popover>
              </div>
            </div>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
