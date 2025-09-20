"use client"

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ServicesChartData {
  month: string;
  [key: string]: number | string;
}

interface ServicesByMonthChartProps {
  data: ServicesChartData[];
  loading?: boolean;
}

const chartConfig: Record<string, { label: string; color: string }> = {
  "Mantenimiento general": {
    label: "Mantenimiento general",
    color: "hsl(var(--chart-1))",
  },
  "Revisión técnica": {
    label: "Revisión técnica",
    color: "hsl(var(--chart-2))",
  },
  "Cambio de aceite": {
    label: "Cambio de aceite",
    color: "hsl(var(--chart-3))",
  },
  "Alineación": {
    label: "Alineación",
    color: "hsl(var(--chart-4))",
  },
  "Balanceo": {
    label: "Balanceo",
    color: "hsl(var(--chart-5))",
  },
  "Cambio de frenos": {
    label: "Cambio de frenos",
    color: "hsl(var(--chart-1))",
  },
  "Diagnóstico electrónico": {
    label: "Diagnóstico electrónico",
    color: "hsl(var(--chart-2))",
  },
  "Otro": {
    label: "Otros servicios",
    color: "hsl(var(--chart-3))",
  },
};

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function ServicesByMonthChart({ data, loading = false }: ServicesByMonthChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Servicios por Mes</CardTitle>
          <CardDescription>
            Servicios más solicitados en los últimos 6 meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Servicios por Mes</CardTitle>
          <CardDescription>
            Servicios más solicitados en los últimos 6 meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            No hay datos disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  // Obtener todas las claves de servicios (excluyendo 'month')
  const serviceKeys = Object.keys(data[0] || {}).filter(key => key !== 'month');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Servicios por Mes</CardTitle>
        <CardDescription>
          Cantidad de servicios solicitados en los últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                labelFormatter={(label) => `Mes: ${label}`}
              />
              <Legend />
              {serviceKeys.map((serviceKey, index) => (
                <Bar
                  key={serviceKey}
                  dataKey={serviceKey}
                  stackId="services"
                  fill={chartConfig[serviceKey]?.color || COLORS[index % COLORS.length]}
                  name={chartConfig[serviceKey]?.label || serviceKey}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}