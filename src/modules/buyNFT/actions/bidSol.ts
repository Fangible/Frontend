import { createAction as createSmartAction } from 'redux-smart-actions';
import { DispatchRequest, RequestAction } from '@redux-requests/core';
import { Store } from 'redux';
import { RootState } from 'store';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
} from '@solana/web3.js';
import {
  WalletAdapter,
  WalletNotConnectedError,
} from '@solana/wallet-adapter-base';
import { AccountLayout } from '@solana/spl-token';
import {
  approve,
  AuctionData,
  createTokenAccount,
  createTransaction,
  decodeAuction,
  ensureWrappedAccount,
  getMintInfo,
  ParsedAccount,
  placeBid,
  toLamports,
  toPublicKey,
  WalletSigner,
  WRAPPED_SOL_MINT,
} from 'npms/oystoer';
import BN from 'bn.js';
import {
  getAuctionManager,
  getMyBidderPot,
} from 'modules/common/utils/solanaAccount';
import { setupCancelBid } from './cancelBid';
import { AuctionManagerV1 } from 'models/metaplex/deprecatedStates';
import { AuctionManagerV2 } from 'models/metaplex';
import { WalletContextState } from '@solana/wallet-adapter-react';

interface ISendPlaceBidPayload {
  amount: number | BN;
  poolId: string;
  connection: Connection;
  wallet: Pick<
    WalletAdapter,
    'publicKey' | 'signTransaction' | 'signAllTransactions'
  >;
}

export const sendPlaceBid = createSmartAction<
  RequestAction<any, any>,
  [ISendPlaceBidPayload]
>('sendPlaceBid', ({ amount, poolId, connection, wallet }) => {
  return {
    request: {
      promise: (async function () {})(),
    },
    meta: {
      onRequest: (
        request: { promise: Promise<any> },
        action: RequestAction,
        store: Store<RootState> & { dispatchRequest: DispatchRequest },
      ) => {
        return {
          promise: (async function () {
            let signers: Keypair[][] = [];
            let instructions: TransactionInstruction[][] = [];
            const auctionAccount = await connection.getAccountInfo(
              new PublicKey(poolId),
            );
            console.log('-------sendPlaceBid--------');
            console.log(auctionAccount, wallet.publicKey?.toBase58());
            if (auctionAccount?.data && wallet.publicKey) {
              console.log(1);
              let parserAuction: ParsedAccount<AuctionData> = {
                pubkey: poolId,
                account: auctionAccount,
                info: decodeAuction(auctionAccount.data),
              };
              console.log(2);
              const auctionManager = await getAuctionManager({
                connection,
                auctionPubkey: poolId,
              });
              console.log('auctionManager------->', auctionManager);
              // const bidderTokenAccount = auctionManager.info.vault;
              const bidderTokenAccount = wallet.publicKey.toString();
              console.log(
                'parserAuction----->',
                parserAuction,
                bidderTokenAccount,
              );

              let bid = await setupPlaceBid(
                connection,
                wallet,
                bidderTokenAccount,
                parserAuction,
                auctionManager,
                amount,
                instructions,
                signers,
              );
              console.log('setupPlaceBid bid----->', bid);

              return await createTransaction(
                connection,
                wallet,
                instructions[0],
                signers[0],
                'single',
              );

              // return {
              //   bid,
              // };
            }
          })(),
        };
      },
      asMutation: true,
    },
  };
});

export async function setupPlaceBid(
  connection: Connection,
  wallet: WalletSigner,
  bidderTokenAccount: string | undefined,
  parserAuction: ParsedAccount<AuctionData>,
  auctionManager: ParsedAccount<AuctionManagerV1 | AuctionManagerV2>,
  // value entered by the user adjust to decimals of the mint
  amount: number | BN,
  overallInstructions: TransactionInstruction[][],
  overallSigners: Keypair[][],
): Promise<BN> {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  let signers: Keypair[] = [];
  let instructions: TransactionInstruction[] = [];
  let cleanupInstructions: TransactionInstruction[] = [];

  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(
    AccountLayout.span,
  );

  // const tokenAccount = bidderTokenAccount
  //   ? (cache.get(bidderTokenAccount) as TokenAccount)
  //   : undefined;

  console.log('---accountRentExempt----->', accountRentExempt);
  // const tokenAccountData = bidderTokenAccount
  //   ? await connection.getAccountInfo(new PublicKey(bidderTokenAccount))
  //   : undefined;
  // console.log('---tokenAccountData----->', tokenAccountData);
  // const tokenAccount =
  //   tokenAccountData && bidderTokenAccount
  //     ? TokenAccountParser(bidderTokenAccount, tokenAccountData)
  //     : undefined;
  const tokenAccount = {
    info: {
      mint: new PublicKey(WRAPPED_SOL_MINT),
    },
  };

  console.log('---tokenAccount----->', tokenAccount);
  // const mint = cache.get(
  //   tokenAccount ? tokenAccount.info.mint : WRAPPED_SOL_MINT,
  // ) as ParsedAccount<MintInfo>;

  // const mintAccount = await connection.getAccountInfo(new PublicKey(tokenAccount ? tokenAccount.info.mint : WRAPPED_SOL_MINT));
  console.log(
    'getMintInfo before arg------------->',
    tokenAccount?.info.mint.toBase58(),
  );

  const _info = tokenAccount
    ? await connection.getAccountInfo(tokenAccount.info.mint)
    : undefined;
  const mintInfo = await getMintInfo(
    connection,
    tokenAccount && _info ? tokenAccount.info.mint : WRAPPED_SOL_MINT,
  );

  console.log('bid   mintInfo -----> ', amount, mintInfo, accountRentExempt);
  // let lamports = toLamports(amount, mintInfo) + accountRentExempt;

  const lamports =
    accountRentExempt +
    (typeof amount === 'number'
      ? toLamports(amount, mintInfo)
      : amount.toNumber());

  // const lamports = 1002039280;
  console.log('bid   lamports -----> ', lamports);

  let bidderPotTokenAccount: string;
  const myBidderPot = await getMyBidderPot({
    connection,
    walletPubkey: wallet.publicKey.toBase58(),
    auctionPubkey: parserAuction.pubkey,
  });
  console.log('myBidderPot-------->', myBidderPot);
  if (!myBidderPot) {
    bidderPotTokenAccount = createTokenAccount(
      instructions,
      wallet.publicKey,
      accountRentExempt,
      toPublicKey(parserAuction.info.tokenMint),
      toPublicKey(parserAuction.pubkey),
      signers,
    ).toBase58();
  } else {
    bidderPotTokenAccount = myBidderPot.info.bidderPot;
    console.log('--if parserAuction--ended---');
    if (!parserAuction.info.ended()) {
      console.log('parserAuction  ended');
      let cancelSigners: Keypair[][] = [];
      let cancelInstr: TransactionInstruction[][] = [];
      if (tokenAccount) {
        await setupCancelBid(
          parserAuction,
          {
            mintInfo,
            myBidderPot,
            auctionManagerVault: auctionManager.info.vault,
          },
          accountRentExempt,
          wallet,
          cancelSigners,
          cancelInstr,
        );
        signers = [...signers, ...cancelSigners[0]];
        instructions = [...cancelInstr[0], ...instructions];
      }
    }
  }

  const payingSolAccount = ensureWrappedAccount(
    instructions,
    cleanupInstructions,
    // tokenAccount,
    wallet.publicKey,
    lamports + accountRentExempt * 2,
    signers,
  );

  const transferAuthority = approve(
    instructions,
    cleanupInstructions,
    toPublicKey(payingSolAccount),
    wallet.publicKey,
    lamports - accountRentExempt,
  );

  const bid = new BN(lamports - accountRentExempt);
  // const auctionManager = await getAuctionManager({connection, auctionPubkey: wallet.publicKey.toBase58()})
  signers.push(transferAuthority);

  console.log('bid number----------->', bid.toString());
  console.log('bidderPotTokenAccount---------->', bidderPotTokenAccount);
  console.log('payingSolAccount---------->', payingSolAccount);
  console.log('parserAuction---------->', parserAuction);
  await placeBid(
    wallet.publicKey.toBase58(),
    payingSolAccount,
    bidderPotTokenAccount,
    parserAuction.info.tokenMint,
    transferAuthority.publicKey.toBase58(),
    wallet.publicKey.toBase58(),
    auctionManager.info.vault,
    bid,
    instructions,
  );

  overallInstructions.push([...instructions, ...cleanupInstructions]);
  overallSigners.push(signers);
  return bid;
}

export const onBid = async ({
  auctionKey: poolId,
  walletAddress: address,
  price,
  dispatch,
  connection,
  wallet,
}: {
  auctionKey: string;
  walletAddress?: string;
  // wei： 9
  price: number;
  dispatch: DispatchRequest;
  connection: Connection;
  wallet: WalletContextState;
}) => {
  const amount = new BN(price ?? -1);
  if (!address) {
    console.error('not address');
    return;
  }
  let buyAllTransaction: Transaction[] = [];
  const bidRes = await dispatch(
    sendPlaceBid({
      connection,
      wallet: {
        publicKey: address ? new PublicKey(address) : null,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      poolId,
      amount,
    }),
  );
  const bidTransaction: Transaction | undefined = bidRes.data;
  if (!bidTransaction) {
    return new Error('ERROR bidTransaction');
  }
  buyAllTransaction.push(bidTransaction);

  const signature1: Transaction[] = await wallet.signAllTransactions(
    buyAllTransaction,
  );
  const txid: TransactionSignature = await connection.sendRawTransaction(
    signature1[0].serialize(),
  );
  if (txid) {
    return txid;
  }
  return new Error('ERROR bid transaction');
};

/**
 * 
 * 
      const poolIdParam = '9zcct4J5py4eGDFWo9Zbu4bCK7PkSWzkfm5TBZdbLTu2';
      const amount = new BN(2).mul(HALF_WAD)
      const bidRes = await dispatch(
        sendPlaceBid({
          connection,
          wallet: {
            publicKey: address ? new PublicKey(address) : null,
            signTransaction: wallet.signTransaction,
            : wallet.signAllTransactions,
          },
          poolId: poolIdParam,
          amount: new BN(2).mul(HALF_WAD),
        }),
      )
      console.log('bid result--------------->', bidRes);
 */
