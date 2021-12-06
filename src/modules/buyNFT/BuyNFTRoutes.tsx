import loadable, { LoadableComponent } from '@loadable/component';
import { useParams } from 'react-router';
import { generatePath, Route } from 'react-router-dom';
import { QueryLoadingAbsolute } from '../common/components/QueryLoading/QueryLoading';

export const PATH_BUY_NFT = '/Auction_Detail/:auctionKey';
export const PATH_BUY_ITEM_NFT = `/NFT_Detail/:mintKey`;

export const BuyNFTRoutesConfig = {
  DetailsNFT: {
    path: PATH_BUY_NFT,
    generatePath: (auctionKey: string) =>
      generatePath(PATH_BUY_NFT, { auctionKey }),
    useParams: () => {
      const { auctionKey } = useParams<{
        auctionKey: string;
      }>();

      return {
        auctionKey,
      };
    },
  },
  Details_ITEM_NFT: {
    path: PATH_BUY_ITEM_NFT,
    generatePath: (mintKey: string) =>
      generatePath(PATH_BUY_ITEM_NFT, { mintKey }),
    useParams: () => {
      const { mintKey } = useParams<{
        mintKey: string;
      }>();

      return {
        mintKey,
      };
    },
  },
};

const LoadableDetailsNFTContainer: LoadableComponent<any> = loadable(
  async () => import('./screens/BuyNFT').then(module => module.BuyNFT),
  {
    fallback: <QueryLoadingAbsolute />,
  },
);

const LoadableDetailsNFTItemContainer: LoadableComponent<any> = loadable(
  async () => import('./screens/BuyNFT').then(module => module.ShowNftDetail),
  {
    fallback: <QueryLoadingAbsolute />,
  },
);

export function BuyNFTRoutes() {
  return (
    <>
      <Route
        path={BuyNFTRoutesConfig.DetailsNFT.path}
        exact={true}
        component={LoadableDetailsNFTContainer}
      />
    </>
  );
}

export function BuyItemNFTRoutes() {
  return (
    <>
      <Route
        path={BuyNFTRoutesConfig.Details_ITEM_NFT.path}
        exact={true}
        component={LoadableDetailsNFTItemContainer}
      />
    </>
  );
}
