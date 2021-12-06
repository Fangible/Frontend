// import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { SOL_NFT_TYPE } from 'modules/api/common/NftType';
import { truncateWalletAddr } from 'modules/common/utils/truncateWalletAddr';
import { t } from 'modules/i18n/utils/intl';
import { useIsSMUp } from 'modules/themes/useTheme';
import { useTokenInfoStyles } from './useTokenInfoStyles';

interface ITokenInfoProps {
  // SOL -> 待删
  tokenId?: number;
  // SOL -> ok
  name?: string;
  itemSymbol?: string;
  contractAddress?: string;
  standard?: SOL_NFT_TYPE;
  copiesIndex?: string | number;
  supply?: string | number;
  maxSupply?: string | number;
  ownerAddress?: string;
}

export const TokenInfo = ({
  name = '--',
  itemSymbol = '--',
  contractAddress = '',
  standard,
  supply = 0,
  maxSupply = 0,
  copiesIndex,
  ownerAddress = '',
}: ITokenInfoProps) => {
  const classes = useTokenInfoStyles();
  const isSMUp = useIsSMUp();

  return (
    <>
      {contractAddress && (
        <Typography className={classes.paragraph}>
          <b>{t('details-nft.token-info.contract')}</b>
          {` `}
          {isSMUp ? contractAddress : truncateWalletAddr(contractAddress)}
        </Typography>
      )}

      {ownerAddress && (
        <Typography className={classes.paragraph}>
          <b>Owner: </b>
          {` `}
          {isSMUp ? ownerAddress : truncateWalletAddr(ownerAddress)}
        </Typography>
      )}

      {name && (
        <Typography className={classes.paragraph}>
          <b>{t('details-nft.token-info.name-tags')}</b>
          {` `}
          {`${name} ${itemSymbol && `(${itemSymbol})`}`}
        </Typography>
      )}

      <Typography className={classes.paragraph}>
        <b>{t('details-nft.token-info.standard')}</b>
        {` `}
        {standard === SOL_NFT_TYPE.Edition ? 'Edition' : 'MasterEdition'}
      </Typography>

      {(supply || supply === 0) && (
        <Typography className={classes.paragraph}>
          <b>{'Supply: '}</b> {` `}
          {standard === SOL_NFT_TYPE.Edition
            ? `${copiesIndex} of ${supply}`
            : `${supply} / ${maxSupply}`}
        </Typography>
      )}
    </>
  );
};
