import React, { useState } from 'react';
import {
  Sparkles,
  UserCheck,
  TrendingUp,
  ChefHat,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Tag,
  Clock,
  ArrowRight
} from 'lucide-react';
import { GeminiAnalysis, Order } from '../types';
import { formatCurrency } from '../utils/formatters';

interface GeminiPanelProps {
  analysis: GeminiAnalysis | null;
  activeOrder: Order | null;
  isLoading: boolean;
  onReanalyze: (order: Order) => Promise<void>;
  errorMessage?: string | null;
}

export const GeminiPanel: React.FC<GeminiPanelProps> = ({
  analysis,
  activeOrder,
  isLoading,
  onReanalyze,
  errorMessage,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPitch = () => {
    if (!analysis?.upsellingStrategy?.pitchLine) return;
    navigator.clipboard.writeText(analysis.upsellingStrategy.pitchLine);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0e1422] border border-slate-800 rounded-2xl shadow-lg overflow-hidden relative">
      
      {/* Decorative top accent hairline */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400"></div>

      {/* Header bar */}
      <div className="px-5 py-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a0f1b]/60">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Asistente Gemini IA · Inteligencia de Ventas y Cocina
              </h3>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-400">
                gemini-3.8-flash
              </span>
            </div>
            {activeOrder && (
              <p className="text-xs text-slate-400 mt-0.5">
                Analizando transacción <span className="font-mono text-slate-200">{activeOrder.id}</span> · {activeOrder.customerName} ({activeOrder.product}, {activeOrder.quantity} pzas · {activeOrder.channel})
              </p>
            )}
          </div>
        </div>

        {activeOrder && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {analysis?.analyzedAt && (
              <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                {analysis.analyzedAt}
              </span>
            )}
            <button
              onClick={() => onReanalyze(activeOrder)}
              disabled={isLoading}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/70 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isLoading ? 'Analizando...' : 'Re-analizar'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-5 sm:p-6">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="h-4 bg-slate-800 rounded w-1/3"></div>
              <div className="h-3 bg-slate-800/80 rounded w-full"></div>
              <div className="h-3 bg-slate-800/80 rounded w-4/5"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                <div className="h-3 bg-slate-800/80 rounded w-3/4"></div>
                <div className="h-12 bg-slate-800/50 rounded w-full"></div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                <div className="h-3 bg-slate-800/80 rounded w-3/4"></div>
                <div className="h-12 bg-slate-800/50 rounded w-full"></div>
              </div>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">Aviso del Asistente</p>
              <p className="mt-1 text-slate-300">{errorMessage}</p>
            </div>
          </div>
        ) : !analysis ? (
          <div className="text-center py-8 px-4 text-slate-400">
            <Sparkles className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-300">Sin análisis activo</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Registra una nueva venta con el formulario o haz clic en "Analizar con IA" en cualquier orden de la tabla.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* 1. Client Profile Card */}
            <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800/90 relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Perfil del Cliente y Hábitos de Compra
                </h4>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed pl-7">
                {analysis.clientProfile}
              </p>
            </div>

            {/* 2 & 3: Upselling Strategy & Operational Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 2. Upselling Strategy */}
              <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800/90 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                        Estrategia de Upselling
                      </h4>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {analysis.upsellingStrategy.recommendedProduct}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3 pl-6">
                    {analysis.upsellingStrategy.expectedValueAdd}
                  </p>
                </div>

                {/* Pitch Line Box */}
                <div className="mt-2 p-3 rounded-lg bg-slate-900/90 border border-slate-800 relative group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                      Pitch Comercial ({activeOrder?.channel || 'Directo'})
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPitch}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors bg-emerald-950/40 hover:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar Pitch</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs italic text-slate-200 leading-relaxed font-sans">
                    "{analysis.upsellingStrategy.pitchLine}"
                  </p>
                </div>
              </div>

              {/* 3. Operational Action */}
              <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800/90 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <ChefHat className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                        Acción Operativa y Cocina
                      </h4>
                    </div>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                        analysis.operationalAction.fulfillmentPriority === 'Alta'
                          ? 'bg-red-950/60 text-red-400 border-red-800/60'
                          : analysis.operationalAction.fulfillmentPriority === 'Media'
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      Prioridad: {analysis.operationalAction.fulfillmentPriority}
                    </span>
                  </div>

                  <div className="space-y-2.5 pl-6 mt-2">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Inventario / Producción:
                      </span>
                      <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                        {analysis.operationalAction.inventoryRecommendation}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Instrucción de Despacho & Empaque:
                      </span>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        {analysis.operationalAction.kitchenNote}
                      </p>
                    </div>
                  </div>
                </div>

                {activeOrder && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Impacto proyectado en ticket:</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      +{formatCurrency(activeOrder.product === 'Polvorones' ? 65 : 85)} MXN
                    </span>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </div>

    </div>
  );
};
