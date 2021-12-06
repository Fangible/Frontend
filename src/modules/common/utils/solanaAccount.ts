import {
  AuctionParser,
  AUCTION_ID,
  BidderPot,
  BidderPotParser,
  BIDDER_POT_LEN,
  decodeEdition,
  decodeMasterEdition,
  decodeMetadata,
  decodeSafetyDeposit,
  Edition,
  ENDPOINTS,
  MasterEditionV1,
  MasterEditionV2,
  Metadata,
  MetadataKey,
  METADATA_PROGRAM_ID,
  METAPLEX_ID,
  ParsedAccount,
  programIds,
  SafetyDepositBox,
  VaultKey,
  VAULT_ID,
} from 'npms/oystoer';
import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { getProgramAccounts } from 'contexts/meta/loadAccounts';
import { processMetaplexAccounts } from 'contexts/meta/processMetaplexAccounts';
import {
  AuctionManagerV2,
  BidRedemptionTicket,
  BidRedemptionTicketV2,
  decodeAuctionManager,
  decodeBidRedemptionTicket,
  decodeSafetyDepositConfig,
  MAX_WHITELISTED_CREATOR_SIZE,
  MetaplexKey,
  SafetyDepositConfig,
  WhitelistedCreator,
} from 'models/metaplex';
import base58 from 'bs58';
import localforage from 'localforage';
import { DB_TABLES, getDbTableStoreName } from './db';
import { useEffect, useState } from 'react';
import { AuctionManagerV1 } from 'models/metaplex/deprecatedStates';
import { AccountAndPubkey } from 'contexts/meta/types';
import { AuctionViewItem } from '../hooks/useAuctions';
import BN from 'bn.js';

interface ObjMap<T> {
  [key: string]: T;
}

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(METADATA_PROGRAM_ID);

export const getMasterEdition = async (mint: PublicKey): Promise<PublicKey> => {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from('edition'),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0];
};

export const getMetaDataAccountInfo = async ({
  publicKey: pubkey,
  connection,
}: {
  publicKey: string;
  connection: Connection;
}) => {
  const account = await connection.getAccountInfo(new PublicKey(pubkey));
  if (account) {
    const info = decodeMetadata(account.data);
    const parsedAccount: ParsedAccount<Metadata> = {
      pubkey,
      account,
      info,
    };
    return parsedAccount;
  }
};

export const getAccountTokenSpl = async ({
  publicKey,
  connection,
}: {
  publicKey: string;
  connection: Connection;
}) => {
  const account = await connection.getAccountInfo(
    new PublicKey(publicKey),
    'confirmed',
  );
  if (account) {
    const mint = decodeMetadata(account.data).mint;

    const tokenLspAccounts = await connection.getTokenLargestAccounts(
      new PublicKey(mint),
    );
    const holding = tokenLspAccounts.value[0].address.toBase58();
    return holding;
  }
  new Error('SPL Error');
  return '';
};

export const axiosJsonGetAccountInfo = (publicKey: string) => {
  return axios.post(ENDPOINTS[0].endpoint, {
    method: 'getAccountInfo',
    jsonrpc: '2.0',
    params: [publicKey, { encoding: 'jsonParsed' }],
    // TODO web3 PR
    id: '5b5044f3-b12b-4904-8d79-a2affae6247b',
  });
};

export const accountGetMasterEditionInfo = async ({
  publicKey,
  connection,
}: {
  publicKey: string;
  connection: Connection;
}) => {
  const account = await connection.getAccountInfo(
    new PublicKey(publicKey),
    'confirmed',
  );
  if (account && account?.data) {
    // const nftInfo = await axiosJsonGetAccountInfo(
    //   decodeMetadata(account.data).mint,
    // );
    // const masterKey: string =
    //   nftInfo.data?.result.value.data.parsed.info.mintAuthority;
    const masterKey = (
      await getMasterEdition(new PublicKey(decodeMetadata(account.data).mint))
    ).toBase58();
    if (masterKey) {
      console.log('masterKey------>', masterKey);
      const masterEditionAccount = await connection.getAccountInfo(
        new PublicKey(masterKey),
      );
      if (masterEditionAccount) {
        const masterEditionAccountData = decodeMasterEdition(
          masterEditionAccount.data,
        );
        localforage.setItem(
          getDbTableStoreName(DB_TABLES.masterEditions, masterKey),
          JSON.stringify(masterEditionAccountData),
        );
        return {
          masterEditionAccountData,
          masterEditionAccount,
          masterKey,
        };
      }
    }
  }
};

export const accountGetEditionInfo = async ({
  parentPubkey,
  connection,
}: {
  parentPubkey: string;
  connection: Connection;
}) => {
  const res = await getProgramAccounts(connection, METADATA_PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: base58.encode(new Uint8Array([MetadataKey.EditionV1])),
        },
      },
      {
        memcmp: {
          offset: 1,
          bytes: parentPubkey,
        },
      },
    ],
  });
  return res.map(({ account, pubkey }) => {
    const info = decodeEdition(account.data);
    const parsedAccount: ParsedAccount<Edition> = {
      pubkey,
      account,
      info,
    };
    return parsedAccount;
  });
};

export const getCreators = async ({
  connection,
}: {
  connection: Connection;
}) => {
  const _creators = await getProgramAccounts(connection, METAPLEX_ID, {
    filters: [
      {
        dataSize: MAX_WHITELISTED_CREATOR_SIZE,
      },
    ],
  });
  let creators: {
    address: string;
    account: ParsedAccount<WhitelistedCreator>;
  }[] = [];
  for (const creator of _creators) {
    await processMetaplexAccounts(
      creator,
      (key, address, account) => {
        creators.push({ address, account });
      },
      false,
    );
  }
  return creators;
};

interface myBidderPotProps {
  connection: Connection;
  walletPubkey: string;
  auctionPubkey: string;
}
interface allBidderPotProps {
  connection: Connection;
  auctionPubkey: string;
}

export const getMyBidderPot = async ({
  connection,
  walletPubkey,
  auctionPubkey,
}: myBidderPotProps) => {
  const biderPots = await getProgramAccounts(connection, AUCTION_ID, {
    filters: [
      {
        dataSize: BIDDER_POT_LEN,
      },
      {
        memcmp: {
          offset: 32,
          //  bidderAct
          bytes: walletPubkey,
        },
      },
      {
        memcmp: {
          offset: 32 + 32,
          //  auctionAct
          bytes: auctionPubkey,
        },
      },
    ],
  });
  const biderPot = biderPots.map(({ account, pubkey }) =>
    BidderPotParser(pubkey, account),
  )[0];

  return biderPot as ParsedAccount<BidderPot>;
};

export const getAllBidderPot = async ({
  connection,
  auctionPubkey,
}: allBidderPotProps) => {
  const biderPots = await getProgramAccounts(connection, AUCTION_ID, {
    filters: [
      {
        dataSize: BIDDER_POT_LEN,
      },
      {
        memcmp: {
          offset: 32 + 32,
          //  auctionAct
          bytes: auctionPubkey,
        },
      },
    ],
  });
  const biderPot = biderPots.map(({ account, pubkey }) =>
    BidderPotParser(pubkey, account),
  );

  return biderPot as ParsedAccount<BidderPot>[];
};

export const getUserAuctionAccountInfo = async ({
  connection,
  authority,
}: {
  connection: Connection;
  authority: string;
}) => {
  const options = [
    {
      memcmp: {
        offset: 0,
        bytes: authority,
      },
    },
  ];
  const actions1 = await getProgramAccounts(connection, AUCTION_ID, {
    filters: [
      {
        dataSize: 219,
      },
      ...options,
    ],
  });
  const actions2 = await getProgramAccounts(connection, AUCTION_ID, {
    filters: [
      {
        dataSize: 478,
      },
      ...options,
    ],
  });
  return [...actions1, ...actions2].map(e => {
    return AuctionParser(e.pubkey, e.account);
  });
};

export const getAuctionInfo = async ({
  connection,
  publicKey,
}: {
  connection: Connection;
  publicKey: string;
}) => {
  const account = await connection.getAccountInfo(new PublicKey(publicKey));
  if (account) {
    const auctionInfo = AuctionParser(publicKey, account);
    return auctionInfo;
  }
};

export const getSafetyDepositConfigsByAuctionManager = async ({
  connection,
  dataSlice,
  managerPubkey,
}: {
  connection: Connection;
  dataSlice?: {
    offset: number;
    length: number;
  };
  managerPubkey: string;
}) => {
  const list = await getProgramAccounts(connection, METAPLEX_ID, {
    dataSlice,
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: base58
            .encode(new Uint8Array([MetaplexKey.SafetyDepositConfigV1]))
            .toString(),
        },
      },
      {
        memcmp: {
          offset: 1,
          bytes: managerPubkey,
        },
      },
    ],
  });
  return list.map(({ account, pubkey }) => {
    const config = decodeSafetyDepositConfig(account.data);
    const parsedAccount: ParsedAccount<SafetyDepositConfig> = {
      pubkey,
      account,
      info: config,
    };
    return parsedAccount;
  });
};

export const getSafetyDepositBoxesByAuctionVault = async ({
  connection,
  dataSlice,
  vaultPubkey,
}: {
  connection: Connection;
  dataSlice?: {
    offset: number;
    length: number;
  };
  vaultPubkey: string;
}) => {
  const list = await getProgramAccounts(connection, VAULT_ID, {
    dataSlice,
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: base58
            .encode(new Uint8Array([VaultKey.SafetyDepositBoxV1]))
            .toString(),
        },
      },
      {
        memcmp: {
          offset: 1,
          bytes: vaultPubkey,
        },
      },
    ],
  });
  return list.map(({ account, pubkey }) => {
    const config = decodeSafetyDeposit(account.data);
    const parsedAccount: ParsedAccount<SafetyDepositBox> = {
      pubkey,
      account,
      info: config,
    };
    return parsedAccount;
  });
};

export const getAuctionManager = async ({
  connection,
  auctionPubkey,
}: {
  connection: Connection;
  auctionPubkey: string;
}) => {
  const STORE_ID = programIds().store;
  const accounts = await getProgramAccounts(connection, METAPLEX_ID, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: base58
            .encode(new Uint8Array([MetaplexKey.AuctionManagerV2]))
            .toString(),
          // bytes: base58
          //   .encode(new Uint8Array([MetaplexKey.AuctionManagerV1]))
          //   .toString(),
        },
      },
      {
        memcmp: {
          offset: 1 + 32 * 2,
          bytes: auctionPubkey,
        },
      },
    ],
  });
  const manager = accounts
    .filter(({ account, pubkey }) => {
      const storeKey = new PublicKey(account.data.slice(1, 33));
      return Boolean(STORE_ID && storeKey.equals(STORE_ID));
    })
    .map(({ account, pubkey }) => {
      const auctionManager = decodeAuctionManager(account.data);
      const parsedAccount: ParsedAccount<AuctionManagerV1 | AuctionManagerV2> =
        {
          pubkey,
          account,
          info: auctionManager,
        };
      return parsedAccount;
    })[0];
  console.log(accounts);
  return manager;
};

export const getRedemptionsAndBidRedemptionV2sByAuctionManagerAndWinningIndex =
  async ({
    connection,
    dataSlice,
    managerPubkey,
  }: {
    connection: Connection;
    dataSlice?: {
      offset: number;
      length: number;
    };
    managerPubkey: string;
  }) => {
    // const listV1 = await getProgramAccounts(connection, METAPLEX_ID, {
    //   dataSlice,
    //   filters: [
    //     {
    //       memcmp: {
    //         offset: 0,
    //         bytes: base58
    //           .encode(new Uint8Array([MetaplexKey.BidRedemptionTicketV1]))
    //           .toString(),
    //       },
    //     },
    //   ],
    // });
    const listV1: AccountAndPubkey[] = [];
    const listV2 = await getProgramAccounts(connection, METAPLEX_ID, {
      dataSlice,
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: base58
              .encode(new Uint8Array([MetaplexKey.BidRedemptionTicketV2]))
              .toString(),
          },
        },
        {
          memcmp: {
            offset: 2 + 8,
            bytes: managerPubkey,
          },
        },
      ],
    });
    let bidRedemptions: ObjMap<ParsedAccount<BidRedemptionTicket>> = {};
    let bidRedemptionV2sByAuctionManagerAndWinningIndex: ObjMap<
      ParsedAccount<BidRedemptionTicket>
    > = {};
    listV1.concat(listV2).forEach(({ account, pubkey }) => {
      const ticket = decodeBidRedemptionTicket(account.data);
      const parsedAccount = {
        pubkey,
        account,
        info: ticket,
      };
      bidRedemptions[pubkey] = parsedAccount;
      if (ticket.key === MetaplexKey.BidRedemptionTicketV2) {
        const asV2 = ticket as BidRedemptionTicketV2;
        if (asV2.winnerIndex) {
          const key = asV2.auctionManager + '-' + asV2.winnerIndex.toNumber();
          bidRedemptionV2sByAuctionManagerAndWinningIndex[key] = parsedAccount;
        }
      }
    });
    return {
      bidRedemptions,
      bidRedemptionV2sByAuctionManagerAndWinningIndex,
    };
  };

export const useMetadataAccountGetEditionInfo = ({
  connection,
  mintPublicKey,
  isMutable,
}: {
  connection: Connection;
  mintPublicKey?: string;
  isMutable?: boolean;
}) => {
  const [masterEditionsInfo, setMasterEditionsInfo] = useState<
    MasterEditionV1 | MasterEditionV2
  >();
  const [editionInfo, setEditionInfo] = useState<Edition>();
  const [parsedEdition, setParsedEdition] = useState<ParsedAccount<Edition>>();

  useEffect(() => {
    (async () => {
      if (mintPublicKey) {
        const masterKey = (
          await getMasterEdition(new PublicKey(mintPublicKey))
        ).toBase58();

        // // ---cache----
        // const masterEditionFrozen = await localforage.getItem(
        //   getDbTableStoreName(DB_TABLES.masterEditions, masterKey),
        // );
        // const editionInfoFrozen = await localforage.getItem(
        //   getDbTableStoreName(DB_TABLES.editions, masterKey),
        // );
        // if (masterEditionFrozen) {
        //   setMasterEditionsInfo(JSON.parse(masterEditionFrozen as string));
        // }
        // if (editionInfoFrozen) {
        //   setEditionInfo(JSON.parse(editionInfoFrozen as string));
        //   // TODO account
        // }

        let masterEditionAccount = await connection.getAccountInfo(
          new PublicKey(masterKey),
        );
        if (masterEditionAccount && !masterEditionsInfo) {
          setMasterEditionsInfo(decodeMasterEdition(masterEditionAccount.data));
          setEditionInfo(decodeEdition(masterEditionAccount.data));
          setParsedEdition({
            pubkey: masterKey,
            account: masterEditionAccount,
            info: decodeEdition(masterEditionAccount.data),
          });
          if (!isMutable) {
            // TODO 优化
            if (editionInfo) {
              masterEditionAccount = await connection.getAccountInfo(
                new PublicKey(editionInfo.parent),
              );
            }
            if (masterEditionAccount) {
              setMasterEditionsInfo(
                decodeMasterEdition(masterEditionAccount.data),
              );
            }
          }
        }
      }
    })();
  }, [connection, editionInfo, isMutable, masterEditionsInfo, mintPublicKey]);
  return {
    masterEditionsInfo,
    editionInfo,
    parsedEdition,
  };
};

export const getItemsFromSafetyDepositBoxes = async ({
  numWinners,
  safetyDepositConfigs,
  boxes,
  connection,
}: {
  numWinners: BN;
  safetyDepositConfigs: ParsedAccount<SafetyDepositConfig>[];
  boxes: ParsedAccount<SafetyDepositBox>[];
  connection: Connection;
}) => {
  const getMetaData = async ({
    safetyDeposit,
  }: {
    safetyDeposit: ParsedAccount<SafetyDepositBox>;
  }) => {
    const participationMetadataAddress = (
      await PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          new PublicKey(METADATA_PROGRAM_ID).toBuffer(),
          new PublicKey(safetyDeposit.info.tokenMint).toBuffer(),
        ],
        new PublicKey(METADATA_PROGRAM_ID),
      )
    )[0];
    const metadataAccount = await connection.getAccountInfo(
      new PublicKey(participationMetadataAddress),
    );
    if (!metadataAccount) {
      return console.error('error metadataAccount');
    }
    const participationMetadata: ParsedAccount<Metadata> = {
      pubkey: participationMetadataAddress.toBase58(),
      account: metadataAccount,
      info: decodeMetadata(metadataAccount?.data),
    };
    return participationMetadata;
  };
  const items: AuctionViewItem[][] = [];
  for (let i = 0; i < numWinners.toNumber(); i++) {
    const newWinnerArr: AuctionViewItem[] = [];
    items.push(newWinnerArr);
    for (let k = 0; k < safetyDepositConfigs.length; k++) {
      // safetyDepositConfigs?.forEach(async s => {
      const s = safetyDepositConfigs[k];
      const amount = s.info.getAmountForWinner(new BN(i));
      if (amount.gt(new BN(0))) {
        const safetyDeposit = boxes[s.info.order.toNumber()];

        const metadata: void | ParsedAccount<Metadata> = await getMetaData({
          safetyDeposit,
        });
        const parsedAccountMasterEditionPubkey = await getMasterEdition(
          new PublicKey(safetyDeposit.info.tokenMint),
        );
        const parsedAccountMasterEditionAccount =
          await connection.getAccountInfo(parsedAccountMasterEditionPubkey);
        if (!parsedAccountMasterEditionAccount) {
          return console.error('error parsedAccountMasterEditionAccount');
        }
        const parsedAccountMasterEdition = {
          pubkey: parsedAccountMasterEditionPubkey.toBase58(),
          account: parsedAccountMasterEditionAccount,
          info: decodeMasterEdition(parsedAccountMasterEditionAccount.data),
        };
        if (metadata) {
          console.log('newWinnerArr.push--------->', metadata);
          newWinnerArr.push({
            metadata,
            winningConfigType: s.info.winningConfigType,
            safetyDeposit,
            amount,
            masterEdition: parsedAccountMasterEdition,
          });
        } else {
          console.error(
            `not meta, in getItemsFromSafetyDepositBoxes, error index: ${i}`,
          );
        }
      } else {
        console.error('error amount.gt(new BN(0))', amount);
      }
    }
  }
  console.log('return items--------> ', items);
  return items;
};
