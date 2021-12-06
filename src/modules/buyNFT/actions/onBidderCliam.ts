import { DispatchRequest } from '@redux-requests/core';
import { AccountLayout } from '@solana/spl-token';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  getAuctionManager,
  getMyBidderPot,
} from 'modules/common/utils/solanaAccount';
import { SolAuctionState } from 'modules/market/types';
import {
  AuctionData,
  createTransaction,
  decodeAuction,
  getMintInfo,
  ParsedAccount,
  WRAPPED_SOL_MINT,
} from 'npms/oystoer';
import { onBid } from './bidSol';
import { setupCancelBid } from './cancelBid';

export const fetchBidderClaimSol = async ({
  setClaimLoading,
  address,
  auctionState,
  auctionKey,
  connection,
  wallet,
  dispatch,
}: {
  setClaimLoading: (v: boolean) => void;
  address?: string;
  auctionState?: SolAuctionState;
  auctionKey: string;
  connection: Connection;
  wallet: WalletContextState;
  dispatch: DispatchRequest;
}) => {
  if (auctionState === undefined) {
    console.error('error: not auctionState');
    return;
  }
  if (!address) {
    console.error('not wallet address');
    return;
  }
  setClaimLoading(true);
  let txid: string | Error | undefined;
  try {
    console.log('-----onBidderClaim------');
    if (auctionState === SolAuctionState.STARTED) {
      console.log('--------place bid 0-------');
      const txId = await onBid({
        price: 0,
        walletAddress: address,
        dispatch,
        connection,
        wallet,
        auctionKey,
      });
      console.log('txId->', txId);
      if (typeof txId === 'string') {
        try {
          await connection.confirmTransaction(txId, 'max');
        } catch {
          // ignore
        }
        await connection.getParsedConfirmedTransaction(txId, 'confirmed');
      }
    }

    // get info Data
    const poolId = auctionKey;
    const _wallet = {
      publicKey: address ? new PublicKey(address) : null,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    };
    const accountRentExempt =
      await connection.getMinimumBalanceForRentExemption(AccountLayout.span);
    const auctionAccount = await connection.getAccountInfo(
      new PublicKey(poolId),
    );
    if (!auctionAccount) {
      console.error('not auction ');
      return;
    }
    let parserAuction: ParsedAccount<AuctionData> = {
      pubkey: poolId,
      account: auctionAccount,
      info: decodeAuction(auctionAccount.data),
    };
    const tokenAccount = {
      info: {
        mint: new PublicKey(WRAPPED_SOL_MINT),
      },
    };

    const _info = tokenAccount
      ? await connection.getAccountInfo(tokenAccount.info.mint)
      : undefined;
    const mintInfo = await getMintInfo(
      connection,
      tokenAccount && _info ? tokenAccount.info.mint : WRAPPED_SOL_MINT,
    );

    const myBidderPot = await getMyBidderPot({
      connection,
      walletPubkey: address,
      auctionPubkey: parserAuction.pubkey,
    });
    const auctionManager = await getAuctionManager({
      connection,
      auctionPubkey: poolId,
    });

    let cancelSigners: Keypair[][] = [];
    let cancelInstr: TransactionInstruction[][] = [];
    await setupCancelBid(
      parserAuction,
      {
        mintInfo,
        myBidderPot,
        auctionManagerVault: auctionManager.info.vault,
      },
      accountRentExempt,
      _wallet,
      cancelSigners,
      cancelInstr,
    );
    const transaction = await createTransaction(
      connection,
      _wallet,
      cancelInstr[0],
      cancelSigners[0],
      'single',
    );
    const signature: Transaction = await wallet.signTransaction(transaction);
    txid = await connection.sendRawTransaction(signature.serialize());

    console.log('bidder claim sol----------->', txid);
    if (typeof txid === 'string') {
      try {
        await connection.confirmTransaction(txid, 'max');
      } catch {
        // ignore
      }
      await connection.getParsedConfirmedTransaction(txid, 'confirmed');
    }
  } catch (error) {
    console.log(error);
  }
  setClaimLoading(false);
  return true;
};
