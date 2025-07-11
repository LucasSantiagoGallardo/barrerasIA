'use client';
import React, { useState, useEffect , useRef } from 'react';
import Swal from 'sweetalert2';
import IconButton from '@mui/material/IconButton';
import MemoryIcon from '@mui/icons-material/Memory';
import CircularProgress from '@mui/material/CircularProgress';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TagIcon from '@mui/icons-material/Tag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import KeyOffIcon from '@mui/icons-material/KeyOff';
import AddIcon from '@mui/icons-material/PersonAdd';
import { Box, Button, Grid, Modal, TextField, Typography, MenuItem, Select, InputLabel, FormControl, FormControlLabel, Checkbox } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Link from 'next/link';

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
  tag: string;
  patente?: string;
  Id_Customer?: string;
  isAllowed?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || `process.env.NEXT_PUBLIC_API_URL/adeco/api`;
const API_URL_SOCKET = process.env.NEXT_PUBLIC_SOCKET_API_URL || `process.env.NEXT_PUBLIC_SOCKET_API_URL/`;

const UserCRUD = () => {
  const [leyendo, setLeyendo] = useState(false);
  const [rows, setRows] = useState<User[]>([]);
  const [filteredRows, setFilteredRows] = useState<User[]>([]);
  const [providers, setProviders] = useState<{ id: number; company_name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<Partial<User>>({});
  const [isEditing, setIsEditing] = useState(false);
  const previousTagRef = useRef<string>('');
  const [lectores, setLectores] = useState<{ id: number, nombre: string }[]>([]);
  const [lectorSeleccionado, setLectorSeleccionado] = useState<number | null>(null);
  
  const fetchLectores = async () => {
    try {
      const res = await fetch('http://localhost:8003/lectores'); // Cambia la URL si usás proxy/env.
      const data = await res.json();
      setLectores(data.filter((l: any) => l.lectura_auto === false || l.lectura_auto === 0 || l.lectura_auto === null));
      // Default: primer lector si hay
      if (data.length > 0 && lectorSeleccionado === null) {
        setLectorSeleccionado(data.tag_decima);
        console.log(data);
      }
    } catch (e) {
      setLectores([]);
    }
  };
  
  const columns: GridColDef[] = [
    { field: 'Dni', headerName: 'DNI', flex: 1 },
    { field: 'Name', headerName: 'Nombre', flex: 1 },
    { field: 'Last_Name', headerName: 'Apellido', flex: 1 },
    { field: 'Telefono', headerName: 'Teléfono', flex: 1 },
    { field: 'Id_Key', headerName: 'Llave', flex: 1 },
    { field: 'company_name', headerName: 'Empresa', flex: 1 },
    { field: 'patente', headerName: 'Patente', flex: 1 },
    { field: 'Active', headerName: 'Activo', flex: 1,
      renderCell: (params) => (
        params.row.Active.toLowerCase() === 'true'
          ? <CheckCircleIcon color="success" titleAccess="Activo"/>
          : <CancelIcon color="error" titleAccess="Inactivo"/>
      )
    },
    { field: 'tag', headerName: 'Tag', flex: 1 },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 2,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton
            color="warning"
            title="Revocar Tag"
            onClick={() => params.row.onDesag(params.row.Dni, params.row.company_name, params.row.tag)}
          >
            <KeyOffIcon />
          </IconButton>
          <IconButton
            color="primary"
            title="Editar"
            onClick={() => params.row.onEdit(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            title="Eliminar"
            onClick={() => params.row.onDelete(params.row.Dni)}
          >
            <DeleteIcon />
          </IconButton>
          <Link href={`/detalles/${params.row.Dni}`} passHref legacyBehavior>
            <IconButton color="success" title="Ver Detalles">
              <LinkIcon />
            </IconButton>
          </Link>
        </Box>
      ),
    },
  ];

  const fetchRows = async () => {
    const response = await fetch(`${API_URL}/users.php`);
    const data = await response.json();
    const processedData = data.map((row: User) => ({
      ...row,
      id: row.id || row.new_id || row.Dni, // usa el primero que esté definido
      onEdit: handleEdit,
      onDelete: handleDelete,
      onDesag: handleRevokeTag,
    }));
    setRows(processedData);
    setFilteredRows(processedData);
  };

  const fetchProviders = async () => {
    const response = await fetch(`${API_URL}/get-providers.php`);
    const data = await response.json();
    setProviders(data);
  };

  useEffect(() => {
    fetchRows();
    fetchProviders();
    fetchLectores();

  }, []);

  const handleRevokeTag = async (dni: string, custo: string, tag: string) => {
    try {
      const response = await fetch(`${API_URL}/revoke-tag.php?dni=${dni}&custo=${custo}&tag=${tag}`, {
        method: 'POST',
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Tag revocado correctamente.', 'success');
        fetchRows();
      } else {
        Swal.fire('Error', 'No se pudo revocar el tag.', 'error');
      }
    } catch (error) {
      console.error('Error al revocar el tag:', error);
      Swal.fire('Error', 'Ocurrió un error al revocar el tag.', 'error');
    }
  };

  const handleEdit = (row: User) => {
    previousTagRef.current = row.tag || '';
    setCurrentRow({
      ...row,
      isAllowed: row.Active.toLowerCase() === 'true',
    });
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = async (dni: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;

    await fetch(`${API_URL}/delete-user.php?dni=${dni}`, {
      method: 'DELETE',
    });
    fetchRows();
  };

  const checkAndUpsertTag = async (id_tag: string) => {
    try {
      const checkRes = await fetch(`${API_URL}/check-tag.php?id_tag=${id_tag}`);
      const exists = await checkRes.json();

      if (exists.found) {
        await fetch(`${API_URL}/update-tag.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_tag: currentRow.tag,
            estado: currentRow.isAllowed ? 1 : 0,
            dni: currentRow.Dni,
            tipo: exists.tipo,
          }),
        });
      } else {
        const { value: tipo } = await Swal.fire({
          title: '¿Qué tipo de tag es?',
          input: 'select',
          inputOptions: {
            'llavero': 'Llavero',
            'calcomania': 'Calcomanía',
          },
          inputPlaceholder: 'Selecciona un tipo',
          showCancelButton: true,
        });

        if (!tipo) throw new Error('No se seleccionó el tipo de tag');

        await fetch(`${API_URL}/create-tag.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_tag: currentRow.tag,
            dni: currentRow.Dni,
            tipo: tipo,
          }),
        });
      }
    } catch (error) {
      console.error('Error con el tag:', error);
      throw error;
    }
  };
  const handleSave = async () => {
    if (!currentRow.Dni || !currentRow.Name || !currentRow.Last_Name) {
      Swal.fire('Campos incompletos', 'Por favor completa todos los campos obligatorios.', 'warning');
      return;
    }
  
    const payload = {
      ...currentRow,
      Active: currentRow.isAllowed ? 'True' : 'False',
    };
  
    const url = isEditing
      ? `${API_URL}/update-user.php`
      : `${API_URL}/create-user.php`;
  
    if (currentRow.tag) {
      await checkAndUpsertTag(currentRow.tag);
    }
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
  
      if (response.status === 409 && result?.error?.includes("tag")) {
        const match = result.error.match(/\(DNI: (\d+)\)/);
        const dniAnterior = match ? match[1] : null;
  
        await Swal.fire({
          title: 'Tag ya asignado',
          text: result.error,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Revocar y reasignar',
          cancelButtonText: 'Cancelar',
          focusConfirm: false,
          allowEscapeKey: true,
          allowOutsideClick: false
        }).then(async (swalResult) => {
          if (swalResult.isConfirmed && dniAnterior && currentRow.tag) {
            const revokeRes = await fetch(`${API_URL}/revoke-tag.php?dni=${dniAnterior}&tag=${currentRow.tag}`, {
              method: 'POST',
            });
  
            if (revokeRes.ok) {
              Swal.fire('¡Listo!', 'El tag fue revocado al usuario anterior. Intentando asignar nuevamente...', 'success');
              await handleSave();
            } else {
              Swal.fire('Error', 'No se pudo revocar el tag al usuario anterior.', 'error');
            }
          }
        });
        return;
      }
  
      if (response.ok) {

        await fetchRows(); // Actualiza la lista antes de filtrar
        setSearchTerm(currentRow.Dni || '');
      
        // Usá la nueva lista de usuarios (no el array viejo)
        setFilteredRows((usuariosActualizados) =>
          usuariosActualizados
            ? usuariosActualizados.filter(row => row.Dni === currentRow.Dni)
            : []
        );
      
        setOpen(false);
        setCurrentRow({});
        setIsEditing(false);
      
        Swal.fire('Éxito', result.message || 'Usuario guardado con éxito.', 'success');
      }
        
      
    } catch (error: any) {
      Swal.fire('Error', error.message || 'Error al guardar el usuario.', 'error');
    }
  };
  

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
  
    const valueWords = value.split(" ").filter(Boolean);
  
    const filtered = rows.filter((row) => {
      const fields = [
        row.Dni?.toString() || '',
        row.Name || '',
        row.Last_Name || '',
        row.Id_Key || '',
        row.company_name || '',
        row.Active || '',
        row.patente || '',
        row.tag || '',
        ((row.Name || '') + ' ' + (row.Last_Name || '')),
        ((row.Last_Name || '') + ' ' + (row.Name || ''))
      ].map(f => f.toLowerCase());
  
      // Todas las palabras que escribo tienen que estar en algún campo
      return valueWords.every((word) =>
        fields.some((field) => field.includes(word))
      );
    });
  
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

  return (
    <Box>
      <Typography variant="h4" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssignmentIndIcon color="primary" sx={{ fontSize: 34 }} /> Gestión de Usuarios
      </Typography>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <TextField
          label="Buscar por DNI, Nombre, Apellido o Empresa"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <PersonIcon sx={{ mr: 1, color: 'grey.500' }} fontSize="small" />,
          }}
        />
        <Button
          variant={showActiveOnly ? "outlined" : "contained"}
          color="secondary"
          onClick={toggleActiveFilter}
          startIcon={showActiveOnly ? <CancelIcon /> : <CheckCircleIcon />}
          sx={{ minWidth: 180 }}
        >
          {showActiveOnly ? 'Mostrar Todos' : 'Mostrar Activos'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setCurrentRow({ isAllowed: false, licensePlate: '' });
            setIsEditing(false);
            setOpen(true);
          }}
          startIcon={<AddIcon />}
          sx={{ minWidth: 180 }}
        >
          Agregar Usuario
        </Button>
      </Box>
      <Box style={{ width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          paginationModel={{ pageSize: 15, page: 0 }}
          autoHeight
          sx={{
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
            '& .MuiDataGrid-cell': { alignItems: 'center' },
            borderRadius: 3,
            boxShadow: 1,
            bgcolor: 'background.paper',
          }}
        />
      </Box>
      {/* MODAL */}
      <Modal open={open} onClose={() => setOpen(false)} closeAfterTransition>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
      width: { xs: 340, sm: 400 },
      borderRadius: 3,
      outline: 'none',
      transition: 'box-shadow 0.3s',
    }}
  >
    <Typography variant="h6" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {isEditing ? <AssignmentIndIcon color="info" /> : <PersonIcon color="primary" />}
      {isEditing ? 'Editar Usuario' : 'Agregar Usuario'}
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="DNI"
          InputProps={{
            startAdornment: <AssignmentIndIcon sx={{ mr: 1, color: 'grey.500' }} fontSize="small" />,
          }}
          autoFocus
          fullWidth
          value={currentRow.Dni || ''}
          onChange={(e) => setCurrentRow({ ...currentRow, Dni: e.target.value })}
          disabled={isEditing}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Nombre"
          InputProps={{
            startAdornment: <PersonIcon sx={{ mr: 1, color: 'grey.500' }} fontSize="small" />,
          }}
          fullWidth
          value={currentRow.Name || ''}
          onChange={(e) => setCurrentRow({ ...currentRow, Name: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Apellido"
          InputProps={{
            startAdornment: <PersonIcon sx={{ mr: 1, color: 'grey.500' }} fontSize="small" />,
          }}
          fullWidth
          value={currentRow.Last_Name || ''}
          onChange={(e) => setCurrentRow({ ...currentRow, Last_Name: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Teléfono"
          InputProps={{
            startAdornment: <PhoneIphoneIcon sx={{ mr: 1, color: 'grey.500' }} fontSize="small" />,
          }}
          fullWidth
          value={currentRow.Telefono || ''}
          onChange={(e) => setCurrentRow({ ...currentRow, Telefono: e.target.value })}
        />
      </Grid>
      
      {/* TAG + SELECT DE LECTOR + BOTÓN */}
      <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <TextField
    label="Tag"
    InputProps={{
      startAdornment: <TagIcon sx={{ mr: 1, color: 'grey.500' }} fontSize="small" />,
    }}
    value={currentRow.tag || ''}
    onChange={e => setCurrentRow(prev => ({ ...prev, tag: e.target.value }))}
    disabled={leyendo}
    sx={{ flex: 1 }}
  />
  <TextField
    select
    label="Lector"
    value={lectorSeleccionado ?? ''}
    onChange={e => setLectorSeleccionado(Number(e.target.value))}
    sx={{ flex: 1, ml: 1 }}
    InputProps={{
      style: { fontWeight: 900 }
    }}
  >
    <MenuItem value="" disabled>Seleccionar lector</MenuItem>
    {lectores.map((lector) => (
      <MenuItem key={lector.id} value={lector.id}>
        {lector.nombre.toUpperCase()}
      </MenuItem>
    ))}
  </TextField>
  <IconButton
    sx={{
      ml: 1,
      borderRadius: 2,
      bgcolor: leyendo ? 'grey.200' : 'background.paper',
      boxShadow: leyendo ? 3 : 1,
      height: 48, width: 48,
      '&:hover': { bgcolor: 'primary.light', boxShadow: 6, scale: '1.1' },
    }}
    color={leyendo ? 'secondary' : 'primary'}
    title="Leer desde lector seleccionado"
    onClick={async () => {
      if (!lectorSeleccionado) {
        Swal.fire('Error', 'Seleccioná un lector primero', 'warning');
        return;
      }
      setLeyendo(true);
      try {
        const res = await fetch(`http://localhost:8003/lectores/${lectorSeleccionado}/leer-tag-directo`);
        const data = await res.json();
        if (data && data.tag_decimal) {
          setCurrentRow(prev => ({ ...prev, tag: String(data.tag_decimal) }));
        } else {
          await Swal.fire({
            icon: 'warning',
            title: 'No se detectó ningún tag',
            text: 'Aproxime el llavero o tarjeta a la antena.',
          });
        }
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Error al leer desde el lector',
          text: 'Verifique la conexión.',
        });
      }
      setLeyendo(false);
    }}
    disabled={leyendo || !lectorSeleccionado}
  >
    {leyendo ? <CircularProgress size={28} color="secondary" /> : <MemoryIcon fontSize="medium" />}
  </IconButton>
</Grid>
<Grid item xs={12} sx={{ mt: -1.5, mb: 1 }}>
  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
    Puede escribirlo manual o leerlo de la antena.
  </Typography>
</Grid>

      {/* --- */}
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>
            <BusinessIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
            Empresa
          </InputLabel>
          <Select
            value={
              providers.some(p => String(p.id) === String(currentRow.Id_Customer))
                ? currentRow.Id_Customer
                : ''
            }
            onChange={(e) =>
              setCurrentRow({
                ...currentRow,
                Id_Customer: e.target.value,
                company_name: providers.find(p => String(p.id) === String(e.target.value))?.company_name || '',
              })
            }
          >
            {providers.map((provider) => (
              <MenuItem key={provider.id} value={provider.id}>
                <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
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
              icon={<CancelIcon />}
              checkedIcon={<CheckCircleIcon />}
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
          InputProps={{
            startAdornment: <LocalShippingIcon sx={{ mr: 1, color: 'grey.500' }} fontSize="small" />,
          }}
          fullWidth
          value={currentRow.patente || ''}
          onChange={(e) =>
            setCurrentRow({ ...currentRow, patente: e.target.value })
          }
        />
      </Grid>
    </Grid>
    <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{
          px: 3,
          boxShadow: 3,
          fontWeight: 'bold',
          '&:hover': { boxShadow: 7, scale: '1.05' }
        }}
        startIcon={<CheckCircleIcon />}
      >
        Guardar
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => setOpen(false)}
        startIcon={<CancelIcon />}
      >
        Cancelar
      </Button>
    </Box>
  </Box>
</Modal>

    </Box>
  );
};

export default UserCRUD;
