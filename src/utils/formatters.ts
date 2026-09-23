import { Order, GeminiAnalysis } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (val: number): string => {
  return new Intl.NumberFormat('es-MX').format(val);
};

export const formatDate = (dateStr: string): string => {
  try {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    return new Intl.DateTimeFormat('es-MX', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};

/**
 * Robust domain-grounded fallback generator if Gemini API key is missing,
 * rate limited, or backend network fails, guaranteeing uninterrupted dashboard UX.
 */
export const generateLocalFallbackAnalysis = (order: Order): GeminiAnalysis => {
  const isB2B = order.channel === 'Gimnasios B2B' || order.gender === 'Empresa / B2B' || order.quantity >= 15;

  if (isB2B) {
    return {
      clientProfile: `Cliente B2B enfocado en abastecimiento comercial para comunidad fitness. Demuestra alta sensibilidad a la rotación de producto y demanda opciones de snacks saludables con alto valor nutricional post-entrenamiento.`,
      upsellingStrategy: {
        recommendedProduct: order.product === 'Polvorones' ? 'Keto Brownies' : 'Polvorones',
        pitchLine: `¡Hola equipo de ${order.customerName}! Nuestros ${order.product === 'Polvorones' ? 'Keto Brownies' : 'Polvorones Proteicos'} tienen una tasa de reorden del 90% en centros deportivos. ¿Les gustaría agregar un lote de degustación con 15% de descuento distribuidor?`,
        expectedValueAdd: `Diversifica la oferta entre opciones altas en proteína y carbohidratos netos reducidos (Keto), captando ambos segmentos de atletas.`,
      },
      operationalAction: {
        inventoryRecommendation: `Programar horneado matutino en bloque de ${order.quantity + 10} unidades para optimizar capacidad de horno y mantener stock de seguridad.`,
        fulfillmentPriority: 'Alta',
        kitchenNote: `Empacar en cajas corrugadas reforzadas con separadores individuales y etiquetas de lote y caducidad para exhibición comercial.`,
      },
      analyzedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      orderId: order.id,
    };
  }

  // Consumer fallback
  const isKeto = order.dietaryPreference === 'Keto';
  const isVegan = order.dietaryPreference === 'Vegano';
  const isSugarFree = order.dietaryPreference === 'Sin Azúcar';

  const complement = isKeto
    ? {
        product: 'Mini Cheesecakes',
        pitch: `¡Hola ${order.customerName}! Notamos que te encantan nuestros ${order.product}. Nuestro Mini Cheesecake keto con base crujiente de nuez y cero azúcar añadida es ideal para tu tarde de café. ¿Te sumamos uno para probarlo?`,
        value: 'Aporta variedad de textura cremosa manteniendo el estado de cetosis intacto con ingredientes limpios.',
      }
    : isVegan
    ? {
        product: 'Polvorones',
        pitch: `¡Hola ${order.customerName}! Para acompañar tu ${order.product}, nuestros Polvorones saludables elaborados con harina de almendra y naranja tienen una textura que se deshace en la boca.`,
        value: 'Complementa tu selección plant-based con un snack tradicional reformulado con ingredientes naturales.',
      }
    : {
        product: 'Keto Brownies',
        pitch: `¡Hola ${order.customerName}! Si disfrutas cuidarte sin sacrificar sabor, nuestros Keto Brownies con cacao puro al 100% y trozos de nuez pecana son los favoritos de nuestra comunidad.`,
        value: 'Eleva la experiencia con un postre intenso en chocolate amargo completamente libre de azúcares refinados.',
      };

  return {
    clientProfile: `Consumidor individual (${order.age ? order.age + ' años, ' : ''}${order.gender}) que prioriza nutrición consciente y conveniencia mediante ${order.channel}. Presenta fidelidad a alternativas libres de azúcar y empaques individuales para consumo diario.`,
    upsellingStrategy: {
      recommendedProduct: complement.product,
      pitchLine: complement.pitch,
      expectedValueAdd: complement.value,
    },
    operationalAction: {
      inventoryRecommendation: `Monitorear existencias de empaques biodegradables individuales e insumos clave para ${order.product}.`,
      fulfillmentPriority: order.quantity > 5 ? 'Media' : 'Estándar',
      kitchenNote: `Mantener cadena de frío si aplica (especialmente para cheesecakes a 4°C) y colocar sello de garantía SHNACKS.`,
    },
    analyzedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    orderId: order.id,
  };
};
