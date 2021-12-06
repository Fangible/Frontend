import { BlockchainNetworkId } from 'modules/common/conts';
import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import { updateShowWalletLogin } from 'modules/common/store/user';
import { useDispatch } from 'react-redux';

export const useAccount = () => {
  const { isConnected, address } = useReactWeb3();
  const dispatch = useDispatch();
  const error = false;
  const handleConnect = () => {
    dispatch(updateShowWalletLogin(true));
  };

  const connectLoading = false;
  return {
    loading: connectLoading,
    isConnected,
    address,
    error,
    handleConnect,
    chainId: BlockchainNetworkId.solana,
    isChainSupported: true,
  };
};
