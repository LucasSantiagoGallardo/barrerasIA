'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { truncate } from 'fs/promises';

interface AccessData {
  ID_Access_Point: string | number;
  Event_Date?: string;
  Name?: string;
  Last_Name?: string;
  Type_Mov?: string;
  Allowed?: boolean;
  ID_key?: string;
}

const AccessHistory = () => {
  const [accessData, setAccessData] = useState<AccessData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost/adeco/api/get-access-hist.php');
        const data = await response.json();

        // Añade la propiedad Allowed dinámicamente
        const updatedData = data.map((row: AccessData) => ({
          ...row,
          Allowed: row.Type_Mov === 'IN' || row.Type_Mov === 'OUT', // Personaliza según tu lógica
        }));

        setAccessData(updatedData);
      } catch (error) {
        console.error('Error fetching access history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar por barrera
  const barrier1Data = accessData.filter(
    (row) => row.ID_Access_Point === '1' || row.ID_Access_Point === '2'
  );
  const barrier2Data = accessData.filter(
    (row) => row.ID_Access_Point === '3' || row.ID_Access_Point === '4'
  );

  // Configuración de columnas
  const columns: GridColDef[] = [
    { field: 'Event_Date', headerName: 'Fecha y Hora', width: 200 },
    { field: 'Name', headerName: 'Nombre', width: 150 },
    { field: 'Last_Name', headerName: 'Apellido', width: 150 },
    { field: 'ID_key', headerName: 'Llave', width: 150 },
    {
      field: 'Type_Mov',
      headerName: 'Movimiento',
      width: 150,
      renderCell: (params) =>
        params.row.Type_Mov === 'IN' ? (
          <Box display="flex" alignItems="center" color="green">
            <ArrowUpwardIcon />
            <Typography ml={1}>Entrada</Typography>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" color="red">
            <ArrowDownwardIcon />
            <Typography ml={1}>Salida</Typography>
          </Box>
        ),
    },
    {
      field: 'Allowed',
      headerName: 'Permitido',
      width: 150,
      renderCell: (params) => (
        <Typography color={true ? 'green' : 'red'}>
          {true ? 'Permitido' : 'No permitido'}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: 9 }}>
      <Typography variant="h4" mb={9}>
        Historial de Accesos
      </Typography>
      <Grid container spacing={12}>
        {/* Barrera 1 */}
        <Grid item xs={12} md={12}>
          <Typography variant="h6" mb={12}>
            Barrera 1 - Entradas y Salidas
          </Typography>
          <Box style={{ height: 400 }}>
            <DataGrid
              rows={barrier1Data.map((row, index) => ({ id: index, ...row }))}
              columns={columns}
              paginationModel={{ pageSize: 5, page: 0 }}
              loading={loading}
            />
          </Box>
        </Grid>
      </Grid>
      <Grid container spacing={12}>
        {/* Barrera 2 */}
        <Grid item xs={12} md={12}>
          <Typography variant="h6" mb={12}>
            Barrera 2 - Entradas y Salidas
          </Typography>
          <Box style={{ height: 400 }}>
            <DataGrid
              rows={barrier2Data.map((row, index) => ({ id: index, ...row }))}
              columns={columns}
              paginationModel={{ pageSize: 5, page: 0 }}
              loading={loading}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccessHistory;
