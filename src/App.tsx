import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { OrderForm } from './components/OrderForm';
import { GeminiPanel } from './components/GeminiPanel';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { OrdersTable } from './components/OrdersTable';
import { Order, GeminiAnalysis } from './types';
import { INITIAL_ORDERS } from './mockData';
import { generateLocalFallbackAnalysis } from './utils/formatters';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  // Load orders from localStorage or default to INITIAL_ORDERS
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('shnacks_orders_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_ORDERS;
  });

  // Active analyzed order and its analysis
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => orders[0] || null);
  const [activeAnalysis, setActiveAnalysis] = useState<GeminiAnalysis | null>(
    () => orders[0]?.geminiAnalysis || null
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  // Filter synced between chart click and table
  const [chartFilter, setChartFilter] = useState<{
    type: 'channel' | 'product';
    value: string;
  } | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info';
  } | null>(null);

  const formRef = useRef<HTMLDivElement>(null);
  const geminiPanelRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Save orders to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('shnacks_orders_v1', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Show auto-dismissing toast
  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Function to call server Gemini API or fallback
  const fetchGeminiAnalysis = async (order: Order): Promise<GeminiAnalysis> => {
    try {
      const response = await fetch('/api/analyze-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error || `HTTP error ${response.status}`);
      }

      const data: GeminiAnalysis = await response.json();
      return data;
    } catch (err: any) {
      console.warn('Fallo llamada directa a Gemini, usando generador analítico contextual:', err);
      // Fallback to rich contextual analysis
      return generateLocalFallbackAnalysis(order);
    }
  };

  // Handle new order registration
  const handleRegisterOrder = async (
    orderData: Omit<Order, 'id' | 'date' | 'status'>
  ) => {
    setIsAnalyzing(true);
    setGeminiError(null);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 5);
    const newId = `SHN-${Math.floor(1000 + Math.random() * 9000)}`;
    const total = orderData.total ?? (orderData.quantity * (orderData.unitPrice || 0));

    const newOrder: Order = {
      ...orderData,
      id: newId,
      total,
      date: dateStr,
      time: timeStr,
      status: 'Completada',
    };

    // Pre-insert order into state so user sees it right away
    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrder(newOrder);

    // Smooth scroll to Gemini Assistant Panel
    if (geminiPanelRef.current) {
      geminiPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    try {
      const analysis = await fetchGeminiAnalysis(newOrder);
      const enrichedOrder: Order = {
        ...newOrder,
        geminiAnalysis: analysis,
      };

      setOrders((prev) =>
        prev.map((o) => (o.id === newOrder.id ? enrichedOrder : o))
      );
      setActiveOrder(enrichedOrder);
      setActiveAnalysis(analysis);
      showToast(`¡Venta #${newId} registrada y analizada por Gemini IA!`, 'success');
    } catch (error: any) {
      setGeminiError('Ocurrió una interrupción al generar la respuesta de IA.');
      showToast(`Venta registrada. Asistente en modo offline.`, 'info');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Re-analyze existing order
  const handleReanalyzeOrder = async (order: Order) => {
    setIsAnalyzing(true);
    setGeminiError(null);
    try {
      const analysis = await fetchGeminiAnalysis(order);
      const updatedOrder = { ...order, geminiAnalysis: analysis };
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? updatedOrder : o))
      );
      setActiveOrder(updatedOrder);
      setActiveAnalysis(analysis);
      showToast(`Análisis de orden #${order.id} actualizado.`, 'success');
    } catch {
      setGeminiError('No se pudo re-analizar la orden en este momento.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Select an order from the table to view in Gemini panel
  const handleSelectOrderForAnalysis = (order: Order) => {
    setActiveOrder(order);
    if (order.geminiAnalysis) {
      setActiveAnalysis(order.geminiAnalysis);
    } else {
      handleReanalyzeOrder(order);
    }

    if (geminiPanelRef.current) {
      geminiPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Delete an order
  const handleDeleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    if (activeOrder?.id === id) {
      const remaining = orders.filter((o) => o.id !== id);
      if (remaining.length > 0) {
        setActiveOrder(remaining[0]);
        setActiveAnalysis(remaining[0].geminiAnalysis || null);
      } else {
        setActiveOrder(null);
        setActiveAnalysis(null);
      }
    }
    showToast(`Transacción ${id} eliminada.`, 'info');
  };

  // Reset to initial mock data
  const handleResetData = () => {
    if (window.confirm('¿Deseas restaurar los datos de muestra iniciales de SHNACKS?')) {
      setOrders(INITIAL_ORDERS);
      setActiveOrder(INITIAL_ORDERS[0]);
      setActiveAnalysis(INITIAL_ORDERS[0].geminiAnalysis || null);
      setChartFilter(null);
      showToast('Datos de muestra restablecidos con éxito.');
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (orders.length === 0) {
      alert('No hay órdenes para exportar.');
      return;
    }

    const headers = [
      'ID',
      'Fecha',
      'Hora',
      'Cliente',
      'Edad',
      'Genero',
      'Preferencia_Dietetica',
      'Producto',
      'Cantidad',
      'Precio_Unitario',
      'Total_MXN',
      'Canal_Venta',
      'Upselling_Recomendado',
      'Prioridad_Operativa',
    ];

    const rows = orders.map((o) => [
      `"${o.id}"`,
      `"${o.date}"`,
      `"${o.time || ''}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.age,
      `"${o.gender}"`,
      `"${o.dietaryPreference}"`,
      `"${o.product}"`,
      o.quantity,
      o.unitPrice,
      o.total,
      `"${o.channel}"`,
      `"${(o.geminiAnalysis?.upsellingStrategy?.recommendedProduct || '').replace(/"/g, '""')}"`,
      `"${(o.geminiAnalysis?.operationalAction?.fulfillmentPriority || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `shnacks_ventas_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Reporte CSV descargado con éxito.');
  };

  // KPIs calculation
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalUnits = orders.reduce((sum, o) => sum + o.quantity, 0);
  const totalOrders = orders.length;
  const averageTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Top Channel calculation
  const channelTotals = orders.reduce((acc: { [key: string]: number }, o) => {
    acc[o.channel] = (acc[o.channel] || 0) + o.total;
    return acc;
  }, {});
  const topChannel = Object.entries(channelTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Gimnasios B2B';

  // Top Product calculation
  const productTotals = orders.reduce((acc: { [key: string]: number }, o) => {
    if (o.items && Array.isArray(o.items) && o.items.length > 0) {
      o.items.forEach((it) => {
        acc[it.product] = (acc[it.product] || 0) + it.quantity;
      });
    } else if (o.product) {
      acc[o.product] = (acc[o.product] || 0) + o.quantity;
    }
    return acc;
  }, {});
  const topProduct = Object.entries(productTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Keto Brownies';

  // Scroll to new order form
  const handleScrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        onNewOrderClick={handleScrollToForm}
        onExportCsv={handleExportCsv}
        onResetData={handleResetData}
        totalOrdersCount={orders.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
            <div className="bg-slate-900/95 border border-emerald-500/40 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-medium">{toastMessage.text}</span>
            </div>
          </div>
        )}

        {/* 1. Top KPI Summary Cards */}
        <section aria-label="Indicadores Clave de Rendimiento">
          <KpiCards
            totalRevenue={totalRevenue}
            totalUnits={totalUnits}
            averageTicket={averageTicket}
            totalOrders={totalOrders}
            topChannel={topChannel}
            topProduct={topProduct}
          />
        </section>

        {/* 2. Interactive Analytics Dashboard (Bar Chart & Line Chart) */}
        <section aria-label="Gráficos Interactivos de Ventas">
          <AnalyticsCharts
            orders={orders}
            onSelectFilter={(type, value) => {
              setChartFilter({ type, value });
              if (tableRef.current) {
                tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }}
            activeFilter={chartFilter}
          />
        </section>

        {/* 3. Operational Split: Order Registration Form + Gemini AI Assistant Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Order Registration Form */}
          <div ref={formRef} className="lg:col-span-6 space-y-4">
            <OrderForm
              onSubmitOrder={handleRegisterOrder}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {/* Gemini AI Assistant Panel */}
          <div ref={geminiPanelRef} className="lg:col-span-6 space-y-4">
            <GeminiPanel
              analysis={activeAnalysis}
              activeOrder={activeOrder}
              isLoading={isAnalyzing}
              onReanalyze={handleReanalyzeOrder}
              errorMessage={geminiError}
            />
          </div>

        </div>

        {/* 4. Transactions Data Table */}
        <section ref={tableRef} aria-label="Tabla de Transacciones">
          <OrdersTable
            orders={orders}
            onSelectOrderForAnalysis={handleSelectOrderForAnalysis}
            onDeleteOrder={handleDeleteOrder}
            activeOrderId={activeOrder?.id}
            externalFilter={chartFilter}
            onClearExternalFilter={() => setChartFilter(null)}
            onExportCsv={handleExportCsv}
          />
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b12] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">SHNACKS</span>
            <span>·</span>
            <span>Repostería Saludable & Operaciones Analíticas</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Potenciado por Google Gemini 3.8 Flash</span>
            <span>·</span>
            <span>Tiempo Real & Estado Local</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
