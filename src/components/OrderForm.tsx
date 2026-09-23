import React, { useState } from 'react';
import {
  Sparkles,
  PlusCircle,
  Trash2,
  Plus,
  Info,
  DollarSign,
  User,
  ShoppingBag,
  Package,
  ChevronDown,
  Layers
} from 'lucide-react';
import {
  ProductType,
  SalesChannel,
  Gender,
  Order,
  OrderItem,
  DietaryPreference,
} from '../types';
import { PRODUCT_CATALOG } from '../mockData';
import { formatCurrency } from '../utils/formatters';

interface FormItem {
  id: string;
  product: ProductType;
  quantity: number;
}

interface OrderFormProps {
  onSubmitOrder: (orderData: Omit<Order, 'id' | 'date' | 'status'>) => Promise<void>;
  isAnalyzing: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  onSubmitOrder,
  isAnalyzing,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [age, setAge] = useState<number | ''>(29);
  const [gender, setGender] = useState<Gender>('Femenino');
  const [channel, setChannel] = useState<SalesChannel>('Instagram');

  // Multi-product items list
  const [items, setItems] = useState<FormItem[]>([
    { id: 'item-1', product: 'Keto Brownies', quantity: 2 },
  ]);

  const [errorMsg, setErrorMsg] = useState('');

  // Helper to get catalog item
  const getProductDetails = (productName: ProductType) => {
    return PRODUCT_CATALOG.find((p) => p.name === productName) || PRODUCT_CATALOG[0];
  };

  // Add new product row
  const handleAddItem = () => {
    // Pick first product not already in items, or default to first
    const existingProducts = items.map((i) => i.product);
    const nextProduct =
      PRODUCT_CATALOG.find((p) => !existingProducts.includes(p.name))?.name ||
      PRODUCT_CATALOG[0].name;

    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        product: nextProduct,
        quantity: 1,
      },
    ]);
  };

  // Remove a product row
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      setErrorMsg('El pedido debe contener al menos un producto.');
      return;
    }
    setErrorMsg('');
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Update item product
  const handleUpdateProduct = (id: string, newProduct: ProductType) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, product: newProduct } : item))
    );
  };

  // Update item quantity
  const handleUpdateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Set specific item quantity from text/number input
  const handleSetQuantity = (id: string, val: number) => {
    const safeVal = isNaN(val) || val < 1 ? 1 : val;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: safeVal } : item))
    );
  };

  // Quick order combo presets (without dietary labels)
  const handleApplyCombo = (combo: {
    customerName: string;
    age: number;
    gender: Gender;
    channel: SalesChannel;
    items: Array<{ product: ProductType; quantity: number }>;
  }) => {
    setCustomerName(combo.customerName);
    setAge(combo.age);
    setGender(combo.gender);
    setChannel(combo.channel);
    setItems(
      combo.items.map((item, idx) => ({
        id: `preset-${idx}-${Date.now()}`,
        product: item.product,
        quantity: item.quantity,
      }))
    );
    setErrorMsg('');
  };

  // Calculated overall totals
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => {
    const details = getProductDetails(item.product);
    return sum + item.quantity * details.defaultPrice;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('Por favor introduce el nombre del cliente o empresa.');
      return;
    }
    if (items.length === 0 || totalUnits <= 0) {
      setErrorMsg('Debes agregar al menos un producto con cantidad válida.');
      return;
    }

    setErrorMsg('');

    // Prepare full OrderItems with catalog prices and dietary properties
    const orderItems: OrderItem[] = items.map((item) => {
      const details = getProductDetails(item.product);
      return {
        product: item.product,
        quantity: item.quantity,
        unitPrice: details.defaultPrice,
        total: item.quantity * details.defaultPrice,
        dietaryPreference: details.defaultDietary,
      };
    });

    // Summary representation of products
    const productSummary =
      items.length === 1
        ? `${items[0].product} (${items[0].quantity} pzas)`
        : items.map((i) => `${i.product} (${i.quantity})`).join(', ');

    // Primary dietary preference derived automatically for reporting
    const uniqueDiets = Array.from(
      new Set(orderItems.map((i) => i.dietaryPreference).filter(Boolean))
    );
    const derivedDietary: DietaryPreference = (uniqueDiets[0] || 'Keto') as DietaryPreference;

    await onSubmitOrder({
      customerName: customerName.trim(),
      age: typeof age === 'number' ? age : 28,
      gender,
      channel,
      items: orderItems,
      product: productSummary,
      quantity: totalUnits,
      unitPrice: Math.round(totalAmount / totalUnits),
      total: totalAmount,
      dietaryPreference: uniqueDiets.length > 1 ? uniqueDiets.join(' / ') : derivedDietary,
    });

    // Reset customer name and restore single default item
    setCustomerName('');
    setItems([{ id: `item-${Date.now()}`, product: 'Keto Brownies', quantity: 2 }]);
  };

  return (
    <div className="bg-[#0f1523] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-md">
      
      {/* Header of Form */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-800/80 gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <span>Registro de Nueva Venta</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Agrega los productos del pedido para registrar la orden y generar el análisis con Gemini IA.
          </p>
        </div>

        {/* Quick Combos (reemplazan los antiguos botones dietéticos) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
            <Layers className="w-3 h-3 text-emerald-400" />
            Ejemplos:
          </span>
          <button
            type="button"
            onClick={() =>
              handleApplyCombo({
                customerName: 'Gimnasio FitZone Valle',
                age: 36,
                gender: 'Empresa / B2B',
                channel: 'Gimnasios B2B',
                items: [
                  { product: 'Polvorones', quantity: 24 },
                  { product: 'Keto Brownies', quantity: 12 },
                ],
              })
            }
            className="px-2.5 py-1 text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            Lote Mixto B2B
          </button>
          <button
            type="button"
            onClick={() =>
              handleApplyCombo({
                customerName: 'Daniela Villarreal',
                age: 27,
                gender: 'Femenino',
                channel: 'Instagram',
                items: [
                  { product: 'Mini Cheesecakes', quantity: 2 },
                  { product: 'Keto Brownies', quantity: 2 },
                ],
              })
            }
            className="px-2.5 py-1 text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            Dúo Degustación
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Row 1: Customer Name, Age, Gender & Sales Channel */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
          <div className="sm:col-span-5">
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Cliente o Empresa</span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ej. Gimnasio IronBox o Sofía Ramos"
              className="w-full bg-[#0a0f1b] border border-slate-800 focus:border-emerald-500 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Edad
            </label>
            <input
              type="number"
              min={14}
              max={99}
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              placeholder="Ej. 30"
              className="w-full bg-[#0a0f1b] border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 font-mono tabular-nums focus:outline-none transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Género
            </label>
            <div className="relative">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full appearance-none bg-[#0a0f1b] border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-2 text-sm text-slate-100 focus:outline-none transition-colors pr-7 cursor-pointer text-xs sm:text-sm"
              >
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
                <option value="No Binario">No Binario</option>
                <option value="Empresa / B2B">Empresa / B2B</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Canal de Venta
            </label>
            <div className="relative">
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as SalesChannel)}
                className="w-full appearance-none bg-[#0a0f1b] border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none transition-colors pr-7 cursor-pointer"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Instagram">Instagram</option>
                <option value="Gimnasios B2B">Gimnasios B2B</option>
                <option value="Venta Directa">Venta Directa</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Section 2: Multi-Product Itemized List */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Productos del Pedido ({items.length})</span>
            </label>
            <span className="text-[11px] text-slate-400">
              Precios del catálogo aplicados automáticamente
            </span>
          </div>

          {/* List of item rows */}
          <div className="space-y-2.5">
            {items.map((item, index) => {
              const details = getProductDetails(item.product);
              const lineTotal = item.quantity * details.defaultPrice;

              return (
                <div
                  key={item.id}
                  className="p-3 sm:p-3.5 rounded-xl bg-[#0a0f1b] border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-slate-700/80 transition-all"
                >
                  {/* Left: Product Selector */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono text-slate-500">#{index + 1}</span>
                      <div className="relative flex-1">
                        <select
                          value={item.product}
                          onChange={(e) =>
                            handleUpdateProduct(item.id, e.target.value as ProductType)
                          }
                          className="w-full appearance-none bg-slate-900 border border-slate-700/80 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none transition-colors pr-8 cursor-pointer font-medium"
                        >
                          <option value="Keto Brownies">Keto Brownies</option>
                          <option value="Mini Cheesecakes">Mini Cheesecakes</option>
                          <option value="Apple Crumble">Apple Crumble</option>
                          <option value="Polvorones">Polvorones</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 pl-5">
                      <span>Precio catálogo: <strong className="text-emerald-400 font-mono">${details.defaultPrice} MXN</strong></span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-500">{details.badge}</span>
                    </div>
                  </div>

                  {/* Right: Quantity Stepper & Line Total & Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/50">
                    
                    {/* Stepper */}
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="h-8 w-8 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-l-lg border border-r-0 border-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer"
                        title="Reducir cantidad"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          handleSetQuantity(item.id, parseInt(e.target.value, 10))
                        }
                        className="h-8 w-12 bg-slate-900 border-y border-slate-700 text-center text-xs text-slate-100 font-mono tabular-nums focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="h-8 w-8 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-r-lg border border-l-0 border-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer"
                        title="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="min-w-[80px] text-right">
                      <div className="text-sm font-bold font-mono tabular-nums text-slate-100">
                        {formatCurrency(lineTotal)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {item.quantity} × ${details.defaultPrice}
                      </div>
                    </div>

                    {/* Delete Line Button */}
                    <button
                      type="button"
                      disabled={items.length <= 1}
                      onClick={() => handleRemoveItem(item.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        items.length <= 1
                          ? 'text-slate-700 cursor-not-allowed opacity-40'
                          : 'text-slate-400 hover:text-red-400 hover:bg-red-950/30 cursor-pointer'
                      }`}
                      title={items.length <= 1 ? 'Mínimo un producto requerido' : 'Eliminar producto'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Product Button */}
          <button
            type="button"
            onClick={handleAddItem}
            className="w-full py-2.5 px-3 border border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl text-xs font-medium text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Agregar otro producto a esta orden</span>
          </button>
        </div>

        {/* Summary Banner & Submit Button */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Total de la Orden
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-white">
                {formatCurrency(totalAmount)}{' '}
                <span className="text-xs font-normal text-slate-400">
                  ({totalUnits} {totalUnits === 1 ? 'unidad' : 'unidades'} en {items.length} {items.length === 1 ? 'producto' : 'productos'})
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className={`px-5 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              isAnalyzing
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-wait'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Procesando con Gemini IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Registrar y Analizar con Gemini IA</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
