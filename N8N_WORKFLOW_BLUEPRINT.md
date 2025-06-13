# n8n Workflow Blueprint: Meeting Processing with Vexa and Supabase

This document provides a detailed, node-by-node guide for building your automated meeting processing workflow in n8n.

### Workflow Overview
`Webhook` -> `Fetch Meeting & User` -> `Request Vexa Bot` -> `Polling Loop (Wait & Get Transcript)` -> `Analyze with LLM` -> `Save Results to Supabase`

---

### Node 1: Webhook Trigger

*   **Node Type**: **Webhook**
*   **Purpose**: To start the workflow when your Next.js app calls it.
*   **Configuration**:
    *   **HTTP Method**: `POST`
    *   **Test URL**: Copy the generated test URL and add it to your `.env` file as `N8N_WEBHOOK_URL`.
    *   **Action**: Click "Listen for test event" to prepare n8n to receive the test call from your app.
*   **Expected Input**: A JSON object from your API:
    ```json
    {
      "meetingId": "jez-xehi-qev"
    }
    ```

---

### Node 2: Fetch Meeting & User Data from Supabase

*   **Node Type**: **Supabase**
*   **Purpose**: To retrieve the full meeting details and the associated user's `vexoApiKey` from your database.
*   **Configuration**:
    *   **Authentication**: Select your pre-configured Supabase credentials.
    *   **Resource**: `Database`
    *   **Operation**: `Select`
    *   **Table**: `Meeting`
    *   **Select**: `*, user(*)` (This fetches all columns from the `Meeting` table and all columns from the related `user` table).
    *   **Filters** > **Add Filter**:
        *   **Key**: `nativeMeetingId`
        *   **Operator**: `eq`
        *   **Value (Expression)**: `{{ $json.body.meetingId }}`
*   **Output**: This node will provide the `id` (your database's CUID for the meeting) and `user.vexoApiKey` for the following steps.

---

### Node 3: Request Vexa Bot

*   **Node Type**: **HTTP Request**
*   **Purpose**: To tell the Vexa bot to join the Google Meet call.
*   **Configuration**:
    *   **Method**: `POST`
    *   **URL**: `https://gateway.dev.vexa.ai/bots`
    *   **Authentication**: `Header Auth`
    *   **Name**: `x-api-key`
    *   **Value (Expression)**: `{{ $items("Fetch Meeting & User Data from Supabase")[0].json.user.vexoApiKey }}`
    *   **Body Content Type**: `JSON`
    *   **Body** > **Add Property**:
        *   **Name**: `meeting_url`
        *   **Value (Expression)**: `https://meet.google.com/{{ $json.body.meetingId }}`
        *   **Name**: `bot_name`
        *   **Value**: `AI Meeting Assistant` (or any name you prefer)

---

### The Polling Loop (Nodes 4-7)

This is the most complex part. You need to wait for the meeting to end and the transcript to be ready. A polling loop is the most reliable way to do this.

---

### Node 4: Start Loop

*   **Node Type**: **Code**
*   **Purpose**: To set up a counter for the loop to prevent it from running forever.
*   **Configuration**:
    *   **Run Once for All Items**: `true`
    *   **JavaScript Code**:
        ```javascript
        // Set a max attempts to prevent infinite loops (e.g., 60 attempts * 2 mins = 2-hour max wait)
        $workflow.set('loopCounter', 0);
        $workflow.set('maxAttempts', 60);
        return { continueLoop: true };
        ```

---

### Node 5: Get Vexa Transcript

*   **Node Type**: **HTTP Request**
*   **Purpose**: To poll Vexa's API for the meeting transcript.
*   **Configuration**:
    *   **Method**: `GET`
    *   **URL (Expression)**: `https://gateway.dev.vexa.ai/transcripts/google_meet/{{ $json.body.meetingId }}`
    *   **Authentication**: `Header Auth` (use the same `vexoApiKey` expression as in Node 3).
    *   **Options** > **Add Option**:
        *   **Continue On Fail**: `true` (This is crucial, as the first few requests may fail if the transcript isn't ready).

---

### Node 6: IF (Is Meeting Complete?)

*   **Node Type**: **IF**
*   **Purpose**: To check if the transcript is ready or if the loop has timed out.
*   **Configuration**:
    *   **Conditions** > **Add Condition** > **All**:
        *   `{{ $workflow.get('loopCounter') }}` -> **Number** -> **Is smaller than** -> `{{ $workflow.get('maxAttempts') }}`
        *   `{{ $items("Get Vexa Transcript")[0].json.status }}` -> **String** -> **Does not equal** -> `completed` (Note: Check Vexa's API docs for the exact status field and value).
*   **Logic**: This node will have two outputs: `true` (continue looping) and `false` (exit loop and continue workflow).

---

### Node 7: Wait

*   **Connect this node to the `true` output of the IF node.**
*   **Node Type**: **Wait**
*   **Purpose**: To pause between polling attempts.
*   **Configuration**:
    *   **Time**: `2`
    *   **Unit**: `Minutes`
*   **Next Step**: Drag a connection from this Wait node **back to the "Get Vexa Transcript" node (Node 5)** to create the loop.

---

### Node 8: Code (Increment Counter)

*   **Connect this node to the Wait node.**
*   **Node Type**: **Code**
*   **Purpose**: To increment the loop counter.
*   **Configuration**:
    *   **JavaScript Code**:
        ```javascript
        const currentCount = $workflow.get('loopCounter');
        $workflow.set('loopCounter', currentCount + 1);
        return {}; // Pass data through
        ```
*   **Next Step**: Connect this node back to the **"Get Vexa Transcript" node (Node 5)**.

---

### Node 9: Analyze with LLM

*   **Connect this node to the `false` output of the IF node (Node 6).**
*   **Node Type**: **OpenAI** (or your preferred LLM provider)
*   **Purpose**: To summarize the transcript and extract action items.
*   **Configuration**:
    *   **Authentication**: Select your OpenAI credentials.
    *   **Resource**: `Chat`
    *   **Operation**: `Create`
    *   **Model**: `gpt-4-turbo-preview` (or another model that supports JSON mode).
    *   **Options** > **Response Format**: `JSON Object`
    *   **Messages** > **Content (Expression)**:
        ```
        You are an expert meeting assistant. Based on the following transcript, please provide a concise summary and a list of clear action items.

        Transcript:
        {{ $items("Get Vexa Transcript")[0].json.transcript_text }} 

        Instructions:
        1.  **Summary**: Create a brief, easy-to-read summary of the key discussion points and decisions.
        2.  **Action Items**: Identify any tasks or follow-ups. For each action item, specify the "task" and the "owner". If the owner isn't mentioned, set the owner to "Unassigned".
        3.  **Output Format**: Provide the output in a structured JSON format like the example below.

        Example Output:
        {
          "summary": "The team discussed the Q3 marketing plan and aligned on the new budget.",
          "actionItems": [
            { "task": "Finalize the budget report", "owner": "Alice" },
            { "task": "Send the client a follow-up email", "owner": "Bob" }
          ]
        }
        ```
---

### Node 10: Code (Format Data for Supabase)

*   **Node Type**: **Code**
*   **Purpose**: To parse the LLM's JSON output and format it for the Supabase `Insert` operation.
*   **Configuration**:
    *   **JavaScript Code**:
        ```javascript
        const llmResponse = JSON.parse($items("Analyze with LLM")[0].json.message.content);
        const actionItems = llmResponse.actionItems;
        const meetingDbId = $items("Fetch Meeting & User Data from Supabase")[0].json.id;

        const itemsToInsert = actionItems.map(item => ({
          meetingId: meetingDbId,
          taskDescription: item.task,
          owner: item.owner,
          status: 'pending' // Default status
        }));

        return itemsToInsert;
        ```

---

### Node 11: Save Analysis to Supabase

*   **Node Type**: **Supabase**
*   **Purpose**: To create a new record in your `Analysis` table.
*   **Configuration**:
    *   **Operation**: `Insert`
    *   **Table**: `Analysis`
    *   **Columns** > **Add Column**:
        *   **Key**: `meetingId`, **Value**: `{{ $items("Fetch Meeting & User Data from Supabase")[0].json.id }}`
        *   **Key**: `summary`, **Value**: `{{ JSON.parse($items("Analyze with LLM")[0].json.message.content).summary }}`
        *   (Add other fields like `sentiment` if your LLM provides them).

---

### Node 12: Save Action Items to Supabase

*   **Node Type**: **Supabase**
*   **Purpose**: To insert all the extracted action items into your `ActionItem` table.
*   **Configuration**:
    *   **Operation**: `Insert`
    *   **Table**: `ActionItem`
    *   **Input Data is List**: `true` (Enable this option).
    *   **Columns (Expression)**: `{{ $items("Code (Format Data for Supabase)").map(item => item.json) }}`

This detailed blueprint should give you everything you need to build a robust and automated meeting processing workflow in n8n. 