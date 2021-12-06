import { makeStyles, Theme } from '@material-ui/core';

export const useDashTableStyles = makeStyles<Theme>(theme => ({
  tableContainer: {
    marginTop: 50,
  },

  tableRow: {
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,.02)',
    },
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    '& img': {
      width: 52,
      height: 52,
    },
    '& span': {
      marginLeft: 10,
    },
  },
}));
