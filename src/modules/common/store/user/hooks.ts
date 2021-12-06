import { useConnection } from 'npms/oystoer';
import { useDispatch } from 'react-redux';
import { store } from 'store/store';
import { fetchUserBalance } from './fetchUser';

export const useUpdateUserBalance = () => {
  const dispatch = useDispatch();
  const connection = useConnection();

  const onUpdateBalance = () => {
    fetchUserBalance({ connection })(dispatch, store.getState());
  };
  return {
    onUpdateBalance,
  };
};
