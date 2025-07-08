import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Height } from '@mui/icons-material';

interface RecentUsersTableProps {
  users: { id: number; Dni: string; Name: string; Active: string }[];
  loading: boolean;
}

const RecentUsersTable: React.FC<RecentUsersTableProps> = ({ users, loading }) => {
  const columns = [
    { field: 'Dni', headerName: 'Dni', width: 100 },
    { field: 'Name', headerName: 'Nombre', width: 100 },
    {field: 'Last_Name', headerName:'Apellido', width: 100},
    {field: 'patente', headerName:'patente', width: 100},
    { field: 'barrera', headerName: 'barrera', width: 100 },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={2}>
          Ultimos Usuarios Creados
        </Typography>
        <Box style={{ Height: 250 }}>
          <DataGrid
            rows={users}
            columns={columns}
            loading={loading}
          
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } },
            }}
            pageSizeOptions={[5, 10, 20]}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecentUsersTable;
