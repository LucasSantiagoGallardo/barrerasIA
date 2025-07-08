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
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import KeyIcon from '@mui/icons-material/VpnKey';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';

// Tipado para las filas si vas a usar DataGrid
interface User {
    ID: number;
    Dni: string;
    Tag: string;
    Tipo: string;
    Asignado: string;
}

// Tipado para las stats que vienen de la API
interface Stats {
    total: number;
    totalc: number;
    totall: number;
    asigc: number;
    [key: string]: number; // fallback
}

const columns: GridColDef[] = [
    { field: 'ID', headerName: 'ID', flex: 1 },
    { field: 'Dni', headerName: 'DNI', flex: 1 },
    { field: 'Tag', headerName: 'Tag', flex: 1 },
    { field: 'Tipo', headerName: 'Tipo', flex: 1 },
    { field: 'Asignado', headerName: 'Asignado', flex: 1 },
];

const Registros = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [rows, setRows] = useState<User[]>([]);
    const [filteredRows, setFilteredRows] = useState<User[]>([]);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        totala: 0,
        totalp: 0,
        asigc: 0
    });

    const fetchStats = async () => {
        try {
            const response = await fetch(`${apiUrl}/devolucion.php`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setStats(data);
            console.log("Datos de tagscard:", data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchStats();
        // fetch de rows si corresponde
    }, []);

    const cards = [
        {
            title: 'Total Tags',
            value: stats.total || 0,
            icon: <GroupIcon style={{ fontSize: 40, color: '#4caf50' }} />,
            bgColor: '#e8f5e9',
        },
        {
            title: 'Asignados ADECO',
            value: stats.totala || 0,
            icon: <LocalOfferIcon style={{ fontSize: 40, color: '#2196f3' }} />,
            bgColor: '#e3f2fd',
        },
        {
            title: 'Asignados P',
            value: stats.totalp || 0,
            icon: <KeyIcon style={{ fontSize: 40, color: '#ffc107' }} />,
            bgColor: '#fff8e1',
        },
        {
            title: 'Vencidos',
            value: stats.asigc || 0,
            icon: <AssignmentIcon style={{ fontSize: 40, color: '#f44336' }} />,
            bgColor: '#ffebee',
        }
    ];

    return (
        <Box>
            <Typography variant="h4" mb={2}>Gestión de Tags</Typography>
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

            <Box style={{ width: '100%' }} mt={3}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    paginationModel={{ pageSize: 10, page: 0 }}
                    getRowId={(row) => row.ID}
                />
            </Box>
        </Box>
    );
};

export default Registros;
