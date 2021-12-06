import { Grid } from '@material-ui/core';
import { Button } from 'modules/uiKit/Button/Button';
import { useArtListStyles } from '../useArtListStyles';
import { ReactComponent as BannerSvg } from '../assets/bannerSvg.svg';

export const TopBanner = () => {
  const classes = useArtListStyles();

  return (
    <Grid container className={classes.topBanner}>
      <Grid item xs={8} className={classes.bannerLeft}>
        <p>
          Ready to create? Please submit
          <br /> your whitelist application
          <br /> through:  
        </p>
        <Button
          rounded
          href="https://docs.google.com/forms/d/e/1FAIpQLSchj7pxEr9z7JfzrMNLmnrhCDzAJGcv4sag_8mmSi5YpbRPyw/viewform?usp=sf_link"
          target="_Blank"
        >
          Application
        </Button>
      </Grid>

      <Grid item xs={4} className={classes.bannerRight}>
        <BannerSvg />
      </Grid>
    </Grid>
  );
};
