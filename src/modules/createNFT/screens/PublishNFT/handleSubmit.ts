import {
  IPartialCreateAuctionArgs,
  ParsedAccount,
  PriceFloor,
  PriceFloorType,
  useConnection,
  WinnerLimit,
  WinnerLimitType,
  WRAPPED_SOL_MINT,
} from 'npms/oystoer';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { IPublishEnglishAuction, IPublishFixedSwap } from './types';
import {
  createAuctionManager,
  SafetyDepositDraft,
} from 'modules/common/actions/createAuctionManager';
import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import { storeWhiteCreatorsType } from 'modules/common/store/user';
import { WhitelistedCreator } from 'models/metaplex';
import { AuctionType } from 'modules/api/common/auctionType';
const MIN_INCREMENTAL_PART = 0.05;

export const usePutOnSaleBidSubmit = () => {
  const connection = useConnection();
  const wallet = useWallet();
  const { address } = useReactWeb3();

  const handlePutOnSale = async ({
    payload,
    name,
    purchasePriceChecked,
    reservePriceChecked,
    tokenContract,
    tokenId,
    storeWhiteCreators,
    attributesItems,
  }: {
    name: string;
    purchasePriceChecked: boolean;
    reservePriceChecked: boolean;
    tokenContract: string;
    tokenId: string;
    // payload: IPublishEnglishAuction;
    payload: IPublishFixedSwap | IPublishEnglishAuction;
    storeWhiteCreators: storeWhiteCreatorsType;
    attributesItems: SafetyDepositDraft[];
  }) => {
    const winnerLimit = new WinnerLimit({
      type: WinnerLimitType.Capped,
      usize: new BN(1) as any,
    });
    let auctionSettings: IPartialCreateAuctionArgs;

    console.log('auctionSettings-payload', payload);
    if (payload.type === AuctionType.FixedSwap) {
      auctionSettings = {
        winners: new WinnerLimit({
          type: WinnerLimitType.Unlimited,
          usize: new BN(1) as any,
        }),
        endAuctionAt: null, // 结束时间
        auctionGap: null, // 出价间隔时间
        priceFloor: new PriceFloor({
          type: PriceFloorType.Minimum,
          minPrice: new BN(
            (parseFloat(payload.price) || 0) * LAMPORTS_PER_SOL,
          ) as any,
        }), // 底价
        tokenMint: WRAPPED_SOL_MINT.toBase58(), // 标的物
        gapTickSizePercentage: MIN_INCREMENTAL_PART, // 竞价增幅 %
        tickSize: null, // 竞价差价 $
        instantSalePrice: new BN(
          (parseFloat(payload.price) || 0) * LAMPORTS_PER_SOL,
        ) as any,
        name: null,
      };
    } else if (payload.type === AuctionType.EnglishAuction) {
      const _endAuctionAt =
        process.env.REACT_APP_BASE_ENV === 'TEST'
          ? payload.duration * 60
          : payload.duration * (60 * 60 * 24);

      auctionSettings = {
        winners: winnerLimit, // 仅一个获胜者
        endAuctionAt: new BN(_endAuctionAt), // 结束时间
        auctionGap: null, // 出价间隔时间
        priceFloor: new PriceFloor({
          type: PriceFloorType.Minimum,
          minPrice: new BN(
            (parseFloat(payload.minBid) || 0) * LAMPORTS_PER_SOL,
          ) as any,
        }), // 底价
        tokenMint: WRAPPED_SOL_MINT.toBase58(), // 标的物
        gapTickSizePercentage: MIN_INCREMENTAL_PART * 100, // 竞价增幅 %
        // gapTickSizePercentage: 0, // 竞价增幅 %
        tickSize: new BN(10).pow(new BN(9 - 2)), // 竞价差价 $
        instantSalePrice: new BN(
          // (parseFloat(payload.purchasePrice) || 99999) * LAMPORTS_PER_SOL,
          9999 * LAMPORTS_PER_SOL,
        ) as any,
        name: null,
      };
    } else {
      return alert('payload.type Error');
    }

    console.log('auctionSettings-auctionSettings', auctionSettings);

    const whitelistedCreatorsByCreator: Record<
      string,
      ParsedAccount<WhitelistedCreator>
    > = {};
    storeWhiteCreators.forEach(e => {
      whitelistedCreatorsByCreator[e.address] = e.account;
    });
    // console.log(
    //   'whitelistedCreatorsByCreator----->',
    //   whitelistedCreatorsByCreator,
    // );
    // console.log('createAuctionManager----------->', [
    //   connection,
    //   {
    //     publicKey: address ? new PublicKey(address || '') : null,
    //     signTransaction: wallet.signTransaction,
    //     signAllTransactions: wallet.signAllTransactions,
    //   },
    //   whitelistedCreatorsByCreator,
    //   auctionSettings,
    //   attributesItems,
    //   undefined,
    //   WRAPPED_SOL_MINT.toBase58(),
    // ]);

    const _auctionObj = await createAuctionManager(
      connection,
      {
        publicKey: address ? new PublicKey(address || '') : null,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      whitelistedCreatorsByCreator,
      auctionSettings,
      attributesItems,
      undefined,
      WRAPPED_SOL_MINT.toBase58(),
    );
    return _auctionObj;
  };

  return {
    handlePutOnSale,
  };
};
