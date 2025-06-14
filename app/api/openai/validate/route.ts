import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey || apiKey.length < 10) {
      return NextResponse.json({ error: "Invalid API key format" }, { status: 400 })
    }

    // In a real implementation, you would validate the API key with OpenAI's API
    // For now, we'll do basic format validation
    const isValid = apiKey.startsWith("sk-") && apiKey.length >= 40

    if (!isValid) {
      return NextResponse.json({ error: "Invalid OpenAI API key" }, { status: 400 })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Error validating OpenAI API key:", error)
    return NextResponse.json({ error: "Validation failed" }, { status: 500 })
  }
}
