import {
  useConnection,
  StringPublicKey,
  useConnectionConfig,
  Creator,
  MetadataCategory,
  Attribute,
} from 'npms/oystoer';
import { DispatchRequest, RequestAction } from '@redux-requests/core';
import { useDispatchRequest } from '@redux-requests/react';
// import { useDispatchRequest } from '@redux-requests/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { NftType } from 'modules/api/common/NftType';
import { uploadFile } from 'modules/common/actions/uploadFile';
import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import { addItem, IAddItemPayload } from 'modules/createNFT/actions/addItem';
import { Channel } from 'modules/createNFT/actions/createNft';
import { useState } from 'react';
import { Store } from 'redux';
import { createAction as createSmartAction } from 'redux-smart-actions';
import { RootState } from 'store';
import { isVideo } from '../../common/utils/isVideo';
import { IBrandInfo } from '../api/queryBrand';
import { mintNFT } from './mintSolNft';
export interface ICreateNFTPayload {
  name: string;
  description: string;
  channel: Channel;
  standard: NftType;
  supply: number;
  points: number;
  file: File;
  attributes: Attribute[];
}

export const useCreateBrandNFT = () => {
  const connection = useConnection();
  const wallet = useWallet();
  const { env } = useConnectionConfig();
  const dispatchRequest = useDispatchRequest();
  const { address, account } = useReactWeb3();
  const [nft, setNft] = useState<
    { metadataAccount: StringPublicKey } | undefined
  >(undefined);

  const onCreate = async (
    {
      file,
      standard,
      points,
      supply,
      name,
      description,
      channel,
      attributes,
    }: ICreateNFTPayload,
    brandInfo?: IBrandInfo,
  ) => {
    const category = isVideo(file)
      ? MetadataCategory.Video
      : MetadataCategory.Image;
    const maxSupply = supply ?? 0;
    const { data } = await dispatchRequest(uploadFile({ file }));
    const path = data?.result.path ?? '';

    const creators = [
      new Creator({
        address: address ?? '',
        share: 100,
        verified: true,
      }),
    ];
    // const attributes: Attribute[] = [];
    const metadata = {
      name: name,
      symbol: brandInfo?.brandsymbol ?? '',
      creators,
      description,
      seller_fee_basis_points: points * 100 ?? 0,
      image: path ?? '',
      animation_url: undefined,
      attributes,
      external_url: '',
      properties: {
        files: [file],
        category,
      },
      channel,
      // // TODO collection
      // collection: {
      //   name: '',
      //   family: brandid,
      // },
    };

    console.log('metadata---------->', metadata);
    const _nft = await mintNFT(
      connection,
      {
        publicKey: account as unknown as PublicKey | null,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      env,
      metadata,
      maxSupply,
      dispatchRequest,
    );
    if (_nft) {
      setNft(_nft);
      const { mintKey } = _nft;
      return {
        metadata,
        mintKey,
      };
    }
  };
  return {
    onCreate,
    nft,
  };
};
// TODO: Remove timers
export const createBrandNFT = createSmartAction(
  'createBrandNFT',
  (
    { file, standard, supply, name, description, channel }: ICreateNFTPayload,
    brandInfo: IBrandInfo,
  ) => ({
    request: {
      promise: (async function () {})(),
    },
    meta: {
      asMutation: true,
      onRequest: (
        request: { promise: Promise<any> },
        action: RequestAction,
        store: Store<RootState> & { dispatchRequest: DispatchRequest },
      ) => {
        return {
          promise: (async function () {
            const { data } = await store.dispatchRequest(uploadFile({ file }));

            const path = data?.result.path ?? '';
            const category = isVideo(file) ? 'video' : 'image';
            const brandid = brandInfo.id;
            const maxSupply = standard === NftType.ERC721 ? 1 : supply;
            const collectionAddress = brandInfo.contractaddress;

            const addItemPayload: IAddItemPayload = {
              brandid,
              category,
              channel,
              contractaddress: collectionAddress,
              description,
              fileurl: path,
              itemname: name,
              itemsymbol: brandInfo.brandsymbol,
              owneraddress: brandInfo.owneraddress,
              ownername: brandInfo.ownername,
              standard: brandInfo.standard,
              supply: maxSupply,
            };

            const { data: addItemData } = await store.dispatchRequest(
              addItem(addItemPayload),
            );

            if (!addItemData) {
              throw new Error("Item hasn't been added");
            }
          })(),
        };
      },
    },
  }),
);
