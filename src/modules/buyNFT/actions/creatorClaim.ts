import { Token } from '@solana/spl-token';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import BN from 'bn.js';
import {
  AuctionManager,
  AuctionManagerV2,
  BidRedemptionTicket,
  BidRedemptionTicketV2,
  MetaplexKey,
  SafetyDepositConfig,
  WinningConfigType,
} from 'models/metaplex';
import { claimBid } from 'models/metaplex/claimBid';
import { AuctionManagerV1 } from 'models/metaplex/deprecatedStates';
import { emptyPaymentAccount } from 'models/metaplex/emptyPaymentAccount';
import { AuctionViewItem } from 'modules/common/hooks/useAuctions';
import { buildListWhileNonZero } from 'modules/common/utils/array';
import {
  getAllBidderPot,
  getAuctionManager,
  getItemsFromSafetyDepositBoxes,
  getMasterEdition,
  // getMyBidderPot,
  getRedemptionsAndBidRedemptionV2sByAuctionManagerAndWinningIndex,
  getSafetyDepositBoxesByAuctionVault,
  getSafetyDepositConfigsByAuctionManager,
} from 'modules/common/utils/solanaAccount';
import {
  AuctionData,
  BidderPot,
  createAssociatedTokenAccountInstruction,
  decodeAuction,
  decodeMasterEdition,
  decodeMetadata,
  decodeVault,
  findProgramAddress,
  MasterEditionV1,
  MasterEditionV2,
  Metadata,
  METADATA_PROGRAM_ID,
  ParsedAccount,
  programIds,
  SafetyDepositBox,
  sendTransactions,
  sendTransactionWithRetry,
  SequenceType,
  TOKEN_PROGRAM_ID,
  toPublicKey,
  WalletSigner,
  WRAPPED_SOL_MINT,
} from 'npms/oystoer';

const QUOTE_MINT = WRAPPED_SOL_MINT;
const BATCH_SIZE = 10;
const SETTLE_TRANSACTION_SIZE = 6;
const CLAIM_TRANSACTION_SIZE = 6;

export const onCreatorClaim = async ({
  auctionKey: poolId,
  walletAddress: address,
  mintAddress: tokenMint,
  connection,
  wallet: _wallet,
  auctionKey: auctionPubkey,
  winnerList,
}: {
  auctionKey: string;
  walletAddress?: string;
  mintAddress?: string;
  connection: Connection;
  wallet: WalletContextState;
  winnerList: string[];
}) => {
  console.log('----onCreatorClaim------');
  console.log('winnerList------->', winnerList);
  const wallet = {
    publicKey: address ? new PublicKey(address) : null,
    signTransaction: _wallet.signTransaction,
    signAllTransactions: _wallet.signAllTransactions,
  };
  if (!address) {
    return console.error('not address');
  }
  if (!tokenMint) {
    return console.error('not itemNftInfo mintAddress');
  }
  const auctionManager = await getAuctionManager({
    connection,
    auctionPubkey,
  });
  const auctionAccount = await connection.getAccountInfo(new PublicKey(poolId));
  if (!auctionAccount?.data) {
    return console.error('not auctionAccount');
  }
  if (!auctionManager) {
    return console.error('not auctionManager');
  }
  console.log('auctionManager---------->', auctionManager);
  const vaultPubkey = new PublicKey(auctionManager.info.vault);
  const vaultAccount = await connection.getAccountInfo(vaultPubkey);
  if (!vaultAccount) {
    console.error('vaultAccount  error');
    return;
  }
  const parserValue = {
    pubkey: vaultPubkey.toBase58(),
    account: vaultAccount,
    info: decodeVault(vaultAccount?.data),
  };
  const parserAuction: ParsedAccount<AuctionData> = {
    pubkey: poolId,
    account: auctionAccount,
    info: decodeAuction(auctionAccount.data),
  };

  // let bidsToClaim: ParsedAccount<BidderPot>[] = [];

  const bidsToClaim = (
    await getAllBidderPot({
      connection,
      auctionPubkey,
    })
  ).filter(pot => winnerList.includes(pot.info.bidderAct));
  if (!bidsToClaim) {
    console.error(
      `error myBidderPot. wallet address: ${address}; auctionPubkey: ${auctionPubkey}`,
    );
  }

  // bidsToClaim = myBidderPot ? [myBidderPot] : [];
  console.log('-------bidsToClaim-------->', bidsToClaim);
  // TODO
  // const bidsToClaim: ParsedAccount<BidderPot>[] = [];

  console.log('---try claimAllBids---');
  try {
    await claimAllBids(
      connection,
      wallet,
      {
        auctionManager: auctionManager.info,
        vaultPubkey: vaultPubkey.toBase58(),
        tokenMint,
      },
      bidsToClaim,
    );
  } catch (error) {
    return new Error('error claimAllBids');
  }
  const safetyDepositConfigs: ParsedAccount<SafetyDepositConfig>[] =
    await getSafetyDepositConfigsByAuctionManager({
      connection,
      managerPubkey: auctionManager.pubkey,
    });
  const bidRedemptionV2sByAuctionManagerAndWinningIndex = (
    await getRedemptionsAndBidRedemptionV2sByAuctionManagerAndWinningIndex({
      connection,
      managerPubkey: auctionManager.pubkey,
    })
  ).bidRedemptions;

  const bidRedemptions: ParsedAccount<BidRedemptionTicket>[] =
    buildListWhileNonZero(
      bidRedemptionV2sByAuctionManagerAndWinningIndex,
      auctionManager.pubkey,
    );

  const boxes: ParsedAccount<SafetyDepositBox>[] =
    await getSafetyDepositBoxesByAuctionVault({
      connection,
      vaultPubkey: auctionManager.info.vault,
    });
  const getBox = (index?: number) => {
    return boxes.find(e => e.info.order === index);
  };
  try {
    const auctionManager2 = new AuctionManager({
      instance: auctionManager,
      auction: parserAuction,
      vault: parserValue,
      safetyDepositConfigs,
      bidRedemptions: bidRedemptions as ParsedAccount<BidRedemptionTicketV2>[],
    });
    console.log(
      'auctionManager---------->',
      auctionManager,
      safetyDepositConfigs,
    );
    const participationBox = getBox(
      auctionManager2.participationConfig?.safetyDepositBoxIndex,
    );
    if (!participationBox?.info.tokenMint) {
      return console.error(
        'error participationBox tokenMint',
        participationBox,
        boxes,
        auctionManager2.participationConfig?.safetyDepositBoxIndex,
        auctionManager,
        safetyDepositConfigs,
      );
    }
    const participationMetadataAddress = (
      await PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          new PublicKey(METADATA_PROGRAM_ID).toBuffer(),
          new PublicKey(participationBox.info.tokenMint).toBuffer(),
        ],
        new PublicKey(METADATA_PROGRAM_ID),
      )
    )[0];
    const metadataAccount = await connection.getAccountInfo(
      new PublicKey(participationMetadataAddress),
    );
    if (!metadataAccount) {
      return console.error(
        'error metadataAccount',
        participationBox,
        participationMetadataAddress.toBase58(),
      );
    }
    const participationMetadata: ParsedAccount<Metadata> = {
      pubkey: participationMetadataAddress.toBase58(),
      account: metadataAccount,
      info: decodeMetadata(metadataAccount?.data),
    };

    const masterKey = (
      await getMasterEdition(new PublicKey(participationBox.info.tokenMint))
    ).toBase58();
    const masterEditionAccount = await connection.getAccountInfo(
      new PublicKey(masterKey),
    );
    if (!masterEditionAccount?.data) {
      return console.error('error masterEditionAccount');
    }
    const participationMaster: ParsedAccount<
      MasterEditionV1 | MasterEditionV2
    > = {
      pubkey: masterKey,
      account: masterEditionAccount,
      info: decodeMasterEdition(masterEditionAccount?.data),
    };
    if (auctionManager.info.key === MetaplexKey.AuctionManagerV1) {
      return console.error('Do not support the AuctionManagerV1');
    }
    const items = await getItemsFromSafetyDepositBoxes({
      connection,
      boxes,
      safetyDepositConfigs,
      numWinners: parserAuction.info.bidState.max,
    });
    if (!items) {
      return console.error('item not');
    }
    console.log(
      'items getItemsFromSafetyDepositBoxes------------------->',
      items,
    );
    console.log('boxes------------------->', boxes);
    console.log(
      'parserAuction.info.bidState.max-------->',
      parserAuction.info.bidState.max,
      safetyDepositConfigs,
    );
    await emptyPaymentAccountForAllTokens(
      connection,
      wallet,
      {
        items,
        participationItem: {
          metadata: participationMetadata,
          safetyDeposit: participationBox,
          masterEdition: participationMaster,
          amount: new BN(1),
          winningConfigType: WinningConfigType.Participation,
        },
        auctionManager,
      },
      auctionPubkey,
    );
  } catch (error) {
    return new Error('error emptyPaymentAccountForAllTokens');
  }
  return true;
};

async function emptyPaymentAccountForAllTokens(
  connection: Connection,
  wallet: WalletSigner,
  auctionView: {
    items: AuctionViewItem[][];
    participationItem: AuctionViewItem;
    auctionManager: ParsedAccount<AuctionManagerV1 | AuctionManagerV2>;
  },
  auctionPubkey: string,
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const PROGRAM_IDS = programIds();
  const signers: Array<Array<Keypair[]>> = [];
  const instructions: Array<Array<TransactionInstruction[]>> = [];

  let currSignerBatch: Array<Keypair[]> = [];
  let currInstrBatch: Array<TransactionInstruction[]> = [];

  let settleSigners: Keypair[] = [];
  let settleInstructions: TransactionInstruction[] = [];
  const ataLookup: Record<string, boolean> = {};
  // TODO replace all this with payer account so user doesnt need to click approve several times.

  // Overall we have 10 parallel txns, of up to 4 settlements per txn
  // That's what this loop is building.
  const prizeArrays = [
    ...auctionView.items,
    ...(auctionView.participationItem ? [[auctionView.participationItem]] : []),
  ];
  console.log('prizeArrays--------->', prizeArrays);
  for (let i = 0; i < prizeArrays.length; i++) {
    const items = prizeArrays[i];

    console.log('items------------>', items);
    for (let j = 0; j < items.length; j++) {
      const item = items[j];
      console.log('item---------->', item, auctionView.participationItem);
      const creators = item.metadata.info.data.creators;
      const edgeCaseWhereCreatorIsAuctioneer = !!creators
        ?.map(c => c.address)
        .find(c => c === auctionView.auctionManager.info.authority);

      const addresses = [
        ...(creators ? creators.map(c => c.address) : []),
        ...[auctionView.auctionManager.info.authority],
      ];

      for (let k = 0; k < addresses.length; k++) {
        const ata = (
          await findProgramAddress(
            [
              toPublicKey(addresses[k]).toBuffer(),
              PROGRAM_IDS.token.toBuffer(),
              QUOTE_MINT.toBuffer(),
            ],
            PROGRAM_IDS.associatedToken,
          )
        )[0];

        const existingAta = await connection.getAccountInfo(toPublicKey(ata));
        console.log('Existing ata?', existingAta);
        if (!existingAta && !ataLookup[ata])
          createAssociatedTokenAccountInstruction(
            settleInstructions,
            toPublicKey(ata),
            wallet.publicKey,
            toPublicKey(addresses[k]),
            QUOTE_MINT,
          );

        ataLookup[ata] = true;

        const creatorIndex = creators
          ? creators.map(c => c.address).indexOf(addresses[k])
          : null;

        await emptyPaymentAccount(
          auctionView.auctionManager.info.acceptPayment,
          ata,
          auctionView.auctionManager.pubkey,
          item.metadata.pubkey,
          item.masterEdition?.pubkey,
          item.safetyDeposit.pubkey,
          item.safetyDeposit.info.vault,
          auctionPubkey,
          wallet.publicKey.toBase58(),
          addresses[k],
          item === auctionView.participationItem ? null : i,
          item === auctionView.participationItem ? null : j,
          creatorIndex === -1 ||
            creatorIndex === null ||
            (edgeCaseWhereCreatorIsAuctioneer && k === addresses.length - 1)
            ? null
            : creatorIndex,
          settleInstructions,
        );

        if (settleInstructions.length >= SETTLE_TRANSACTION_SIZE) {
          currSignerBatch.push(settleSigners);
          currInstrBatch.push(settleInstructions);
          settleSigners = [];
          settleInstructions = [];
        }

        if (currInstrBatch.length === BATCH_SIZE) {
          signers.push(currSignerBatch);
          instructions.push(currInstrBatch);
          currSignerBatch = [];
          currInstrBatch = [];
        }
      }
    }
  }

  if (
    settleInstructions.length < SETTLE_TRANSACTION_SIZE &&
    settleInstructions.length > 0
  ) {
    currSignerBatch.push(settleSigners);
    currInstrBatch.push(settleInstructions);
  }

  if (currInstrBatch.length <= BATCH_SIZE && currInstrBatch.length > 0) {
    // add the last one on
    signers.push(currSignerBatch);
    instructions.push(currInstrBatch);
  }

  const ata = (
    await findProgramAddress(
      [
        toPublicKey(auctionView.auctionManager.info.authority).toBuffer(),
        PROGRAM_IDS.token.toBuffer(),
        QUOTE_MINT.toBuffer(),
      ],
      PROGRAM_IDS.associatedToken,
    )
  )[0];
  const owner = wallet.publicKey;
  const closeAccountIx = Token.createCloseAccountInstruction(
    TOKEN_PROGRAM_ID,
    new PublicKey(ata),
    wallet.publicKey,
    owner,
    [],
  );
  signers.push([[]]);
  instructions.push([[closeAccountIx]]);
  const instructionBatch = instructions.flat();
  const signerBatch = signers.flat();
  console.log('instructionBatch----------->', instructionBatch);
  if (instructionBatch.length >= 2) {
    // Pump em through!
    await sendTransactions(
      connection,
      wallet,
      instructionBatch,
      signerBatch,
      SequenceType.StopOnFailure,
      'single',
    );
  } else {
    await sendTransactionWithRetry(
      connection,
      wallet,
      instructionBatch[0],
      signerBatch[0],
      'single',
    );
  }
}

async function claimAllBids(
  connection: Connection,
  wallet: WalletSigner,
  auctionView: {
    auctionManager: AuctionManagerV1 | AuctionManagerV2;
    vaultPubkey: string;
    tokenMint: string;
  },
  bids: ParsedAccount<BidderPot>[],
) {
  const signers: Array<Array<Keypair[]>> = [];
  const instructions: Array<Array<TransactionInstruction[]>> = [];

  let currSignerBatch: Array<Keypair[]> = [];
  let currInstrBatch: Array<TransactionInstruction[]> = [];

  let claimBidSigners: Keypair[] = [];
  let claimBidInstructions: TransactionInstruction[] = [];

  // TODO replace all this with payer account so user doesnt need to click approve several times.

  // Overall we have 10 parallel txns, of up to 7 claims in each txn
  // That's what this loop is building.
  for (let i = 0; i < bids.length; i++) {
    const bid = bids[i];
    console.log('Claiming', bid.info.bidderAct);
    await claimBid(
      auctionView.auctionManager.acceptPayment,
      bid.info.bidderAct,
      bid.info.bidderPot,
      auctionView.vaultPubkey,
      WRAPPED_SOL_MINT.toBase58(),
      claimBidInstructions,
    );

    if (claimBidInstructions.length === CLAIM_TRANSACTION_SIZE) {
      currSignerBatch.push(claimBidSigners);
      currInstrBatch.push(claimBidInstructions);
      claimBidSigners = [];
      claimBidInstructions = [];
    }

    if (currInstrBatch.length === BATCH_SIZE) {
      signers.push(currSignerBatch);
      instructions.push(currInstrBatch);
      currSignerBatch = [];
      currInstrBatch = [];
    }
  }

  if (
    claimBidInstructions.length < CLAIM_TRANSACTION_SIZE &&
    claimBidInstructions.length > 0
  ) {
    currSignerBatch.push(claimBidSigners);
    currInstrBatch.push(claimBidInstructions);
  }

  if (currInstrBatch.length <= BATCH_SIZE && currInstrBatch.length > 0) {
    // add the last one on
    signers.push(currSignerBatch);
    instructions.push(currInstrBatch);
  }
  console.log('Instructions', instructions);
  if (!wallet.publicKey) {
    console.error('error  wallet');
    return;
  }
  for (let i = 0; i < instructions.length; i++) {
    const instructionBatch = instructions[i];
    const signerBatch = signers[i];
    console.log('Running batch', i);
    if (instructionBatch.length >= 2) {
      // Pump em through!
      await sendTransactions(
        connection,
        wallet,
        instructionBatch,
        signerBatch,
        SequenceType.StopOnFailure,
        'single',
      );
    } else {
      const transaction = new Transaction();
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash('max')
      ).blockhash;
      transaction.feePayer = wallet.publicKey;
      for (let i = 0; i < instructionBatch[0].length; i++) {
        transaction.add(instructionBatch[0][i]);
      }
      const signature = await wallet.signTransaction(transaction);
      await connection.sendRawTransaction(signature.serialize());
      // await sendTransactionWithRetry(
      //   connection,
      //   wallet,
      //   instructionBatch[0],
      //   signerBatch[0],
      //   'single',
      // );
    }
    console.log('Done');
  }
}
