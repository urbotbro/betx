import { http, cookieStorage, createConfig, createStorage } from 'wagmi';
import { bsc, bscTestnet, mainnet } from 'wagmi/chains';

export const config = createConfig({
  chains: [bscTestnet, bsc, mainnet],
  transports: {
    [bscTestnet.id]: http(), // public RPC (ডেমো). প্রোডাকশনে নির্ভরযোগ্য RPC দাও।
    [bsc.id]: http(),
    [mainnet.id]: http(),
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
});
