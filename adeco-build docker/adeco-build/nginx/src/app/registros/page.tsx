'use client';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import RegistrosAcceso from '@/app/(DashboardLayout)/components/registros/registros';

const Page = () => {
  return (
    <PageContainer title="Registros de Acceso" description="Listado completo de entradas y salidas">
      <RegistrosAcceso />
    </PageContainer>
  );
};

export default Page;
