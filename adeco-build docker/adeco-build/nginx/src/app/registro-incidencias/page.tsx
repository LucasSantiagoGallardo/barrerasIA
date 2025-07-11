const API_URL = process.env.NEXT_PUBLIC_API_URL;
'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import GroupIcon from '@mui/icons-material/Group';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import KeyIcon from '@mui/icons-material/VpnKey';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';

// Tipado
interface Registro {
  ID: number;
  Dni: string;
  Tag: string;
  Tipo?: string;
  Asignado: string;
  company_name: string;
  fecha: string;
}

const columns: GridColDef[] = [
  { field: 'ID', headerName: 'ID', flex: 1 },
  { field: 'Dni', headerName: 'DNI', flex: 1 },
  { field: 'Tag', headerName: 'Tag', flex: 1 },
  { field: 'company_name', headerName: 'Proveedor', flex: 1 },
  { field: 'fecha', headerName: 'Asignado el', flex: 1 },
];

const Registros = () => {
  const apiUrl = API_URL;
  const [pendientes, setPendientes] = useState<Registro[]>([]);
  const [vencidos, setVencidos] = useState<Registro[]>([]);
  

  const fetchDevoluciones = async () => {
    try {
      const res = await fetch(`${apiUrl}/get-devoluciones.php`);
      const data: Registro[] = await res.json();
  
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // quitar hora para comparar solo fecha
  
      const pendientesTemp: Registro[] = [];
      const vencidosTemp: Registro[] = [];
  
      data.forEach((row) => {
        const fechaAsig = new Date(row.fecha);
        const fechaAsigSinHora = new Date(fechaAsig);
        fechaAsigSinHora.setHours(0, 0, 0, 0);
  
        const mismaFecha = fechaAsigSinHora.getTime() === hoy.getTime();
        const hora = fechaAsig.getHours();
  
        if (!mismaFecha || hora >= 22) {
          vencidosTemp.push(row);
        } else {
          pendientesTemp.push(row);
        }
      });
  
      setPendientes(pendientesTemp);
      setVencidos(vencidosTemp);
    } catch (err) {
      console.error('Error al obtener devoluciones:', err);
    }
  };
  




  useEffect(() => {
    fetchDevoluciones();
  }, []);

  const cards = [
    {
      title: 'Pendientes (antes de las 22:00)',
      value: pendientes.length,
      icon: <KeyIcon style={{ fontSize: 40, color: '#2196f3' }} />,
      bgColor: '#e3f2fd',
    },
    {
      title: 'Vencidos (después de las 22:00)',
      value: vencidos.length,
      icon: <AssignmentLateIcon style={{ fontSize: 40, color: '#f44336' }} />,
      bgColor: '#ffebee',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" mb={2}>Gestión de Devoluciones</Typography>
      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card style={{ backgroundColor: card.bgColor }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  {card.icon}
                  <Box>
                    <Typography variant="h6">{card.title}</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {card.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>Pendientes (hasta las 22:00)</Typography>
        <DataGrid
          rows={pendientes}
          columns={columns}
          paginationModel={{ pageSize: 10, page: 0 }}
          getRowId={(row) => row.ID}
        />
      </Box>

      <Box mt={5}>
        <Typography variant="h6" gutterBottom color="error">Vencidos (después de las 22:00)</Typography>
        <DataGrid
          rows={vencidos}
          columns={columns}
          paginationModel={{ pageSize: 10, page: 0 }}
          getRowId={(row) => row.ID}
        />
      </Box>
    </Box>
  );
};

export default Registros;
