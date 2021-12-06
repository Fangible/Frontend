import { NoItems } from 'modules/common/components/NoItems';
import { SolProductCards } from 'modules/common/components/ProductCards';
import { SceneType } from 'modules/common/components/QueryEmpty/QueryEmpty';
import { useProductsStyles } from 'modules/market/components/Products/useProductsStyles';
import { ProfileRoutesConfig } from 'modules/profile/ProfileRoutes';
import { Pagination } from 'modules/uiKit/Pagination';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useUserOwnedNft } from '../../Hook/useUserOwnedNft';

export const TabOwned: React.FC<{
  isOther?: boolean;
  address: string;
  reload?: () => void;
}> = function ({ isOther = false, address: userAddress, reload }) {
  const classes = useProductsStyles();
  const history = useHistory();
  const { page: defaultPageIndex, tab } =
    ProfileRoutesConfig.UserProfile.useParams();
  const [currentPageIndex, setCurrentPageIndex] = useState(
    parseInt(defaultPageIndex) || 1,
  );
  const { list, loading, pageConfig } = useUserOwnedNft(
    userAddress,
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
            isOther
              ? ProfileRoutesConfig.OtherProfile.generatePath(
                  userAddress,
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
        scene={SceneType.MyOwned}
        list={list}
        isOther={isOther}
        userAddress={userAddress}
        noItemComponent={
          <NoItems
            title={'No items found'}
            descr={'You haven’t owned any NFT yet.'}
            href={'/market'}
          />
        }
      />

      {list && list.length !== 0 && renderedBottomPagination}
    </>
  );
};
