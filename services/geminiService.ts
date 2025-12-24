import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

interface StreamChunk {
  text: string;
  groundingMetadata?: any;
}

// Singleton instance to manage chat state
class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public getChatSession(): Chat {
    if (!this.chatSession) {
      this.chatSession = this.ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          tools: [{ googleSearch: {} }], // Enable Search Grounding
          thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for lowest latency
        },
      });
    }
    return this.chatSession;
  }

  public async resetChat() {
    this.chatSession = null;
  }

  public async *sendMessageStream(message: string): AsyncGenerator<StreamChunk, void, unknown> {
    const chat = this.getChatSession();
    
    try {
      const resultStream = await chat.sendMessageStream({ message });

      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        
        const payload: StreamChunk = {
          text: c.text || '',
        };

        // Extract grounding metadata if present in this chunk
        if (c.candidates?.[0]?.groundingMetadata) {
          payload.groundingMetadata = c.candidates[0].groundingMetadata;
        }

        yield payload;
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      yield { text: "Sorry, I am having trouble connecting to the campus server right now. Please try again later." };
    }
  }
}

export const geminiService = new GeminiService();