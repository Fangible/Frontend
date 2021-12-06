import { SolProductCards } from 'modules/common/components/ProductCards';
import { SceneType } from 'modules/common/components/QueryEmpty/QueryEmpty';
import { Pagination } from 'modules/uiKit/Pagination';
import { useProductsStyles } from 'modules/market/components/Products/useProductsStyles';
import { JoinType, useUserPool } from '../../Hook/useUserPool';
import { useState } from 'react';
import { ProfileRoutesConfig } from 'modules/profile/ProfileRoutes';
import { useHistory } from 'react-router-dom';
import { NoItems } from 'modules/common/components/NoItems';
import { useAccount } from 'modules/account/hooks/useAccount';

export const TabSale: React.FC<{
  isOther?: boolean;
  isCollectionSale?: boolean;
  address?: string;
  reload?: () => void;
}> = ({ isOther, address: userAddress }) => {
  const classes = useProductsStyles();
  const { address } = useAccount();
  const artAddress = userAddress ? userAddress : address || '';
  const history = useHistory();
  const { page: defaultPageIndex, tab } =
    ProfileRoutesConfig.UserProfile.useParams();
  const [currentPageIndex, setCurrentPageIndex] = useState(
    parseInt(defaultPageIndex) || 1,
  );

  const { list, loading, pageConfig } = useUserPool(
    artAddress,
    currentPageIndex,
    JoinType.created,
    isOther,
  );

  const renderedBottomPagination = (
    <div className={classes.paginationBottom}>
      <Pagination
        disabled={loading}
        page={currentPageIndex}
        count={pageConfig.pageCount}
        onChange={(_event, value) => {
          history.push(
            isOther
              ? ProfileRoutesConfig.OtherProfile.generatePath(
                  artAddress,
                  tab,
                  value,
                )
              : ProfileRoutesConfig.UserProfile.generatePath(tab, value),
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
        scene={SceneType.MySells}
        list={list}
        isOther={isOther}
        userAddress={address}
        noItemComponent={
          <NoItems
            title={'No items found'}
            descr={'You haven’t listed any item for sale yet.'}
          />
        }
      />

      {list && list.length !== 0 && renderedBottomPagination}
    </>
  );
};
