import { FC, ReactNode, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';
import {
  getPhantomWallet,
  getSolletWallet,
  getSolongWallet,
  getMathWallet,
} from '@solana/wallet-adapter-wallets';
// import { NotificationActions } from 'modules/notification/store/NotificationActions';
// import { extractMessage } from 'modules/common/utils/extractError';
// import { useDispatch } from 'react-redux';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { AccountsProvider } from 'npms/oystoer';

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const endpoint = useMemo(
    () => clusterApiUrl(WalletAdapterNetwork.Mainnet),
    [],
  );
  // const dispatch = useDispatch();

  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getMathWallet(),
      getSolongWallet(),
      getSolletWallet({
        provider: (window as any).sollet,
        network: WalletAdapterNetwork.Mainnet,
      }),
    ],
    [],
  );

  const onError = (err: any) => {
    console.error(err);
    // dispatch(
    //   NotificationActions.showNotification({
    //     message: extractMessage(err),
    //     severity: 'error',
    //   }),
    // );
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect>
        <AccountsProvider>{children}</AccountsProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
