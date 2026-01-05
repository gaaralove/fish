
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
    // Vercel 部署后会自动注入环境变量
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      console.error("API_KEY is not defined in the environment.");
      throw new Error("Missing_API_KEY");
    }

    // 必须使用命名参数初始化
    const ai = new GoogleGenAI({ apiKey });

    try {
      // 任务类型适合使用 gemini-3-flash-preview
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: `你是一个名为 Nova 的手机助手。你现在运行在高度现代化的 Web 系统中。
          你的核心指令：解析用户的一句话需求，如果是点餐，必须调用 'placeFoodOrder' 函数。
          请自动根据语境选择合理的餐厅、菜品、价格和配送地址。
          当前地理位置：${location ? `纬度 ${location.lat}, 经度 ${location.lng}` : '未知'}。
          回复语气：简洁、科幻、富有逻辑。`,
          tools: [{ functionDeclarations: [placeOrderFunction] }],
        }
      });

      return response;
    } catch (error: any) {
      console.error("Gemini API Error Detail:", error);
      throw error;
    }
  }
}
