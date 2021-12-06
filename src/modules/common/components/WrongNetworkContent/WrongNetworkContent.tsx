import { Box, Typography } from '@material-ui/core';
import React from 'react';
import { t } from '../../../i18n/utils/intl';
import { useWrongNetworkContentStyles } from './useWrongNetworkContentStyles';

export const WrongNetworkContent = () => {
  const classes = useWrongNetworkContentStyles();

  return (
    <Box mb={3} textAlign="center" className={classes.root}>
      <Typography variant="h1" className={classes.caption}>
        {t('change-wallet.title')}
      </Typography>
      <Typography variant="body1" className={classes.text}>
        {t('change-wallet.description')}
      </Typography>
      {<></>}
    </Box>
  );
};
