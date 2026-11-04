import type { AppProps } from 'next/app';
import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import '../src/App.css';
import { HelmetProvider } from 'react-helmet-async';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { wagmiConfig } from '../src/config/wagmi';
import { novaFiRainbowKitTheme } from '../src/config/rainbowkitTheme';
import App from '../src/App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <HelmetProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={novaFiRainbowKitTheme} modalSize="compact">
            <App>
              <Component {...pageProps} />
            </App>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </HelmetProvider>
  );
}
