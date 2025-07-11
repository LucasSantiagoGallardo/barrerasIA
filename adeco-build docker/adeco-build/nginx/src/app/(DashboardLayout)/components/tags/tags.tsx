const API_URL = process.env.NEXT_PUBLIC_API_URL;
'use client';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    Card,
    CardContent,
    Avatar,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import GroupIcon from '@mui/icons-material/Group';
import LocalOfferIcon from '@mui/icons-material/LocalOffer'; // Icono para calcomanías
import KeyIcon from '@mui/icons-material/VpnKey'; // Icono para llaveros
import AssignmentIcon from '@mui/icons-material/Assignment'; // Icono para asignados
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate'; // Icono para disponibles

interface User {
    ID: number;
    Dni: string ;
    Name: string;
    Apellido: string;
    Patente: string;
    Tag: string;
    Tipo: string;
    Asignado: string;
    Telefono: string;
    Id_Key: string;
    company_name: string;
    isAllowed?: boolean;
    patente?: string;
}

const columns: GridColDef[] = [
    { field: 'ID', headerName: 'ID', flex: 1 },
    { field: 'Dni', headerName: 'Dni', flex: 1 },
    { field: 'Name', headerName: 'Nombre', flex: 1 },
    { field: 'Last_Name', headerName: 'Apellido', flex: 1 },
    { field: 'patente', headerName: 'Patente', flex: 1 },
    { field: 'value', headerName: 'Tag', flex: 1 },
    {
      field: 'tipo',
      headerName: 'Tipo',
      flex: 1,
      renderCell: (params) => {
          const imageUrl = params.value === 'calcomania' ? '/etiqueta.jpg' : '/llavero.jpg';
          return <Avatar src={imageUrl} alt={params.value} />;
      },
  },
  {
    field: 'Asignado',
    headerName: 'Asignado',
    flex: 1,
    renderCell: (params) => {
        return params.row.Dni ? 'Asignado' : 'Disponible';
    },
},];


const Registros = () => {
    const apiUrl = API_URL;
    const [rows, setRows] = useState<User[]>([]);
    const [filteredRows, setFilteredRows] = useState<User[]>([]);
    const [stats, setStats] = useState<any>({}); // stats ahora es un objeto

    const fetchRows = async () => {
        try {
            const response = await fetch(`${apiUrl}/tags.php`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const processedData = data.map((row: User) => ({
                ...row,
                onEdit: (rowToEdit: User) => handleEdit(rowToEdit),
                onDelete: (dni: string) => handleDelete(dni),
            }));
            setRows(processedData);
            setFilteredRows(processedData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(`${apiUrl}/tagscard.php`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setStats(data);
            console.log("Datos de tagscard:", data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchRows();
        fetchStats();
    }, []);

    const cards = [
      {
          title: 'Total Tags',
          value: stats.total || 0,
          icon: <GroupIcon style={{ fontSize: 40, color: '#4caf50' }} />,
          bgColor: '#e8f5e9',
      },
      {
          title: 'Calcomanías',
          value: stats.totalc || 0,
          icon: <LocalOfferIcon style={{ fontSize: 40, color: '#2196f3' }} />,
          bgColor: '#e3f2fd',
      },
      {
          title: 'Llaveros',
          value: stats.totall || 0,
          icon: <KeyIcon style={{ fontSize: 40, color: '#ffc107' }} />,
          bgColor: '#fff8e1',
      },
      {
          title: 'Calcos Asignados',
          value: stats.asigc || 0,
          icon: <AssignmentIcon style={{ fontSize: 40, color: '#f44336' }} />,
          bgColor: '#ffebee',
      },
      {
          title: 'Llaveros Asignados',
          value: stats.asigl || 0,
          icon: <AssignmentIcon style={{ fontSize: 40, color: '#f44336' }} />,
          bgColor: '#ffebee',
      },
      {
          title: 'Calcos Disponibles',
          value: stats.dispoc || 0,
          icon: <AssignmentLateIcon style={{ fontSize: 40, color: '#ff9800' }} />,
          bgColor: '#fff3e0',
      },
      {
          title: 'Llaveros Disponibles',
          value: stats.dispol || 0,
          icon: <AssignmentLateIcon style={{ fontSize: 40, color: '#ff9800' }} />,
          bgColor: '#fff3e0',
      },
  ];


    return (
        <Box>
            <Typography variant="h4" mb={2}>
                Gestión de Tags
            </Typography>
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
            <Box style={{ width: '100%' }}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
              
                    getRowId={(row) => row.ID}
                />
            </Box>
        </Box>
    );
};

export default Registros;