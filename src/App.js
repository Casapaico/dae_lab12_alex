import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography, Box } from '@mui/material';
import PokemonSearch from './PokemonSearch';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Container maxWidth="lg">
          <Box sx={{ 
            textAlign: 'center', 
            my: 4,
            padding: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            color: 'white'
          }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Pokédex Explorer
            </Typography>
            <Typography variant="h6" component="p">
              Busca y explora todos los Pokémon con filtros avanzados
            </Typography>
          </Box>
          
          <PokemonSearch />
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;