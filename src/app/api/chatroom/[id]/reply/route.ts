import { chatWithGemini, searchWithGemini, ChatMessage } from '@/lib/gemini'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { messages, userMessage, isSearch, searchHistory } = await req.json()
    
    let reply: string
    
    if (isSearch) {
      // Handle search query
      reply = await searchWithGemini(userMessage, searchHistory)
    } else {
      // Handle regular chat
      const chatMessages: ChatMessage[] = messages.map((msg: ChatMessage) => ({
        text: msg.text,
        role: msg.role,
        timestamp: new Date(msg.timestamp)
      }))
      
      reply = await chatWithGemini(chatMessages, userMessage)
    }
    
    return NextResponse.json({ 
      reply,
      success: true 
    })
    
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json({ 
      error: 'Failed to get response from Gemini',
      success: false 
    }, { status: 500 })
  }
}