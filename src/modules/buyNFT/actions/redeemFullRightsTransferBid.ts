import {
  TransactionInstruction,
  Transaction,
  PublicKey,
  Keypair,
  Connection,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { AccountLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { serialize } from 'borsh';
import {
  AUCTION_ID,
  decodeSafetyDeposit,
  decodeVault,
  FANGIBLE_STORE,
  METADATA_PROGRAM_ID,
  METAPLEX_ID,
  updatePrimarySaleHappenedViaToken,
  VAULT_ID,
  WalletSigner,
} from 'npms/oystoer';
import { getAuctionManager } from 'modules/common/utils/solanaAccount';
import {
  ProxyCallAddress,
  RedeemUnusedWinningConfigItemsAsAuctioneerArgs,
} from 'models/metaplex';

interface IRedeemTransfer {
  poolId: string;
  connection: Connection;
  wallet: WalletSigner;
  tokenAddress: string;
  isSeller?: boolean;
  endAuctionInstructions?: TransactionInstruction[];
}
export const buyRedeemFullRightsTransferBid = async ({
  connection,
  wallet,
  poolId,
  tokenAddress,
  isSeller,
  endAuctionInstructions = [],
}: IRedeemTransfer) => {
  const token_program = new PublicKey(TOKEN_PROGRAM_ID);
  const vault_program = new PublicKey(VAULT_ID);
  const auction_program = new PublicKey(AUCTION_ID);
  const metaplex_pubkey = new PublicKey(METAPLEX_ID);
  const metadata_pubkey = new PublicKey(METADATA_PROGRAM_ID);
  const store_key = new PublicKey(FANGIBLE_STORE);

  const auctionAccount = await connection.getAccountInfo(new PublicKey(poolId));
  if (!auctionAccount) {
    return;
  }
  const auctionManager = await getAuctionManager({
    connection,
    auctionPubkey: poolId,
  });
  const vault = new PublicKey(auctionManager.info.vault);
  const vaultAccount = await connection.getAccountInfo(new PublicKey(vault));
  if (!vaultAccount) {
    console.error('vaultAccount  error');
    return;
  }
  // const parserAuction: ParsedAccount<AuctionData> = {
  //   pubkey: poolId,
  //   account: auctionAccount,
  //   info: decodeAuction(auctionAccount.data),
  // };
  const parserValue = {
    pubkey: vault,
    account: vaultAccount,
    info: decodeVault(vaultAccount?.data),
  };
  // const token_mint = new PublicKey(parserAuction.info.tokenMint);
  const token_mint = new PublicKey(tokenAddress);

  const safetyDepositBox = (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('vault'),
        new PublicKey(vault).toBuffer(),
        token_mint.toBuffer(),
      ],
      vault_program,
    )
  )[0];
  const safetyAccount = await connection.getAccountInfo(safetyDepositBox);
  if (!safetyAccount) {
    console.error(
      `safetyAccount error vault: ${vault.toBase58()}; token_mint: ${token_mint.toBase58()}; safetyDepositBox: ${safetyDepositBox}`,
    );
    return;
  }
  const parserSafetyDepositBox = {
    pubkey: safetyDepositBox.toBase58(),
    account: safetyAccount,
    info: decodeSafetyDeposit(safetyAccount.data),
  };

  const fractionMint = new PublicKey(parserValue.info.fractionMint);
  const transferAuthority = (
    await PublicKey.findProgramAddress(
      [Buffer.from('vault'), vault_program.toBuffer(), vault.toBuffer()],
      vault_program,
    )
  )[0];
  const safetyDepositTokenStore = new PublicKey(
    parserSafetyDepositBox.info.store,
  );

  if (!wallet.publicKey) {
    return void 0;
  }
  console.log('--generate Keypair------');
  console.log(
    [
      vault,
      fractionMint,
      token_mint,
      transferAuthority,
      safetyDepositTokenStore,
    ].map(e => e.toBase58()),
  );
  //1、为钱包地址创建接收NFT的token_account
  const my_token_ata = Keypair.generate();
  //1------------------------------------------
  const create_ataIx = SystemProgram.createAccount({
    /** The account that will transfer lamports to the created account */
    fromPubkey: wallet.publicKey,
    /** Public key of the created account */
    newAccountPubkey: my_token_ata.publicKey,
    /** Amount of lamports to transfer to the created account */
    lamports: await connection.getMinimumBalanceForRentExemption(
      AccountLayout.span,
    ),
    /** Amount of space in bytes to allocate to the created account */
    space: AccountLayout.span,
    /** Public key of the program to assign as the owner of the created account */
    programId: token_program,
  });
  //2----------------------------------------
  const initaccIx = Token.createInitAccountInstruction(
    token_program,
    token_mint,
    my_token_ata.publicKey,
    wallet.publicKey,
  );

  //获取对应vault的 auction账户
  const auctionKey = (
    await PublicKey.findProgramAddress(
      [Buffer.from('auction'), auction_program.toBuffer(), vault.toBuffer()],
      auction_program,
    )
  )[0];
  console.log('auctionKey::::', auctionKey);
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
  console.log('auctionExtendedKey::::', auctionExtendedKey.toBase58());
  //获取auctionmanager key
  const auctionmanagerKey = (
    await PublicKey.findProgramAddress(
      [Buffer.from('metaplex'), auctionKey.toBuffer()],
      metaplex_pubkey,
    )
  )[0];
  console.log('auctionmanagerKey::::', auctionmanagerKey.toBase58());
  //bidredemption ['metaplex', auction_key, bidder_metadata_key]
  const bidderMetaKey = (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('auction'),
        auction_program.toBuffer(),
        auctionKey.toBuffer(),
        wallet.publicKey.toBuffer(),
        Buffer.from('metadata'),
      ],
      auction_program,
    )
  )[0];
  console.log('bidderMetaKey::::', bidderMetaKey.toBase58());
  // const safetyDepositBox = (
  //   await PublicKey.findProgramAddress(
  //     [Buffer.from('vault'), vault.toBuffer(), token_mint.toBuffer()],
  //     vault_program,
  //   )
  // )[0];
  console.log('safetyDepositBox::::', safetyDepositBox.toBase58());
  const bidRedemption = (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('metaplex'),
        auctionKey.toBuffer(),
        bidderMetaKey.toBuffer(),
      ],
      metaplex_pubkey,
    )
  )[0];
  console.log('bidRedemption::::', bidRedemption.toBase58());
  const metadataAccount = (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        metadata_pubkey.toBuffer(),
        token_mint.toBuffer(), //
      ],
      metadata_pubkey,
    )
  )[0];
  console.log(
    'metadataAccount::::',
    metadataAccount.toBase58(),
    token_mint.toBase58(),
  );

  const safetyDepositConfig = (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('metaplex'),
        metaplex_pubkey.toBuffer(),
        auctionmanagerKey.toBuffer(),
        safetyDepositBox.toBuffer(),
      ],
      metaplex_pubkey,
    )
  )[0];
  class RedeemFullRightsTransferBidArgs {
    instruction = 3;
  }
  class RedeemBidArgs {
    instruction = 2;
  }
  class ClaimBidArgs {
    instruction = 6;
  }
  const redeemfullkeys = [
    {
      pubkey: auctionmanagerKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: safetyDepositTokenStore, //token_account in vault
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: my_token_ata.publicKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: bidRedemption,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: safetyDepositBox,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: vault,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: fractionMint,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: auctionKey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: bidderMetaKey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: wallet.publicKey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: wallet.publicKey,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: token_program,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: vault_program,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: metadata_pubkey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: store_key,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: metadataAccount, //toPublicKey(masterMetadata),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: wallet.publicKey, //toPublicKey(newAuthority),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: transferAuthority, //initvault transferauthority
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: safetyDepositConfig,
      isSigner: false,
      isWritable: false,
    },

    {
      pubkey: auctionExtendedKey,
      isSigner: false,
      isWritable: false,
    },
  ];
  const SCHEMA = new Map<any, any>([
    [
      RedeemBidArgs,
      {
        kind: 'struct',
        fields: [['instruction', 'u8']],
      },
    ],
    [
      RedeemFullRightsTransferBidArgs,
      {
        kind: 'struct',
        fields: [['instruction', 'u8']],
      },
    ],
    [
      RedeemUnusedWinningConfigItemsAsAuctioneerArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['winningConfigItemIndex', 'u8'],
          ['proxyCall', 'u8'],
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
  ]);
  const value = new RedeemFullRightsTransferBidArgs();
  const SellerValue = new RedeemUnusedWinningConfigItemsAsAuctioneerArgs({
    winningConfigItemIndex: 0,
    proxyCall: ProxyCallAddress.RedeemFullRightsTransferBid,
  });
  const data = Buffer.from(serialize(SCHEMA, isSeller ? SellerValue : value));
  //3------------------------------
  const redeemfullIx = new TransactionInstruction({
    keys: redeemfullkeys,
    programId: metaplex_pubkey,
    data,
  });

  const transaction = new Transaction();
  if (endAuctionInstructions[0]) {
    endAuctionInstructions.forEach(instruction => {
      transaction.add(instruction);
    });
  }
  const instructions = [create_ataIx, initaccIx, redeemfullIx];
  await updatePrimarySaleHappenedViaToken(
    metadataAccount.toBase58(),
    wallet.publicKey.toBase58(),
    my_token_ata.publicKey.toBase58(),
    instructions,
  );
  instructions.forEach(instruction => {
    transaction.add(instruction);
  });
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash('max')
  ).blockhash;
  transaction.feePayer = wallet.publicKey;
  transaction.partialSign(my_token_ata);

  console.log(
    '--- redeemfullkeys------>',
    redeemfullkeys,
    redeemfullkeys.map(e => {
      return {
        ...e,
        pubkey: e.pubkey.toBase58(),
      };
    }),
  );

  return transaction;
};

/**
 * test
 * const poolIdParam = '9zcct4J5py4eGDFWo9Zbu4bCK7PkSWzkfm5TBZdbLTu2';
      const sing = await buyRedeemFullRightsTransferBid({
        connection,
        wallet: {
          publicKey: address ? new PublicKey(address) : null,
          signTransaction: wallet.signTransaction,
          signAllTransactions: wallet.signAllTransactions,
        },
        poolId: poolIdParam,
      });
      console.log('buyRedeemFullRightsTransferBid ----------> ', sing);
 */
