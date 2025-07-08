// src/app/(DashboardLayout)/components/proveedores/PerfilProveedor.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Paper,
  Modal
} from "@mui/material";
import { styled } from "@mui/material/styles";

interface Documento {
  id?: number;
  tipo: string;
  archivo_url?: string;
  vencimiento?: string;
  observaciones?: string;
}

interface PerfilProveedorProps {
  proveedorId: string;
}

const tiposDocumento = [
  "AFIP",
  "ART",
  "Póliza Accidentes",
  "Formulario 931",
  "IIBB",
  "Constancia EPP",
  "Normativa Firmada",
  "Otros",
];

const Input = styled("input")({
  display: "none",
});

const PerfilProveedor: React.FC<PerfilProveedorProps> = ({ proveedorId }) => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [nuevo, setNuevo] = useState<Documento>({ tipo: "" });
  const [archivo, setArchivo] = useState<File | null>(null);
  const [openQR, setOpenQR] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    let anterior = JSON.stringify(documentos);
  
    const fetchDocumentos = () => {
      fetch(`http://localhost/adeco/api/get_documentos_proveedor.php?proveedor_id=${proveedorId}`)
        .then((res) => res.json())
        .then((data) => {
          const actual = JSON.stringify(data);
          if (actual !== anterior) {
            setDocumentos(data);
            anterior = actual;
          }
        });
    };
  
    fetchDocumentos(); // primera carga
    const intervalo = setInterval(fetchDocumentos, 5000); // luego cada 5 seg
  
    return () => clearInterval(intervalo);
  }, [proveedorId]);

  const subirDocumento = async () => {
    if (!archivo || !nuevo.tipo) return alert("Faltan campos obligatorios");

    const formData = new FormData();
    formData.append("proveedor_id", proveedorId);
    formData.append("tipo", nuevo.tipo);
    if (nuevo.vencimiento) formData.append("vencimiento", nuevo.vencimiento);
    if (nuevo.observaciones) formData.append("observaciones", nuevo.observaciones);
    formData.append("archivo", archivo);

    const res = await fetch("http://localhost/adeco/api/upload_documento_proveedor.php", {
      method: "POST",
      body: formData,
    });

    const resultado = await res.json();
    if (resultado.success) {
      setDocumentos([...documentos, { ...nuevo, archivo_url: resultado.archivo_url }]);
      setNuevo({ tipo: "" });
      setArchivo(null);
    } else {
      alert("Error al subir: " + resultado.error);
    }
  };

  const generarQR = () => {
    const url = `http://192.168.0.85/adeco/foto/subir.html?proveedor_id=${proveedorId}&tipo=${encodeURIComponent(nuevo.tipo)}`;
    setQrUrl(url);
    setOpenQR(true);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Documentación del Proveedor
      </Typography>

      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={nuevo.tipo}
                label="Tipo"
                onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })}
              >
                {tiposDocumento.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Vencimiento"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={nuevo.vencimiento || ""}
              onChange={(e) => setNuevo({ ...nuevo, vencimiento: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Observaciones"
              fullWidth
              multiline
              value={nuevo.observaciones || ""}
              onChange={(e) => setNuevo({ ...nuevo, observaciones: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <label htmlFor="archivo-subida">
              <Input
                accept=".pdf,.jpg,.png"
                id="archivo-subida"
                type="file"
                onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              />
              <Button variant="outlined" component="span">
                {archivo ? archivo.name : "Seleccionar archivo"}
              </Button>
            </label>
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" onClick={subirDocumento} sx={{ mr: 2 }}>
              Subir desde escritorio
            </Button>
            <Button variant="outlined" onClick={generarQR}>
              📱 Subir desde celular (QR)
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Documentos Cargados
      </Typography>
      <Grid container spacing={2}>
        {documentos.map((doc, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">{doc.tipo}</Typography>
              {doc.vencimiento && <Typography color="text.secondary">Vence: {doc.vencimiento}</Typography>}
              {doc.archivo_url && (
                <a href={`http://localhost/adeco/api/${doc.archivo_url}`} target="_blank" rel="noopener noreferrer">
                  Ver archivo
                </a>
              )}
              {doc.observaciones && <Typography variant="body2">{doc.observaciones}</Typography>}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Modal open={openQR} onClose={() => setOpenQR(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 2, boxShadow: 24 }}>
          <Typography variant="h6" mb={2}>Escaneá el QR desde el celular</Typography>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`} alt="QR" />
          <Box mt={2}>
            <Button variant="outlined" fullWidth onClick={() => setOpenQR(false)}>Cerrar</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default PerfilProveedor;
