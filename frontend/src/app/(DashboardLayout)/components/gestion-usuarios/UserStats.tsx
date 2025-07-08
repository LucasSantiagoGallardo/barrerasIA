'use client';
import { Card, CardContent, Typography } from '@mui/material';

const UserStats = () => {
  const stats = {
    totalUsers: 50,
    admins: 5,
    operators: 10,
    activeUsers: 45,
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold">
          Estadísticas de Usuarios
        </Typography>
        <Typography variant="body1">Total de Usuarios: {stats.totalUsers}</Typography>
        <Typography variant="body1">Administradores: {stats.admins}</Typography>
        <Typography variant="body1">Operadores: {stats.operators}</Typography>
        <Typography variant="body1">Usuarios Activos: {stats.activeUsers}</Typography>
      </CardContent>
    </Card>
  );
};

export default UserStats;
