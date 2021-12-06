import { makeStyles, Theme } from '@material-ui/core';

// TODO: Extract common component
export const useMintToDialogStyles = makeStyles<Theme>(theme => ({
  root: {
    display: 'block',
    maxWidth: 700,
    padding: theme.spacing(4, 2.5),
    borderRadius: 22,

    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(3, 5),
    },
  },

  close: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 40,
    height: 40,
    padding: 0,
    color: theme.palette.text.primary,
    border: 'none',

    [theme.breakpoints.up('md')]: {
      top: 20,
      right: 20,
    },

    '&:hover': {
      border: 'none',
    },
  },

  closeIcon: {
    fontSize: 25,
  },

  title: {
    textAlign: 'center',
    marginBottom: theme.spacing(5),

    [theme.breakpoints.up('md')]: {
      fontSize: 40,
    },
  },

  inputWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridColumnGap: 23,
    position: 'relative',

    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr',
    },
  },
  mintBalance: {
    position: 'absolute',
    right: 12,
    top: 10,
  },
  btnWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridColumnGap: 20,
    marginTop: 50,
  },
  maxBtn: {
    width: 62,
    height: 34,
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    outline: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    opacity: 0.5,
  },
}));
