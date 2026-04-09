/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { MeetingAgenda } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateAgendaFromText(text: string): Promise<MeetingAgenda> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analyze the following document and extract a structured meeting agenda. 
            Identify the main stakeholders, the topics to cover, and estimate a reasonable time to spend on each topic if not specified.
            
            Document:
            ${text}
            `
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          stakeholders: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING }
              },
              required: ["name", "role"]
            }
          },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                topic: { type: Type.STRING },
                duration: { type: Type.NUMBER, description: "Duration in minutes" },
                description: { type: Type.STRING }
              },
              required: ["id", "topic", "duration", "description"]
            }
          },
          totalDuration: { type: Type.NUMBER }
        },
        required: ["title", "stakeholders", "items", "totalDuration"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as MeetingAgenda;
}

export async function refineAgenda(
  currentAgenda: MeetingAgenda, 
  userRequest: string, 
  history: { role: 'user' | 'model', content: string }[]
): Promise<MeetingAgenda> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
      {
        role: "user",
        parts: [
          {
            text: `Current Agenda: ${JSON.stringify(currentAgenda)}
            
            User Request: ${userRequest}
            
            Please update the agenda based on the user request. Return the full updated agenda in JSON format.`
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          stakeholders: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING }
              },
              required: ["name", "role"]
            }
          },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                topic: { type: Type.STRING },
                duration: { type: Type.NUMBER },
                description: { type: Type.STRING }
              },
              required: ["id", "topic", "duration", "description"]
            }
          },
          totalDuration: { type: Type.NUMBER }
        },
        required: ["title", "stakeholders", "items", "totalDuration"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as MeetingAgenda;
}
