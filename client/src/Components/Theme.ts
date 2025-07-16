import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#caccd1ec',
      main: '#333333',
      dark: '#333333',
      contrastText: '#fff', // #797536
    },
  },
});

export default theme;