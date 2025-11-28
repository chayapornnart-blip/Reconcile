import { GoogleGenAI } from "@google/genai";
import { Transaction, AIAnalysisResult } from '../types';

const getClient = () => {
  // Vite uses import.meta.env.VITE_... for client-side environment variables
  // Check VITE_API_KEY first, fallback to process.env.API_KEY for compatibility if needed
  const apiKey = import.meta.env.VITE_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : undefined);
  
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const analyzeUnmatched = async (
  unmatchedBank: Transaction[], 
  unmatchedBook: Transaction[]
): Promise<AIAnalysisResult> => {
  const client = getClient();
  if (!client) {
    return {
      insights: ["ไม่พบ API Key กรุณาตรวจสอบการตั้งค่า VITE_API_KEY ใน .env หรือ Vercel Settings"],
      suggestions: []
    };
  }

  // สร้าง Prompt
  const bankStr = unmatchedBank.map(t => `- ID: ${t.id} | Date: ${t.date} | Desc: ${t.description} | Amt: ${t.amount}`).join('\n');
  const bookStr = unmatchedBook.map(t => `- ID: ${t.id} | Date: ${t.date} | Desc: ${t.description} | Amt: ${t.amount}`).join('\n');

  const prompt = `
    Role: Financial Reconciliation Expert.
    Task: Analyze unmatched transactions between Bank Statement (Source of Truth) and Book (GL).

    Unmatched Bank Transactions:
    ${bankStr}

    Unmatched Book Transactions:
    ${bookStr}

    Instructions:
    1. Identify patterns (e.g., Bank fees not recorded in Book, Date slips, Human error in amount).
    2. Provide 3-4 short "Key Insights" summarizing the main causes.
    3. For EACH transaction ID listed above, provide a specific suggestion.
    
    Output Format (JSON Only):
    {
      "insights": ["Insight 1 (Thai)", "Insight 2 (Thai)"],
      "suggestions": [
        {
          "id": "TRANSACTION_ID", 
          "category": "TIMING" | "FEE" | "ERROR" | "MISSING" | "OTHER",
          "reason": "Explanation in Thai (short)",
          "action": "ADJUST_BOOK" | "INVESTIGATE" | "IGNORE",
          "confidence": "HIGH" | "MEDIUM" | "LOW"
        }
      ]
    }
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    return result as AIAnalysisResult;

  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      insights: ["เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล"],
      suggestions: []
    };
  }
};