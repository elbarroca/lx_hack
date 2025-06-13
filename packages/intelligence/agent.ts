// This agent uses a powerful LLM with a strict JSON output format
// to analyze transcripts reliably.
import OpenAI from 'openai';
import { AnalysisResult } from '../core/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const analysisSchema = {
    type: "object",
    properties: {
        summary: { type: "string", description: "A concise, professional summary in 3-5 bullet points focusing on decisions and outcomes." },
        sentiment: { type: "string", enum: ["Positive", "Neutral", "Negative"], description: "The overall sentiment of the meeting." },
        sentimentScore: { type: "number", description: "A score from -1.0 (very negative) to 1.0 (very positive)." },
        keyTopics: { type: "array", items: { type: "string" }, description: "A list of the 3-5 most important topics discussed." },
        actionItems: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    taskDescription: { type: "string", description: "A clear description of the task." },
                    owner: { type: "string", description: "The person assigned to the task. Use 'Unknown' if not explicitly stated." },
                    verbatimQuote: { type: "string", description: "The exact sentence where the task was assigned or agreed upon." },
                },
                required: ["taskDescription", "owner", "verbatimQuote"],
            },
        },
    },
    required: ["summary", "sentiment", "sentimentScore", "keyTopics", "actionItems"],
};

async function finalAnalysis(transcript: string): Promise<AnalysisResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo', // Or another model that supports JSON mode
    messages: [
      {
        role: 'system',
        content: `You are an expert meeting analysis AI. Analyze the transcript and respond ONLY with a valid JSON object that conforms to this schema: ${JSON.stringify(analysisSchema)}`,
      },
      {
        role: 'user',
        content: `Please analyze the following transcript:\n\n---\n${transcript}\n---`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  try {
    const parsedJson = JSON.parse(response.choices[0].message.content || '{}');
    // Here you could add validation against the schema (e.g., with Zod) for extra safety.
    return parsedJson as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse LLM response:", error);
    throw new Error("AI response was not valid JSON.");
  }
}

export const agent = { finalAnalysis }; 