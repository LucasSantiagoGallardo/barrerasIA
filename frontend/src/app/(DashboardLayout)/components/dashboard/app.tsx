'use client';
import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Divider } from '@mui/material';
import QuickSummary from './QuickSummary';
import KeyStatusChart from './KeyStatusChart';
import RecentUsersTable from './RecentUsersTable';
import AccessHistory from './registros';
import BarriersControl from './barrieControl';
import BuscadorGlobal from './BuscadorGlobal';

const Dashboard2: React.FC = () => {
  const [metrics, setMetrics] = useState({
    active_users: 0,
    total_providers: 0,
    active_keys: 0,
    inactive_keys: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentAccess, setRecentAccess] = useState([]);
  const [expiredTags, setExpiredTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost/adeco/api/get-dashboard-metrics.php');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    const fetchRecentUsers = async () => {
      try {
        const response = await fetch('http://localhost/adeco/api/get-recent-users.php');
        const data = await response.json();
        setRecentUsers(data);
      } catch (error) {
        console.error('Error fetching recent users:', error);
      }
    };

    const fetchRecentAccess = async () => {
      try {
        const response = await fetch('http://localhost/adeco/api/get-recent-access.php');
        const data = await response.json();
        setRecentAccess(data);
      } catch (error) {
        console.error('Error fetching access history:', error);
      }
    };

    const fetchExpiredTags = async () => {
      try {
        const response = await fetch('http://localhost/adeco/api/get-expired-tags.php');
        const data = await response.json();
        setExpiredTags(data);
      } catch (error) {
        console.error('Error fetching expired tags:', error);
      }
    };

    setLoading(true);
    Promise.all([
      fetchMetrics(),
      fetchRecentUsers(),
      fetchRecentAccess(),
      fetchExpiredTags()
    ]).then(() => setLoading(false));
  }, []);

  const pieData = [
    { name: 'Activas', value: metrics.active_keys },
    { name: 'Inactivas', value: metrics.inactive_keys },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Panel de Control - Sistema de Accesos
      </Typography>
      <BuscadorGlobal />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <QuickSummary metrics={metrics} />
        </Grid>

        <Grid item xs={12}>
          <BarriersControl />
        </Grid>

        <Grid item xs={12} md={4}>
          <KeyStatusChart data={pieData} />
        </Grid>

        <Grid item xs={12} md={8}>
          <RecentUsersTable users={recentUsers} loading={loading} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Últimos Accesos
          </Typography>
          {/* Aquí se puede renderizar un componente AccessList o usar un DataGrid */}
          <pre>{JSON.stringify(recentAccess, null, 2)}</pre>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Tags Vencidos
          </Typography>
          {/* Aquí se puede renderizar un componente TagAlertTable */}
          <pre>{JSON.stringify(expiredTags, null, 2)}</pre>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" fontWeight="medium" mb={1}>
            Historial de Accesos Completo
          </Typography>
          <AccessHistory />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard2;
  1 