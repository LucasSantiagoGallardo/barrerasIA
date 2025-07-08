import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import KeyIcon from '@mui/icons-material/VpnKey';
import ErrorIcon from '@mui/icons-material/Error';

interface QuickSummaryProps {
  metrics: {
    active_users: number;
    total_providers: number;
    active_keys: number;
    inactive_keys: number;
  };
}

const QuickSummary: React.FC<QuickSummaryProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Usuarios Activos',
      value: metrics.active_users,
      icon: <GroupIcon style={{ fontSize: 40, color: '#4caf50' }} />,
      bgColor: '#e8f5e9', // Verde claro
    },
    {
      title: 'Proveedores',
      value: metrics.total_providers,
      icon: <BusinessIcon style={{ fontSize: 40, color: '#2196f3' }} />,
      bgColor: '#e3f2fd', // Azul claro
    },
    {
      title: 'Llaves Activas',
      value: metrics.active_keys,
      icon: <KeyIcon style={{ fontSize: 40, color: '#ffc107' }} />,
      bgColor: '#fff8e1', // Amarillo claro
    },
    {
      title: 'Llaves Caducadas',
      value: metrics.inactive_keys,
      icon: <ErrorIcon style={{ fontSize: 40, color: '#f44336' }} />,
      bgColor: '#ffebee', // Rojo claro
    },
  ];

  return (
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
  );
};

export default QuickSummary;
