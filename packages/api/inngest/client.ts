// Defines and exports the Inngest client, which allows us to define
// and send events to our workflows.
import { Inngest } from 'inngest';
import { AnalysisResult } from '../../core/types';

// Define the events that our system can handle
type Events = {
  'meeting/detected': { data: { meetingId: string } };
  'meeting/analysis.complete': { data: { meetingId: string; analysis: AnalysisResult } };
};

export const inngest = new Inngest<Events>({ name: 'MCP Server' }); 