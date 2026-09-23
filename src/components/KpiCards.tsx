import React from 'react';
import { DollarSign, Package, Receipt, ShoppingBag, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface KpiCardsProps {
  totalRevenue: number;
  totalUnits: number;
  averageTicket: number;
  totalOrders: number;
  topChannel: string;
  topProduct: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  totalRevenue,
  totalUnits,
  averageTicket,
  totalOrders,
  topChannel,
  topProduct,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Total Revenue */}
      <div className="bg-[#0f1523] border border-slate-800/90 rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Ingresos Totales</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white tracking-tight">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-400 gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs semana previa</span>
          </div>
        </div>
      </div>

      {/* 2. Total Units Sold */}
      <div className="bg-[#0f1523] border border-slate-800/90 rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Unidades Vendidas</span>
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white tracking-tight">
            {formatNumber(totalUnits)} <span className="text-sm font-normal text-slate-400">pzas</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Producto líder: <span className="text-slate-200 font-medium">{topProduct || 'Polvorones'}</span>
          </div>
        </div>
      </div>

      {/* 3. Average Ticket */}
      <div className="bg-[#0f1523] border border-slate-800/90 rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Ticket Promedio</span>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white tracking-tight">
            {formatCurrency(averageTicket)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Canal principal: <span className="text-slate-200 font-medium">{topChannel || 'Gimnasios B2B'}</span>
          </div>
        </div>
      </div>

      {/* 4. Total Orders & Operations */}
      <div className="bg-[#0f1523] border border-slate-800/90 rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Transacciones Totales</span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white tracking-tight">
            {formatNumber(totalOrders)} <span className="text-sm font-normal text-slate-400">órdenes</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-200">100% procesadas en cocina</span>
          </div>
        </div>
      </div>

    </div>
  );
};
