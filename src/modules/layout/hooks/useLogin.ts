import { useDispatchRequest } from '@redux-requests/react';
import bs58 from 'bs58';
import { getAuthToken } from 'modules/account/api/getAuthToken';
import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import { setJWTToken } from 'modules/common/utils/localStorage';
// import { queryLikedItems } from 'modules/profile/actions/queryLikedItems';
// import { useDispatch } from 'react-redux';

const getSolSignature = async (sinMessage: string) => {
  const encodedMessage = new TextEncoder().encode(sinMessage);
  const signedMessage = await (window as any)?.solana?.signMessage(
    encodedMessage,
    'utf8',
  );
  const signature = bs58.encode(signedMessage.signature);
  return signature;
};

export const useLogin = () => {
  const { address } = useReactWeb3();
  // const dispatch = useDispatch();
  const dispatchRequest = useDispatchRequest();
  const login = async (cb: () => void) => {
    console.log('--------login---');
    try {
      const message = `Fangible ` + Date.now();
      const signature = await getSolSignature(message);
      setJWTToken(signature);
      cb?.();
      // -----  Login -----
      const params = {
        accountaddress: address ?? (window as any).solana.publicKey.toBase58(),
        message: message,
        signature: signature,
      };
      const authResponse = await dispatchRequest(getAuthToken(params));
      const token = authResponse.data.data.token;
      setJWTToken(token);
      // setTimeout(() => {
      //   dispatch(queryLikedItems());
      // }, 500);
    } catch (error: any) {
      console.log('error----->', error);
      if (error.code === -32603 || error.code === 4001) {
        console.log('User rejected the request');
        return;
      }

      // dispatch(
      //   NotificationActions.showNotification({
      //     message: extractMessage(
      //       new Error(error?.message ?? 'signature error'),
      //       // new Error('signature error'),
      //     ),
      //     severity: 'error',
      //     autoHideDuration: 99999999999,
      //   }),
      // );
    }
  };

  return {
    login,
  };
};
