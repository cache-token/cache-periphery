import { HashRouter, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Container } from '@mui/material';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, lightTheme, RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { polygon } from 'wagmi/chains'
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

import { IAppConfig } from './models/Base';
import { getAppConfig } from './helpers/Utilities';
import Sign from './components/Sign';

const config: IAppConfig = getAppConfig();

const theme = createTheme({
  palette: {
    primary: {
      main: '#0e76fd',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F7B600',
      contrastText: '#000000',
    }
  },
  typography: {
    fontFamily: [
      'Ubuntu',
      'sans-serif'
    ].join(','),
  }
});

const { chains, provider } = configureChains(
  [polygon],
  [
    alchemyProvider({ apiKey: config.alchemyKey }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'CGT Widget',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
});

const rainbowDarkTheme: Theme = {
  ...lightTheme({
    borderRadius: 'small'
  }),
  colors: {
    ...lightTheme().colors
  } as any
};

function App() {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={rainbowDarkTheme}>
        <ThemeProvider theme={theme}>
          <Container sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center',
            minHeight: '100vh',
            width: '100%'
          }}>
            <HashRouter>
              <Routes>
                <Route path="/" element={
                  <Sign />
                } />
              </Routes>
            </HashRouter>
          </Container>
        </ThemeProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;

(window as any).ethereum?.on('chainChanged', () => {
  window.location.reload();
});
