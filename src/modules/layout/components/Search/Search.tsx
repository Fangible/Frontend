import { ClickAwayListener, IconButton, InputBase } from '@material-ui/core';
import { useDispatchRequest } from '@redux-requests/react';
import classNames from 'classnames';
import { SearchIcon } from 'modules/common/components/Icons/SearchIcon';
import { Queries } from 'modules/common/components/Queries/Queries';
import { ResponseData } from '../../../common/types/ResponseData';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getByLikeStr } from './getByLikeStr';
import { SearchResult } from './SearchResult';
import { useSearchStyles } from './SearchStyles';
import debounce from 'lodash/debounce';
import { Axios } from 'modules/common/conts';
import { IApi_whiteListItem } from 'modules/admin/useFetchWhiteList';
import { ReactComponent as DefaultAvatarSvg } from '../../../../modules/admin/assets/defaultAvatar.svg';
import { truncateWalletAddr } from 'modules/common/utils/truncateWalletAddr';
import { t } from 'modules/i18n/utils/intl';
import { ProfileRoutesConfig } from 'modules/profile/ProfileRoutes';
import { useHistory } from 'react-router';

const SEARCH_REQUEST_KEY = 'Search';

const SEARCH_DELAY = 500;
const ANIMATION_TIMEOUT = 200;

interface ISearchProps {
  className?: string;
  focus?: boolean;
  disabled?: boolean;
  placeholder: string;
  scene: 'GlobalSearch' | 'ArtListSearch';
}

export const Search = ({
  className,
  focus,
  disabled,
  placeholder,
  scene,
}: ISearchProps) => {
  const classes = useSearchStyles();
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatchRequest();
  const history = useHistory();
  const [showResult, setShowResult] = useState(false);
  const [tarWhiteListItem, setTarWhiteListItem] = useState<
    IApi_whiteListItem | undefined
  >();

  useEffect(() => {
    if (focus) {
      setTimeout(() => {
        inputRef?.current?.focus();
      }, ANIMATION_TIMEOUT);
    }
  }, [focus]);

  const handleSearch = useRef(
    debounce((value: string) => {
      if (value.length && value.length >= 2) {
        if (scene === 'GlobalSearch') {
          dispatch(getByLikeStr(value));
        } else if (scene === 'ArtListSearch' || value) {
          const fetchSearchResult = async () => {
            try {
              const result = await Axios.get('/whitelist/users', {
                params: {
                  address: value,
                  limit: 5,
                  offset: 0,
                },
              });
              if (result.status === 200 && result.data.code === 0) {
                let item = undefined;
                if (value.length === 44) {
                  item = {
                    activated: false,
                    address: value,
                    id: 0,
                    image: '',
                    name: '',
                  };
                }
                if (result.data.data[0]) item = result.data.data[0];
                setTarWhiteListItem(item);
              }
              // throw new Error('fetchSearchResult');
            } catch (error) {
              console.error(error);
              setTarWhiteListItem(undefined);
            }
          };

          fetchSearchResult();
        }
        setShowResult(true);
      } else {
        setShowResult(false);
      }
    }, SEARCH_DELAY),
  ).current;

  const handleKeyup = (event: any) => {
    handleSearch(event.target.value);
  };

  const handleClose = () => {
    setShowResult(false);
  };

  const renderSearchWhiteListItem = useMemo(() => {
    return (
      <>
        {tarWhiteListItem ? (
          <div
            className={classes.searchItemBox}
            onClick={() => {
              if (!tarWhiteListItem.activated) return;
              history.push(
                ProfileRoutesConfig.OtherProfile.generatePath(
                  tarWhiteListItem.address,
                ),
              );
            }}
          >
            {tarWhiteListItem.image ? (
              <img
                src={tarWhiteListItem.image}
                alt=""
                className={classes.searchItemAvatar}
              />
            ) : (
              <DefaultAvatarSvg className={classes.searchItemAvatar} />
            )}
            <p>{tarWhiteListItem.name || 'Untitled '}</p>
            <p>{truncateWalletAddr(tarWhiteListItem.address)}</p>
            {tarWhiteListItem.activated ? (
              <p className={classes.success}>In The Whitelist</p>
            ) : (
              <p className={classes.danger}>Not In Whitelist</p>
            )}
          </div>
        ) : (
          <div className={classes.empty}>{t('header.search.empty')}</div>
        )}
      </>
    );
  }, [tarWhiteListItem, classes, history]);

  return (
    <div className={classes.root}>
      <div className={classNames(classes.root, className)}>
        <InputBase
          required
          inputRef={inputRef}
          className={classNames(
            classes.input,
            showResult && classes.inputFocused,
          )}
          classes={{
            focused: classes.inputFocused,
            input: classes.inputBase,
          }}
          type="search"
          onKeyUp={handleKeyup}
          placeholder={placeholder}
          startAdornment={
            <IconButton className={classes.iconButton} aria-label="search">
              <SearchIcon />
            </IconButton>
          }
          disabled={disabled}
        />
      </div>
      {scene === 'GlobalSearch' && showResult && (
        <ClickAwayListener onClickAway={handleClose}>
          <div className={classes.searchResult}>
            <Queries<ResponseData<typeof getByLikeStr>>
              requestActions={[getByLikeStr]}
              requestKeys={['', SEARCH_REQUEST_KEY]}
            >
              {({ loading, data }) => (
                <SearchResult
                  loading={loading}
                  data={data}
                  handleClose={handleClose}
                />
              )}
            </Queries>
          </div>
        </ClickAwayListener>
      )}

      {scene === 'ArtListSearch' && showResult && (
        <ClickAwayListener onClickAway={handleClose}>
          <div
            className={classNames(classes.searchResult, classes.ArtListSearch)}
          >
            {renderSearchWhiteListItem}
          </div>
        </ClickAwayListener>
      )}
    </div>
  );
};
