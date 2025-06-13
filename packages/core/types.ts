// This file defines the shape of our structured analysis data,
// ensuring type safety between the agent, workflow, and notification services.

export interface ActionItemData {
  taskDescription: string;
  owner: string;
  verbatimQuote: string;
}

export interface AnalysisResult {
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  sentimentScore: number;
  keyTopics: string[];
  actionItems: ActionItemData[];
} 