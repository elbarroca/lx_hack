# Google OAuth Setup Guide

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API and Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `https://ngpywxuebfxmrjqptjfb.supabase.co/auth/v1/callback` (Supabase OAuth callback)
7. Copy the Client ID and Client Secret to your environment variables

## Required Scopes

The application requests these Google API scopes:
- `https://www.googleapis.com/auth/calendar.readonly` - Read calendar events
- `https://www.googleapis.com/auth/userinfo.email` - Get user email
- `https://www.googleapis.com/auth/userinfo.profile` - Get user profile info

## Database Migration

Run the database migration to add the required fields:

```bash
# Apply the migration
supabase db push
```

This adds:
- `google_calendar_token` - Stores OAuth tokens
- `calendar_email` - User's Google email
- `full_name` - User's display name
- `native_meeting_id` - Google Calendar event ID for meetings 