import { SolProductCards } from 'modules/common/components/ProductCards';
import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import { SceneType } from 'modules/common/components/QueryEmpty/QueryEmpty';
import { Pagination } from 'modules/uiKit/Pagination';
import { useProductsStyles } from 'modules/market/components/Products/useProductsStyles';
import { JoinType, useUserPool } from '../../Hook/useUserPool';
import { useState } from 'react';
import { ProfileRoutesConfig } from 'modules/profile/ProfileRoutes';
import { useHistory } from 'react-router-dom';
import { NoItems } from 'modules/common/components/NoItems';

export const TabBids: React.FC<{
  isOther?: boolean;
  isCollectionSale?: boolean;
  reload?: () => void;
}> = () => {
  const classes = useProductsStyles();
  const { address } = useReactWeb3();
  const artAddress = address ?? '';

  const history = useHistory();
  const { page: defaultPageIndex, tab } =
    ProfileRoutesConfig.UserProfile.useParams();
  const [currentPageIndex, setCurrentPageIndex] = useState(
    parseInt(defaultPageIndex) || 1,
  );

  const { list, loading, pageConfig } = useUserPool(
    artAddress,
    currentPageIndex,
    JoinType.participated,
  );

  const renderedBottomPagination = (
    <div className={classes.paginationBottom}>
      <Pagination
        disabled={loading}
        page={currentPageIndex}
        count={pageConfig.pageCount}
        onChange={(_event, value) => {
          history.push(
            ProfileRoutesConfig.UserProfile.generatePath(tab, value),
          );
          setCurrentPageIndex(value);
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }}
      />
    </div>
  );

  return (
    <>
      <SolProductCards
        isLoading={loading}
        scene={SceneType.MyBids}
        list={list}
        userAddress={address}
        noItemComponent={
          <NoItems
            title={'No items found'}
            descr={
              'You haven’t placed a bid for any item yet. Go browse our marketplace.'
            }
            href={'/market'}
          />
        }
      />

      {list && list.length !== 0 && renderedBottomPagination}
    </>
  );
};
