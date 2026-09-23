import React from 'react';
import { Sparkles, Calendar, Cookie, RefreshCw, Download } from 'lucide-react';

interface HeaderProps {
  onNewOrderClick: () => void;
  onExportCsv: () => void;
  onResetData: () => void;
  totalOrdersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNewOrderClick,
  onExportCsv,
  onResetData,
  totalOrdersCount,
}) => {
  const currentDate = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const capitalizedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

  return (
    <header className="border-b border-slate-800/80 bg-[#0b0f19]/95 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Zone */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Cookie className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                  SHNACKS
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                  <Sparkles className="w-3 h-3" />
                  Gemini IA
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden xs:block">
                AI Sales & Operations Dashboard · Repostería Saludable
              </p>
            </div>
          </div>

          {/* Center Info: Live Date & Active Stats */}
          <div className="hidden lg:flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{capitalizedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono tabular-nums text-slate-200">{totalOrdersCount}</span>
              <span>órdenes en sistema</span>
            </div>
          </div>

          {/* Action Zone */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onResetData}
              title="Restablecer datos de muestra"
              className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reiniciar</span>
            </button>

            <button
              onClick={onExportCsv}
              className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            <button
              onClick={onNewOrderClick}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] rounded-lg transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="text-base leading-none font-bold">+</span>
              <span>Nueva Venta</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
