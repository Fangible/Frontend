import { Container } from '@material-ui/core';
import { useState } from 'react';
import { DashTable } from './components/DashTable';
import { useArtListStyles } from './useArtListStyles';
import { useFetchWhiteList } from './useFetchWhiteList';
import { TopBanner } from './components/TopBanner';
import { Pagination } from 'modules/uiKit/Pagination';
import { useHistory, useParams } from 'react-router';
import { Search } from 'modules/layout/components/Search';

export const ArtList = () => {
  const history = useHistory();
  const { page } = useParams<{ page: string }>();
  const classes = useArtListStyles();
  const [currentPageIndex, setCurrentPageIndex] = useState(parseInt(page) || 1);
  const { loading, whiteList, pageConfig } =
    useFetchWhiteList(currentPageIndex);

  const renderedBottomPagination = (
    <div className={classes.paginationBottom}>
      <Pagination
        disabled={loading}
        page={currentPageIndex}
        count={pageConfig.pageCount}
        onChange={(_event, value) => {
          history.push(`/artList/page=${value}`);
          setCurrentPageIndex(value);
          window.scrollTo({
            top: 300,
            behavior: 'smooth',
          });
        }}
      />
    </div>
  );

  return (
    <>
      <TopBanner />
      <Container className={classes.root} maxWidth="xl">
        <Search
          className={classes.searchBar}
          placeholder={'Enter address'}
          scene={'ArtListSearch'}
        />
        <DashTable tableDatas={whiteList} />
        <div className={classes.pagination}>{renderedBottomPagination}</div>
      </Container>
    </>
  );
};
