import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import { useLayout } from 'modules/layout/hooks/useLayout';
import { useCallback, useState } from 'react';

export function useWalletDropdown() {
  const [isOpen, setOpen] = useState(false);
  const { disconnect } = useReactWeb3();
  const { toggleNav, mobileNavShowed } = useLayout();

  const handleClose = useCallback(() => {
    if (isOpen) {
      setOpen(false);
    }

    if (mobileNavShowed) {
      toggleNav(false);
    }
  }, [isOpen, mobileNavShowed, toggleNav]);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleDisconnect = useCallback(() => {
    disconnect()?.finally(() => {
      localStorage.clear();
      setOpen(false);
    });
  }, [disconnect]);

  return {
    isOpened: isOpen,
    handleDisconnect,
    handleClose,
    handleOpen,
  };
}
