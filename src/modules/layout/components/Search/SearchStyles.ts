import { makeStyles, Theme } from '@material-ui/core';
import { fade } from '@material-ui/core/styles';

export const useSearchStyles = makeStyles<Theme>(theme => ({
  root: {
    position: 'relative',
  },

  iconButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: 46,
    padding: 0,
    color: '#7b7b7b',
    border: 'none',

    '&:hover': {
      border: 'none',
    },
  },

  input: {
    borderRadius: 44,
    width: '100%',
    height: 44,
    background: theme.palette.common.white,
    transition: 'background 0.2s, color 0.2s, border 0.2s',
    color: theme.palette.common.black,
    fontSize: 14,

    [theme.breakpoints.up('xl')]: {
      background: theme.palette.background.paper,
      color: 'inherit',
    },

    '$root:hover &': {
      borderColor: fade(theme.palette.text.primary, 0.1),
    },
  },

  inputFocused: {
    '$root &&': {
      background: theme.palette.common.white,
      color: theme.palette.common.black,
      borderColor: fade(theme.palette.text.primary, 0.7),
    },
  },

  empty: {
    padding: theme.spacing(3),
    textAlign: 'center',
  },

  inputBase: {
    padding: '0 20px 0 48px',
    height: '100%',
    '&::-webkit-search-decoration, &::-webkit-search-results-button, &::-webkit-search-results-decoration, &::-webkit-search-cancel-button':
      {
        appearance: 'none',
      },
  },
  searchResult: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '100%',
    marginTop: 10,
    width: '100%',
    borderRadius: 12,
    border: `1px solid ${theme.palette.grey['300']}`,
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    zIndex: 10,
    overflow: 'hidden',
    maxHeight: '75vh',
  },

  ArtListSearch: {
    width: 480,
    position: 'absolute',
    top: 50,
    right: 0,
    [theme.breakpoints.down('md')]: {
      width: 350,
    },
  },

  searchItemBox: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0px 20px',
    alignItems: 'center',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,.02)',
    },
  },
  searchItemAvatar: {
    width: 36,
    height: 36,
  },
  success: {
    fontWeight: 700,
    color: 'green',
  },
  danger: {
    fontWeight: 700,
    color: 'red',
  },
}));
