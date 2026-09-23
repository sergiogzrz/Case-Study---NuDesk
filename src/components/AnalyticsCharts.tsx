import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  Filter,
  Layers
} from 'lucide-react';
import { Order, ProductType, SalesChannel } from '../types';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';

interface AnalyticsChartsProps {
  orders: Order[];
  onSelectFilter?: (type: 'channel' | 'product', value: string) => void;
  activeFilter?: { type: 'channel' | 'product'; value: string } | null;
}

// Fixed SHNACKS Products configuration with distinct palette
const SHNACKS_PRODUCTS: Array<{
  name: ProductType;
  shortLabel: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  dotClass: string;
}> = [
  {
    name: 'Mini Cheesecakes',
    shortLabel: 'Mini Cheesecakes',
    color: '#f59e0b',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-amber-300',
    dotClass: 'bg-amber-400',
  },
  {
    name: 'Apple Crumble',
    shortLabel: 'Apple Crumble',
    color: '#38bdf8',
    gradientFrom: 'from-sky-500',
    gradientTo: 'to-cyan-300',
    dotClass: 'bg-sky-400',
  },
  {
    name: 'Keto Brownies',
    shortLabel: 'Keto Brownies',
    color: '#10b981',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-300',
    dotClass: 'bg-emerald-400',
  },
  {
    name: 'Polvorones',
    shortLabel: 'Polvorones',
    color: '#c084fc',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-pink-400',
    dotClass: 'bg-purple-400',
  },
];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  orders,
  onSelectFilter,
  activeFilter,
}) => {
  // Bar chart state: 'channel' | 'product'
  const [barDimension, setBarDimension] = useState<'channel' | 'product'>('product');
  const [barMetric, setBarMetric] = useState<'revenue' | 'units'>('revenue');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Line chart state: 'revenue' | 'units' | 'product'
  const [lineMetric, setLineMetric] = useState<'revenue' | 'units' | 'product'>('revenue');
  const [hoveredDateIndex, setHoveredDateIndex] = useState<number | null>(null);

  // --- 1. BAR CHART DATA CALCULATION ---
  const barChartData = useMemo(() => {
    if (barDimension === 'channel') {
      const channels: SalesChannel[] = ['WhatsApp', 'Instagram', 'Gimnasios B2B', 'Venta Directa'];
      const aggregated = channels.map((channel) => {
        const matches = orders.filter((o) => o.channel === channel);
        const revenue = matches.reduce((sum, o) => sum + o.total, 0);
        const units = matches.reduce((sum, o) => sum + o.quantity, 0);
        return {
          label: channel,
          revenue,
          units,
          count: matches.length,
          key: channel,
        };
      });

      const totalValue = aggregated.reduce(
        (sum, item) => sum + (barMetric === 'revenue' ? item.revenue : item.units),
        0
      );

      return { items: aggregated, totalValue };
    } else {
      // Breakdown by specific SHNACKS Products: Mini Cheesecakes, Apple Crumble, Keto Brownies, Polvorones
      const aggregated = SHNACKS_PRODUCTS.map((prod) => {
        let revenue = 0;
        let units = 0;
        let count = 0;

        orders.forEach((o) => {
          if (o.items && Array.isArray(o.items) && o.items.length > 0) {
            const matchingItems = o.items.filter((it) => it.product === prod.name);
            if (matchingItems.length > 0) {
              count += 1;
              matchingItems.forEach((it) => {
                revenue += it.total;
                units += it.quantity;
              });
            }
          } else if (o.product && o.product.toLowerCase().includes(prod.name.toLowerCase().replace('keto ', ''))) {
            count += 1;
            revenue += o.total;
            units += o.quantity;
          }
        });

        return {
          label: prod.name,
          revenue,
          units,
          count,
          key: prod.name,
        };
      });

      const totalValue = aggregated.reduce(
        (sum, item) => sum + (barMetric === 'revenue' ? item.revenue : item.units),
        0
      );

      return { items: aggregated, totalValue };
    }
  }, [orders, barDimension, barMetric]);

  const maxBarValue = useMemo(() => {
    const vals = barChartData.items.map((i) =>
      barMetric === 'revenue' ? i.revenue : i.units
    );
    return Math.max(...vals, 1);
  }, [barChartData, barMetric]);

  // --- 2. TIME SERIES DATA (AGGREGATED BY DATE) ---
  const timeSeriesData = useMemo(() => {
    const dateMap: {
      [dateStr: string]: {
        revenue: number;
        units: number;
        ordersCount: number;
        byProduct: { [productName: string]: number };
      };
    } = {};

    orders.forEach((o) => {
      if (!dateMap[o.date]) {
        dateMap[o.date] = {
          revenue: 0,
          units: 0,
          ordersCount: 0,
          byProduct: {
            'Mini Cheesecakes': 0,
            'Apple Crumble': 0,
            'Keto Brownies': 0,
            'Polvorones': 0,
          },
        };
      }
      dateMap[o.date].revenue += o.total;
      dateMap[o.date].units += o.quantity;
      dateMap[o.date].ordersCount += 1;

      // Track product units breakdown
      if (o.items && Array.isArray(o.items) && o.items.length > 0) {
        o.items.forEach((it) => {
          if (dateMap[o.date].byProduct[it.product] !== undefined) {
            dateMap[o.date].byProduct[it.product] += it.quantity;
          }
        });
      } else if (o.product) {
        // Fallback match
        SHNACKS_PRODUCTS.forEach((p) => {
          if (o.product.toLowerCase().includes(p.name.toLowerCase().replace('keto ', ''))) {
            dateMap[o.date].byProduct[p.name] += o.quantity;
          }
        });
      }
    });

    const sortedDates = Object.keys(dateMap).sort();
    const points = sortedDates.map((dateStr) => ({
      date: dateStr,
      revenue: dateMap[dateStr].revenue,
      units: dateMap[dateStr].units,
      ordersCount: dateMap[dateStr].ordersCount,
      byProduct: dateMap[dateStr].byProduct,
    }));

    // Calculate max values for Y-axis scaling
    const maxRevenue = Math.max(...points.map((p) => p.revenue), 100);
    const maxUnits = Math.max(...points.map((p) => p.units), 10);
    const maxProductUnits = Math.max(
      ...points.flatMap((p) => Object.values(p.byProduct)),
      5
    );

    return {
      points,
      maxRevenue,
      maxUnits,
      maxProductUnits,
    };
  }, [orders]);

  // SVG Chart Dimensions
  const lineSvgWidth = 600;
  const lineSvgHeight = 220;
  const paddingX = 45;
  const paddingY = 30;
  const chartInnerWidth = lineSvgWidth - paddingX * 2;
  const chartInnerHeight = lineSvgHeight - paddingY * 2;

  // Single series coordinates (for revenue or units)
  const singleLineCoords = useMemo(() => {
    const pts = timeSeriesData.points;
    if (pts.length === 0) return [];
    const maxVal = lineMetric === 'revenue' ? timeSeriesData.maxRevenue : timeSeriesData.maxUnits;

    if (pts.length === 1) {
      return [{ x: lineSvgWidth / 2, y: lineSvgHeight / 2, point: pts[0] }];
    }

    return pts.map((pt, idx) => {
      const x = paddingX + (idx / (pts.length - 1)) * chartInnerWidth;
      const val = lineMetric === 'revenue' ? pt.revenue : pt.units;
      const y = paddingY + chartInnerHeight - (val / maxVal) * chartInnerHeight;
      return { x, y, point: pt };
    });
  }, [timeSeriesData, lineMetric, chartInnerWidth, chartInnerHeight]);

  // Multi-line coordinates (for 'product' breakdown)
  const multiProductCoords = useMemo(() => {
    const pts = timeSeriesData.points;
    if (pts.length === 0) return [];
    const maxVal = timeSeriesData.maxProductUnits;

    return SHNACKS_PRODUCTS.map((prod) => {
      const coords = pts.map((pt, idx) => {
        const x =
          pts.length === 1
            ? lineSvgWidth / 2
            : paddingX + (idx / (pts.length - 1)) * chartInnerWidth;
        const val = pt.byProduct[prod.name] || 0;
        const y = paddingY + chartInnerHeight - (val / maxVal) * chartInnerHeight;
        return { x, y, val, date: pt.date };
      });
      return {
        product: prod,
        coords,
      };
    });
  }, [timeSeriesData, chartInnerWidth, chartInnerHeight]);

  // Helper to build smooth cubic Bézier spline path
  const buildSmoothPath = (coords: Array<{ x: number; y: number }>) => {
    if (coords.length === 0) return '';
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

    return coords.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      const prev = coords[idx - 1];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }, '');
  };

  const singleLinePathD = useMemo(() => {
    return buildSmoothPath(singleLineCoords);
  }, [singleLineCoords]);

  const singleAreaPathD = useMemo(() => {
    if (singleLineCoords.length === 0) return '';
    const baseY = paddingY + chartInnerHeight;
    const firstX = singleLineCoords[0].x;
    const lastX = singleLineCoords[singleLineCoords.length - 1].x;
    return `${singleLinePathD} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  }, [singleLinePathD, singleLineCoords, chartInnerHeight]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* ========================================================= */}
      {/* 1. BAR CHART: DISTRIBUCIÓN DE VENTAS (CANAL vs PRODUCTO) */}
      {/* ========================================================= */}
      <div className="lg:col-span-6 bg-[#0f1523] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div>
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Distribución de Ventas</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparativa por {barDimension === 'channel' ? 'Canal de Venta' : 'Producto SHNACKS'}
              </p>
            </div>

            {/* Toggle Dimension & Metric */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Dimension: Canal vs Producto */}
              <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-800 flex items-center text-xs">
                <button
                  type="button"
                  onClick={() => setBarDimension('channel')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    barDimension === 'channel'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Canal
                </button>
                <button
                  type="button"
                  onClick={() => setBarDimension('product')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    barDimension === 'product'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Producto
                </button>
              </div>

              {/* Metric: $ vs Unidades */}
              <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-800 flex items-center text-xs">
                <button
                  type="button"
                  onClick={() => setBarMetric('revenue')}
                  title="Ingresos ($ MXN)"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    barMetric === 'revenue'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setBarMetric('units')}
                  title="Unidades vendidas"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    barMetric === 'units'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="mt-6 space-y-3.5">
            {barChartData.items.map((item, idx) => {
              const currentVal = barMetric === 'revenue' ? item.revenue : item.units;
              const percentage =
                barChartData.totalValue > 0
                  ? Math.round((currentVal / barChartData.totalValue) * 100)
                  : 0;
              const widthPct = Math.max(4, Math.round((currentVal / maxBarValue) * 100));
              const isFiltered =
                activeFilter?.type === barDimension && activeFilter?.value === item.key;

              // Color styles per item
              const barGradient =
                barDimension === 'product'
                  ? idx === 0
                    ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                    : idx === 1
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-300'
                    : idx === 2
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-300'
                    : 'bg-gradient-to-r from-purple-500 to-pink-400'
                  : idx === 0
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : idx === 1
                  ? 'bg-gradient-to-r from-teal-400 to-cyan-400'
                  : idx === 2
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500'
                  : 'bg-gradient-to-r from-amber-400 to-emerald-400';

              return (
                <div
                  key={item.key}
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                  onClick={() => onSelectFilter && onSelectFilter(barDimension, item.key)}
                  className={`cursor-pointer p-2.5 rounded-xl transition-all ${
                    isFiltered
                      ? 'bg-emerald-950/40 ring-1 ring-emerald-500'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200">{item.label}</span>
                      {isFiltered && (
                        <span className="text-[10px] text-emerald-400 font-mono">(Filtro activo)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      <span className="text-slate-400 text-[11px]">{percentage}%</span>
                      <span className="font-semibold text-slate-100">
                        {barMetric === 'revenue'
                          ? formatCurrency(item.revenue)
                          : `${formatNumber(item.units)} pzas`}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barGradient}`}
                      style={{ width: `${widthPct}%` }}
                    ></div>
                  </div>

                  {/* Hover micro details */}
                  {hoveredBarIndex === idx && (
                    <div className="mt-1.5 text-[11px] text-slate-400 flex items-center justify-between animate-fadeIn">
                      <span>{item.count} órdenes registradas con este ítem</span>
                      <span>
                        Ticket prom:{' '}
                        {item.count > 0 ? formatCurrency(item.revenue / item.count) : '$0'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info note */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Haz clic en un {barDimension === 'product' ? 'producto' : 'canal'} para filtrar la tabla
          </span>
          <span className="font-mono tabular-nums text-slate-300 font-medium">
            Total:{' '}
            {barMetric === 'revenue'
              ? formatCurrency(barChartData.totalValue)
              : `${formatNumber(barChartData.totalValue)} pzas`}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. LINE CHART: TENDENCIA TEMPORAL CON DESGLOSE POR PRODUCTO */}
      {/* ========================================================= */}
      <div className="lg:col-span-6 bg-[#0f1523] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div>
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Tendencia de Ventas en el Tiempo</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lineMetric === 'product'
                  ? 'Volumen diario desglosado por producto SHNACKS'
                  : lineMetric === 'revenue'
                  ? 'Comportamiento diario de ingresos totales ($ MXN)'
                  : 'Comportamiento diario de volumen total (unidades)'}
              </p>
            </div>

            {/* Metric Toggle: Ingresos ($) | Unidades | Por Producto */}
            <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-800 flex items-center text-xs flex-wrap">
              <button
                type="button"
                onClick={() => setLineMetric('revenue')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  lineMetric === 'revenue'
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ingresos ($)
              </button>
              <button
                type="button"
                onClick={() => setLineMetric('units')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  lineMetric === 'units'
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Unidades
              </button>
              <button
                type="button"
                onClick={() => setLineMetric('product')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  lineMetric === 'product'
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Por Producto</span>
              </button>
            </div>
          </div>

          {/* Product Legend (Visible when 'Por Producto' is active) */}
          {lineMetric === 'product' && (
            <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-xs bg-slate-900/60 p-2 rounded-xl border border-slate-800">
              {SHNACKS_PRODUCTS.map((p) => (
                <div key={p.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  ></span>
                  <span className="text-slate-300 text-[11px] font-medium">{p.shortLabel}</span>
                </div>
              ))}
            </div>
          )}

          {/* SVG Line Chart Canvas */}
          <div className="mt-3 relative">
            <svg
              viewBox={`0 0 ${lineSvgWidth} ${lineSvgHeight}`}
              className="w-full h-48 sm:h-52 overflow-visible"
            >
              <defs>
                <linearGradient id="shnacksAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.30" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="shnacksLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = paddingY + chartInnerHeight * (1 - ratio);
                const currentMax =
                  lineMetric === 'revenue'
                    ? timeSeriesData.maxRevenue
                    : lineMetric === 'units'
                    ? timeSeriesData.maxUnits
                    : timeSeriesData.maxProductUnits;

                return (
                  <g key={ratio}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={lineSvgWidth - paddingX}
                      y2={y}
                      stroke="#1e293b"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {lineMetric === 'revenue'
                        ? `$${Math.round((currentMax * ratio) / 1000)}k`
                        : Math.round(currentMax * ratio)}
                    </text>
                  </g>
                );
              })}

              {/* Vertical guideline on hover */}
              {hoveredDateIndex !== null && timeSeriesData.points[hoveredDateIndex] && (
                <line
                  x1={
                    timeSeriesData.points.length === 1
                      ? lineSvgWidth / 2
                      : paddingX + (hoveredDateIndex / (timeSeriesData.points.length - 1)) * chartInnerWidth
                  }
                  y1={paddingY}
                  x2={
                    timeSeriesData.points.length === 1
                      ? lineSvgWidth / 2
                      : paddingX + (hoveredDateIndex / (timeSeriesData.points.length - 1)) * chartInnerWidth
                  }
                  y2={paddingY + chartInnerHeight}
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              )}

              {/* === MODE A: SINGLE CURVE (REVENUE OR TOTAL UNITS) === */}
              {lineMetric !== 'product' && (
                <>
                  {/* Gradient Area */}
                  {singleAreaPathD && <path d={singleAreaPathD} fill="url(#shnacksAreaGrad)" />}

                  {/* Spline Path */}
                  {singleLinePathD && (
                    <path
                      d={singleLinePathD}
                      fill="none"
                      stroke="url(#shnacksLineGrad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Interactive Nodes */}
                  {singleLineCoords.map((coord, idx) => {
                    const isHovered = hoveredDateIndex === idx;
                    return (
                      <g key={coord.point.date}>
                        {/* Hit Area */}
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r="14"
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredDateIndex(idx)}
                          onMouseLeave={() => setHoveredDateIndex(null)}
                        />
                        {/* Visible Point */}
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r={isHovered ? '6' : '3.5'}
                          fill={isHovered ? '#34d399' : '#10b981'}
                          stroke="#0f1523"
                          strokeWidth="2"
                          className="transition-all duration-150 pointer-events-none"
                        />
                        {/* X-axis date label */}
                        <text
                          x={coord.x}
                          y={lineSvgHeight - 8}
                          textAnchor="middle"
                          fill={isHovered ? '#f1f5f9' : '#64748b'}
                          fontSize="10"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {formatDate(coord.point.date)}
                        </text>
                      </g>
                    );
                  })}
                </>
              )}

              {/* === MODE B: MULTI-LINE CURVES (POR PRODUCTO) === */}
              {lineMetric === 'product' && (
                <>
                  {multiProductCoords.map(({ product, coords }) => {
                    const pathD = buildSmoothPath(coords);
                    return (
                      <g key={product.name}>
                        {/* Multi-line path */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={product.color}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.9"
                        />
                        {/* Data dots */}
                        {coords.map((c, idx) => {
                          const isDateHovered = hoveredDateIndex === idx;
                          return (
                            <circle
                              key={`${product.name}-${c.date}`}
                              cx={c.x}
                              cy={c.y}
                              r={isDateHovered ? '5' : '3'}
                              fill={product.color}
                              stroke="#0f1523"
                              strokeWidth="2"
                              className="transition-all pointer-events-none"
                            />
                          );
                        })}
                      </g>
                    );
                  })}

                  {/* Hit Areas & X Labels for Multi-line */}
                  {timeSeriesData.points.map((pt, idx) => {
                    const x =
                      timeSeriesData.points.length === 1
                        ? lineSvgWidth / 2
                        : paddingX + (idx / (timeSeriesData.points.length - 1)) * chartInnerWidth;
                    const isHovered = hoveredDateIndex === idx;

                    return (
                      <g key={`hit-${pt.date}`}>
                        <rect
                          x={x - 20}
                          y={paddingY}
                          width="40"
                          height={chartInnerHeight}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredDateIndex(idx)}
                          onMouseLeave={() => setHoveredDateIndex(null)}
                        />
                        <text
                          x={x}
                          y={lineSvgHeight - 8}
                          textAnchor="middle"
                          fill={isHovered ? '#f1f5f9' : '#64748b'}
                          fontSize="10"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {formatDate(pt.date)}
                        </text>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>

            {/* Hover Tooltip Float */}
            {hoveredDateIndex !== null && timeSeriesData.points[hoveredDateIndex] && (
              <div
                className="absolute z-10 pointer-events-none bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs text-slate-200 min-w-[200px]"
                style={{
                  left: `${
                    timeSeriesData.points.length === 1
                      ? 50
                      : ((paddingX +
                          (hoveredDateIndex / (timeSeriesData.points.length - 1)) *
                            chartInnerWidth) /
                          lineSvgWidth) *
                        100
                  }%`,
                  top: `20%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="font-semibold text-white flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    {formatDate(timeSeriesData.points[hoveredDateIndex].date)}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {timeSeriesData.points[hoveredDateIndex].ordersCount} órdenes
                  </span>
                </div>

                {/* Content based on selected metric */}
                {lineMetric === 'product' ? (
                  <div className="space-y-1">
                    {SHNACKS_PRODUCTS.map((prod) => {
                      const qty =
                        timeSeriesData.points[hoveredDateIndex].byProduct[prod.name] || 0;
                      return (
                        <div key={prod.name} className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: prod.color }}
                            ></span>
                            {prod.name}:
                          </span>
                          <span className="font-mono font-semibold tabular-nums text-slate-100">
                            {qty} pzas
                          </span>
                        </div>
                      );
                    })}
                    <div className="pt-1.5 mt-1.5 border-t border-slate-800 flex items-center justify-between font-medium text-[11px] text-emerald-400">
                      <span>Total unidades:</span>
                      <span className="font-mono tabular-nums font-bold">
                        {timeSeriesData.points[hoveredDateIndex].units} pzas
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-mono text-emerald-400 font-bold tabular-nums text-sm">
                      {lineMetric === 'revenue'
                        ? formatCurrency(timeSeriesData.points[hoveredDateIndex].revenue)
                        : `${timeSeriesData.points[hoveredDateIndex].units} piezas vendidas`}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {lineMetric === 'revenue'
                        ? `${timeSeriesData.points[hoveredDateIndex].units} unidades despachadas`
                        : `${formatCurrency(timeSeriesData.points[hoveredDateIndex].revenue)} facturados`}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer info note */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            {lineMetric === 'product'
              ? 'Pasa el cursor sobre las curvas para ver el desglose diario de cada producto'
              : 'Pasa el cursor sobre los nodos para ver el total del día'}
          </span>
          <span className="font-mono text-slate-300">
            {timeSeriesData.points.length} días analizados
          </span>
        </div>
      </div>

    </div>
  );
};
