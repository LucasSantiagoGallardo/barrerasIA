'use client';

import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Grid, TextField, Divider
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import KeyIcon from '@mui/icons-material/VpnKey';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Registro = {
  id: number;
  fecha: string;
  hora: string;
  nombre: string;
  apellido: string;
  dni: string;
  empresa: string;
  llave: string;
  patente: string;
  barrera: string;
};

export default function RegistrosAccesoDashboard() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [filtro, setFiltro] = useState<string>("");
  const [filtered, setFiltered] = useState<Registro[]>([]);

  // Cards resumen
  const [totalAccesos, setTotalAccesos] = useState(0);
  const [totalLlaves, setTotalLlaves] = useState(0);
  const [totalEmpresas, setTotalEmpresas] = useState(0);
  const [totalPatentes, setTotalPatentes] = useState(0);
  const filteredUnicos = [];
  const seen = new Set();
  filtered.forEach(r => {
    const clave = `${r.dni}_${r.llave}_${r.patente}`;
    if (!seen.has(clave)) {
      seen.add(clave);
      filteredUnicos.push(r);
    }
  });
  // Fetch registros
  useEffect(() => {
    fetch(`${API_URL}/get_registros.php`)
      .then((res) => res.json())
      .then((data) => {
        // Suponemos que el backend ya devuelve registros con estos campos
        setRegistros(data);
        setFiltered(data);
        setTotalAccesos(data.length);
        setTotalLlaves(new Set(data.map((r: Registro) => r.llave)).size);
        setTotalEmpresas(new Set(data.map((r: Registro) => r.empresa)).size);
        setTotalPatentes(new Set(data.map((r: Registro) => r.patente)).size);
      });
  }, []);

  // Filtrado en tiempo real
  useEffect(() => {
    if (!filtro.trim()) {
      setFiltered(registros);
      return;
    }
    const val = filtro.trim().toLowerCase();
    setFiltered(registros.filter(r =>
      (r.llave || "").toLowerCase().includes(val) ||
      (r.empresa || "").toLowerCase().includes(val) ||
      (r.dni || "").toLowerCase().includes(val) ||
      (r.patente || "").toLowerCase().includes(val)
    ));
  }, [filtro, registros]);

  const columns: GridColDef[] = [
    { field: "fecha", headerName: "Fecha", flex: 1 },
    { field: "hora", headerName: "Hora", flex: 1 },
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "apellido", headerName: "Apellido", flex: 1 },
    { field: "dni", headerName: "DNI", flex: 1 },
    { field: "empresa", headerName: "Empresa", flex: 1 },
    { field: "llave", headerName: "Llave", flex: 1 },
    { field: "patente", headerName: "Patente", flex: 1 },
    { field: "barrera", headerName: "Barrera", flex: 1 },
    {
      field: "resultado",
      headerName: "Acceso",
      flex: 1,
      renderCell: (params) => (
        params.row.resultado === "permitido"
          ? <CheckCircleIcon sx={{ color: 'green' }} titleAccess="Permitido" />
          : <CancelIcon sx={{ color: 'red' }} titleAccess="Denegado" />
      )
    } 
  ]

  return (
    <Box sx={{ px: { xs: 0, sm: 2 }, pt: 2 }}>
      {/* Cards resumen */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: "#e9f5e1", boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {totalAccesos}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <LockOpenIcon color="success" />
                <Typography variant="subtitle2">Accesos totales</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: "#e3f2fd", boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {totalLlaves}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <KeyIcon color="primary" />
                <Typography variant="subtitle2">Llaves distintas</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: "#fffde7", boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {totalEmpresas}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <BusinessIcon color="warning" />
                <Typography variant="subtitle2">Empresas</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: "#ede7f6", boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {totalPatentes}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <LocalShippingIcon color="secondary" />
                <Typography variant="subtitle2">Patentes distintas</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Buscador */}
      <Box display="flex" alignItems="center" mb={2} gap={2}>
        <TextField
          fullWidth
          label="Buscar por llave, empresa, DNI o patente"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          InputProps={{
            startAdornment: <KeyIcon sx={{ mr: 1, color: 'grey.500' }} fontSize="small" />,
          }}
        />
      </Box>

      {/* Tabla */}
      <DataGrid
        rows={filtered.map((row, idx) => ({ id: idx + 1, ...row }))}
        columns={columns}
        autoHeight
        sx={{
          borderRadius: 3,
          boxShadow: 1,
          bgcolor: 'background.paper',
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
          fontSize: 15,
        }}
        paginationModel={{ pageSize: 20, page: 0 }}
        getRowId={(row) => row.id}
      />
    </Box>
  );
}
