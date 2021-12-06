import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-wallets';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { useConnection } from 'npms/oystoer';
import { useCallback, useEffect, useState } from 'react';
import { getJWTToken } from '../utils/localStorage';
import { useCount } from './useTimer';

export const useReactWeb3 = () => {
  const { select, adapter } = useWallet();
  const account = adapter?.publicKey;
  const address = account?.toString();
  const _isConnected = Boolean(adapter?.connected);
  const isConnected = Boolean(_isConnected && getJWTToken());

  const disconnect = useCallback(() => {
    localStorage.clear();
    return adapter?.disconnect?.();
  }, [adapter]);
  const connect = useCallback(
    (name: WalletName) =>
      new Promise((resolve, reject) => {
        const connect = () => {
          // if (_isConnected || address) {
          if ((window as any).solana.publicKey) {
            return resolve(name);
          }
          let isResolve = false;
          try {
            adapter?.connect().finally(() => {
              resolve(name);
              isResolve = true;
            });
          } catch (error) {
            console.log('uninstall');
            reject(error);
          }
          if (adapter) {
            setTimeout(() => !isResolve && resolve(name), 600);
          }
        };
        select(name);
        try {
          connect();
        } catch (error) {
          console.log(error);
        }
      }),
    [select, adapter /* _isConnected, address */],
  );
  return {
    isConnected,
    connected: adapter?.connected,
    account,
    address,
    disconnect,
    connect,
  };
};

// 注意！！ 这个函数不可轻易使用，统一由update的hooks调用，使用的时候应该从redux取数据
export const useBalance = () => {
  const { address } = useReactWeb3();
  const [balance, setBalance] = useState<BigNumber>();
  const connection = useConnection();
  const count = useCount(20e3);
  useEffect(() => {
    if (!address) {
      return;
    }
    const run = async () => {
      try {
        const res = await connection.getBalance(new PublicKey(address));
        // console.log('balance----->', res, address);
        setBalance(new BigNumber(res).dividedBy(1e9));
      } catch (error) {
        console.log(error);
      }
    };
    run();
    // eslint-disable-next-line
  }, [address, count]);
  return { balance };
};
