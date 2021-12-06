import { Metadata, ParsedAccount, useConnection } from 'npms/oystoer';
import { useCallback, useEffect, useState } from 'react';
import { getMetaDataAccountInfo } from '../utils/solanaAccount';
import { useExtendedArt } from './useArt';

export const useMetaDataInfo = (pubkey: string) => {
  const connection = useConnection();
  const [metadataAccountInfo, setMetadataAccountInfo] =
    useState<ParsedAccount<Metadata>>();
  const initData = useCallback(async () => {
    const accountInfo = await getMetaDataAccountInfo({
      publicKey: pubkey,
      connection,
    });
    if (accountInfo) {
      setMetadataAccountInfo(accountInfo);
    }
  }, [connection, pubkey]);
  useEffect(() => {
    initData();
  }, [initData]);

  const { data: metadata } = useExtendedArt(
    metadataAccountInfo?.info.data.uri ?? '',
  );
  const name = metadata?.name ?? '';
  const fileUrl = metadata?.image ?? '';
  const description = metadata?.image ?? '';
  const category = metadata?.properties.category;
  const seller_fee_basis_points = metadata?.seller_fee_basis_points;
  return {
    metadataAccountInfo,
    name,
    fileUrl,
    description,
    category,
    metadata,
    seller_fee_basis_points,
  };
};
