'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import {
  Box,
  Card,
  Button,
  Grid,
  Modal,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface User {
  id: number;
  Dni: string;
  Name: string;
  Last_Name: string;
  Telefono: string;
  Id_Key: string;
  company_name: string;
  Active: string; // Contiene "True" o "False"
  licensePlate?: string; // Para la patente
  Id_Tag: string;

}

const columns: GridColDef[] = [
  { field: 'Name', headerName: 'Nombre', flex: 1 },
  { field: 'Last_Name', headerName: 'Apellido',flex: 1},
  { field: 'timestamp', headerName: 'Hora',flex: 1},
  { field: 'Id_Key', headerName: 'Llave', flex: 1 },
  { field: 'company_name', headerName: 'Empresa',flex: 1 },
  {field: 'patente', headerName: 'Patente', flex: 1},
  { field: 'tag', headerName: 'Tag', flex: 1 },
  { field: 'barrera', headerName: 'Tambo', flex: 1 },
  {field: 'movimiento', headerName: 'Tipo', flex: 1},
  {field: 'estado', headerName: 'Tipo', flex: 1},
  {
    field: 'actions',
    headerName: 'Acciones',
    flex:3,
    renderCell: (params) => (
      <Box display="flex" gap={1}>
 
        <Link href={`/detalles/${params.row.Dni}`} passHref>
          <Button size="small" variant="contained" color="primary">
            Detalles
          </Button>
        </Link>
      </Box>
    ),
  },
];

const Registros= () => {
  const [rows, setRows] = useState<User[]>([]);
  const [filteredRows, setFilteredRows] = useState<User[]>([]);
  const [providers, setProviders] = useState<{ id: number; company_name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<Partial<User>>({});
  const [isEditing, setIsEditing] = useState(false);

  const fetchRows = async () => {
    const response = await fetch('http://localhost/adeco/api/registros.php');
    const data = await response.json();
    const processedData = data.map((row: User) => ({
      ...row,
      onEdit: handleEdit,
      onDelete: handleDelete,
    }));
    setRows(processedData);
    setFilteredRows(processedData);
  };



  useEffect(() => {
    fetchRows();
    const stats = {total : 1 }; // stats ahora es un objeto


  }, []);

  const handleEdit = (row: User) => {
    setCurrentRow({
      ...row,
      isAllowed: row.Active.toLowerCase() === 'true', // Convertir Active a booleano
    });
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = async (dni: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;

    await fetch(`http://localhost/adeco/api/delete-user.php?dni=${dni}`, {
      method: 'DELETE',
    });
    fetchRows();
  };

  const handleSave = async () => {
    if (!currentRow.Dni || !currentRow.Name || !currentRow.Last_Name) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    const payload = {
      ...currentRow,
      Active: currentRow.isAllowed ? 'True' : 'False', // Convertir isAllowed a string
    };

    const url = isEditing
      ? 'http://localhost/adeco/api/update-user.php'
      : 'http://localhost/adeco/api/create-user.php';

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    fetchRows();
    setOpen(false);
    setCurrentRow({});
    setIsEditing(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = rows.filter((row) =>
      (row.Dni?.toString() || '').toLowerCase().includes(value) ||
      (row.Name || '').toLowerCase().includes(value) ||
      (row.Last_Name || '').toLowerCase().includes(value) ||
      (row.Id_Key || '').toLowerCase().includes(value) ||
      (row.company_name || '').toLowerCase().includes(value) ||
      (row.Active || '').toLowerCase().includes(value)||
      (row.patente || '').toLowerCase().includes(value)
    );

    setFilteredRows(filtered);
  };

  const toggleActiveFilter = () => {
    setShowActiveOnly(!showActiveOnly);
    if (!showActiveOnly) {
      setFilteredRows(rows.filter((row) => row.Active.toLowerCase() === 'true'));
    } else {
      setFilteredRows(rows);
    }
  };

  
  const cards = [
    {
        title: 'Total Tags',
        value: stats.total || 0,
       // icon: <GroupIcon style={{ fontSize: 40, color: '#4caf50' }} />,
        bgColor: '#e8f5e9',
    }];
    
  return (
    <Box>
      <Typography variant="h4" mb={2}>
        Gestión de Incidencias
      </Typography>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <TextField
          label="Buscar por DNI, Nombre, Apellido o Empresa"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
        />
  
      </Box>
      <Box style={{ width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          paginationModel={{ pageSize: 15, page: 0 }}
        />
      </Box>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            width: '400px',
          }}
        >
          <Typography variant="h6" mb={2}>
            {isEditing ? 'Editar Usuario' : 'Agregar Usuario'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="DNI"
                fullWidth
                value={currentRow.Dni || ''}
                onChange={(e) =>
                  setCurrentRow({ ...currentRow, Dni: e.target.value })
                }
                disabled={isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre"
                fullWidth
                value={currentRow.Name || ''}
                onChange={(e) =>
                  setCurrentRow({ ...currentRow, Name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Apellido"
                fullWidth
                value={currentRow.Last_Name || ''}
                onChange={(e) =>
                  setCurrentRow({ ...currentRow, Last_Name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Teléfono"
                fullWidth
                value={currentRow.Telefono || ''}
                onChange={(e) =>
                  setCurrentRow({ ...currentRow, Telefono: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6} sm={6}>
              <TextField
                label="LLave"
                fullWidth
                value={currentRow.Id_Key || ''}
                onChange={(e) =>
                  setCurrentRow({ ...currentRow, Id_Key: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6} sm={6}>
              <TextField
                label="Tag"
                fullWidth
                value={currentRow.tag || ''}
                onChange={(e) =>
                  setCurrentRow({ ...currentRow, tag: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Empresa</InputLabel>
                <Select
                  value={currentRow.company_name || ''}
                  onChange={(e) =>
                    setCurrentRow({ ...currentRow, company_name: e.target.value })
                  }
                >
                  {providers.map((provider) => (
                    <MenuItem key={provider.id} value={provider.company_name}>
                      {provider.company_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={currentRow.isAllowed || false}
                    onChange={(e) =>
                      setCurrentRow({ ...currentRow, isAllowed: e.target.checked })
                    }
                  />
                }
                label="Permitido"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Patente"
                fullWidth
                value={currentRow.patente || ''}
                onChange={(e) =>
                  setCurrentRow({ ...currentRow, patente: e.target.value })
                }
              />
            </Grid>
          </Grid>
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ mr: 2 }}
            >
              Guardar
            </Button>
            <Button variant="outlined" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Registros;
