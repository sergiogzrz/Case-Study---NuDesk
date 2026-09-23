import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  Trash2,
  Download,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Calendar,
  CalendarDays,
  RotateCcw
} from 'lucide-react';
import { Order, SalesChannel, ProductType } from '../types';
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
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
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

        // Date range filter: Fecha Inicio
        if (startDate && order.date < startDate) {
          return false;
        }

        // Date range filter: Fecha Fin
        if (endDate && order.date > endDate) {
          return false;
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
  }, [orders, searchTerm, channelFilter, productFilter, startDate, endDate, externalFilter, sortBy, sortOrder]);

  const toggleSort = (field: 'date' | 'total' | 'quantity') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDateSortOrder = (direction: 'desc' | 'asc') => {
    setSortBy('date');
    setSortOrder(direction);
  };

  const handleResetAllFilters = () => {
    setSearchTerm('');
    setChannelFilter('all');
    setProductFilter('all');
    setStartDate('');
    setEndDate('');
    if (onClearExternalFilter) onClearExternalFilter();
  };

  const isAnyFilterActive =
    searchTerm !== '' ||
    channelFilter !== 'all' ||
    productFilter !== 'all' ||
    startDate !== '' ||
    endDate !== '' ||
    externalFilter !== null;

  return (
    <div className="bg-[#0f1523] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-sm">
      
      {/* Header Bar */}
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
            Registro operativo con filtros avanzados por rango de fechas, orden cronológico y desglose detallado
          </p>
        </div>

        {/* Primary quick actions: Search & CSV */}
        <div className="flex items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
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

          {/* CSV Export */}
          <button
            type="button"
            onClick={onExportCsv}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Sorting Controls Toolbar */}
      <div className="mt-4 pt-1 flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
        
        {/* Left Side: Category Filters & Date Range */}
        <div className="flex flex-wrap items-center gap-2.5">
          
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

          {/* Date Range Controls */}
          <div className="flex items-center gap-1.5 bg-[#0a0f1b] border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-medium mr-1">Rango:</span>
            
            <div className="flex items-center gap-1">
              <label htmlFor="startDate" className="text-[10px] text-slate-400">Desde</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="bg-slate-900 border border-slate-700/80 rounded px-1.5 py-0.5 text-[11px] text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <span className="text-slate-600">-</span>

            <div className="flex items-center gap-1">
              <label htmlFor="endDate" className="text-[10px] text-slate-400">Hasta</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="bg-slate-900 border border-slate-700/80 rounded px-1.5 py-0.5 text-[11px] text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                title="Limpiar rango de fechas"
                className="ml-1 text-slate-400 hover:text-slate-200 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

        </div>

        {/* Right Side: Date Sort Controls & Reset Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Date Sort Selector Options */}
          <div className="flex items-center gap-1 bg-[#0a0f1b] border border-slate-800 rounded-lg p-0.5 text-xs">
            <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Fecha:</span>
            </span>
            <button
              type="button"
              onClick={() => handleDateSortOrder('desc')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                sortBy === 'date' && sortOrder === 'desc'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Ordenar de más reciente a más antigua"
            >
              <ArrowDown className="w-3 h-3" />
              <span>Más reciente</span>
            </button>
            <button
              type="button"
              onClick={() => handleDateSortOrder('asc')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                sortBy === 'date' && sortOrder === 'asc'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Ordenar de más antigua a más reciente"
            >
              <ArrowUp className="w-3 h-3" />
              <span>Más antigua</span>
            </button>
          </div>

          {/* Reset Filters Button (Active when any filter is applied) */}
          {isAnyFilterActive && (
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="px-2.5 py-1 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar filtros</span>
            </button>
          )}

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
              className="text-emerald-400 hover:text-emerald-200 text-xs flex items-center gap-1 underline cursor-pointer"
            >
              <X className="w-3 h-3" />
              Quitar filtro
            </button>
          )}
        </div>
      )}

      {/* Date Range Active Indicator Chip */}
      {(startDate || endDate) && (
        <div className="mt-2.5 px-2.5 py-1.5 bg-slate-900/70 border border-slate-800 rounded-lg flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Filtrando transacciones entre{' '}
              <strong className="text-white">{startDate ? formatDate(startDate) : 'el inicio'}</strong> y{' '}
              <strong className="text-white">{endDate ? formatDate(endDate) : 'la actualidad'}</strong>
            </span>
          </div>
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 underline cursor-pointer"
          >
            Quitar rango
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 text-slate-400 font-medium bg-[#0a0f1b]/50">
              
              {/* ID & Fecha (Clickable for date sort toggle) */}
              <th
                className="py-3 px-3 cursor-pointer select-none hover:text-slate-200 transition-colors"
                onClick={() => toggleSort('date')}
                title="Ordenar por fecha (clic para alternar)"
              >
                <div className="inline-flex items-center gap-1.5">
                  <span className={sortBy === 'date' ? 'text-emerald-400 font-semibold' : ''}>
                    ID & Fecha
                  </span>
                  {sortBy === 'date' ? (
                    sortOrder === 'desc' ? (
                      <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  )}
                </div>
              </th>

              <th className="py-3 px-3">Cliente / Demografía</th>
              <th className="py-3 px-3">Producto / Detalle</th>
              <th className="py-3 px-3">Canal</th>
              
              {/* Cantidad */}
              <th
                className="py-3 px-3 cursor-pointer select-none text-right hover:text-slate-200"
                onClick={() => toggleSort('quantity')}
                title="Ordenar por cantidad"
              >
                <div className="inline-flex items-center gap-1">
                  <span className={sortBy === 'quantity' ? 'text-emerald-400 font-semibold' : ''}>
                    Cant.
                  </span>
                  {sortBy === 'quantity' ? (
                    sortOrder === 'desc' ? (
                      <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  )}
                </div>
              </th>

              {/* Monto Total */}
              <th
                className="py-3 px-3 cursor-pointer select-none text-right hover:text-slate-200"
                onClick={() => toggleSort('total')}
                title="Ordenar por monto total"
              >
                <div className="inline-flex items-center gap-1">
                  <span className={sortBy === 'total' ? 'text-emerald-400 font-semibold' : ''}>
                    Monto Total
                  </span>
                  {sortBy === 'total' ? (
                    sortOrder === 'desc' ? (
                      <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  )}
                </div>
              </th>

              <th className="py-3 px-3 text-center">IA Gemini</th>
              <th className="py-3 px-3 text-right">Acción</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/50">
            {processedOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500">
                  <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">No se encontraron transacciones con los filtros actuales.</p>
                  <button
                    type="button"
                    onClick={handleResetAllFilters}
                    className="mt-2 text-xs text-emerald-400 hover:underline cursor-pointer"
                  >
                    Restablecer todos los filtros
                  </button>
                </td>
              </tr>
            ) : (
              processedOrders.map((order) => {
                const isActive = activeOrderId === order.id;

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
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200 font-medium">
                      {order.quantity} <span className="text-[10px] text-slate-500">pzas</span>
                    </td>

                    {/* Total */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                      {formatCurrency(order.total)}
                    </td>

                    {/* Gemini AI Status Badge */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {order.geminiAnalysis ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Analizado</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Pendiente</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Select for Analysis */}
                        <button
                          type="button"
                          onClick={() => onSelectOrderForAnalysis(order)}
                          title="Inspeccionar en panel Gemini IA"
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-900/80 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border-slate-800 hover:border-emerald-500/40'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Order */}
                        <button
                          type="button"
                          onClick={() => onDeleteOrder(order.id)}
                          title="Eliminar registro"
                          className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
        <span>
          Mostrando <strong>{processedOrders.length}</strong> de <strong>{orders.length}</strong> transacciones totales
        </span>
        <span className="font-mono text-slate-300">
          Orden: {sortBy === 'date' ? (sortOrder === 'desc' ? 'Más reciente a más antigua' : 'Más antigua a más reciente') : `${sortBy} (${sortOrder})`}
        </span>
      </div>

    </div>
  );
};
