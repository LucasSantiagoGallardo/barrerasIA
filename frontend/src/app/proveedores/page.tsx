'use client';

import PageContainer from '../(DashboardLayout)/components/container/PageContainer';
 
import ProviderCRUD from '../(DashboardLayout)/components/proveedores/proveedores';

const proveedores= () => {
  return (
    <PageContainer title="Gestión de Usuarios" description="Administración de usuarios del sistema">
        
        <ProviderCRUD></ProviderCRUD>
        
    </PageContainer>
  );
};

export default proveedores;
