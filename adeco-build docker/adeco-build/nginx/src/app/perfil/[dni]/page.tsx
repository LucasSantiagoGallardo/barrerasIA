'use client';
import { useParams } from 'next/navigation';
import PerfilCompleto from '@/app/(DashboardLayout)/components/perfil/PerfilCompleto';

export default function Page() {
  const { dni } = useParams();
  return <PerfilCompleto dni={dni as string} />;
}