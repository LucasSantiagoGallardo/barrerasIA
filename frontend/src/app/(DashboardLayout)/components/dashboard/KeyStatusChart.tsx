'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface KeyStatusChartProps {
  data: { name: string; value: number }[];
}

const KeyStatusChart: React.FC<KeyStatusChartProps> = ({ data }) => {
  const colors = ['#82ca9d', '#ff7979'];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={2}>
          Estado de Llaves
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" label outerRadius={80} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Componente para generar datos aleatorios y renderizar el gráfico
const KeyStatusChartWithRandomData: React.FC = () => {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    // Genera datos aleatorios
    const randomData = [
      { name: 'Activas', value: Math.floor(Math.random() * 100) },
      { name: 'Inactivas', value: Math.floor(Math.random() * 100) },
    ];
    setData(randomData);
  }, []);

  return <KeyStatusChart data={data} />;
};

export default KeyStatusChartWithRandomData;
