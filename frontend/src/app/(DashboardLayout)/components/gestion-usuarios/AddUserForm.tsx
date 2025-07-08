'use client';
import { Box, TextField, Button, Grid } from '@mui/material';

const AddUserForm = () => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Usuario agregado');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Nombre" required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Correo Electrónico" required />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Nivel de Acceso" required />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            Agregar Usuario
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddUserForm;
