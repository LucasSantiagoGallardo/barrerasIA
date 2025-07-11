'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Modal, Grid, TextField, IconButton, Tooltip, Checkbox, FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MemoryIcon from '@mui/icons-material/Memory';
import CircularProgress from '@mui/material/CircularProgress';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import RefreshIcon from '@mui/icons-material/Refresh';
import Swal from 'sweetalert2';

const API_URL = "http://localhost:8003";

interface Lector {
  id?: number;
  nombre: string;
  ip: string;
  port: number;
  rele_on: string;
  rele_off: string;
  rtsp_url?: string;
  lectura_auto?: boolean;
}

type LectorEstado = {
  conectado?: boolean;
  ultimo_uid?: string;
  error?: boolean;
};

export default function LectoresCRUD() {
  const [lectores, setLectores] = useState<Lector[]>([]);
  const [estados, setEstados] = useState<Record<number, LectorEstado>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lector | null>(null);
  const [form, setForm] = useState<Lector>({
    nombre: '', ip: '', port: 0, rele_on: '', rele_off: '', rtsp_url: '', lectura_auto: true
  });
  const [leyendo, setLeyendo] = useState<number | null>(null);
  const [tagLeido, setTagLeido] = useState<string>('');

  useEffect(() => {
    fetchLectores();
    fetchEstados();
    const timer = setInterval(fetchEstados, 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchLectores = async () => {
    const res = await fetch(`${API_URL}/lectores`);
    setLectores(await res.json());
  };

  const fetchEstados = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/lectores/estados`);
      const data = await res.json();
      setEstados(data);
    } catch {
      setEstados({});
    }
    setRefreshing(false);
  };

  const handleOpen = (lector?: Lector) => {
    setEditing(lector ?? null);
    setForm(lector ?? { nombre: '', ip: '', port: 0, rele_on: '', rele_off: '', rtsp_url: '', lectura_auto: true });
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm({ nombre: '', ip: '', port: 0, rele_on: '', rele_off: '', rtsp_url: '', lectura_auto: true });
  };

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `${API_URL}/lectores/${editing.id}` : `${API_URL}/lectores`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      await fetchLectores();
      handleClose();
    } else {
      Swal.fire('Error', 'No se pudo guardar el lector', 'error');
    }
  };

  const handleDelete = async (lector: Lector) => {
    if (!window.confirm('¿Seguro que deseas eliminar este lector?')) return;
    const res = await fetch(`${API_URL}/lectores/${lector.id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchLectores();
    } else {
      Swal.fire('Error', 'No se pudo eliminar', 'error');
    }
  };

  // NUEVO: Leer tag SOLO cuando el lector está en modo on-demand
  const handleLeerTagDirecto = async (lector: Lector) => {
    setLeyendo(lector.id ?? -1);
    setTagLeido('');
    try {
      const res = await fetch(`${API_URL}/lectores/${lector.id}/leer-tag-directo`);
      const data = await res.json();
      setTagLeido(data.tag_decimal || 'No detectado');
      if (data.tag_decimal) {
        Swal.fire('Tag leído', data.tag_decimal, 'success');
      } else {
        Swal.fire('Sin tag detectado', '', 'warning');
      }
    } catch {
      Swal.fire('Error', 'No se pudo leer el tag', 'error');
    }
    setLeyendo(null);
  };

  const handleAbrir = async (lector: Lector) => {
    await fetch(`${API_URL}/lectores/${lector.id}/abrir`, { method: 'POST' });
    fetchEstados();
  };

  const handleCerrar = async (lector: Lector) => {
    await fetch(`${API_URL}/lectores/${lector.id}/cerrar`, { method: 'POST' });
    fetchEstados();
  };

  return (
    <Box>
      <Typography variant="h4" mb={2}>Configuración de Lectores</Typography>
      <Button startIcon={<AddIcon />} variant="contained" onClick={() => handleOpen()}>Nuevo Lector</Button>
      <IconButton sx={{ ml: 2 }} onClick={fetchEstados} disabled={refreshing}><RefreshIcon /></IconButton>
      <Box mt={2}>
        {lectores.length === 0 && <Typography>No hay lectores configurados.</Typography>}
        {lectores.map(lector => {
          const estado = estados[lector.id ?? 0] || {};
          return (
            <Box key={lector.id} sx={{
              display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#f5f5f5',
              p: 2, borderRadius: 2, mb: 2, boxShadow: 1,
              transition: 'box-shadow .2s', '&:hover': { boxShadow: 4 }
            }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">{lector.nombre}</Typography>
                <Typography variant="body2">IP: {lector.ip}:{lector.port}</Typography>
                <Typography variant="body2" color="text.secondary">Rele On: {lector.rele_on} | Rele Off: {lector.rele_off}</Typography>
                {lector.rtsp_url && <Typography variant="body2" color="primary">RTSP: {lector.rtsp_url}</Typography>}
                <Typography variant="body2" color={
                  estado.conectado
                    ? "success.main"
                    : estado.error
                      ? "error.main"
                      : "text.secondary"
                }>
                  Estado: {
                    estado.conectado
                      ? <MeetingRoomOutlinedIcon color="success" fontSize="small" />
                      : estado.error
                        ? "Error"
                        : <span style={{ color: "#888" }}>Desconectado</span>
                  }
                </Typography>
                <Typography variant="body2" color="info.main">
                  Último tag leído: {estado.ultimo_uid || "Ninguno"}
                </Typography>
                <Typography variant="body2">
                  Modo: {lector.lectura_auto ? "Lectura continua" : "Lectura bajo demanda"}
                </Typography>
                {leyendo === lector.id && <CircularProgress size={24} sx={{ ml: 2 }} />}
                {tagLeido && leyendo === lector.id && (
                  <Typography color="success.main">Tag leído: {tagLeido}</Typography>
                )}
              </Box>
              <Tooltip title="Abrir barrera">
                <span>
                  <IconButton color="success" onClick={() => handleAbrir(lector)}>
                    <MeetingRoomOutlinedIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Cerrar barrera">
                <span>
                  <IconButton color="primary" onClick={() => handleCerrar(lector)}>
                    <DoorFrontIcon />
                  </IconButton>
                </span>
              </Tooltip>
              {/* Leer tag SOLO si está en modo bajo demanda */}
              {!lector.lectura_auto &&
                <Tooltip title="Leer Tag On Demand">
                  <span>
                    <IconButton onClick={() => handleLeerTagDirecto(lector)} disabled={leyendo !== null}>
                      <MemoryIcon color="info" />
                    </IconButton>
                  </span>
                </Tooltip>
              }
              <Tooltip title="Editar">
                <IconButton onClick={() => handleOpen(lector)}><EditIcon /></IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton onClick={() => handleDelete(lector)}><DeleteIcon color="error" /></IconButton>
              </Tooltip>
            </Box>
          );
        })}
      </Box>
      {/* Modal ABM */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper', p: 4, borderRadius: 3, width: 400, boxShadow: 8
        }}>
          <Typography variant="h6" mb={2}>{editing ? 'Editar Lector' : 'Nuevo Lector'}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField label="Nombre" fullWidth value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} /></Grid>
            <Grid item xs={8}><TextField label="IP" fullWidth value={form.ip} onChange={e => setForm(f => ({ ...f, ip: e.target.value }))} /></Grid>
            <Grid item xs={4}><TextField label="Puerto" fullWidth type="number" value={form.port} onChange={e => setForm(f => ({ ...f, port: Number(e.target.value) }))} /></Grid>
            <Grid item xs={6}><TextField label="Rele ON (hex)" fullWidth value={form.rele_on} onChange={e => setForm(f => ({ ...f, rele_on: e.target.value }))} /></Grid>
            <Grid item xs={6}><TextField label="Rele OFF (hex)" fullWidth value={form.rele_off} onChange={e => setForm(f => ({ ...f, rele_off: e.target.value }))} /></Grid>
            <Grid item xs={12}><TextField label="RTSP URL" fullWidth value={form.rtsp_url} onChange={e => setForm(f => ({ ...f, rtsp_url: e.target.value }))} /></Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.lectura_auto ?? true}
                    onChange={e => setForm(f => ({ ...f, lectura_auto: e.target.checked }))}
                  />
                }
                label="Lectura automática (loop continuo)"
              />
            </Grid>
          </Grid>
          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="contained" onClick={handleSave}>Guardar</Button>
            <Button variant="outlined" onClick={handleClose}>Cancelar</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
