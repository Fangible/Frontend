import { Box, Button, Grid, Tooltip, Typography } from '@material-ui/core';
import { SOL_NFT_TYPE } from 'modules/api/common/NftType';
import { LayersIcon } from 'modules/common/components/Icons/LayersIcon';
import { featuresConfig } from 'modules/common/conts';
import { t } from 'modules/i18n/utils/intl';
import Truncate from 'react-truncate';
import { useInfoDescrStyles } from './useInfoDescrStyles';
import { useInfoDescrToggle } from './useInfoDescrToggle';

const DESCR_LINES = 3;

interface IInfoDescrProps {
  title: string;
  description?: string;
  creator?: JSX.Element;
  owner?: JSX.Element;
  LikeBtn: JSX.Element;
  currentPage: 'poolDetail' | 'itemDetail';
  // Sol - 待删
  copiesCurrent?: string | number;
  copiesTotal?: string | number;
  // Sol - 新增
  nftType?: SOL_NFT_TYPE;
  copiesIndex?: string | number;
  supply?: string | number;
  maxSupply?: string | number;
}

export const InfoDescr = ({
  title,
  description,
  creator,
  owner,
  LikeBtn,
  copiesCurrent,
  // Sol - 修改
  nftType,
  copiesIndex = 0,
  supply = 0,
  maxSupply = 0,
}: IInfoDescrProps) => {
  const classes = useInfoDescrStyles();
  const { toggleExpanded, onTruncate, expanded, truncated } =
    useInfoDescrToggle();

  return (
    <>
      <Box mb={3}>
        <Typography variant="h2" className={classes.title}>
          {title}
        </Typography>
      </Box>

      <Grid container spacing={2} alignItems="center">
        <div className={classes.spaceBetween}>
          {creator && featuresConfig.nftDetailsCreator && (
            <Grid item xs>
              {creator}
            </Grid>
          )}

          {owner && (
            <Grid item xs>
              {owner}
            </Grid>
          )}

          {featuresConfig.nftLikes && LikeBtn}
        </div>

        {/* SOL 新增类型属性*/}
        <div className={classes.poolAmount} style={{ marginRight: 20 }}>
          <div className={classes.copies}>
            <LayersIcon className={classes.copiesIcon} />
            {nftType === SOL_NFT_TYPE.Edition ? 'Edition' : 'MasterEdition'}
          </div>
        </div>

        <div className={classes.poolAmount}>
          <Tooltip
            placement="top"
            title={
              nftType === SOL_NFT_TYPE.Edition
                ? 'copies_index of copies_total'
                : 'supply / max_supply'
            }
          >
            <Grid item xs="auto">
              <div className={classes.copies}>
                <LayersIcon className={classes.copiesIcon} />
                {nftType === SOL_NFT_TYPE.Edition
                  ? `${copiesIndex} of ${supply}`
                  : `${supply} / ${maxSupply}`}
              </div>
            </Grid>
          </Tooltip>

          {/* --- */}
        </div>
      </Grid>

      {description && (
        <>
          <Box component="hr" className={classes.hr} my={3.5} />

          <Box className={classes.description}>
            <Truncate
              lines={!expanded && DESCR_LINES}
              onTruncate={onTruncate}
              ellipsis={
                <>
                  ...
                  <br />
                  <Button
                    className={classes.textToggle}
                    variant="text"
                    onClick={toggleExpanded(true)}
                  >
                    {t('details-nft.descr-full')} ⬇
                  </Button>
                </>
              }
            >
              {description}
            </Truncate>

            {!truncated && expanded && (
              <Box>
                <Button
                  className={classes.textToggle}
                  variant="text"
                  onClick={toggleExpanded(false)}
                >
                  {t('details-nft.descr-short')} ⬆
                </Button>
              </Box>
            )}
          </Box>
        </>
      )}
    </>
  );
};
