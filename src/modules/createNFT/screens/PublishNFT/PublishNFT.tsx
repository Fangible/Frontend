import {
  Box,
  Container,
  FormControl,
  InputAdornment,
  InputLabel,
  Paper,
  Tooltip,
  Typography,
} from '@material-ui/core';
// import { useDispatchRequest } from '@redux-requests/react';
import BigNumber from 'bignumber.js';
import { add } from 'date-fns';
import { NftType } from 'modules/api/common/NftType';
import { Button } from 'modules/uiKit/Button';
import { Img } from 'modules/uiKit/Img';
import { Section } from 'modules/uiKit/Section';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Field, Form, FormRenderProps } from 'react-final-form';
import { useHistory, useParams } from 'react-router';
import { AuctionType } from '../../../api/common/auctionType';
import { ReactComponent as QuestionIcon } from '../../../common/assets/question.svg';
import { VideoPlayer } from '../../../common/components/VideoPlayer';
// import { Address } from '../../../common/types/unit';
import { InputField } from '../../../form/components/InputField';
import { SelectField } from '../../../form/components/SelectField';
import { FormErrors } from '../../../form/utils/FormErrors';
// import { OnChange } from '../../../form/utils/OnChange';
import { t } from '../../../i18n/utils/intl';
import { GoBack } from '../../../layout/components/GoBack';
// import { fetchCurrency } from '../../../overview/actions/fetchCurrency';
import { ProfileRoutesConfig } from '../../../profile/ProfileRoutes';
import { usePublishNFTtyles } from './usePublishNFTtyles';
import {
  UserRoleEnum,
  UserRoleType,
} from 'modules/common/actions/queryAccountInfo';
import { IItemRoyaltyRes } from 'modules/brand/components/RoyaltyDialog/action/fetchItemRoyalty';
import { RenderRoyalty } from './Royalty';
import { IPublishEnglishAuction, IPublishFixedSwap } from './types';
import { usePutOnSaleBidSubmit } from './handleSubmit';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import {
  accountGetMasterEditionInfo,
  getAccountTokenSpl,
  useMetadataAccountGetEditionInfo,
} from 'modules/common/utils/solanaAccount';
import { METADATA_PROGRAM_ID, useConnection } from 'npms/oystoer';
import { AmountRange, WinningConfigType } from 'models/metaplex';
import BN from 'bn.js';
import { extractMessage } from 'modules/common/utils/extractError';
import { NotificationActions } from 'modules/notification/store/NotificationActions';
import { useMetaDataInfo } from 'modules/common/hooks/useAccount';
import { PublicKey } from '@solana/web3.js';
import { useNftInfo } from 'modules/profile/screens/Profile/Hook/useNftInfo';
import { useCurrencies } from 'modules/createNFT/hooks/useCurrencies';
import { ButtonGroupField } from 'modules/form/components/ButtonGroupField/ButtonGroupField';
import { MarketRoutesConfig } from 'modules/market/Routes';
import { CardTranstionCache } from 'modules/cacheLocalStage';
import {
  ICacheNftInfo,
  TransitionCacheName,
} from 'modules/cacheLocalStage/types';
import { useAccount } from 'modules/account/hooks/useAccount';
type IPublishNFTFormData = IPublishFixedSwap | IPublishEnglishAuction;

interface IPublishNFTComponentProps {
  // 待删
  tokenContract: string;
  tokenId: string;
  // ---
  nftType: NftType;
  maxQuantity: number;
  onPublish: () => void;
  RoyaltyData: IItemRoyaltyRes | null;
  // SOL
  metaDataKey: string;
  category: string;
  file?: string;
  identity: UserRoleType;
  name: string;
  isPublishPower: Boolean;
}

export const PublishNFTComponent = ({
  tokenContract,
  nftType,
  tokenId,
  maxQuantity,
  onPublish,
  // SOL
  metaDataKey,
  file,
  category,
  identity,
  name,
  RoyaltyData,
  isPublishPower,
}: IPublishNFTComponentProps) => {
  const classes = usePublishNFTtyles();
  // const dispatch = useDispatchRequest();
  const storeDispatch = useDispatch();
  const { address } = useAccount();
  const { push } = useHistory();
  const connection = useConnection();
  const { handlePutOnSale } = usePutOnSaleBidSubmit();
  const [purchasePriceChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const { metadataAccountInfo } = useMetaDataInfo(metaDataKey);
  const storeWhiteCreators = useSelector(
    (state: RootState) => state.user.storeWhiteCreators,
  );

  const { parsedEdition } = useMetadataAccountGetEditionInfo({
    connection,
    mintPublicKey: metadataAccountInfo?.info.mint,
    isMutable: metadataAccountInfo?.info.isMutable,
  });

  const options = [
    {
      label: t(`publish-nft.auction-type.${AuctionType.FixedSwap}`),
      value: AuctionType.FixedSwap,
    },
    {
      label: t(`publish-nft.auction-type.${AuctionType.EnglishAuction}`),
      value: AuctionType.EnglishAuction,
      // disable: true
    },
  ];

  const { options: currencyOptions, default: defaultCurrency } =
    useCurrencies();

  const validateCreateNFT = useCallback((payload: IPublishNFTFormData) => {
    const errors: FormErrors<IPublishNFTFormData> = {};

    if (payload.type === AuctionType.FixedSwap) {
      const price = +payload.price;
      if (!price) {
        errors.price = t('validation.required');
      } else if (price <= 0) {
        errors.price = t('validation.min', { value: 0 });
      }
    } else {
      const minBid = +payload.minBid;
      if (!minBid) {
        errors.minBid = t('validation.required');
      } else if (minBid <= 0) {
        errors.minBid = t('validation.min', { value: 0 });
      }
    }

    return errors;
  }, []);

  const durationOptions = useMemo(
    () => [
      {
        label: t('unit.day', { value: 3 }),
        value: 3,
      },
      {
        label: t('unit.day', { value: 5 }),
        value: 5,
      },
      {
        label: t('unit.day', { value: 7 }),
        value: 7,
      },
      {
        label: t('unit.day', { value: 14 }),
        value: 14,
      },
      {
        label: t('unit.day', { value: 30 }),
        value: 30,
      },
    ],
    [],
  );

  const handleSubmit = useCallback(
    async (payload: IPublishNFTFormData) => {
      setLoading(true);

      // 判断是否有发布 NFT销售的权利
      if (!isPublishPower) {
        setLoading(false);
        storeDispatch(
          NotificationActions.showNotification({
            message:
              'The user is not in the artist list, please contact the administrator to whitelist first!',
            severity: 'warning',
          }),
        );
        return;
      }

      try {
        const getInfoParam = {
          publicKey: tokenId,
          connection,
        };
        const masterEdition = await accountGetMasterEditionInfo(getInfoParam);
        const holding = await getAccountTokenSpl(getInfoParam);

        // 固定价格拍卖
        if (metadataAccountInfo && holding) {
          const params = {
            name,
            purchasePriceChecked,
            reservePriceChecked: false,
            tokenContract: metaDataKey,
            tokenId,
            payload,
            storeWhiteCreators,
            attributesItems: [
              {
                masterEdition: masterEdition
                  ? {
                      info: masterEdition.masterEditionAccountData,
                      pubkey: masterEdition.masterKey,
                      account: masterEdition.masterEditionAccount,
                    }
                  : undefined,
                edition: parsedEdition,
                metadata: {
                  info: metadataAccountInfo.info,
                  pubkey: tokenId,
                  account: metadataAccountInfo.account,
                },
                holding,
                winningConfigType: WinningConfigType.FullRightsTransfer,
                amountRanges: [
                  new AmountRange({
                    amount: new BN(1),
                    length: new BN(1),
                  }),
                ],
              },
            ],
          };

          const result = await handlePutOnSale(params);

          // 过渡卡片功能
          // 创建销售成功后一个映射缓存 auction => NFT
          const _auctionAddress = result?.auction;
          if (_auctionAddress && address) {
            const _nftInfo: ICacheNftInfo = {
              auction: _auctionAddress,
              mintToken: tokenContract,
              image: file || '',
              name: name,
            };

            const catch_PublishItems = new CardTranstionCache(
              TransitionCacheName.PublishItems,
              address,
            );
            catch_PublishItems.set(_auctionAddress, _nftInfo);
          }

          setTimeout(() => {
            push(MarketRoutesConfig.Market.generatePath());
          }, 300);
        }
        setLoading(false);
      } catch (error) {
        console.log('errorerror', error);
        setLoading(false);
        storeDispatch(
          NotificationActions.showNotification({
            message: extractMessage(new Error('error')),
            severity: 'error',
          }),
        );
      }
    },
    [
      isPublishPower,
      tokenId,
      connection,
      metadataAccountInfo,
      handlePutOnSale,
      name,
      purchasePriceChecked,
      metaDataKey,
      storeWhiteCreators,
      push,
      parsedEdition,
      storeDispatch,
      tokenContract,
      file,
      address,
    ],
  );

  const isVerify = identity === UserRoleEnum.Normal;
  const formatAmount = (value: string) =>
    value ? `${Math.round(+value)}` : '1';

  const renderForm = ({
    handleSubmit,
    values,
  }: FormRenderProps<IPublishNFTFormData>) => {
    return (
      <Box className={classes.form} component="form" onSubmit={handleSubmit}>
        {/* <OnChange name="unitContract">{handleUnitChange}</OnChange> */}
        <div className={classes.formImgCol}>
          {file && (
            <Paper className={classes.formImgBox} variant="outlined">
              {category === 'image' ? (
                <Img
                  src={file}
                  alt={name}
                  title={name}
                  ratio="1x1"
                  objectFit="scale-down"
                />
              ) : (
                <VideoPlayer src={file} objectFit="cover" />
              )}
            </Paper>
          )}

          <Box mt={2}>
            <Typography variant="h2" className={classes.textCenter}>
              {name}
            </Typography>
          </Box>
        </div>

        <div>
          <Box mb={6}>
            <FormControl fullWidth>
              <InputLabel shrink>{t('publish-nft.label.type')}</InputLabel>

              <Field
                component={ButtonGroupField}
                name="type"
                type="number"
                color="primary"
                fullWidth={true}
                items={options}
              />
            </FormControl>
          </Box>

          {values.type === AuctionType.FixedSwap ? (
            <>
              <Box className={classes.formControl}>
                <Field
                  component={InputField}
                  name="price"
                  type="number"
                  label={t('publish-nft.label.price')}
                  color="primary"
                  fullWidth
                  inputProps={{
                    step: 'any',
                    min: '0',
                    inputMode: 'decimal',
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Field
                          component={SelectField}
                          name="unitContract"
                          color="primary"
                          fullWidth={true}
                          options={currencyOptions}
                          className={classes.currencySelect}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box className={classes.formControl}>
                <Field
                  component={InputField}
                  name="quantity"
                  type="number"
                  label={t('publish-nft.label.amount')}
                  color="primary"
                  fullWidth={true}
                  parse={formatAmount}
                  format={formatAmount}
                  disabled={true} // 默认数量为·1 直接禁用输入
                  inputProps={{
                    step: 1,
                    min: '0',
                    inputMode: 'decimal',
                  }}
                />
              </Box>

              {/* {isVerify && (
                <Box className={classes.formControl}>
                  <Field
                    component={SelectTimeField}
                    name="saleTimeFS"
                    type="text"
                    label={t('create-nft.label.specific-time-sale')}
                    color="primary"
                    fullWidth={true}
                  />
                </Box>
              )} */}
            </>
          ) : (
            <>
              <Box className={classes.formControl}>
                <Field
                  component={InputField}
                  name="minBid"
                  type="number"
                  label={t('publish-nft.label.minBid')}
                  color="primary"
                  fullWidth={true}
                  inputProps={{
                    step: 'any',
                    min: '0',
                    inputMode: 'decimal',
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Field
                          component={SelectField}
                          name="unitContract"
                          color="primary"
                          fullWidth={true}
                          options={currencyOptions}
                          className={classes.currencySelect}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box className={classes.formControl}>
                <Field
                  component={SelectField}
                  name="duration"
                  color="primary"
                  fullWidth={true}
                  options={durationOptions}
                  label={
                    <Box display="flex" alignItems="center">
                      {t('publish-nft.label.duration')}

                      <Tooltip title={t('publish-nft.tooltip.duration')}>
                        <Box component="i" ml={1}>
                          <QuestionIcon />
                        </Box>
                      </Tooltip>
                    </Box>
                  }
                />

                <div className={classes.fieldText}>
                  {t('publish-nft.expire', {
                    value: add(
                      isVerify &&
                        values.saleTimeEA?.open &&
                        values.saleTimeEA?.time
                        ? values.saleTimeEA?.time
                        : new Date(),
                      {
                        days: +values.duration,
                      },
                    ),
                  })}
                </div>
              </Box>

              {/* {isVerify && (
                <Box className={classes.formControl}>
                  <Field
                    component={SelectTimeField}
                    name="saleTimeEA"
                    type="text"
                    label={t('create-nft.label.specific-time-sale')}
                    color="primary"
                    fullWidth={true}
                  />
                </Box>
              )} */}

              {/* <Box className={classes.formControl}>
                <Box mb={2.5}>
                  <Grid container alignItems="center">
                    <Grid item xs>
                      <InputLabel shrink className={classes.labelNoMargin}>
                        <Box display="flex" alignItems="center">
                          {t('publish-nft.label.directPurchase')}

                          <Tooltip
                            title={t('publish-nft.tooltip.directPurchase')}
                          >
                            <Box component="i" ml={1}>
                              <QuestionIcon />
                            </Box>
                          </Tooltip>
                        </Box>
                      </InputLabel>
                    </Grid>

                    <Grid item>
                      <Switch
                        checked={purchasePriceChecked}
                        onChange={togglePurchasePriceChecked}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {purchasePriceChecked && (
                  <Field
                    component={InputField}
                    name="purchasePrice"
                    type="number"
                    color="primary"
                    fullWidth={true}
                    inputProps={{
                      step: 'any',
                      min: '0',
                      inputMode: 'decimal',
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Field
                            component={SelectField}
                            name="unitContract"
                            color="primary"
                            fullWidth={true}
                            options={currencyOptions}
                            className={classes.currencySelect}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </Box> */}
            </>
          )}

          {RoyaltyData && <RenderRoyalty RoyaltyData={RoyaltyData} />}

          <Box>
            <Button size="large" type="submit" fullWidth loading={loading}>
              {loading ? t('publish-nft.submitting') : t('publish-nft.submit')}
            </Button>
          </Box>
        </div>
      </Box>
    );
  };

  return (
    <Section>
      <Container maxWidth="lg">
        <Box mb={3.5}>
          <GoBack />
        </Box>
        <Box mb={6}>
          <Typography variant="h1">{t('publish-nft.title')}</Typography>
        </Box>
        <Box>
          <Form
            onSubmit={handleSubmit}
            render={renderForm}
            validate={validateCreateNFT}
            initialValues={
              {
                type: AuctionType.FixedSwap,
                unitContract: defaultCurrency,
                duration: durationOptions[0].value,
                quantity: maxQuantity.toString(),
              } as unknown as Partial<
                IPublishFixedSwap | IPublishEnglishAuction
              >
            }
          />
        </Box>
      </Container>
    </Section>
  );
};

export const PublishNFT = () => {
  const { mintKey } = useParams<{ mintKey: string }>();
  const [metaDataKey, setMetaDataKey] = useState('');
  const { replace } = useHistory();
  const { data: nftInfo } = useNftInfo(mintKey);
  const storeDispatch = useDispatch();
  const storeWhiteCreators = useSelector(
    (state: RootState) => state.user.storeWhiteCreators,
  );
  const handlePublish = useCallback(() => {
    storeDispatch(
      NotificationActions.showNotification({
        message: extractMessage(`Congratulations, it's on the shelf`),
        severity: 'success',
      }),
    );
    setTimeout(() => {
      replace(ProfileRoutesConfig.UserProfile.generatePath());
    }, 1000);
  }, [replace, storeDispatch]);

  useEffect(() => {
    (async () => {
      const MetaDataKey = (
        await PublicKey.findProgramAddress(
          [
            Buffer.from('metadata'),
            new PublicKey(METADATA_PROGRAM_ID).toBuffer(),
            new PublicKey(mintKey).toBuffer(), //
          ],
          new PublicKey(METADATA_PROGRAM_ID),
        )
      )[0];
      setMetaDataKey(MetaDataKey.toBase58());
    })();
  }, [mintKey]);

  // const findTar = storeWhiteCreators.find(item => item.address === address);

  return useMemo(() => {
    const itemCreator = nftInfo?.creators ?? [];
    const isPublishPower = itemCreator.some(e =>
      storeWhiteCreators.some(w => w.address === e.address),
    );

    return !metaDataKey ? (
      <>Loading ...</>
    ) : (
      <>
        <PublishNFTComponent
          name={nftInfo?.name || ''}
          nftType={1}
          tokenContract={nftInfo?.mintAddress || ''}
          tokenId={metaDataKey}
          file={nftInfo?.image || ''}
          category={'image'}
          maxQuantity={1}
          onPublish={handlePublish}
          identity={UserRoleEnum.Normal}
          RoyaltyData={{
            remainingRatio: new BigNumber(0),
            platformFee: new BigNumber(0),
            royaltyFee: new BigNumber(nftInfo?.sellerFeeBasisPoints || 0).div(
              100,
            ), // 利率粒度 万分之一
          }}
          // SOL
          metaDataKey={metaDataKey}
          isPublishPower={isPublishPower}
        />
      </>
    );
  }, [metaDataKey, nftInfo, handlePublish, storeWhiteCreators]);
};
