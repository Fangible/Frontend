import loadable, { LoadableComponent } from '@loadable/component';
import { generatePath, Route } from 'react-router-dom';
import { QueryLoadingAbsolute } from '../common/components/QueryLoading/QueryLoading';
import { RouteConfiguration } from '../common/types/RouteConfiguration';
import { PrivateRoute } from '../router/components/PrivateRoute';

export const PATH_LIST_BRAND = '/collectionList';
export const PATH_CREATE_BRAND = '/collection/create';
export const PATH_CREATE_BRAND_ITEM = '/collection/create-item/:brandId';

export const BrandRoutesConfig: { [key: string]: RouteConfiguration } = {
  ListBrand: {
    path: PATH_LIST_BRAND,
    generatePath: () => generatePath(PATH_LIST_BRAND),
  },
  CreateBrand: {
    path: PATH_CREATE_BRAND,
    generatePath: () => generatePath(PATH_CREATE_BRAND),
  },
  CreateCollectionItem: {
    path: PATH_CREATE_BRAND_ITEM,
    generatePath: (brandId: string) =>
      generatePath(PATH_CREATE_BRAND_ITEM, { brandId }),
  },
};

const LoadableListBrandContainer: LoadableComponent<any> = loadable(
  async () => import('./screens/Brands').then(module => module.Brands),
  {
    fallback: <QueryLoadingAbsolute />,
  },
);

const LoadableCreateBrandContainer: LoadableComponent<any> = loadable(
  async () =>
    import('./screens/CreateBrand').then(module => module.CreateBrand),
  {
    fallback: <QueryLoadingAbsolute />,
  },
);

const LoadableCreateCollectionItemContainer: LoadableComponent<any> = loadable(
  async () =>
    import('./screens/CreateCollectionItem').then(
      module => module.CreateCollectionItem,
    ),
  {
    fallback: <QueryLoadingAbsolute />,
  },
);

export function BrandRoutes() {
  return (
    <>
      <Route
        path={BrandRoutesConfig.ListBrand.path}
        exact={true}
        component={LoadableListBrandContainer}
      />

      <PrivateRoute
        path={BrandRoutesConfig.CreateBrand.path}
        exact={true}
        component={LoadableCreateBrandContainer}
      />

      <PrivateRoute
        path={BrandRoutesConfig.CreateCollectionItem.path}
        exact={true}
        component={LoadableCreateCollectionItemContainer}
      />
    </>
  );
}
