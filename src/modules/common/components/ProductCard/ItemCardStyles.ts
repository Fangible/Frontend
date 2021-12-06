import { makeStyles } from '@material-ui/core';

export const useItemCardStyles = makeStyles(theme => {
  return {
    root: {
      height: '100%',
      overflow: 'hidden',
      position: 'relative',
    },
    nftName: {
      lineHeight: '1.7em',
      margin: 0,
    },
    saleType: {
      fontSize: 14,
      lineHeight: '17px',
      marginTop: 15,
    },
    maxSupply: {
      whiteSpace: 'nowrap',
    },

    showNftType: {
      display: 'flex',
      alignItems: 'center',
      marginTop: 5,
    },

    rightOption: {
      width: 100,
      display: 'flex',
      alignItems: 'center',
      marginRight: 10,
    },
  };
});
