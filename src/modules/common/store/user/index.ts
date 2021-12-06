import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { WhitelistedCreator } from 'models/metaplex';
import { ParsedAccount } from 'npms/oystoer';
type colorValueType = number;
type userColorMapType = { [key in string]: number };

type storeWhiteCreatorType = {
  address: string;
  account: ParsedAccount<WhitelistedCreator>;
};
export type storeWhiteCreatorsType = storeWhiteCreatorType[];
export interface IUserState {
  colors: userColorMapType;
  showWalletLogin: boolean;
  address: string;
  balance: BigNumber;
  storeWhiteCreators: storeWhiteCreatorsType;
}

const initialState: IUserState = {
  colors: {},
  showWalletLogin: false,
  address: '',
  balance: new BigNumber(0),
  storeWhiteCreators: [],
};

interface IColor {
  userName: string;
  randomColor: colorValueType;
}

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    updateUserColorMap: (state, action: PayloadAction<IColor>) => {
      const colorInfo = action.payload;
      state.colors[colorInfo.userName] = colorInfo.randomColor;
      state.colors = {
        ...state.colors,
        [colorInfo.userName]: colorInfo.randomColor,
      };
    },
    updateShowWalletLogin: (state, action: PayloadAction<boolean>) => {
      state.showWalletLogin = action.payload;
    },
    updateAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
    updateBalance: (state, action: PayloadAction<BigNumber>) => {
      state.balance = action.payload;
    },
    updateStoreWhiteCreators: (
      state,
      action: PayloadAction<storeWhiteCreatorsType>,
    ) => {
      state.storeWhiteCreators = action.payload;
    },
  },
});

export const {
  updateUserColorMap,
  updateShowWalletLogin,
  updateAddress,
  updateBalance,
  updateStoreWhiteCreators,
} = userSlice.actions;

export const addUserColorDataAsync =
  (color: IColor) => async (dispatch: any) => {
    dispatch(updateUserColorMap(color));
  };
