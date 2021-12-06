import {
  DispatchRequest,
  RequestAction,
  RequestActionMeta,
} from '@redux-requests/core';

import { Store } from 'redux';
import { createAction as createSmartAction } from 'redux-smart-actions';
import { RootState } from 'store';
import {
  IApiProfileInfo,
  IProfileInfo,
  mapProfileInfo,
} from '../api/profileInfo';

interface IFetchProfileInfoArgs {
  address: string;
}

type Test = RequestActionMeta<IApiProfileInfo, IProfileInfo | undefined> & {
  auth?: boolean;
};

export const fetchProfileInfo = createSmartAction<
  RequestAction<IApiProfileInfo, IProfileInfo | undefined>,
  [IFetchProfileInfoArgs?, Test?]
>('fetchProfileInfo', (params, meta) => ({
  request: {
    url: '/accountinfo/getaccount',
    method: 'get',
  },
  meta: {
    asMutation: false,
    ...meta,
    driver: 'axios',
    onRequest: (
      request,
      _action: RequestAction,
      store: Store<RootState> & { dispatchRequest: DispatchRequest },
    ) => {
      const state: RootState = store.getState();
      const address = state.user.address;
      request.params = { accountaddress: address };
      return request;
    },
    getData: data => {
      // if (data.code === 0) {
      //   console.error('fetchProfileInfo:', data?.msg ?? 'Unexpected error');
      //   return;
      // }
      return mapProfileInfo(data);
    },
  },
}));
