import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  Trash2,
  Download,
  ArrowUpDown,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Order, SalesChannel, DietaryPreference } from '../types';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';

interface OrdersTableProps {
  orders: Order[];
  onSelectOrderForAnalysis: (order: Order) => void;
  onDeleteOrder: (id: string) => void;
  activeOrderId?: string;
  externalFilter?: { type: 'channel' | 'product'; value: string } | null;
  onClearExternalFilter?: () => void;
  onExportCsv: () => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onSelectOrderForAnalysis,
  onDeleteOrder,
  activeOrderId,
  externalFilter,
  onClearExternalFilter,
  onExportCsv,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'total' | 'quantity'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtered & Sorted orders
  const processedOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Search term filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchCustomer = order.customerName.toLowerCase().includes(term);
          const matchProduct = order.product.toLowerCase().includes(term);
          const matchChannel = order.channel.toLowerCase().includes(term);
          const matchId = order.id.toLowerCase().includes(term);
          if (!matchCustomer && !matchProduct && !matchChannel && !matchId) {
            return false;
          }
        }

        // Dropdown channel filter
        if (channelFilter !== 'all' && order.channel !== channelFilter) {
          return false;
        }

        // Dropdown product filter
        if (productFilter !== 'all') {
          const inItems = order.items && order.items.some((i) => i.product === productFilter);
          const inSummary = order.product.toLowerCase().includes(productFilter.toLowerCase().replace('keto ', ''));
          if (!inItems && !inSummary) {
            return false;
          }
        }

        // External chart click filter
        if (externalFilter) {
          if (externalFilter.type === 'channel' && order.channel !== externalFilter.value) {
            return false;
          }
          if (externalFilter.type === 'product') {
            const inItems = order.items && order.items.some((i) => i.product === externalFilter.value);
            const inSummary = order.product.toLowerCase().includes(externalFilter.value.toLowerCase().replace('keto ', ''));
            if (!inItems && !inSummary) {
              return false;
            }
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortBy];
        let valB: any = b[sortBy];

        if (sortBy === 'date') {
          valA = `${a.date} ${a.time || '00:00'}`;
          valB = `${b.date} ${b.time || '00:00'}`;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [orders, searchTerm, channelFilter, productFilter, externalFilter, sortBy, sortOrder]);

  const toggleSort = (field: 'date' | 'total' | 'quantity') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-[#0f1523] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-sm">
      
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">
              Historial de Transacciones Registradas
            </h3>
            <span className="font-mono text-xs text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded">
              {processedOrders.length} {processedOrders.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro operativo con desglose de cliente, canal, especificación nutricional y asistencia Gemini IA
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar cliente o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0f1b] border border-slate-800 focus:border-emerald-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="bg-[#0a0f1b] border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="all">Todos los Canales</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Instagram">Instagram</option>
            <option value="Gimnasios B2B">Gimnasios B2B</option>
            <option value="Venta Directa">Venta Directa</option>
          </select>

          {/* Product Filter */}
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="bg-[#0a0f1b] border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="all">Todos los Productos</option>
            <option value="Mini Cheesecakes">Mini Cheesecakes</option>
            <option value="Apple Crumble">Apple Crumble</option>
            <option value="Keto Brownies">Keto Brownies</option>
            <option value="Polvorones">Polvorones</option>
          </select>

          {/* CSV Export */}
          <button
            type="button"
            onClick={onExportCsv}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV</span>
          </button>

        </div>
      </div>

      {/* External Filter Alert / Chip */}
      {externalFilter && (
        <div className="mt-3 p-2 bg-emerald-950/30 border border-emerald-800/40 rounded-lg flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Filtrado por gráfico: <strong>{externalFilter.value}</strong> ({externalFilter.type === 'channel' ? 'Canal' : 'Producto'})
            </span>
          </div>
          {onClearExternalFilter && (
            <button
              onClick={onClearExternalFilter}
              className="text-emerald-400 hover:text-emerald-200 text-xs flex items-center gap-1 underline"
            >
              <X className="w-3 h-3" />
              Quitar filtro
            </button>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 text-slate-400 font-medium bg-[#0a0f1b]/50">
              <th className="py-3 px-3">ID & Fecha</th>
              <th className="py-3 px-3">Cliente / Demografía</th>
              <th className="py-3 px-3">Producto / Detalle</th>
              <th className="py-3 px-3">Canal</th>
              <th
                className="py-3 px-3 cursor-pointer select-none text-right hover:text-slate-200"
                onClick={() => toggleSort('quantity')}
              >
                <div className="inline-flex items-center gap-1">
                  <span>Cant.</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer select-none text-right hover:text-slate-200"
                onClick={() => toggleSort('total')}
              >
                <div className="inline-flex items-center gap-1">
                  <span>Monto Total</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">IA Gemini</th>
              <th className="py-3 px-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {processedOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">No se encontraron transacciones con los filtros actuales.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setChannelFilter('all');
                      setProductFilter('all');
                      if (onClearExternalFilter) onClearExternalFilter();
                    }}
                    className="mt-2 text-xs text-emerald-400 hover:underline"
                  >
                    Restablecer filtros
                  </button>
                </td>
              </tr>
            ) : (
              processedOrders.map((order) => {
                const isActive = activeOrderId === order.id;
                const hasAnalysis = Boolean(order.geminiAnalysis);

                return (
                  <tr
                    key={order.id}
                    className={`transition-colors group ${
                      isActive
                        ? 'bg-emerald-950/20'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    {/* ID & Date */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono text-slate-300 font-semibold">{order.id}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {order.date} {order.time ? `· ${order.time}` : ''}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{order.customerName}</div>
                      <div className="text-[11px] text-slate-400">
                        {order.gender} {order.age ? `· ${order.age} años` : ''}
                      </div>
                    </td>

                    {/* Product & Details (Clean unboxed metadata) */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-100">{order.product}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        {order.items && order.items.length > 1 ? (
                          <span className="text-emerald-400/90 font-medium">
                            {order.items.length} productos combinados
                          </span>
                        ) : (
                          <>
                            <span className="text-emerald-400 font-medium">
                              {order.dietaryPreference || 'Saludable'}
                            </span>
                            {order.unitPrice && (
                              <>
                                <span className="text-slate-600">·</span>
                                <span className="font-mono tabular-nums text-slate-400">
                                  ${order.unitPrice} c/u
                                </span>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    {/* Sales Channel */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-slate-300 font-medium">{order.channel}</span>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200">
                      {formatNumber(order.quantity)} pzas
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-400">
                      {formatCurrency(order.total)}
                    </td>

                    {/* Gemini AI Status & Trigger */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => onSelectOrderForAnalysis(order)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                          isActive
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                            : hasAnalysis
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/60'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{isActive ? 'En Pantalla' : hasAnalysis ? 'Ver Análisis' : 'Analizar IA'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onDeleteOrder(order.id)}
                        title="Eliminar registro"
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
