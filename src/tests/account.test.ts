// import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
// import { decodeMetadata } from 'npms/oystoer';

// const metadata = async () => {
//   const connection = new Connection(clusterApiUrl('devnet'), 'recent');

//   const metadataAccountPubkey = new PublicKey(
//     'wzcAUDVqTVdbvxWRThPgE7LU3n5qex2mXABxAKj9gkk',
//   );
//   const metadataAccount = await connection.getAccountInfo(
//     metadataAccountPubkey,
//   );
//   if (!metadataAccount?.data) {
//     return console.log('error');
//   }
//   const parseMetadata = decodeMetadata(metadataAccount?.data);
//   console.log('---parseMetadata---------->', parseMetadata);
// };
// export default metadata;

// import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
// import { decodeAuction } from 'npms/oystoer';

// const biderPostTest = async () => {
//   const connection = new Connection(clusterApiUrl('devnet'), 'recent');
//   const auctionAccountPubkey = new PublicKey(
//     'F3fH4J55sEccz7vAXsn3nLuvq3E29MEtaTigM7xvoWHn',
//   );
//   const auctionAccount = await connection.getAccountInfo(auctionAccountPubkey);
//   if (!auctionAccount?.data) {
//     return console.log('error');
//   }
//   const parseAuction = decodeAuction(auctionAccount?.data);
//   console.log(
//     '--jk-parseAuction---------->',
//     parseAuction,
//     parseAuction.priceFloor.minPrice?.toString(),
//     (parseAuction.priceFloor.minPrice?.toNumber() ?? 1) / 1e9,
//   );
// };
// export default biderPostTest;

// import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
// import { decodeAuctionDataExtended } from 'npms/oystoer';

// const biderPostTest = async () => {
//   const connection = new Connection(clusterApiUrl('devnet'), 'recent');

//   const auctionExtended = (
//     await PublicKey.findProgramAddress(
//       [
//         Buffer.from('auction'),
//         new PublicKey('1cuophQB85tYEX19vUNAR8bWY531vLA7AefWETszXbw').toBuffer(),
//         new PublicKey(
//           '7T8TZT9EFiz9rpv6fmnS15w9uoLcHqYY1p8LMZiTzMU7',
//         ).toBuffer(),
//         Buffer.from('extended'),
//       ],
//       new PublicKey('1cuophQB85tYEX19vUNAR8bWY531vLA7AefWETszXbw'),
//     )
//   )[0];
//   const auctionAccountPubkey = new PublicKey(
//     'GLkBPVqWygZqhZBfoQQxicFVLXqmKD5GpkaTs2gYjttv',
//   );
//   const auctionAccount = await connection.getAccountInfo(auctionAccountPubkey);
//   if (!auctionAccount?.data) {
//     return console.log('error');
//   }
//   const parseAuction = decodeAuctionDataExtended(auctionAccount?.data);
//   console.log('--decodeAuctionDataExtended---------->', parseAuction);
// };
// export default biderPostTest;

// import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
// import { decodeVault } from 'npms/oystoer';

// const biderPostTest = async () => {
//   const connection = new Connection(clusterApiUrl('devnet'), 'recent');
//   const auctionAccountPubkey = new PublicKey(
//     '6TJ4aLhx8Rp1pxZwwEgzmFZJJE6je2ihjoZgEmEssv5T',
//   );
//   const auctionAccount = await connection.getAccountInfo(auctionAccountPubkey);
//   if (!auctionAccount?.data) {
//     return console.log('error');
//   }
//   const parseAuction = decodeVault(auctionAccount?.data);
//   console.log('--jk-parseVault---------->', parseAuction, auctionAccount);
// };
// export default biderPostTest;

// import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
// import { decodeAuctionManager } from 'models/metaplex';

// const biderPostTest = async () => {
//   const connection = new Connection(clusterApiUrl('devnet'), 'recent');
//   const auctionAccountPubkey = new PublicKey(
//     'GLkBPVqWygZqhZBfoQQxicFVLXqmKD5GpkaTs2gYjttv',
//   );
//   const auctionAccount = await connection.getAccountInfo(auctionAccountPubkey);
//   if (!auctionAccount?.data) {
//     return console.log('error');
//   }
//   const parseAuction = decodeAuctionManager(auctionAccount?.data);
//   console.log('--jk-manager---------->', parseAuction, auctionAccount);
//   console.log('--jk-manager---------->', auctionAccount);
// };
// export default biderPostTest;

const a = () => {
  // 0
};
export default a;
