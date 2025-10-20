'use client';

import { useSDK } from '@metamask/sdk-react';
import { useState } from 'react';

interface WalletConnectProps {
  onConnect: (connected: boolean) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const { sdk, connected, connecting, account } = useSDK();
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    try {
      await sdk?.connect();
      setIsConnected(true);
      onConnect(true);
    } catch (err) {
      console.warn('failed to connect..', err);
    }
  };

  const disconnect = async () => {
    try {
      await sdk?.disconnect();
      setIsConnected(false);
      onConnect(false);
    } catch (err) {
      console.warn('failed to disconnect..', err);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {connected ? (
        <div className="flex items-center gap-4">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg">
            Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
          </div>
          <button
            onClick={disconnect}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          disabled={connecting}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-6 py-2 rounded-lg transition-colors"
        >
          {connecting ? 'Connecting...' : 'Connect MetaMask'}
        </button>
      )}
    </div>
  );
}
