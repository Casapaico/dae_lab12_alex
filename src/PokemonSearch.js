import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Chip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Pagination,
  Avatar,
} from '@mui/material';
import { Search, Height, FitnessCenter } from '@mui/icons-material';
import { debounce } from 'lodash';
import axios from 'axios';
import './App.css';

const PokemonSearch = () => {
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weightRange, setWeightRange] = useState([0, 1000]);
  const [heightRange, setHeightRange] = useState([0, 100]);
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Cargar todos los Pokémon
  useEffect(() => {
    const fetchAllPokemons = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const pokemonList = response.data.results;
        
        // Obtener detalles de cada Pokémon
        const pokemonDetails = await Promise.all(
          pokemonList.map(async (pokemon) => {
            try {
              const detailResponse = await axios.get(pokemon.url);
              return detailResponse.data;
            } catch (error) {
              console.error(`Error fetching details for ${pokemon.name}:`, error);
              return null;
            }
          })
        );
        
        const validPokemons = pokemonDetails.filter(pokemon => pokemon !== null);
        setPokemons(validPokemons);
        setFilteredPokemons(validPokemons);
      } catch (error) {
        setError('Error al cargar los Pokémon');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPokemons();
  }, []);

  // Función de búsqueda con debounce
  const debouncedSearch = useCallback(
    debounce((term, allPokemons, weight, height, type) => {
      let filtered = allPokemons;

      // Filtro por nombre
      if (term) {
        filtered = filtered.filter(pokemon =>
          pokemon.name.toLowerCase().includes(term.toLowerCase())
        );
      }

      // Filtro por peso
      filtered = filtered.filter(pokemon =>
        pokemon.weight >= weight[0] && pokemon.weight <= weight[1]
      );

      // Filtro por altura
      filtered = filtered.filter(pokemon =>
        pokemon.height >= height[0] && pokemon.height <= height[1]
      );

      // Filtro por tipo
      if (type) {
        filtered = filtered.filter(pokemon =>
          pokemon.types.some(t => t.type.name === type)
        );
      }

      // Ordenar alfabéticamente
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      
      setFilteredPokemons(filtered);
      setCurrentPage(1);
    }, 300),
    []
  );

  // Aplicar filtros cuando cambien los criterios
  useEffect(() => {
    debouncedSearch(searchTerm, pokemons, weightRange, heightRange, typeFilter);
  }, [searchTerm, pokemons, weightRange, heightRange, typeFilter, debouncedSearch]);

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPokemons = filteredPokemons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPokemons.length / itemsPerPage);

  // Tipos únicos para el filtro
  const uniqueTypes = [...new Set(pokemons.flatMap(pokemon => 
    pokemon.types.map(type => type.type.name)
  ))].sort();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando Pokémon...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Barra de búsqueda y filtros */}
      <Card sx={{ mb: 3, p: 2 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            {/* Búsqueda por nombre */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Buscar Pokémon"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                placeholder="Escribe para buscar en tiempo real..."
              />
            </Grid>

            {/* Filtro por tipo */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={typeFilter}
                  label="Tipo"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {uniqueTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Filtro por peso */}
            <Grid item xs={12} md={3}>
              <Box>
                <Typography gutterBottom>
                  <FitnessCenter sx={{ fontSize: 16, mr: 1 }} />
                  Peso: {weightRange[0]} - {weightRange[1]} kg
                </Typography>
                <Slider
                  value={weightRange}
                  onChange={(_, newValue) => setWeightRange(newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={1000}
                  step={10}
                />
              </Box>
            </Grid>

            {/* Filtro por altura */}
            <Grid item xs={12} md={3}>
              <Box>
                <Typography gutterBottom>
                  <Height sx={{ fontSize: 16, mr: 1 }} />
                  Altura: {heightRange[0]} - {heightRange[1]} dm
                </Typography>
                <Slider
                  value={heightRange}
                  onChange={(_, newValue) => setHeightRange(newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                  step={1}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Información de resultados */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          {filteredPokemons.length} Pokémon encontrados
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Página {currentPage} de {totalPages}
        </Typography>
      </Box>

      {/* Grid de Pokémon */}
      <Grid container spacing={2}>
        {currentPokemons.map((pokemon) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={pokemon.id}>
            <Card 
              className="pokemon-card"
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  src={pokemon.sprites.front_default}
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mx: 'auto',
                    mb: 2,
                    backgroundColor: '#f5f5f5'
                  }}
                  variant="rounded"
                />
                
                <Typography 
                  variant="h6" 
                  component="h2"
                  sx={{ 
                    fontWeight: 'bold',
                    textTransform: 'capitalize',
                    mb: 1
                  }}
                >
                  {pokemon.name}
                </Typography>

                <Typography 
                  variant="body2" 
                  color="textSecondary"
                  sx={{ mb: 2 }}
                >
                  # {pokemon.id.toString().padStart(3, '0')}
                </Typography>

                {/* Tipos */}
                <Box sx={{ mb: 2 }}>
                  {pokemon.types.map((typeInfo) => (
                    <Chip
                      key={typeInfo.type.name}
                      label={typeInfo.type.name}
                      size="small"
                      sx={{ 
                        mx: 0.5,
                        textTransform: 'capitalize',
                        backgroundColor: getTypeColor(typeInfo.type.name),
                        color: 'white'
                      }}
                    />
                  ))}
                </Box>

                {/* Estadísticas */}
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                  <Box textAlign="center">
                    <FitnessCenter fontSize="small" color="action" />
                    <Typography variant="body2">
                      {pokemon.weight} kg
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Height fontSize="small" color="action" />
                    <Typography variant="body2">
                      {pokemon.height} dm
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Paginación */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, value) => setCurrentPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {filteredPokemons.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No se encontraron Pokémon que coincidan con los criterios de búsqueda.
        </Alert>
      )}
    </Box>
  );
};

// Función para obtener colores según el tipo de Pokémon
const getTypeColor = (type) => {
  const colors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
  };
  return colors[type] || '#68A090';
};

export default PokemonSearch;