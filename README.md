---

# Veritas AI - your personal meeting assistant 🤖

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tech: LLM Agent](https://img.shields.io/badge/Tech-LLM_Agent-blueviolet)](https://openai.com)
[![Platform: Vexa AI](https://img.shields.io/badge/Transcription-Vexa_AI-orange)](https://vexa.ai/)

Veritas AI automates the process of transcribing Google Meet calls and generating intelligent analysis using an LLM. It acts as a powerful agent that joins meetings, captures the conversation, and produces a structured summary, action items, and more, creating a verifiable source of truth from every call.

## The Problem 🤔

In any organization, countless hours are spent in meetings where critical decisions are made, tasks are assigned, and key insights are shared. However, this valuable information is often lost the moment the call ends. Manually taking notes is inefficient and prone to errors, leading to a lack of accountability and a fuzzy record of what was actually said.

## The Solution ✨

This workflow provides a robust, automated solution. By deploying an AI agent into your Google Meet calls, you can create a permanent, intelligent, and queryable record of every conversation.

Here we can check the full workflow of the agent:

![image](https://github.com/user-attachments/assets/05ce678c-2cc0-4b2b-9905-f9cfa6d114af)

### Key Features:
-   ▶️ **Manual or Automated Trigger:** Kick off the workflow for any Google Meet call.
-   ✍️ **High-Quality Transcription:** Uses the Vexa AI API to get a full, speaker-separated transcript of the meeting.
-   🧠 **AI-Powered Analysis:** Feeds the transcript to a Large Language Model (LLM) like OpenAI's GPT to generate a concise summary and structured data (e.g., action items in JSON format).
-   💾 **Persistent Storage:** Saves all relevant data, including the transcript and AI analysis, to a Supabase database for record-keeping and tracking.
-   🧹 **Automated Housekeeping:** The Vexa bot is automatically removed from the call after its job is done.

## 🚀 Workflow Breakdown

The entire process is a sequential chain of events designed for reliability and clarity.



Here is a step-by-step explanation of the workflow:

1.  **Start:** Manually trigger the workflow and provide the Google Meet ID.
2.  **Request Vexa Bot:** An API call is made to Vexa, requesting it to deploy a bot to join the specified Google Meet call.
3.  **Wait for Transcription:** The workflow pauses for a set duration (e.g., 5 minutes, adjustable as needed) to allow the meeting to take place and be recorded.
4.  **Get Vexa Transcript:** After the wait, it retrieves the full meeting transcript from the Vexa API.
5.  **Analyze with LLM:** The transcript is sent to an LLM (OpenAI) with a prompt to generate a summary and extract key action items, returning a structured JSON object.
6.  **Save to Supabase:** All relevant data—the transcript, the AI summary, and action items—are stored as a new row in your `meetings` table in Supabase for record-keeping.
7.  **Stop Vexa Bot:** A final API call is made to remove the Vexa bot from the meeting for good housekeeping.

## 🛠️ Tech Stack

This workflow is built on a modern, API-first stack:

| Component             | Technology                                                                                                  | Description                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **Orchestration**     | A workflow engine (e.g., [n8n](https://n8n.io/), [Pipedream](https://pipedream.com/), or a custom script)      | Manages the sequence of tasks and data flow.        |
| **Transcription**     | [Vexa AI](https://vexa.ai/)                                                                                   | Provides the real-time transcription bot service.   |
| **AI / Intelligence** | [OpenAI](https://openai.com/)                                                                                 | Powers the analysis and summarization of the text.  |
| **Database**          | [Supabase](https://supabase.com/)                                                                             | Acts as the persistent data store for all results.  |

## ⚙️ Getting Started

To run this workflow yourself, you'll need to configure the necessary components and API credentials.

### Prerequisites

-   A Vexa AI account and API Key.
-   An OpenAI account and API Key.
-   A Supabase project with a `meetings` table set up.
-   An automation platform or a development environment to run the workflow script.

### Configuration

1.  **Clone the Repository (if applicable):**
    ```bash
    git clone https://github.com/your-username/your-repo.git
    cd your-repo
    ```

2.  **Set Up Environment Variables:**
    Create a `.env` file and add your secret keys.
    ```env
    # Vexa AI Credentials
    VEXA_API_KEY="YOUR_VEXA_API_KEY"

    # OpenAI Credentials
    OPENAI_API_KEY="YOUR_OPENAI_API_KEY"

    # Supabase Credentials
    SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

3.  **Configure Workflow Nodes:**
    In each step of your workflow, ensure you are using these environment variables to authenticate with the respective services (Vexa, OpenAI, Supabase).

4.  **Run the Workflow:**
    Trigger the workflow by providing a valid Google Meet ID as input. Watch the magic happen
