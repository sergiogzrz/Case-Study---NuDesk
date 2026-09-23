export type DietaryPreference = 'Keto' | 'Sin Azúcar' | 'Proteico' | 'Vegano';

export type ProductType = 
  | 'Keto Brownies' 
  | 'Mini Cheesecakes' 
  | 'Apple Crumble' 
  | 'Polvorones';

export type SalesChannel = 
  | 'WhatsApp' 
  | 'Instagram' 
  | 'Gimnasios B2B' 
  | 'Venta Directa';

export type Gender = 
  | 'Femenino' 
  | 'Masculino' 
  | 'No Binario' 
  | 'Empresa / B2B';

export interface UpsellingStrategy {
  recommendedProduct: string;
  pitchLine: string;
  expectedValueAdd: string;
}

export interface OperationalAction {
  inventoryRecommendation: string;
  fulfillmentPriority: 'Alta' | 'Media' | 'Estándar' | string;
  kitchenNote: string;
}

export interface GeminiAnalysis {
  clientProfile: string;
  upsellingStrategy: UpsellingStrategy;
  operationalAction: OperationalAction;
  analyzedAt?: string;
  orderId?: string;
}

export interface OrderItem {
  product: ProductType;
  quantity: number;
  unitPrice: number;
  total: number;
  dietaryPreference?: DietaryPreference;
}

export interface Order {
  id: string;
  customerName: string;
  age: number;
  gender: Gender;
  items?: OrderItem[];
  product: string;
  quantity: number;
  unitPrice?: number;
  total: number;
  channel: SalesChannel;
  date: string; // YYYY-MM-DD
  time?: string;
  status: 'Completada' | 'En Producción' | 'Pendiente';
  geminiAnalysis?: GeminiAnalysis;
  dietaryPreference?: DietaryPreference | string;
}

export interface ProductCatalogItem {
  name: ProductType;
  defaultPrice: number;
  defaultDietary: DietaryPreference;
  description: string;
  badge: string;
}
