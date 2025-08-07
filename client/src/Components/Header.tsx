import React from 'react'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Logo from "../Assets/diim_logo.png"

function Header() {
return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <a href="https://sy1990.github.io/diim-lab/" target="_blank">
            <img
              src={Logo}
              alt="Logo"
              style={{ maxWidth: 120, maxHeight: 120, marginRight: 16 }}
            />
          </a>
          <Typography
            variant="h5"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'flex' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'primary.contrastText',
              textDecoration: 'none',
            }}
          >
            Digital Twin Dashboard
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header
