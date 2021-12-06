import React from 'react';
import Box from '@material-ui/core/Box';
import { ButtonProps } from '@material-ui/core/Button';
import { Button } from 'modules/uiKit/Button';
import { useWalletsItemStyles } from './WalletItemStyles';
import { WalletName } from '@solana/wallet-adapter-wallets';

interface props extends ButtonProps {
  name: WalletName;
}
export default function WalletItem({ name, ...restProps }: props) {
  const classes = useWalletsItemStyles();
  const disabled = Boolean(
    name === WalletName.Phantom && !Boolean((window as any)?.solana?.isPhantom),
  );
  return (
    <Box
      display="flex"
      flexDirection="col"
      justifyContent="center"
      className={classes.root}
    >
      {/* <Tooltip title="uninstall" arrow placement="top"> */}
      <Button
        disabled={disabled}
        classes={{
          root: classes.button,
          label: classes.buttonLabel,
        }}
        fullWidth
        variant="outlined"
        {...restProps}
      >
        <span>
          {name} {disabled ? '(uninstall)' : ''}
        </span>
      </Button>
      {/* </Tooltip> */}
    </Box>
  );
}
