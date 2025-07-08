'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

interface HistoryItem {
  Event_Date: string;
  Type_Mov: 'IN' | 'OUT';
  ID_Access_Point: string;
  Name?: string;
  Last_Name?: string;
}

const Detalles = () => {
  const { Dni } = useParams();
  const [history, setHistory] = useState<HistoryItem[]>([]); // Inicializado como array vacío
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalEntries: 0,
    totalExits: 0,
    tambo1Entries: 0,
    tambo1Exits: 0,
    tambo2Entries: 0,
    tambo2Exits: 0,
    timeInTambo1: '00:00',
    timeInTambo2: '00:00',
  });
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    if (Dni) {
      fetchData();
    }
  }, [Dni]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost/adeco/api/details.php?dni=${Dni}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setHistory(data);
        calculateStatistics(data);
        calculateTrends(data);
      } else {
        console.error('Unexpected data format:', data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data: HistoryItem[]) => {
    const stats = {
      totalEntries: 0,
      totalExits: 0,
      tambo1Entries: 0,
      tambo1Exits: 0,
      tambo2Entries: 0,
      tambo2Exits: 0,
      timeInTambo1: 0,
      timeInTambo2: 0,
    };

    data.forEach((row, index) => {
      if (row.Type_Mov === 'IN') stats.totalEntries++;
      if (row.Type_Mov === 'OUT') stats.totalExits++;

      if (row.ID_Access_Point === '1' && row.Type_Mov === 'IN') stats.tambo1Entries++;
      if (row.ID_Access_Point === '2' && row.Type_Mov === 'OUT') {
        stats.tambo1Exits++;
        if (
          data[index - 1]?.ID_Access_Point === '1' &&
          data[index - 1].Type_Mov === 'IN'
        ) {
          const entryTime = dayjs(data[index - 1].Event_Date, 'DD/MM/YYYY HH:mm');
          const exitTime = dayjs(row.Event_Date, 'DD/MM/YYYY HH:mm');
          stats.timeInTambo1 += exitTime.diff(entryTime, 'minute');
        }
      }

      if (row.ID_Access_Point === '3' && row.Type_Mov === 'IN') stats.tambo2Entries++;
      if (row.ID_Access_Point === '4' && row.Type_Mov === 'OUT') {
        stats.tambo2Exits++;
        if (
          data[index - 1]?.ID_Access_Point === '3' &&
          data[index - 1].Type_Mov === 'IN'
        ) {
          const entryTime = dayjs(data[index - 1].Event_Date, 'DD/MM/YYYY HH:mm');
          const exitTime = dayjs(row.Event_Date, 'DD/MM/YYYY HH:mm');
          stats.timeInTambo2 += exitTime.diff(entryTime, 'minute');
        }
      }
    });

    setStatistics({
      ...stats,
      timeInTambo1: formatTime(stats.timeInTambo1),
      timeInTambo2: formatTime(stats.timeInTambo2),
    });
  };

  const calculateTrends = (data: HistoryItem[]) => {
    const groupedByDay = data.reduce((acc, row) => {
      const day = dayjs(row.Event_Date, 'DD/MM/YYYY').format('DD/MM/YYYY');
      acc[day] = acc[day] || { day, entries: 0, exits: 0 };
      if (row.Type_Mov === 'IN') acc[day].entries++;
      if (row.Type_Mov === 'OUT') acc[day].exits++;
      return acc;
    }, {});

    setTrendData(Object.values(groupedByDay));
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(history);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial');
    XLSX.writeFile(workbook, `Historial_${Dni}.xlsx`);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        Historial de Detalles - DNI: {Dni}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Estadísticas Generales</Typography>
              <Typography>Total Entradas: {statistics.totalEntries}</Typography>
              <Typography>Total Salidas: {statistics.totalExits}</Typography>
              <Typography>Total Entradas Tambo1: {statistics.tambo1Entries}</Typography>
              <Typography>Total Salidas Tambo1: {statistics.tambo1Exits}</Typography>
              <Typography>Total Entradas Tambo2: {statistics.tambo2Entries}</Typography>
              <Typography>Total Salidas Tambo2: {statistics.tambo2Exits}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Tendencia de Accesos
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="entries" fill="#82ca9d" name="Entradas" />
                  <Bar dataKey="exits" fill="#ff7979" name="Salidas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box mt={4}>
        <Typography variant="h6" mb={2}>
          Tabla de Historial
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={exportToExcel}
          sx={{ mb: 2 }}
        >
          Exportar a Excel
        </Button>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Movimiento</TableCell>
                <TableCell>Barrera</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Apellido</TableCell>
                <TableCell>#</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.length > 0 ? (
                history.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.Event_Date}</TableCell>
                    <TableCell>
                      {row.Type_Mov === 'IN' ? 'Entrada' : 'Salida'}
                    </TableCell>
                    <TableCell>
                      {row.ID_Access_Point === '1' || row.ID_Access_Point === '2'
                        ? 'Tambo1'
                        : 'Tambo2'}
                    </TableCell>
                    <TableCell>{row.Name}</TableCell>
                    <TableCell>{row.Last_Name}</TableCell>
                    <TableCell>
                      {row.Type_Mov === 'IN' ? (
                        <ArrowUpward style={{ color: 'green' }} />
                      ) : (
                        <ArrowDownward style={{ color: 'red' }} />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay datos disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Detalles;
