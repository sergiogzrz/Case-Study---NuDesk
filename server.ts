import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google Gemini Client (Server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/analyze-order', async (req, res) => {
  try {
    const order = req.body;
    if (!order || !order.customerName || !order.product) {
      return res.status(400).json({ error: 'Faltan datos de la orden para el análisis.' });
    }

    const itemsDescription =
      order.items && Array.isArray(order.items) && order.items.length > 0
        ? order.items
            .map(
              (it: any) =>
                `${it.product} (${it.quantity} pzas a $${it.unitPrice} MXN = $${it.total} MXN)`
            )
            .join('; ')
        : `${order.product} (${order.quantity} unidades)`;

    const totalCalculated = order.total || (order.quantity || 1) * (order.unitPrice || 65);

    const prompt = `Analiza la siguiente transacción de venta para la marca de repostería saludable "SHNACKS":
- Cliente / Empresa: ${order.customerName}
- Edad: ${order.age || 'No especificada'} años
- Género: ${order.gender || 'No especificado'}
- Productos Adquiridos: ${itemsDescription}
- Cantidad Total: ${order.quantity} unidades
- Total Facturado: $${totalCalculated} MXN
- Canal de Venta: ${order.channel}
- Fecha: ${order.date || new Date().toISOString().split('T')[0]}

Catálogo de referencia de SHNACKS:
1. Keto Brownies ($65 MXN): Harina de almendra, cacao puro 100%, endulzado con monk fruit (1.8g carbos netos).
2. Mini Cheesecakes ($85 MXN): Base de almendra y nuez, cero azúcar añadida, textura cremosa y suave.
3. Apple Crumble ($75 MXN): Manzanas horneadas con canela ceilán, crumble de avena sin gluten, vegano / plant-based.
4. Polvorones ($55 MXN): Textura tradicional suave, harina de almendra y eritritol con 12g de proteína por porción.

Genera una respuesta en formato JSON con la siguiente estructura exacta:
1. clientProfile: Análisis conciso (2-3 oraciones) de los hábitos de compra, motivaciones de consumo y comportamiento esperado según su demografía, canal y la combinación de productos adquiridos.
2. upsellingStrategy:
   - recommendedProduct: Nombre exacto de un producto complementario del catálogo SHNACKS para venta cruzada (cross-sell / upsell) que no haya adquirido o que complete su cesta.
   - pitchLine: Frase comercial persuasiva y empática formulada exactamente para el canal (${order.channel}) para ofrecer este producto complementario.
   - expectedValueAdd: Justificación de por qué este producto complementa nutricional o gastronómicamente la compra actual.
3. operationalAction:
   - inventoryRecommendation: Recomendación concreta de producción o reabastecimiento para cocina/almacén basada en el volumen pedido.
   - fulfillmentPriority: Prioridad de surtido ("Alta", "Media" o "Estándar").
   - kitchenNote: Instrucción operativa para empaque, conservación de cadena de frío o entrega según el canal.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Eres el Director de Operaciones y Estrategia Comercial de SHNACKS, una marca boutique mexicana de repostería saludable de alta gama. Tus recomendaciones son prácticas, comerciales, empáticas y orientadas a resultados.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clientProfile: {
              type: Type.STRING,
              description: 'Perfil y hábitos de consumo del cliente.',
            },
            upsellingStrategy: {
              type: Type.OBJECT,
              properties: {
                recommendedProduct: { type: Type.STRING },
                pitchLine: { type: Type.STRING },
                expectedValueAdd: { type: Type.STRING },
              },
              required: ['recommendedProduct', 'pitchLine', 'expectedValueAdd'],
            },
            operationalAction: {
              type: Type.OBJECT,
              properties: {
                inventoryRecommendation: { type: Type.STRING },
                fulfillmentPriority: { type: Type.STRING },
                kitchenNote: { type: Type.STRING },
              },
              required: ['inventoryRecommendation', 'fulfillmentPriority', 'kitchenNote'],
            },
          },
          required: ['clientProfile', 'upsellingStrategy', 'operationalAction'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Respuesta vacía del modelo');
    }

    const data = JSON.parse(text);
    return res.json({
      ...data,
      analyzedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      orderId: order.id,
    });
  } catch (error: any) {
    console.error('Error procesando con Gemini:', error);
    return res.status(500).json({
      error: 'Error al generar análisis con Gemini',
      details: error?.message || 'Error desconocido',
    });
  }
});

// Full stack serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`SHNACKS Server running on http://0.0.0.0:${port}`);
});
