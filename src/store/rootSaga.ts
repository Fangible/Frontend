import { fork } from 'redux-saga/effects';
import { connectSaga } from '../modules/account/effects/connectSaga';
import { notificationSaga } from '../modules/notification/effects/notificationSaga';
import { profileUpdateSaga } from '../modules/profile/effects/profileUpdateSaga';

export function* rootSaga() {
  yield fork(connectSaga);
  yield fork(notificationSaga);
  yield fork(profileUpdateSaga);
}
