import { makeStyles, Theme } from '@material-ui/core';
import classNames from 'classnames';
import phantomIcon from './asstes/img/phantom.png';
// import soLongIcon from './asstes/img/solong.png';
// import solletIcon from './asstes/img/sollet.svg';
import mathIcon from './asstes/img/math.svg';
import { WalletName } from '@solana/wallet-adapter-wallets';

export const useWalletsStyles = makeStyles((theme: Theme) => ({
  root: {},
  img: {
    width: 36,
    height: 36,
  },
  imgBox: {
    marginRight: 10,
  },
}));

const Icon: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const classes = useWalletsStyles();
  return (
    <img
      className={classNames(classes.img, classes.imgBox)}
      src={src}
      alt={alt}
    />
  );
};

export const wallets = [
  {
    walletLabel: WalletName.Phantom,
    startIcon: <Icon alt={WalletName.Phantom} src={phantomIcon} />,
  },
  // {
  //   walletLabel: WalletName.Sollet,
  //   startIcon: <Icon alt={WalletName.Sollet} src={solletIcon} />,
  // },
  // {
  //   walletLabel: WalletName.Solong,
  //   startIcon: <Icon alt={WalletName.Solong} src={soLongIcon} />,
  // },
];

export const mobileWallets = [
  {
    walletLabel: WalletName.MathWallet,
    startIcon: <Icon alt={WalletName.MathWallet} src={mathIcon} />,
  },
];
