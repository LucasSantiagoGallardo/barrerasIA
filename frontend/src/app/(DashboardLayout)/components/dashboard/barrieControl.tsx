'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Container,
  FormControlLabel,
  Checkbox
} from '@mui/material';

interface LectorEstado {
  conectado: boolean;
  ultimo_uid: string | null;
  error: boolean;
}

const API_BASE_URL = 'http://192.168.182.40:8000/barrera-control';
const API_BASE= 'http://192.168.182.40:8000';
const barriers = [
  { name: 'Barrera Tambo 1 in', endpoint: 'tambo1_in', disabled: false },
  { name: 'Barrera Tambo 1 out', endpoint: 'tambo1_out', disabled: false },
  { name: 'Barrera Tambo 2 in', endpoint: 'tambo2_in', disabled: false },
  { name: 'Barrera Tambo 2 out', endpoint: 'tambo2_out', disabled: false },
  { name: 'Portón Carmen', endpoint: 'carmen', disabled: true },
  { name: 'Lote 39', endpoint: 'lote39', disabled: true },
];

const BarriersControl: React.FC = () => {
  const [estadoLectores, setEstadoLectores] = useState<Record<string, LectorEstado>>({});

  useEffect(() => {
    const fetchEstado = () => {
      fetch(`${API_BASE}/estado-lectores`)

        .then(res => res.json())
        .then(data => setEstadoLectores(data))
        .catch(err => console.error("Error al obtener estado de lectores:", err));
    };

    fetchEstado();
    const interval = setInterval(fetchEstado, 2000); // cada 2 segundos

    return () => clearInterval(interval);
  }, []);

  const handleBarrierAction = (endpoint: string, action: 'open' | 'closed') => {
    fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint, action }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Respuesta de la API:', data);
      })
      .catch((error) =>
        console.error(`Error al ${action === 'open' ? 'abrir' : 'cerrar'} la barrera ${endpoint}:`, error)
      );
  };

  return (
    <Container>
      <Typography variant="h4" mb={4} align="center">
        Control de Barreras
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {barriers.map((barrier) => (
          <Grid item xs={12} sm={6} md={3} key={barrier.endpoint}>
            <Card>
              <CardContent>
                <Typography variant="h6" align="center">{barrier.name}</Typography>

                <Box display="flex" justifyContent="center" mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleBarrierAction(barrier.endpoint, 'open')}
                    disabled={barrier.disabled}
                  >
                    Abrir
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleBarrierAction(barrier.endpoint, 'closed')}
                    style={{ marginLeft: '10px' }}
                    disabled={barrier.disabled}
                  >
                    Cerrar
                  </Button>
                </Box>

                <Box mt={2}>
                  {estadoLectores[barrier.endpoint]?.conectado ? (
                    <Typography variant="body2" color="green">🟢 Conectado</Typography>
                  ) : (
                    <Typography variant="body2" color="red">🔴 Desconectado</Typography>
                  )}
                  {estadoLectores[barrier.endpoint]?.ultimo_uid && (
                    <Typography variant="body2">Último tag: {estadoLectores[barrier.endpoint]?.ultimo_uid}</Typography>
                  )}
                  {estadoLectores[barrier.endpoint]?.error && (
                    <Typography variant="body2" color="orange">⚠️ Error de lectura</Typography>
                  )}
                </Box>

                <Box>
                  <FormControlLabel
                    label=""
                    control={
                      <Checkbox
                        value=""
                        color="primary"
                      />
                    }
                  />
                </Box>

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default BarriersControl;
