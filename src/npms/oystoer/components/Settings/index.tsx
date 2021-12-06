import React, { useCallback } from 'react';
import { Button, Select } from 'antd';
import { ENDPOINTS, useConnectionConfig } from '../../contexts/connection';
import { useWalletModal } from '../../contexts';
import { notify, shortenAddress } from '../../utils';
import { CopyOutlined } from '@ant-design/icons';
import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';

export const Settings = ({
  additionalSettings,
}: {
  additionalSettings?: JSX.Element;
}) => {
  const {
    account: publicKey,
    disconnect,
    isConnected: connected,
  } = useReactWeb3();
  const { endpoint, setEndpoint } = useConnectionConfig();
  const { setVisible } = useWalletModal();
  const open = useCallback(() => setVisible(true), [setVisible]);

  return (
    <>
      <div style={{ display: 'grid' }}>
        Network:{' '}
        <Select
          onSelect={setEndpoint}
          value={endpoint}
          style={{ marginBottom: 20 }}
        >
          {ENDPOINTS.map(({ name, endpoint }) => (
            <Select.Option value={endpoint} key={endpoint}>
              {name}
            </Select.Option>
          ))}
        </Select>
        {connected && (
          <>
            <span>Wallet:</span>
            {publicKey && (
              <Button
                style={{ marginBottom: 5 }}
                onClick={async () => {
                  if (publicKey) {
                    await navigator.clipboard.writeText(publicKey.toBase58());
                    notify({
                      message: 'Wallet update',
                      description: 'Address copied to clipboard',
                    });
                  }
                }}
              >
                <CopyOutlined />
                {shortenAddress(publicKey.toBase58())}
              </Button>
            )}

            <Button onClick={open} style={{ marginBottom: 5 }}>
              Change
            </Button>
            <Button
              type="primary"
              onClick={() => disconnect()}
              style={{ marginBottom: 5 }}
            >
              Disconnect
            </Button>
          </>
        )}
        {additionalSettings}
      </div>
    </>
  );
};
