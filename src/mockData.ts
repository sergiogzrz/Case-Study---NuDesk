import { Order, ProductCatalogItem } from './types';

export const PRODUCT_CATALOG: ProductCatalogItem[] = [
  {
    name: 'Keto Brownies',
    defaultPrice: 65,
    defaultDietary: 'Keto',
    description: 'Harina de almendra, cacao puro 100%, monk fruit y trozos de nuez pecana.',
    badge: '1.8g Carbos Netos'
  },
  {
    name: 'Mini Cheesecakes',
    defaultPrice: 85,
    defaultDietary: 'Sin Azúcar',
    description: 'Base crujiente de nuez y almendra con relleno suave de queso crema y vainilla bourbon.',
    badge: 'Zero Azúcar'
  },
  {
    name: 'Apple Crumble',
    defaultPrice: 75,
    defaultDietary: 'Vegano',
    description: 'Manzanas golden salteadas con canela ceilán, crumble de avena sin gluten y aceite de coco.',
    badge: '100% Plant-Based'
  },
  {
    name: 'Polvorones',
    defaultPrice: 55,
    defaultDietary: 'Proteico',
    description: 'Tradicionales de naranja y almendra, enriquecidos con aislado de proteína whey y eritritol.',
    badge: '12g Proteína / porción'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'SHN-1082',
    customerName: 'CrossFit IronBox San Pedro',
    age: 34,
    gender: 'Empresa / B2B',
    dietaryPreference: 'Proteico',
    product: 'Polvorones',
    quantity: 36,
    unitPrice: 55,
    total: 1980,
    channel: 'Gimnasios B2B',
    date: '2026-09-22',
    time: '17:40',
    status: 'Completada',
    geminiAnalysis: {
      clientProfile: 'Cuenta B2B corporativa con alto volumen de consumo post-entrenamiento. Los usuarios buscan densidad calórica limpia con aporte proteico tras sesiones de alta intensidad.',
      upsellingStrategy: {
        recommendedProduct: 'Keto Brownies',
        pitchLine: '¡Hola coach! Para los atletas que siguen protocolo cetogénico estricto, nuestro pack de 24 Keto Brownies con 1.8g net carbos vuela en la barra de snacks. ¿Agregamos media caja con 15% de margen B2B?',
        expectedValueAdd: 'Complementa la oferta proteica con una opción de carbohidratos ultrabajos para deportistas en fase de corte.'
      },
      operationalAction: {
        inventoryRecommendation: 'Aumentar lote de horneado matutino en 50 polvorones adicionales para prever reorden semanal recurrente.',
        fulfillmentPriority: 'Alta',
        kitchenNote: 'Empacar en bandejas termo-selladas con etiqueta nutricional visible para exhibición directa en mostrador del gimnasio.'
      },
      analyzedAt: '2026-09-22 17:45'
    }
  },
  {
    id: 'SHN-1081',
    customerName: 'Mariana Elizondo',
    age: 28,
    gender: 'Femenino',
    dietaryPreference: 'Keto',
    product: 'Keto Brownies',
    quantity: 6,
    unitPrice: 65,
    total: 390,
    channel: 'Instagram',
    date: '2026-09-22',
    time: '15:20',
    status: 'Completada',
    geminiAnalysis: {
      clientProfile: 'Consumidora joven millennial enfocada en estilo de vida low-carb y bienestar estético. Compra recurrente individual/semanal para antojos sin culpa.',
      upsellingStrategy: {
        recommendedProduct: 'Mini Cheesecakes',
        pitchLine: 'Si te encantan los Keto Brownies, nuestro Mini Cheesecake con base crocante de nuez es el maridaje perfecto para tus tardes de café keto.',
        expectedValueAdd: 'Eleva el ticket promedio en $85 MXN introduciendo una textura fresca y cremosa contrastante.'
      },
      operationalAction: {
        inventoryRecommendation: 'Verificar inventario de harina de almendra fina y monk fruit líquido para la tanda vespertina.',
        fulfillmentPriority: 'Media',
        kitchenNote: 'Incluir tarjeta de agradecimiento personalizada con tips de refrigeración.'
      },
      analyzedAt: '2026-09-22 15:22'
    }
  },
  {
    id: 'SHN-1080',
    customerName: 'Studio Pilates Reforma',
    age: 41,
    gender: 'Empresa / B2B',
    dietaryPreference: 'Sin Azúcar',
    product: 'Mini Cheesecakes',
    quantity: 20,
    unitPrice: 85,
    total: 1700,
    channel: 'Gimnasios B2B',
    date: '2026-09-21',
    time: '11:15',
    status: 'Completada'
  },
  {
    id: 'SHN-1079',
    customerName: 'Rodrigo Garza Treviño',
    age: 32,
    gender: 'Masculino',
    dietaryPreference: 'Proteico',
    product: 'Polvorones',
    quantity: 4,
    unitPrice: 55,
    total: 220,
    channel: 'WhatsApp',
    date: '2026-09-21',
    time: '09:40',
    status: 'Completada'
  },
  {
    id: 'SHN-1078',
    customerName: 'Dra. Camila Morales',
    age: 38,
    gender: 'Femenino',
    dietaryPreference: 'Vegano',
    product: 'Apple Crumble',
    quantity: 5,
    unitPrice: 75,
    total: 375,
    channel: 'WhatsApp',
    date: '2026-09-20',
    time: '18:10',
    status: 'Completada'
  },
  {
    id: 'SHN-1077',
    customerName: 'Santiago Navarro',
    age: 26,
    gender: 'Masculino',
    dietaryPreference: 'Keto',
    product: 'Keto Brownies',
    quantity: 8,
    unitPrice: 65,
    total: 520,
    channel: 'Venta Directa',
    date: '2026-09-20',
    time: '14:30',
    status: 'Completada'
  },
  {
    id: 'SHN-1076',
    customerName: 'Valeria Serna & Amigos',
    age: 29,
    gender: 'Femenino',
    dietaryPreference: 'Sin Azúcar',
    product: 'Mini Cheesecakes',
    quantity: 4,
    unitPrice: 85,
    total: 340,
    channel: 'Instagram',
    date: '2026-09-19',
    time: '16:50',
    status: 'Completada'
  },
  {
    id: 'SHN-1075',
    customerName: 'SmartFit Del Valle B2B',
    age: 35,
    gender: 'Empresa / B2B',
    dietaryPreference: 'Proteico',
    product: 'Polvorones',
    quantity: 28,
    unitPrice: 55,
    total: 1540,
    channel: 'Gimnasios B2B',
    date: '2026-09-19',
    time: '10:05',
    status: 'Completada'
  },
  {
    id: 'SHN-1074',
    customerName: 'Lucía Benavides',
    age: 45,
    gender: 'Femenino',
    dietaryPreference: 'Vegano',
    product: 'Apple Crumble',
    quantity: 3,
    unitPrice: 75,
    total: 225,
    channel: 'Venta Directa',
    date: '2026-09-18',
    time: '13:15',
    status: 'Completada'
  },
  {
    id: 'SHN-1073',
    customerName: 'Carlos Mendívil',
    age: 30,
    gender: 'Masculino',
    dietaryPreference: 'Keto',
    product: 'Keto Brownies',
    quantity: 5,
    unitPrice: 65,
    total: 325,
    channel: 'Instagram',
    date: '2026-09-17',
    time: '12:00',
    status: 'Completada'
  }
];
