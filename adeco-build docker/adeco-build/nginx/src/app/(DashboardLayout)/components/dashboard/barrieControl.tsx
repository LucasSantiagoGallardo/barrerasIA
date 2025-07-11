import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CardActions, Button, Snackbar } from '@mui/material';

const API_URL = process.env.NEXT_PUBLIC_FASTAPI_URL;

export default function BarrieControl() {
  const [barriers, setBarriers] = useState([]);
  const [estados, setEstados] = useState({});
  const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'info'});

  useEffect(() => {
    fetch(`${API_URL}/lectores`)
      .then(res => res.json())
      .then(data => setBarriers(data));

    const interval = setInterval(fetchEstados, 5000);
    fetchEstados();
    return () => clearInterval(interval);
  }, []);

  const fetchEstados = () => {
    fetch(`${API_URL}/lectores/estados`)
      .then(res => res.json())
      .then(data => setEstados(data));
  };

  const handleAction = (lector, action) => {
    fetch(`${API_URL}/lectores/${lector.id}/${action}`, {method: 'POST'})
      .then(res => res.ok ? setSnackbar({open: true, message: `Barrera ${action}da!`, severity: 'success'}) :
        setSnackbar({open: true, message: `Error al ${action} barrera`, severity: 'error'}));
    fetchEstados();
  };

  return (
    <Box>
      <Typography variant="h4" mb={2}>Control de Barreras</Typography>
      <Box display="flex" flexWrap="wrap" gap={2}>
        {barriers.map(barrier => (
          <Card key={barrier.id} sx={{width: 300}}>
            <CardContent>
              <Typography variant="h6">{barrier.nombre}</Typography>
              <Typography>IP: {barrier.ip}:{barrier.port}</Typography>
              <Typography color={estados[barrier.id]?.conectado ? 'green' : 'red'}>
                Estado: {estados[barrier.id]?.conectado ? 'Conectado' : 'Desconectado'}
              </Typography>
              <Typography>
                Último tag: {estados[barrier.id]?.ultimo_uid ?? '---'}
              </Typography>
              {estados[barrier.id]?.error && (
                <Typography color="error">Error en lectura</Typography>
              )}
            </CardContent>
            <CardActions>
              <Button onClick={() => handleAction(barrier, 'abrir')} color="success" variant="contained">Abrir</Button>
              <Button onClick={() => handleAction(barrier, 'cerrar')} color="primary" variant="outlined">Cerrar</Button>
            </CardActions>
          </Card>
        ))}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({...s, open: false}))}
        message={snackbar.message}
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
      />
    </Box>
  );
}
