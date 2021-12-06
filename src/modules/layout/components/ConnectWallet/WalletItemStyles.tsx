import { makeStyles, Theme } from '@material-ui/core';

export const useWalletsItemStyles = makeStyles((theme: Theme) => ({
  root: {},
  button: {
    borderRadius: 50,
    justifyContent: 'left',
    padding: '38px 33px',
    height: 0,
    lineHeight: 0,
    maxWidth: 480,
    marginBottom: 29,
    backgroundImage: "url('/svg/arrow.svg')",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 30px center',
    '&::after': {
      content: '>',
      display: 'block',
    },
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 600,
  },
}));
