const API_URL = process.env.NEXT_PUBLIC_API_URL;
'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, TextField } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface Registro {
  id: number;
  Id_Key: string;
  dni: string;
  barrera: string;
  estado: string;
  timestamp: string;
  nombre?: string;
  apellido?: string;
  fechaFormateada?: string | null;
}

export default function RegistrosAcceso() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [filtro, setFiltro] = useState<string>("");

  useEffect(() => {
    fetch(`API_URL/adeco/api/get_registros.php`)
      .then(res => res.json())
      .then(data => {
        const withParsedDates = data.map((item: any, index: number) => {
          const [fecha, hora] = item.timestamp?.split(" ") ?? ["", ""];
          const [y, m, d] = fecha.split("-").map(Number);
          const [h, min, s] = hora.split(":").map(Number);
          const fechaJS = new Date(y, m - 1, d, h, min, s);
          return {
            ...item,
            id: index + 1,
            fechaFormateada: isNaN(fechaJS.getTime()) ? null : fechaJS.toLocaleString(),
          };
        });

        setRegistros(withParsedDates);
      });
  }, []);

  const filtered = registros.filter(r =>
    r.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    r.apellido?.toLowerCase().includes(filtro.toLowerCase()) ||
    r.dni?.includes(filtro) ||
    r.barrera?.toLowerCase().includes(filtro.toLowerCase()) ||
    r.Id_Key?.toLowerCase().includes(filtro.toLowerCase())
  );

  const resumen = {
    b1_permitido: 0,
    b1_denegado: 0,
    b2_permitido: 0,
    b2_denegado: 0,
  };

  filtered.forEach((r) => {
    const barrera = r.barrera?.toLowerCase() || "";
    const estado = r.estado?.toLowerCase();

    const esB1 = barrera.includes("1") || barrera.includes("2");
    const esB2 = barrera.includes("3") || barrera.includes("4");

    if (esB1) {
      estado === "permitido" ? resumen.b1_permitido++ : resumen.b1_denegado++;
    } else if (esB2) {
      estado === "permitido" ? resumen.b2_permitido++ : resumen.b2_denegado++;
    }
  });

  const columns: GridColDef[] = [
    { field: 'nombre', headerName: 'Nombre', width: 130 },
    { field: 'apellido', headerName: 'Apellido', width: 130 },
    { field: 'dni', headerName: 'DNI', width: 130 },
    { field: 'Id_Key', headerName: 'Id-Key', width: 150 },
    { field: 'barrera', headerName: 'Barrera', width: 150 },
    { field: 'estado', headerName: 'Estado', width: 150 },
    {
      field: 'fechaFormateada',
      headerName: 'Fecha/Hora',
      width: 200,
    }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={2}>Registros de Acceso</Typography>

        <TextField
          fullWidth
          placeholder="Buscar por nombre, apellido, DNI, barrera o Id-Key"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          size="small"
          sx={{ mb: 2 }}
        />

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="body2">
            Barrera 1 ➜ Permitido: {resumen.b1_permitido} | No permitido: {resumen.b1_denegado}
          </Typography>
          <Typography variant="body2">
            Barrera 2 ➜ Permitido: {resumen.b2_permitido} | No permitido: {resumen.b2_denegado}
          </Typography>
        </Box>

        <Box style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
