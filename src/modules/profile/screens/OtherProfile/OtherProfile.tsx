import { Container } from '@material-ui/core';
import { useQuery } from '@redux-requests/react';
import { UserRoleEnum } from 'modules/common/actions/queryAccountInfo';
import { QueryLoadingAbsolute } from 'modules/common/components/QueryLoading/QueryLoading';
import { Social } from 'modules/common/components/Social';
import { featuresConfig } from 'modules/common/conts';
import { t } from 'modules/i18n/utils/intl';
import {
  ILikedItem,
  queryLikedItems,
} from 'modules/profile/actions/queryLikedItems';
import { Avatar } from 'modules/profile/components/Avatar';
import { Bio } from 'modules/profile/components/Bio';
import { Header } from 'modules/profile/components/Header';
import { InfoPanel } from 'modules/profile/components/InfoPanel';
import { Subscribers } from 'modules/profile/components/Subscribers';
import { TabPanel } from 'modules/profile/components/TabPanel';
import { Tabs } from 'modules/profile/components/Tabs';
import { Tab } from 'modules/profile/components/Tabs/Tab';
import { ProfileRoutesConfig, ProfileTab } from 'modules/profile/ProfileRoutes';
import { Section } from 'modules/uiKit/Section';
import { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router';
import { uid } from 'react-uid';
import { TabOwned } from '../Profile/components/tabOwned';
import { TabSale } from '../Profile/components/TabSale';
import { useOtherProfileStyles } from './useOtherProfileStyles';
import useProfileInfo from './useProfileInfo';

export const PROFILE_INFO_REQUEST_KEY = '/other';

export const OtherProfile = () => {
  const { tab, address: artAddress } =
    ProfileRoutesConfig.OtherProfile.useParams();

  const classes = useOtherProfileStyles();
  const { push } = useHistory();
  const { data: likedItems } = useQuery<ILikedItem[] | null>({
    type: queryLikedItems.toString(),
  });
  const { data: profileInfo, loading: profileInfoLoading } = useProfileInfo(
    artAddress,
    {},
  );

  console.log('profileInfo', profileInfo);

  const tabs = useMemo(
    () => [
      {
        value: ProfileTab.sells,
        label: t('profile.tabs.my-sells'),
      },
      {
        value: ProfileTab.owned,
        label: t('profile.tabs.showcase'),
      },
      ...(featuresConfig.profileFollowers
        ? [
            {
              value: ProfileTab.following,
              label: t('profile.tabs.following'),
              count: 0,
            },
          ]
        : []),
    ],
    // eslint-disable-next-line
    [likedItems],
  );

  const onTabsChange = useCallback(
    (_, value) => {
      push(ProfileRoutesConfig.OtherProfile.generatePath(artAddress, value));
    },
    [artAddress, push],
  );

  return profileInfoLoading ? (
    <QueryLoadingAbsolute />
  ) : (
    <Section className={classes.root}>
      <Header img={profileInfo?.bgImgUrl} />
      <Container>
        <Avatar
          className={classes.avatar}
          src={profileInfo?.imgUrl}
          isVerified={profileInfo?.identity === UserRoleEnum.Verified}
        />
        <InfoPanel
          withSharing
          name={profileInfo?.username}
          email={profileInfo?.email}
          subscribers={
            featuresConfig.subscribers && (
              <Subscribers count={profileInfo?.followCount} />
            )
          }
          social={
            featuresConfig.profileSocialLinks && (
              <Social
                twitter={profileInfo?.twitter}
                instagram={profileInfo?.instagram}
                facebook={profileInfo?.facebook}
                website={profileInfo?.website}
              />
            )
          }
          // follow={renderFollow()}
          address={artAddress}
        />

        {profileInfo?.bio && <Bio>{profileInfo.bio}</Bio>}

        <Tabs
          className={classes.tabs}
          onChange={onTabsChange as any}
          value={tab}
        >
          {tabs.map(tabProps => (
            <Tab key={uid(tabProps)} {...tabProps} />
          ))}
        </Tabs>

        <TabPanel value={tab} index={ProfileTab.owned}>
          <TabOwned isOther address={artAddress} />
        </TabPanel>

        <TabPanel value={tab} index={ProfileTab.sells}>
          <TabSale isOther address={artAddress} />
        </TabPanel>
      </Container>
    </Section>
  );
};
