import { SolProductCards } from 'modules/common/components/ProductCards';
import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import { useUserCreatedNft } from '../../Hook/useUserCreatedNft';
import { SceneType } from 'modules/common/components/QueryEmpty/QueryEmpty';
import { Pagination } from 'modules/uiKit/Pagination';
import { useProductsStyles } from 'modules/market/components/Products/useProductsStyles';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ProfileRoutesConfig } from 'modules/profile/ProfileRoutes';
import { NoItems } from 'modules/common/components/NoItems';

export const TabCreated: React.FC<{
  isOther?: boolean;
  isCollectionSale?: boolean;
  reload?: () => void;
}> = () => {
  const classes = useProductsStyles();
  const { address: artAddress } = useReactWeb3();
  const history = useHistory();
  const { page: defaultPageIndex, tab } =
    ProfileRoutesConfig.UserProfile.useParams();
  const [currentPageIndex, setCurrentPageIndex] = useState(
    parseInt(defaultPageIndex) || 1,
  );
  const { list, loading, pageConfig } = useUserCreatedNft(
    artAddress || '',
    currentPageIndex,
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
        scene={SceneType.MyCreated}
        list={list}
        userAddress={artAddress}
        noItemComponent={
          <NoItems
            title={'No items found'}
            descr={'You haven’t created any NFT yet.'}
            href={'/market'}
          />
        }
      />

      {list && list.length !== 0 && renderedBottomPagination}
    </>
  );
};
