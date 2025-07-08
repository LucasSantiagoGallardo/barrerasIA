'use client';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Nombre', width: 150 },
  { field: 'email', headerName: 'Correo Electrónico', width: 200 },
  { field: 'access', headerName: 'Nivel de Acceso', width: 150 },
];

const rows = [
  { id: 1, name: 'Lucas Pérez', email: 'lucas@example.com', access: 'Administrador' },
  { id: 2, name: 'Ana Gómez', email: 'ana@example.com', access: 'Operador' },
  { id: 3, name: 'Carlos López', email: 'carlos@example.com', access: 'Usuario' },
];

const UserTable = () => {
  return (
    <Box style={{ height: 400, width: '100%' }}>
      <DataGrid rows={rows} columns={columns}  
       paginationModel={{ pageSize: 5, page: 0 }}
      checkboxSelection />
    </Box>
  );
};

export default UserTable;
