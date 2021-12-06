import { Box, Grid, Tooltip } from '@material-ui/core';
import { usePublishNFTtyles } from './usePublishNFTtyles';
import { ReactComponent as QuestionIcon } from '../../../common/assets/question.svg';
import { IItemRoyaltyRes } from 'modules/brand/components/RoyaltyDialog/action/fetchItemRoyalty';
import { t } from 'modules/i18n/utils/intl';

export const RenderRoyalty: React.FC<{ RoyaltyData: IItemRoyaltyRes }> = ({
  RoyaltyData,
}) => {
  const classes = usePublishNFTtyles();
  return (
    <Box>
      <Grid container spacing={3} className={classes.royaltyWrapper}>
        <Grid item className={classes.royaltyItem}>
          <span>{t('publish-nft.royalty.platform-fee')}</span>
          <span>{`${RoyaltyData?.platformFee.dp(2).toNumber()} %`}</span>
        </Grid>
        <div className={classes.divLine}>
          <i></i>
        </div>

        <Grid item className={classes.royaltyItem}>
          <span>
            <Box display="flex" alignItems="center">
              {t('publish-nft.royalty.royalty-fee')}

              <Tooltip title={t('publish-nft.royalty.royalty-fee-tip')}>
                <Box component="i" ml={1}>
                  <QuestionIcon />
                </Box>
              </Tooltip>
            </Box>
          </span>
          <span>{`${RoyaltyData?.royaltyFee.dp(2).toNumber()} %`}</span>
        </Grid>
        <div className={classes.divLine}>
          <i></i>
        </div>

        {/* <Grid item className={classes.royaltyItem}>
          <span>
            {values.type === AuctionType.FixedSwap
              ? t('publish-nft.royalty.receive-fs')
              : t('publish-nft.royalty.receive-ea')}
          </span>
          {reciveValue && reciveValue.dp(6, 1).toNumber() ? (
            <span>
              {reciveValue.dp(6, 1).toNumber()}
              &nbsp;
              {currentCryptoCurrencyLabel}
              &nbsp;&nbsp;
              <Queries<ResponseData<typeof fetchCurrency>>
                requestActions={[fetchCurrency]}
                requestKeys={[values.unitContract]}
                noDataMessage={<></>}
              >
                {({ data }) => (
                  <Box component="span" color={theme.palette.text.secondary}>
                    {t('unit.$-value', {
                      value: reciveValue
                        ?.multipliedBy(data.priceUsd)
                        .decimalPlaces(2)
                        .toFormat(),
                    })}
                  </Box>
                )}
              </Queries>
            </span>
          ) : (
            '-'
          )}
        </Grid> */}
      </Grid>
    </Box>
  );
};
