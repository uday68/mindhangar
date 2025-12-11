import { GoogleGenAI, Type, Schema } from "@google/genai";

// Accessing the API key securely from environment variables
const apiKey = process.env.API_KEY || ""; 

const ai = new GoogleGenAI({ apiKey });

export const generatePlanSuggestion = async (goals: string[]) => {
  if (!apiKey) return "API Key missing. Cannot generate plan.";
  
  try {
    const prompt = `Create a concise 3-day study schedule for the following goals: ${goals.join(", ")}. Return as a markdown list.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert academic coach. Be specific and time-bound.",
        temperature: 0.7
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Plan Error:", error);
    return "Failed to generate plan. Please try again.";
  }
};

export const generateQuizQuestions = async (topic: string, difficulty: 'easy' | 'medium' | 'hard') => {
  if (!apiKey) return [];

  try {
    const prompt = `Generate 3 ${difficulty} multiple choice questions about "${topic}".`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.INTEGER }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return [];
  }
};

export const generateFlashcards = async (topic: string, count: number = 5) => {
  if (!apiKey) return [];

  try {
    const prompt = `Generate ${count} study flashcards about "${topic}". Return valid JSON array with 'front' and 'back' properties for each card. Keep them concise.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING, description: "The term or question on the front of the card" },
              back: { type: Type.STRING, description: "The definition or answer on the back" }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Flashcard Error:", error);
    return [];
  }
};

export const performSemanticSearch = async (query: string) => {
  if (!apiKey) return [];
  
  try {
    const prompt = `Provide 3 distinct, high-quality, and factual search results or key concept summaries for the query: "${query}". 
    For 'source', cite a reputable real-world source (e.g., documentation, book, or authority website). 
    For 'url', provide a real or plausible URL structure.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              snippet: { type: Type.STRING },
              source: { type: Type.STRING },
              qualityScore: { type: Type.INTEGER },
              date: { type: Type.STRING },
              url: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
};

export const summarizeContent = async (text: string) => {
  if (!apiKey) return "API Key missing.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Summarize the following text into key bullet points and a brief conclusion:\n\n${text}`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Summarization Error:", error);
    return "Error during summarization.";
  }
};

export const createChatSession = () => {
  if (!apiKey) return null;
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: "You are a helpful, encouraging student assistant.",
    }
  });
};

export interface ReviewData {
  topic: string;
  confidence: number;
  confusion: string;
}

export const generatePerformanceReview = async (data: ReviewData) => {
  if (!apiKey) return null;
  
  try {
    const prompt = `
      Analyze this Student Reflection to provide strategic improvements:
      Topic: "${data.topic}"
      Confidence: ${data.confidence}/10
      Specific Struggles: "${data.confusion}"

      Act as an elite academic performance coach using best practices (Active Recall, Spaced Repetition, Pareto Principle).
      1. Diagnose the root cognitive blocker (e.g., Conceptual Gap, Lack of Application, Memory Decay).
      2. Recommend ONE specific high-yield technique to fix this (e.g., Feynman Technique, Interleaving, Dual Coding).
      3. Create a concrete, 3-step action plan to master this concept by next week.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING, description: "The identified root cause of the struggle" },
            technique: { type: Type.STRING, description: "Name of the learning strategy" },
            technique_description: { type: Type.STRING, description: "Brief explanation of how to apply the technique" },
            action_plan: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 steps to improve" 
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Review Error:", error);
    return null;
  }
};

export const generateLearningRoadmap = async (
  goal: string,
  currentLevel: string,
  timeCommitment: string
) => {
  if (!apiKey) return null;

  try {
    const prompt = `
      Create a structured learning roadmap for a student with the following profile:
      - Goal: ${goal}
      - Current Knowledge Level: ${currentLevel}
      - Time Availability: ${timeCommitment}

      Break this down into logical chronological modules (e.g., Week 1, Month 1, etc. depending on timeframe).
      For each module, provide:
      1. A clear title and brief description.
      2. Key topics to master.
      3. 2-3 specific recommended search terms or titles for free high-quality resources (videos, docs, articles).

      Return strictly valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.STRING, description: "Timeframe e.g., 'Week 1'" },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  resources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['video', 'article', 'course'] }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Roadmap Generation Error:", error);
    return null;
  }
};