'use client';

import PageContainer from '../(DashboardLayout)/components/container/PageContainer';
 import Lectores from '../(DashboardLayout)/components/lectores/LectoresCRUD';

const Dashboard = () => {
  return (
    <PageContainer title="Control LECTORES"  description="Administración de usuarios del sistema">
        
      <Lectores/>        
      
    </PageContainer>
  );
};

export default Dashboard;
