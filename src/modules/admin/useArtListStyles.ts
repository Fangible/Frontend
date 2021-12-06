import { makeStyles, Theme } from '@material-ui/core';

export const useArtListStyles = makeStyles<Theme>(theme => ({
  root: {
    // width: '100%',
  },

  tableContainer: {
    marginTop: 20,
  },

  topBanner: {
    backgroundColor: '#000',
    height: 324,
    color: '#fff',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    padding: '0px 200px',
    [theme.breakpoints.down('md')]: {
      height: 200,
      padding: '0px 20px',
    },
  },

  bannerLeft: {
    '& p': {
      fontSize: 48,
      marginTop: 0,
      marginBottom: 15,
      lineHeight: '1.2',
      [theme.breakpoints.down('lg')]: {
        fontSize: '2.4rem',
      },
      [theme.breakpoints.down('md')]: {
        fontSize: '1.2rem',
      },
    },
  },

  bannerRight: {
    '& svg': {
      [theme.breakpoints.down('md')]: {
        width: 100,
        height: 100,
      },
    },
  },

  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
    margin: '20px 0px',
  },

  searchBar: {
    width: 480,
    marginLeft: 'auto',
    marginTop: 20,

    [theme.breakpoints.down('md')]: {
      width: 350,
    },
  },
}));
