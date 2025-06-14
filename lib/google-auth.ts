import { google } from 'googleapis'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
]

export function getGoogleAuthUrl() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/auth/google/callback`
  )

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  })

  return authUrl
}

export async function getGoogleTokens(code: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/auth/google/callback`
  )

  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export async function getGoogleUserInfo(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
  const { data } = await oauth2.userinfo.get()
  
  return data
}

export async function getCalendarEvents(accessToken: string, timeMin?: string, timeMax?: string) {
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
  
  const now = new Date()
  const defaultTimeMin = timeMin || now.toISOString()
  const defaultTimeMax = timeMax || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: defaultTimeMin,
    timeMax: defaultTimeMax,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 50
  })

  return response.data
} 