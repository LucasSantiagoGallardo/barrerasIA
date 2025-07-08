'use client';

import PageContainer from '../(DashboardLayout)/components/container/PageContainer';

import Registros from '../(DashboardLayout)/components/tags/tags';
const GestionUsuarios = () => {
  return (
    <PageContainer title="Gestión de Tags" description="Administración de  Tags rfid">
        <Registros />
     
    </PageContainer>
  );
};

export default GestionUsuarios;
