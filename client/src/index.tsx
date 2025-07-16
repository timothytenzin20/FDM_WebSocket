import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { StyledEngineProvider } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';
import { ThemeProvider } from '@mui/material/styles';
import Theme from "./Components/Theme"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StyledEngineProvider enableCssLayer>
      <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
      <ThemeProvider theme={Theme}>
      <App/>
      </ThemeProvider>

    </StyledEngineProvider>
  </React.StrictMode>,
);
