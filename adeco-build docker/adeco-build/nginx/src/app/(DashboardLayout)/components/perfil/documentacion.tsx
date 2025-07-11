const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Componente modular: DocumentacionPerfil.tsx
"use client";

import React, { useRef } from "react";
import {
  Box, FormControl, InputLabel, Select, MenuItem,
  TextField, IconButton, Link, Typography
} from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Documentacion {
  tipo: string;
  estado: "vigente" | "vencido";
  vencimiento: string;
  archivo_url?: string;
}

interface Props {
  dni: string;
  documentacion: Documentacion[];
  setDocumentacion: (docs: Documentacion[]) => void;
  setEditando: (value: boolean) => void;
  onQR: (tipo: string, index: number) => void;
}

const tiposDocumentos = ["CUIL", "DNI", "ART", "Recibo", "Seguro", "Licencia", "Otros"];

export default function DocumentacionPerfil({ dni, documentacion, setDocumentacion, setEditando, onQR }: Props) {
  const fileInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, tipo: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("dni", dni);
    formData.append("tipo", tipo);

    fetch(`API_URL/adeco/api/upload_documento_perfil.php`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) alert("Documento subido correctamente");
        else alert("Error al subir documento");
      });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Documentación</Typography>
      {documentacion.map((doc, index) => (
        <Box key={index} display="flex" alignItems="center" borderBottom="1px solid #eee" py={1} gap={1}>
          <FormControl><InputLabel>Tipo</InputLabel>
            <Select value={doc.tipo} onChange={(e) => {
              setEditando(true);
              const docs = [...documentacion];
              docs[index].tipo = e.target.value;
              setDocumentacion(docs);
            }}>{tiposDocumentos.map((tipo) => <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>)}</Select>
          </FormControl>
          <TextField label="Estado" value={doc.estado} onChange={(e) => {
            setEditando(true);
            const docs = [...documentacion];
            docs[index].estado = e.target.value as "vigente" | "vencido";
            setDocumentacion(docs);
          }} />
          <TextField label="Vencimiento" type="date" value={doc.vencimiento} onChange={(e) => {
            setEditando(true);
            const docs = [...documentacion];
            docs[index].vencimiento = e.target.value;
            setDocumentacion(docs);
          }} />
          <input type="file" hidden ref={(el) => fileInputsRef.current[index] = el} accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, doc.tipo)} />
          <IconButton onClick={() => fileInputsRef.current[index]?.click()}><UploadFileIcon /></IconButton>
          <IconButton onClick={() => onQR(doc.tipo, index)}><QrCode2Icon /></IconButton>
          {doc.archivo_url && (
            <Link href={`http://192.168.0.85/adeco/api/${doc.archivo_url}`} target="_blank" rel="noopener">
              {doc.archivo_url.endsWith('.pdf')
                ? <VisibilityIcon />
                : <img src={`http://192.168.0.85/adeco/api/${doc.archivo_url}`} alt={doc.tipo} style={{ width: 32, height: 32, borderRadius: 4 }} />}
            </Link>
          )}
        </Box>
      ))}
    </Box>
  );
}
