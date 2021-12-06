import loadable, { LoadableComponent } from '@loadable/component';
import { QueryLoadingAbsolute } from 'modules/common/components/QueryLoading/QueryLoading';
import { useQueryParams } from 'modules/common/hooks/useQueryParams';
import { ItemsChannel } from 'modules/overview/actions/fetchItemsByFilter';
import { generatePath, Route } from 'react-router-dom';
import { RouteConfiguration } from '../common/types/RouteConfiguration';

const PATH_MARKET_BASE = '/market';
const PATH_MARKET = `${PATH_MARKET_BASE}?page=:page?&channel=:channel?`;

const DEFAULT_PAGE = 1;
const DEFAULT_CHANNEL = ItemsChannel.all;

const LoadableContainer: LoadableComponent<any> = loadable(
  async () => import('./screens/Market').then(module => module.Market),
  {
    fallback: <QueryLoadingAbsolute />,
  },
);

export const MarketRoutesConfig: { [key: string]: RouteConfiguration } = {
  Market: {
    path: PATH_MARKET_BASE,
    generatePath: (page?: number, channel?: ItemsChannel) => {
      console.log('channel11', channel);
      if (!page && !channel) {
        return generatePath(PATH_MARKET_BASE);
      } else {
        return generatePath(PATH_MARKET, {
          page: page ?? DEFAULT_PAGE,
          channel: channel ?? DEFAULT_CHANNEL,
        });
      }
    },
    useParams: () => {
      const query = useQueryParams();
      const page = query.get('page');

      return {
        page: page ? +page : DEFAULT_PAGE,
        channel: query.get('channel') || DEFAULT_CHANNEL,
      };
    },
  },
};

export function MarketRoutes() {
  return (
    <Route
      path={MarketRoutesConfig.Market.path}
      exact={true}
      component={LoadableContainer}
    />
  );
}
