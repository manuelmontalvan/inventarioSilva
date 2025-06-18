"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CalendarDays, PackageCheck } from "lucide-react";

const salesChartData = [
  { date: "2024-12", total: 400 },
  { date: "2025-01", total: 850 },
  { date: "2025-02", total: 740 },
  { date: "2025-03", total: 960 },
  { date: "2025-04", total: 1200 },
  { date: "2025-05", total: 880 },
];

const recentSales = [
  { invoice: "INV-1001", client: "Ana Pérez", total: 240.0, date: "2025-06-10" },
  { invoice: "INV-1002", client: "Luis Gómez", total: 380.0, date: "2025-06-09" },
  { invoice: "INV-1003", client: "Marta Ruiz", total: 150.0, date: "2025-06-08" },
];

export default function SalesPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Gráfico de ventas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-primary" />
            Ventas mensuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={salesChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#4f46e5" fill="#c7d2fe" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ventas recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Ventas recientes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSales.map((sale, idx) => (
                <TableRow key={idx}>
                  <TableCell>{sale.invoice}</TableCell>
                  <TableCell>{sale.client}</TableCell>
                  <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                  <TableCell>{sale.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
