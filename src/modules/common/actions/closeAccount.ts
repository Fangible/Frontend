import { Token } from '@solana/spl-token';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { StringPublicKey, TOKEN_PROGRAM_ID, WalletSigner } from 'npms/oystoer';

interface ICloseAccount {
  connection: Connection;
  wallet: WalletSigner;
  ata: StringPublicKey;
}
export async function fetchCloseAccount({
  connection,
  wallet,
  ata,
}: ICloseAccount) {
  if (!wallet.publicKey) {
    console.error('error  wallet');
    return;
  }
  const instructions: TransactionInstruction[] = [];

  const owner = wallet.publicKey;
  const closeAccountIx = Token.createCloseAccountInstruction(
    TOKEN_PROGRAM_ID,
    new PublicKey(ata),
    wallet.publicKey,
    owner,
    [],
  );
  instructions.push(closeAccountIx);

  const transaction = new Transaction();

  instructions.forEach(instruction => {
    transaction.add(instruction);
  });
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash('max')
  ).blockhash;
  transaction.feePayer = wallet.publicKey;
  const signedTransaction = await wallet.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(
    signedTransaction.serialize(),
  );
  console.log(signature);
}
