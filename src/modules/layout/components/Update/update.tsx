import { useBalance, useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import {
  updateAddress,
  updateBalance,
  updateStoreWhiteCreators,
} from 'modules/common/store/user';
import { getCreators } from 'modules/common/utils/solanaAccount';
import { fetchProfileInfo } from 'modules/profile/actions/fetchProfileInfo';
import { useConnection } from 'npms/oystoer';
import { ReactNode, useEffect } from 'react';
import { useDispatch } from 'react-redux';

export const Update: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address } = useReactWeb3();
  const connection = useConnection();
  const { balance } = useBalance();
  const dispatch = useDispatch();
  useEffect(() => {
    if (balance) {
      dispatch(updateBalance(balance));
    }
  }, [dispatch, balance]);

  useEffect(() => {
    dispatch(updateAddress(address ?? ''));
    if (!address) return;
    dispatch(fetchProfileInfo());
  }, [address, dispatch]);

  useEffect(() => {
    (async () => {
      dispatch(updateStoreWhiteCreators(await getCreators({ connection })));
    })();
  }, [connection, dispatch]);

  return <>{children}</>;
};
