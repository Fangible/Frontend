import { Connection, PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { Dispatch } from 'redux';
import { RootState } from 'store';
import { updateBalance } from '.';

export const fetchUserBalance =
  ({ connection }: { connection: Connection }) =>
  async (dispatch: Dispatch, store: RootState) => {
    const address = store.user.address;
    if (address) {
      const res = await connection.getBalance(new PublicKey(address));
      dispatch(updateBalance(new BigNumber(res).dividedBy(1e9)));
    }
  };
