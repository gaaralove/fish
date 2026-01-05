
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const placeOrderFunction: FunctionDeclaration = {
  name: 'placeFoodOrder',
  parameters: {
    type: Type.OBJECT,
    description: 'Place a food order from a specific restaurant with items.',
    properties: {
      restaurantName: {
        type: Type.STRING,
        description: 'The name of the restaurant.',
      },
      items: {
        type: Type.ARRAY,
        description: 'List of items to order.',
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            price: { type: Type.NUMBER },
            quantity: { type: Type.INTEGER }
          },
          required: ['name', 'price', 'quantity']
        }
      },
      deliveryAddress: {
        type: Type.STRING,
        description: 'Where the food should be delivered.'
      }
    },
    required: ['restaurantName', 'items', 'deliveryAddress'],
  },
};

export class GeminiService {
  async generateResponse(prompt: string, location?: { lat: number; lng: number }) {
    // Correctly accessing API key from environment variables
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("Missing_API_KEY");
    }

    // Initializing the GenAI client with named parameter
    const ai = new GoogleGenAI({ apiKey });

    try {
      // Using gemini-3-flash-preview for the task
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: `你是一个名为 Nova 的手机助手。
          核心能力：一句话点外卖。
          当用户提出点餐需求时，你必须调用 'placeFoodOrder' 函数，并自动补全合理的菜单项和配送地址。
          当前地理位置：${location ? `纬度 ${location.lat}, 经度 ${location.lng}` : '未知'}。
          回复语言：中文。风格：极简、科幻感。`,
          tools: [{ functionDeclarations: [placeOrderFunction] }],
        }
      });

      // Returning response object; caller will use the .text property
      return response;
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}
