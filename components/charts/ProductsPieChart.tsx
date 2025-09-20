"use client"

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductsChartData {
  name: string;
  total_products: number;
  total_stock: number;
}

interface ProductsPieChartProps {
  data: ProductsChartData[];
  loading?: boolean;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const chartConfig = {
  products: {
    label: "Productos",
  },
  automotive: {
    label: "Automotriz",
    color: "hsl(var(--chart-1))",
  },
  electronics: {
    label: "Electrónicos",
    color: "hsl(var(--chart-2))",
  },
  tools: {
    label: "Herramientas",
    color: "hsl(var(--chart-3))",
  },
  accessories: {
    label: "Accesorios",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Otros",
    color: "hsl(var(--chart-5))",
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-lg">
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Categoría
            </span>
            <span className="font-bold text-muted-foreground">
              {data.name}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Productos
            </span>
            <span className="font-bold">
              {data.total_products}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Stock Total
            </span>
            <span className="font-bold">
              {data.total_stock}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function ProductsPieChart({ data, loading = false }: ProductsPieChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos por Categoría</CardTitle>
          <CardDescription>
            Distribución de productos por categoría
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
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
          <CardTitle>Productos por Categoría</CardTitle>
          <CardDescription>
            Distribución de productos por categoría
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No hay datos disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  // Preparar datos para el gráfico
  const chartData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos por Categoría</CardTitle>
        <CardDescription>
          Distribución de productos en inventario por categoría
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="total_products"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}