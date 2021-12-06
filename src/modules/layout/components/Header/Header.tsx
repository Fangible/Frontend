import {
  Box,
  ClickAwayListener,
  Container,
  Drawer,
  Fade,
  ThemeProvider,
} from '@material-ui/core';
import { useAccount } from 'modules/account/hooks/useAccount';
import { featuresConfig } from 'modules/common/conts';
import { getTheme } from 'modules/common/utils/getTheme';
import { t } from 'modules/i18n/utils/intl';
import { Themes } from 'modules/themes/types';
import { useIsXLUp } from 'modules/themes/useTheme';
import { Button } from 'modules/uiKit/Button';
import { Link as RouterLink } from 'react-router-dom';
import { RoutesConfiguration } from '../../../createNFT/Routes';
import { HeaderLinks, HeaderLinksSecondary } from '../HeaderLinks';
import { Logo } from '../Logo';
import { Search } from '../Search';
import { SearchTrigger } from '../SearchTrigger';
import { Social } from '../Social';
import { Toggle } from '../Toggle';
import { Wallet } from '../Wallet';
import { useHeaderStyles } from './HeaderStyles';
import { useHeader } from './useHeader';
import { WalletModal } from '../ConnectWallet';
import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import { updateShowWalletLogin } from 'modules/common/store/user';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { NotificationActions } from 'modules/notification/store/NotificationActions';

export const Header = () => {
  const {
    onNavClose,
    onNavOpen,
    onSearchClose,
    onSearchOpen,
    onClickAwaySearch,
    onClickAwayNav,
    mobileNavShowed,
    searchShowed,
  } = useHeader();

  const { loading } = useAccount();

  const { isConnected, address } = useReactWeb3();
  const dispatch = useDispatch();
  const { showWalletLogin: isConnectWalletOpen } = useSelector(
    (state: RootState) => state.user,
  );
  const setIsConnectWalletOpen = (open: boolean) => {
    dispatch(updateShowWalletLogin(open));
  };

  const classes = useHeaderStyles();
  const isXLUp = useIsXLUp();
  const storeDispatch = useDispatch();
  const storeWhiteCreators = useSelector(
    (state: RootState) => state.user.storeWhiteCreators,
  );
  const tarFind = address
    ? storeWhiteCreators.find(item => item.address === address)
    : false;

  const renderedWallet = <Wallet />;

  const renderedDesktop = (
    <>
      <Search
        className={classes.search}
        disabled={false}
        placeholder={t('header.search.placeholder')}
        scene={'GlobalSearch'}
      />
      <HeaderLinks />
      {featuresConfig.howItWorkPage && <HeaderLinksSecondary />}

      {!tarFind ? (
        <Button
          rounded
          className={classes.btnCreate}
          variant="outlined"
          color="primary"
          onClick={() => {
            storeDispatch(
              NotificationActions.showNotification({
                message: (
                  <div>
                    Sorry, you are not yet a whitelist user and are not eligible
                    to create one, you become whitelist first
                    <a
                      target="_blank"
                      style={{
                        textDecoration: 'underline',
                        display: 'inline-block',
                        marginLeft: 10,
                      }}
                      href="https://docs.google.com/forms/d/e/1FAIpQLSchj7pxEr9z7JfzrMNLmnrhCDzAJGcv4sag_8mmSi5YpbRPyw/viewform?usp=sf_link"
                      rel="noreferrer"
                    >
                      qualification application
                    </a>
                  </div>
                ),
                severity: 'warning',
                autoHideDuration: 6e3,
              }),
            );
          }}
        >
          {t('header.create')}
        </Button>
      ) : (
        <Button
          rounded
          component={RouterLink}
          to={RoutesConfiguration.CreateNft.generatePath()}
          className={classes.btnCreate}
          variant="outlined"
          color="primary"
        >
          {t('header.create')}
        </Button>
      )}

      {!isConnected && (
        <>
          <Button
            onClick={() => {
              setIsConnectWalletOpen(true);
            }}
            loading={loading}
            rounded
          >
            {t('header.connect')}
          </Button>

          <ThemeProvider theme={getTheme(Themes.light)}>
            <WalletModal
              isOpen={isConnectWalletOpen}
              onClose={() => {
                setIsConnectWalletOpen(false);
              }}
            />
          </ThemeProvider>
        </>
      )}

      {isConnected && <div>{renderedWallet}</div>}
    </>
  );

  const renderedMobile = (
    <>
      <div className={classes.buttons}>
        <ClickAwayListener onClickAway={onClickAwaySearch}>
          <div>
            <SearchTrigger
              isActive={searchShowed}
              onClick={searchShowed ? onSearchClose : onSearchOpen}
            />

            <Fade in={searchShowed}>
              <div className={classes.searchBox}>
                <Container className={classes.searchBoxContainer}>
                  <Search
                    className={classes.searchMobile}
                    focus={searchShowed}
                    disabled={true}
                    placeholder={t('header.search.placeholder')}
                    scene={'GlobalSearch'}
                  />
                  <Toggle onClick={onSearchClose} isActive={searchShowed} />
                </Container>
              </div>
            </Fade>
          </div>
        </ClickAwayListener>

        <ClickAwayListener onClickAway={onClickAwayNav}>
          <div>
            <Toggle
              onClick={mobileNavShowed ? onNavClose : onNavOpen}
              isActive={mobileNavShowed}
            />

            <ThemeProvider theme={getTheme(Themes.light)}>
              <Drawer
                className={classes.drawer}
                ModalProps={{
                  BackdropProps: {
                    classes: {
                      root: classes.drawerBackdrop,
                    },
                  },
                }}
                classes={{
                  paperAnchorRight: classes.drawerPaper,
                }}
                elevation={0}
                anchor="right"
                open={mobileNavShowed}
                onClose={onNavClose}
              >
                <Container className={classes.navInner}>
                  <Box mb={5}>
                    <HeaderLinks />

                    {featuresConfig.howItWorkPage && <HeaderLinksSecondary />}
                  </Box>

                  <Box mt="auto" mb={3}>
                    <Button
                      component={RouterLink}
                      className={classes.btnCreate}
                      variant="outlined"
                      to={RoutesConfiguration.CreateNft.generatePath()}
                      fullWidth
                      rounded
                      onClick={onNavClose}
                    >
                      {t('header.create')}
                    </Button>
                  </Box>

                  {!isConnected && (
                    <>
                      <Button
                        onClick={() => {
                          setIsConnectWalletOpen(true);
                        }}
                        loading={loading}
                        fullWidth
                        rounded
                      >
                        {t('header.connect')}
                      </Button>
                    </>
                  )}

                  {isConnected && renderedWallet}

                  <Social mt={5} />
                </Container>
              </Drawer>
            </ThemeProvider>
          </div>
        </ClickAwayListener>
        <WalletModal
          isOpen={isConnectWalletOpen}
          onClose={() => {
            setIsConnectWalletOpen(false);
          }}
        />
      </div>
    </>
  );

  return (
    <header className={classes.root}>
      <Container className={classes.container} maxWidth={false}>
        <Logo />

        {!isXLUp && renderedMobile}
        {isXLUp && renderedDesktop}
      </Container>
    </header>
  );
};
