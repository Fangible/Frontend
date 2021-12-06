import { MintInfo } from '@solana/spl-token';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { Keypair, TransactionInstruction } from '@solana/web3.js';
import {
  AuctionData,
  BidderPot,
  cancelBid,
  ensureWrappedAccount,
  ParsedAccount,
  WalletSigner,
} from 'npms/oystoer';

export async function setupCancelBid(
  parserAuction: ParsedAccount<AuctionData>,
  {
    // tokenAccount,
    mintInfo,
    myBidderPot,
    auctionManagerVault: vault,
  }: {
    // tokenAccount: TokenAccount;
    mintInfo: MintInfo;
    myBidderPot: ParsedAccount<BidderPot>;
    auctionManagerVault: string;
  },
  accountRentExempt: number,
  wallet: WalletSigner,
  signers: Array<Keypair[]>,
  instructions: Array<TransactionInstruction[]>,
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const cancelSigners: Keypair[] = [];
  const cancelInstructions: TransactionInstruction[] = [];
  const cleanupInstructions: TransactionInstruction[] = [];

  // const tokenAccount = accountsByMint.get(auctionView.auction.info.tokenMint);
  const mint = parserAuction.info.tokenMint;

  if (mint && myBidderPot) {
    const receivingSolAccount = ensureWrappedAccount(
      cancelInstructions,
      cleanupInstructions,
      // tokenAccount,
      wallet.publicKey,
      accountRentExempt,
      cancelSigners,
    );

    await cancelBid(
      wallet.publicKey.toBase58(),
      receivingSolAccount,
      myBidderPot.info.bidderPot,
      parserAuction.info.tokenMint,
      vault,
      cancelInstructions,
    );
    signers.push(cancelSigners);
    instructions.push([...cancelInstructions, ...cleanupInstructions]);
  }
}
