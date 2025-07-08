'use client';
import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Modal, Grid } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Swal from 'sweetalert2';
import PerfilProveedor from '@/app/(DashboardLayout)/components/proveedores/PerfilProveedor';

interface Provider {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  key_expiration_date: string;
  active: string;
  notes?: string;
}

const ProviderCRUD = () => {
  const [rows, setRows] = useState<Provider[]>([]);
  const [open, setOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<Partial<Provider>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [docuProveedorId, setDocuProveedorId] = useState<string>('');
  const [openDocu, setOpenDocu] = useState(false);

  const handleVerDocu = (row: Provider) => {
    setDocuProveedorId(row.id.toString());
    setOpenDocu(true);
  };

  const columns: GridColDef[] = [
    { field: 'company_name', headerName: 'Empresa', width: 200 },
    { field: 'contact_name', headerName: 'Contacto', width: 150 },
    { field: 'email', headerName: 'Correo', width: 200 },
    { field: 'phone', headerName: 'Teléfono', width: 150 },
    { field: 'key_expiration_date', headerName: 'Caducidad', width: 150 },
    { field: 'active', headerName: 'Activo', width: 100 },
    {
      field: 'ver_docu',
      headerName: 'Documentación',
      width: 150,
      renderCell: (params) => (
        <Button size="small" variant="contained" onClick={() => handleVerDocu(params.row)}>
          Ver
        </Button>
      )
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 200,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => params.row.onEdit(params.row)}
          >
            Editar
          </Button>
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => params.row.onDelete(params.row.id)}
          >
            Eliminar
          </Button>
        </Box>
      ),
    },
  ];

  const fetchRows = async () => {
    const response = await fetch('http://localhost/adeco/api/get-providers.php');
    const data: Provider[] = await response.json();
    const processedData = data.map((row: Provider) => ({
      ...row,
      onEdit: handleEdit,
      onDelete: handleDelete,
    }));
    setRows(processedData);
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const handleEdit = (row: Provider) => {
    setCurrentRow(row);
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Esta acción no se puede deshacer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost/adeco/api/delete-provider.php?id=${id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            Swal.fire('Eliminado', 'El proveedor ha sido eliminado correctamente.', 'success');
            fetchRows();
          } else {
            Swal.fire('Error', 'No se pudo eliminar el proveedor.', 'error');
          }
        } catch (error) {
          Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
        }
      }
    });
  };

  const handleSave = async () => {
    const url = isEditing
      ? 'http://localhost/adeco/api/update-provider.php'
      : 'http://localhost/adeco/api/create-provider.php';

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentRow),
    });

    fetchRows();
    setOpen(false);
    setCurrentRow({});
    setIsEditing(false);
  };

  return (
    <Box>
      <Typography variant="h4" mb={2}>
        Gestión de Proveedores
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setCurrentRow({});
          setIsEditing(false);
          setOpen(true);
        }}
      >
        Agregar Proveedor
      </Button>
      <Box style={{ height: 400, width: '100%', marginTop: 20 }}>
        <DataGrid rows={rows} columns={columns} initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }} />
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
            {isEditing ? 'Editar Proveedor' : 'Agregar Proveedor'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField label="Empresa" fullWidth value={currentRow.company_name || ''} onChange={(e) => setCurrentRow({ ...currentRow, company_name: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField label="Contacto" fullWidth value={currentRow.contact_name || ''} onChange={(e) => setCurrentRow({ ...currentRow, contact_name: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField label="Correo" fullWidth value={currentRow.email || ''} onChange={(e) => setCurrentRow({ ...currentRow, email: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField label="Teléfono" fullWidth value={currentRow.phone || ''} onChange={(e) => setCurrentRow({ ...currentRow, phone: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField label="Caducidad de Llave" type="date" fullWidth InputLabelProps={{ shrink: true }} value={currentRow.key_expiration_date || ''} onChange={(e) => setCurrentRow({ ...currentRow, key_expiration_date: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField label="Notas" fullWidth multiline value={currentRow.notes || ''} onChange={(e) => setCurrentRow({ ...currentRow, notes: e.target.value })} /></Grid>
          </Grid>
          <Box mt={2}>
            <Button variant="contained" color="primary" onClick={handleSave} sx={{ mr: 2 }}>Guardar</Button>
            <Button variant="outlined" onClick={() => setOpen(false)}>Cancelar</Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openDocu} onClose={() => setOpenDocu(false)}>
        <Box sx={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', width: '90%', height: '90%', overflowY: 'auto', bgcolor: 'background.paper', p: 4 }}>
          <PerfilProveedor proveedorId={docuProveedorId} />
        </Box>
      </Modal>
    </Box>
  );
};

export default ProviderCRUD;
