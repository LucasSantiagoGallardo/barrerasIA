'use client';

import PageContainer from '../(DashboardLayout)/components/container/PageContainer';

import UserCRUD from '../(DashboardLayout)/components/gestion-usuarios/usuarios';
const GestionUsuarios = () => {
  return (
    <PageContainer title="Gestión de Usuarios" description="Administración de usuarios del sistema">
        <UserCRUD />
     
    </PageContainer>
  );
};

export default GestionUsuarios;
