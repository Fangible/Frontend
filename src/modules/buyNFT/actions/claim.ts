import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
} from '@solana/web3.js';
import BN from 'bn.js';
import {
  AUCTION_ID,
  BidderPotParser,
  FANGIBLE_STORE,
  METAPLEX_ID,
  TOKEN_PROGRAM_ID,
  WalletSigner,
  WRAPPED_SOL_MINT,
} from 'npms/oystoer';
import { serialize } from 'borsh';
import { getAuctionManager } from 'modules/common/utils/solanaAccount';
import { buyRedeemFullRightsTransferBid } from './redeemFullRightsTransferBid';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { endAuction } from './endAuction';
import { SolAuctionState, SolAuctionType } from 'modules/market/types';
import { sendPlaceBid } from './bidSol';
import { DispatchRequest } from '@redux-requests/core';

interface IClaim {
  poolId: string;
  connection: Connection;
  wallet: WalletSigner;
}
export const Claim = async ({ poolId, connection, wallet }: IClaim) => {
  const token_program = new PublicKey(TOKEN_PROGRAM_ID);
  const auction_program = new PublicKey(AUCTION_ID);
  const metaplex_pubkey = new PublicKey(METAPLEX_ID);
  const store_key = new PublicKey(FANGIBLE_STORE);
  if (!wallet.publicKey) {
    return;
  }

  const auctionAccount = await connection.getAccountInfo(new PublicKey(poolId));
  if (!auctionAccount) {
    return;
  }
  // const parserAuction: ParsedAccount<AuctionData> = {
  //   pubkey: poolId,
  //   account: auctionAccount,
  //   info: decodeAuction(auctionAccount.data),
  // };
  const auctionManager = await getAuctionManager({
    connection,
    auctionPubkey: poolId,
  });
  // const myBidderPot = await getMyBidderPot({
  //   connection,
  //   walletPubkey: wallet.publicKey.toBase58(),
  //   auctionPubkey: poolId,
  // });

  const vault = new PublicKey(auctionManager.info.vault);
  const acceptPayment = new PublicKey(auctionManager.info.acceptPayment);
  // const bidderPotToken = new PublicKey(myBidderPot.pubkey);

  console.log('----start claim-------');
  console.log(
    `vault: ${vault.toBase58()};
    acceptPayment: ${acceptPayment.toBase58()}; `,
  );

  //获取对应vault的 auction账户
  const auctionKey = (
    await PublicKey.findProgramAddress(
      [Buffer.from('auction'), auction_program.toBuffer(), vault.toBuffer()],
      auction_program,
    )
  )[0];
  //获取对应auction的 auction—extended 扩展账户
  const auctionExtendedKey = (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('auction'),
        auction_program.toBuffer(),
        vault.toBuffer(),
        Buffer.from('extended'),
      ],
      auction_program,
    )
  )[0];
  //获取auctionmanager key
  const auctionmanagerKey = (
    await PublicKey.findProgramAddress(
      [Buffer.from('metaplex'), auctionKey.toBuffer()],
      metaplex_pubkey,
    )
  )[0];

  class NumberOfShareArgs {
    instruction: number;
    numberOfShares: BN;

    constructor(args: { instruction: number; numberOfShares: BN }) {
      this.instruction = args.instruction;
      this.numberOfShares = args.numberOfShares;
    }
  }

  class StartAuctionArgs {
    instruction = 5;
  }
  class ClaimBidArgs {
    instruction = 6;
  }
  const AUCTION_SCHEMA = new Map<any, any>([
    [
      NumberOfShareArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['numberOfShares', 'u64'],
        ],
      },
    ],
    [
      ClaimBidArgs,
      {
        kind: 'struct',
        fields: [['instruction', 'u8']],
      },
    ],
    [
      StartAuctionArgs,
      {
        kind: 'struct',
        fields: [['instruction', 'u8']],
      },
    ],
  ]);

  const value = new ClaimBidArgs();
  const data = Buffer.from(serialize(AUCTION_SCHEMA, value));
  const bidderPotKey = (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('auction'),
        auction_program.toBuffer(),
        auctionKey.toBuffer(),
        wallet.publicKey.toBuffer(),
      ],
      auction_program,
    )
  )[0];

  const biderPotTokenAccount = await connection.getAccountInfo(bidderPotKey);
  if (!biderPotTokenAccount?.data) {
    console.error('biderPotAccount data');
    return;
  }
  const parseBiderPotToken = BidderPotParser(
    bidderPotKey.toBase58(),
    biderPotTokenAccount,
  );
  if (!parseBiderPotToken?.info) {
    console.error('parseBiderPotToken error');
    return;
  }
  const bidderPotToken = new PublicKey(parseBiderPotToken.info.bidderPot);
  console.log(`bidderPotKey: ${bidderPotKey}`);
  console.log(`bidderPotToken: ${bidderPotToken.toBase58()}`);

  const SYSVAR_CLOCK_PUBKEY = new PublicKey(
    'SysvarC1ock11111111111111111111111111111111',
  );
  const calimkeys = [
    {
      pubkey: acceptPayment,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: bidderPotToken,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: bidderPotKey,
      isSigner: false,
      isWritable: true,
    },

    {
      pubkey: auctionmanagerKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: auctionKey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: wallet.publicKey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: WRAPPED_SOL_MINT,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: vault,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: store_key,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: auction_program,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_CLOCK_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: token_program,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: auctionExtendedKey,
      isSigner: false,
      isWritable: false,
    },
  ];

  //1------------------------------
  const claimIx = new TransactionInstruction({
    keys: calimkeys,
    programId: metaplex_pubkey,
    data,
  });
  // const claimTx = new Transaction();
  // claimTx.add(claimIx);
  // const signature = await sendAndConfirmTransaction(connection, claimTx, [
  //   wallet,
  // ]);
  // console.log('signature::::', signature);
  const transaction = new Transaction();
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash('max')
  ).blockhash;
  [claimIx].forEach(instruction => {
    transaction.add(instruction);
  });
  transaction.feePayer = wallet.publicKey;
  // transaction.partialSign(my_token_ata);
  // const signature = await wallet.signTransaction(transaction);
  // console.log('--- signature------>', signature);
  // connection.sendRawTransaction(signature.serialize());

  return transaction;
};

export const onClaim = async ({
  auctionKey: poolId,
  walletAddress: address,
  mintAddress,
  connection,
  wallet,
}: {
  auctionKey: string;
  walletAddress?: string;
  mintAddress?: string;
  connection: Connection;
  wallet: WalletContextState;
}) => {
  let buyAllTransaction: Transaction[] = [];
  if (!address) {
    console.error('not address');
    return;
  }
  if (!mintAddress) {
    console.error('not itemNftInfo mintAddress');
    return;
  }

  const redeemFullRightsTransaction = await buyRedeemFullRightsTransferBid({
    connection,
    wallet: {
      publicKey: address ? new PublicKey(address) : null,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    },
    poolId,
    tokenAddress: mintAddress,
  });
  console.log(
    'buyRedeemFullRightsTransferBid ----------> ',
    redeemFullRightsTransaction,
  );
  if (!redeemFullRightsTransaction) {
    return new Error('ERROR redeemFullRightsTransaction');
  }
  buyAllTransaction.push(redeemFullRightsTransaction);

  const claimTransaction = await Claim({
    connection,
    wallet: {
      publicKey: address ? new PublicKey(address) : null,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    },
    poolId,
  });
  if (!claimTransaction) {
    return new Error('ERROR claimTransaction');
  }
  buyAllTransaction.push(claimTransaction);

  const signature2: Transaction[] = await wallet.signAllTransactions(
    buyAllTransaction,
  );
  await connection.sendRawTransaction(signature2[0].serialize());
  await connection.sendRawTransaction(signature2[1].serialize());
  return true;
};

export const onCreatorEnd = async ({
  auctionKey: poolId,
  walletAddress: address,
  mintAddress,
  connection,
  wallet,
  auctionType,
  dispatch,
  state,
}: {
  auctionKey: string;
  walletAddress?: string;
  mintAddress?: string;
  connection: Connection;
  wallet: WalletContextState;
  auctionType: SolAuctionType;
  dispatch: DispatchRequest;
  state: SolAuctionState;
}) => {
  let buyAllTransaction: Transaction[] = [];
  if (!address) {
    console.error('not address');
    return;
  }
  if (!mintAddress) {
    console.error('not itemNftInfo mintAddress');
    return;
  }

  console.log('---onCreatorEnd--------');
  const auctionManager = await getAuctionManager({
    connection,
    auctionPubkey: poolId,
  });
  const vault = new PublicKey(auctionManager.info.vault);

  let endAuctionInstructions: TransactionInstruction[] = [];
  if (auctionType === SolAuctionType.OPEN_EDITION) {
    endAuction(
      vault,
      new PublicKey(auctionManager.info.authority),
      endAuctionInstructions,
    );

    const redeemFullRightsTransaction = await buyRedeemFullRightsTransferBid({
      connection,
      wallet: {
        publicKey: address ? new PublicKey(address) : null,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      poolId,
      tokenAddress: mintAddress,
      isSeller: true,
      endAuctionInstructions,
    });
    console.log('mintAddress---------->', mintAddress);
    console.log('vault---------->', vault.toBase58());
    console.log(
      'end buyRedeemFullRightsTransferBid ----------> ',
      redeemFullRightsTransaction,
    );
    if (!redeemFullRightsTransaction) {
      return new Error('ERROR redeemFullRightsTransaction');
    }
    buyAllTransaction.push(redeemFullRightsTransaction);

    console.log('----end signAllTransactions ----');
    const signature: Transaction[] = await wallet.signAllTransactions(
      buyAllTransaction,
    );
    for (let i = 0; i < signature.length; i++) {
      await connection.sendRawTransaction(signature[i].serialize());
    }
    return true;
  }

  console.log(
    'auction time is up. not bid . creator bid 0, auctionType  ----------> ',
    auctionType,
  );

  const bidRes = await dispatch(
    sendPlaceBid({
      connection,
      wallet: {
        publicKey: address ? new PublicKey(address) : null,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      poolId,
      amount: 0,
    }),
  );
  const bidTransaction: Transaction | undefined = bidRes.data;
  if (!bidTransaction) {
    return new Error('ERROR bidTransaction');
  }

  console.log('buyAllTransaction SolAuctionState ----------->', state);
  if (state === SolAuctionState.STARTED) {
    buyAllTransaction.push(bidTransaction);
  }

  const redeemFullRightsTransaction = await buyRedeemFullRightsTransferBid({
    connection,
    wallet: {
      publicKey: address ? new PublicKey(address) : null,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    },
    poolId,
    tokenAddress: mintAddress,
    isSeller: true,
    endAuctionInstructions,
  });
  console.log('mintAddress---------->', mintAddress);
  console.log('vault---------->', vault.toBase58());
  console.log(
    'end buyRedeemFullRightsTransferBid ----------> ',
    redeemFullRightsTransaction,
  );
  if (!redeemFullRightsTransaction) {
    return new Error('ERROR redeemFullRightsTransaction');
  }
  buyAllTransaction.push(redeemFullRightsTransaction);

  console.log('----end signAllTransactions ----', buyAllTransaction);
  try {
    const signature: Transaction[] = await wallet.signAllTransactions(
      buyAllTransaction,
    );

    // for (let i = 0; i < signature.length; i++) {
    //   await connection.sendRawTransaction(signature[i].serialize());
    // }

    const txid: TransactionSignature = await connection.sendRawTransaction(
      signature[0].serialize(),
    );
    try {
      await connection.confirmTransaction(txid, 'max');
    } catch {
      // ignore
    }
    await connection.getParsedConfirmedTransaction(txid, 'confirmed');
    console.log('----tx 1 id-------------->', txid);
    if (signature[1]) {
      const txid2: TransactionSignature = await connection.sendRawTransaction(
        signature[1].serialize(),
      );
      console.log('----txid2-------------->', txid2);
    } else {
      console.log('old bid， not bid');
    }
    return true;
  } catch (error: any) {
    console.log('catch error', error);
    throw new Error(JSON.stringify(error));
  }
};
/**
 * 
      const claimSign = await ClaimNft({
        connection,
        wallet: {
          publicKey: address ? new PublicKey(address) : null,
          signTransaction: wallet.signTransaction,
          signAllTransactions: wallet.signAllTransactions,
        },
        poolId: auctionKey,
      });

      console.log('----claimSign---->', claimSign);
 */
