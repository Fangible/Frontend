import { PublicKey } from '@solana/web3.js';
import { METADATA_PROGRAM_ID } from 'npms/oystoer';

// mintKey ===> metaDataAccount
export const findMetaDataAccountByMint = async (
  mintKey: string,
): Promise<PublicKey> => {
  const metadata_publickey = new PublicKey(METADATA_PROGRAM_ID);
  const mint_publickey = new PublicKey(mintKey);

  const metadataAccount = (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        metadata_publickey.toBuffer(),
        mint_publickey.toBuffer(),
      ],
      metadata_publickey,
    )
  )[0];

  return metadataAccount;
};
