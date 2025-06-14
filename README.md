---

# Veritas AI - your personal meeting assistant 🤖

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  
[![Tech: LLM Agent](https://img.shields.io/badge/Tech-LLM_Agent-blueviolet)](https://openai.com)  
[![Platform: Vexa AI](https://img.shields.io/badge/Transcription-Vexa_AI-orange)](https://vexa.ai/)

Veritas AI automates the process of transcribing Google Meet calls and generating intelligent analysis using an LLM. It acts as a powerful agent that joins meetings, captures the conversation, and produces a structured summary, action items, and more, creating a verifiable source of truth from every call. We leverage the Model Context Protocol (MCP) to feed our LLM agent with backend context, orchestrate personalized workflows, and handle downstream tasks like email delivery.

## The Problem 🤔

In any organization, countless hours are spent in meetings where critical decisions are made, tasks are assigned, and key insights are shared. However, this valuable information is often lost the moment the call ends. Manually taking notes is inefficient and prone to errors, leading to a lack of accountability and a fuzzy record of what was actually said.

## The Solution ✨

This workflow provides a robust, automated solution. By deploying an AI agent into your Google Meet calls, you can create a permanent, intelligent, and queryable record of every conversation.

### Key Features:
- ▶️ **Manual or Automated Trigger:** Kick off the workflow for any Google Meet call.  
- ✍️ **High-Quality Transcription:** Uses the Vexa AI API to get a full, speaker-separated transcript of the meeting.  
- 🧠 **AI-Powered Analysis:** Feeds the transcript to a Large Language Model (LLM) like OpenAI’s GPT to generate a concise summary and structured data (e.g., action items in JSON format).  
- 💾 **Persistent Storage:** Saves all relevant data, including the transcript and AI analysis, to a Supabase database for record-keeping and tracking.  
- ⚙️ **Model Context Protocol (MCP):** A dedicated FastAPI service that—using MCP principles—fetches meeting data from Supabase, builds rich prompts for each attendee, calls OpenAI to generate personalized HTML summaries and action-item emails, queues them in Supabase, and dispatches via a Make.com webhook with full auditability.  
- 🧹 **Automated Housekeeping:** The Vexa bot is automatically removed from the call after its job is done.

## 🚀 Workflow Breakdown

The entire process is a sequential chain of events designed for reliability and clarity.

Here is a step-by-step explanation of the workflow:

1. **Start:** Manually trigger the workflow and provide the Google Meet ID.  
2. **Request Vexa Bot:** An API call is made to Vexa, requesting it to deploy a bot to join the specified Google Meet call.  
3. **Wait for Transcription:** The workflow pauses for a set duration (e.g., 5 minutes, adjustable as needed) to allow the meeting to take place and be recorded.  
4. **Get Vexa Transcript:** After the wait, it retrieves the full meeting transcript from the Vexa API.  
5. **Analyze with LLM:** The transcript is sent to an LLM (OpenAI) with a prompt to generate a summary and extract key action items, returning a structured JSON object.  
6. **Save to Supabase:** All relevant data—the transcript, the AI summary, and action items—are stored as a new row in your `meetings` table in Supabase for record-keeping.  
7. **MCP Email Delivery:** MCP fetches the saved meeting record, generates personalized HTML emails for each participant, queues them in Supabase, and sends them via a Make.com webhook—ensuring each message is tracked and logged.  
8. **Stop Vexa Bot:** A final API call is made to remove the Vexa bot from the meeting for good housekeeping.

## 🛠️ Tech Stack

This workflow is built on a modern, API-first stack:

| Component         | Technology                                                                                               | Description                                         |
| ----------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **Orchestration** | A workflow engine (e.g., [n8n](https://n8n.io/), [Pipedream](https://pipedream.com/), or a custom script) | Manages the sequence of tasks and data flow.        |
| **Transcription** | [Vexa AI](https://vexa.ai/)                                                                              | Provides the real-time transcription bot service.   |
| **AI / Intelligence** | [OpenAI](https://openai.com/)                                                                          | Powers the analysis and summarization of the text.  |
| **Database**      | [Supabase](https://supabase.com/)                                                                         | Acts as the persistent data store for all results.  |
| **MCP**           | FastAPI + Supabase + OpenAI + Make.com                                                                    | Handles personalized email generation, queuing, and dispatch with full traceability. |

## ⚙️ Getting Started

To run this workflow yourself, you'll need to configure the necessary components and API credentials.

### Prerequisites

- A Vexa AI account and API Key.  
- An OpenAI account and API Key.  
- A Supabase project with a `meetings`, `transcripts`, `meeting_participants`, and `email_notifications` tables set up.  
- A Make.com (or equivalent) webhook endpoint for email delivery.  
- An automation platform or development environment to run the workflow script.

### Configuration

1. **Clone the Repository (if applicable):**  
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
