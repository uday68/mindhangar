import { GoogleGenAI, Type } from "@google/genai";

// Enterprise-Grade Service Factory
// We no longer instantiate a global `ai` object. 
// Instead, we use a helper to create the client on-demand with the user's latest key.

const getClient = (apiKey: string) => {
  if (!apiKey) throw new Error("API Key is missing. Please configure it in Settings.");
  return new GoogleGenAI({ apiKey });
};

export const testConnection = async (apiKey: string) => {
  try {
    const ai = getClient(apiKey);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Reply with "OK" if you receive this.',
    });
    return !!response.text;
  } catch (error) {
    console.error("AI Connection Test Error:", error);
    return false;
  }
};

export const generatePlanSuggestion = async (apiKey: string, goals: string[]) => {
  try {
    const ai = getClient(apiKey);
    const prompt = `Create a concise, high-performance 3-day study schedule for the following academic goals: ${goals.join(", ")}. 
    Format as a markdown list. Prioritize deep work sessions and active recall intervals.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an elite academic performance coach. Be specific, time-bound, and encouraging.",
        temperature: 0.7
      }
    });

    return response.text;
  } catch (error: any) {
    console.error("Gemini Plan Error:", error);
    return `Error: ${error.message || "Failed to generate plan."}`;
  }
};

export const generateQuizQuestions = async (apiKey: string, topic: string, difficulty: 'easy' | 'medium' | 'hard') => {
  try {
    const ai = getClient(apiKey);
    const prompt = `Generate 3 ${difficulty} multiple choice questions about "${topic}". Ensure distractor options are plausible to test true understanding.`;
    
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

export const generateFlashcards = async (apiKey: string, topic: string, count: number = 5) => {
  try {
    const ai = getClient(apiKey);
    const prompt = `Generate ${count} study flashcards about "${topic}". 
    Return valid JSON array with 'front' and 'back' properties. 
    Front should be a concept or question. Back should be a concise, high-yield explanation.`;
    
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

export const performSemanticSearch = async (apiKey: string, query: string) => {
  try {
    const ai = getClient(apiKey);
    // In a real enterprise app, we might use the `googleSearch` tool here if available to the model.
    // For now, we simulate "Semantic Search" by asking the LLM to hallucinate high-quality resources 
    // OR we could actually use the Grounding tool if the model supports it.
    // Let's use the standard generation but ask for structured data that mimics a search engine.
    
    const prompt = `Provide 3 distinct, high-quality, and factual learning resources or key concept summaries for the query: "${query}". 
    For 'source', cite a reputable real-world source (e.g., documentation, book, university website). 
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

export const summarizeContent = async (apiKey: string, text: string) => {
  try {
    const ai = getClient(apiKey);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Summarize the following text into key bullet points and a brief conclusion. Focus on actionable insights:\n\n${text}`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Summarization Error:", error);
    return "Error during summarization. Please check your API key.";
  }
};

export const createChatSession = (apiKey: string) => {
  try {
    const ai = getClient(apiKey);
    return ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are a helpful, encouraging student assistant. Keep answers concise and academic.",
      }
    });
  } catch (error) {
    console.error("Chat Creation Error:", error);
    return null;
  }
};

export interface ReviewData {
  topic: string;
  confidence: number;
  confusion: string;
}

export const generatePerformanceReview = async (apiKey: string, data: ReviewData) => {
  try {
    const ai = getClient(apiKey);
    const prompt = `
      Analyze this Student Reflection to provide strategic improvements:
      Topic: "${data.topic}"
      Confidence: ${data.confidence}/10
      Specific Struggles: "${data.confusion}"

      Act as an elite academic performance coach using best practices (Active Recall, Spaced Repetition, Pareto Principle).
      1. Diagnose the root cognitive blocker.
      2. Recommend ONE specific high-yield technique.
      3. Create a concrete, 3-step action plan.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING },
            technique: { type: Type.STRING },
            technique_description: { type: Type.STRING },
            action_plan: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }
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
  apiKey: string,
  goal: string,
  currentLevel: string,
  timeCommitment: string
) => {
  try {
    const ai = getClient(apiKey);
    const prompt = `
      Create a structured learning roadmap for a student with the following profile:
      - Goal: ${goal}
      - Current Knowledge Level: ${currentLevel}
      - Time Availability: ${timeCommitment}

      Break this down into logical chronological modules.
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
                  week: { type: Type.STRING },
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

export const analyzeFocusFrame = async (apiKey: string, imageBase64: string) => {
  try {
    const ai = getClient(apiKey);
    
    const prompt = `Analyze this webcam frame of a student working. 
    Determine if they seem: 
    1. Focused (looking at screen/notes)
    2. Distracted (looking away, phone, talking, or sleeping)
    3. Absent (no person visible)
    
    If distracted, provide a very short, gentle, encouraging phrase (max 6 words).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
        { text: prompt }
      ],
      config: {
        responseMimeType: "application/json", 
        responseSchema: {
           type: Type.OBJECT,
           properties: {
             status: { type: Type.STRING, enum: ["focused", "distracted", "absent"] },
             suggestion: { type: Type.STRING }
           }
        }
      }
    });
    
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    // console.error("Focus Analysis Error:", error); 
    // Suppress heavy logging for frame errors to avoid console spam
    return null;
  }
};