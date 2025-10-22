'use client';

import { useSDK } from '@metamask/sdk-react';
import { useState } from 'react';

interface WalletConnectProps {
  onConnect: (connected: boolean, address?: string) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const { sdk, connected, connecting, account } = useSDK();
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    try {
      await sdk?.connect();
      setIsConnected(true);
      onConnect(true, account || undefined);
    } catch (err) {
      console.warn('failed to connect..', err);
    }
  };

  const disconnect = async () => {
    try {
      // await sdk?.disconnect();
      await sdk?.terminate();
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
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="font-medium">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </span>
          </div>
          <button
            onClick={disconnect}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 font-medium"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          disabled={connecting}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {connecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Connect MetaMask
            </>
          )}
        </button>
      )}
    </div>
  );
}
