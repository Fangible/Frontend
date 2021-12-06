import { makeStyles, Theme } from '@material-ui/core';

export const useSolanaTextStyles = makeStyles<Theme>(theme => ({
  root: {
    background:
      'linear-gradient(to bottom right,rgba(220, 31, 255, 1), rgba(0, 255, 163, 1))',
    '-webkit-background-clip': 'text',
    color: 'transparent',
  },
}));
