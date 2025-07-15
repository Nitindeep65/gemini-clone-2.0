import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export interface ChatMessage {
  text: string
  role: 'user' | 'ai'
  timestamp: Date
}

export async function chatWithGemini(messages: ChatMessage[], userMessage: string) {
  try {
    // Check if API key is available and not a placeholder
    if (!process.env.GOOGLE_API_KEY || 
        process.env.GOOGLE_API_KEY === 'AIzaSyBH7YqOdJKFqSc8pGWUWwI8oTNUdO3w1Y8' ||
        process.env.GOOGLE_API_KEY === 'your_real_google_api_key_here' ||
        process.env.GOOGLE_API_KEY === 'your_google_api_key_here') {
      // Demo mode - return a mock response
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000)) // Simulate API delay
      
      const demoResponses = [
        `I'm currently in demo mode since no valid Google API key is configured. 

To use the real Gemini API:
1. Get an API key from https://makersuite.google.com/app/apikey
2. Add it to your .env.local file as GOOGLE_API_KEY=your_key_here
3. Restart the server

For now, I can respond to your message: "${userMessage}"

This is a demo response to show how the chat interface works!`,
        
        `Demo response: I understand you're asking about "${userMessage}". In demo mode, I can show you how the conversation flows, but I need a real API key to provide actual AI responses.`,
        
        `Thanks for your message about "${userMessage}". I'm running in demo mode right now. The interface is working perfectly - you can see the typing indicator, message history, and all the UI features. Just add your Google API key to get real AI responses!`
      ]
      
      return demoResponses[Math.floor(Math.random() * demoResponses.length)]
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    
    const history = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }))
    
    const chat = model.startChat({ 
      history: history,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    })
    
    const result = await chat.sendMessage(userMessage)
    return result.response.text()
  } catch (error) {
    console.error('Error with Gemini API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (errorMessage.includes('API key not valid')) {
      throw new Error('Invalid Google API key. Please set a valid GOOGLE_API_KEY in your .env.local file.')
    }
    throw new Error('Failed to get response from Gemini: ' + errorMessage)
  }
}

export async function searchWithGemini(query: string, searchHistory: string[] = []) {
  try {
    // Check if API key is available and not a placeholder
    if (!process.env.GOOGLE_API_KEY || 
        process.env.GOOGLE_API_KEY === 'AIzaSyBH7YqOdJKFqSc8pGWUWwI8oTNUdO3w1Y8' ||
        process.env.GOOGLE_API_KEY === 'your_real_google_api_key_here' ||
        process.env.GOOGLE_API_KEY === 'your_google_api_key_here') {
      // Demo mode - return a mock search response
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000)) // Simulate API delay
      
      return `🔍 **Demo Search Results for: "${query}"**

I'm currently in demo mode since no valid Google API key is configured.

In real mode, I would search for information about "${query}" and provide:
- Relevant facts and information
- Context and background
- Related topics and suggestions
- Up-to-date information

**To enable real search:**
1. Get an API key from https://makersuite.google.com/app/apikey
2. Add it to your .env.local file as GOOGLE_API_KEY=your_key_here
3. Restart the server

**Search History Context:** ${searchHistory.length > 0 ? `Previous searches: ${searchHistory.slice(-3).join(', ')}` : 'No previous searches'}

This demo shows how the search interface works with thinking indicators, search history, and response formatting!`
    }

    // Use Gemini Pro for search
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const searchPrompt = `
You are a helpful AI assistant. The user is asking: "${query}"

${searchHistory.length > 0 ? `Previous search context: ${searchHistory.slice(-5).join(', ')}` : ''}

Please provide a comprehensive and helpful response. If this is a search query, provide relevant information, facts, and context.
    `.trim()
    
    const result = await model.generateContent(searchPrompt)
    return result.response.text()
  } catch (error) {
    console.error('Error with Gemini search:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (errorMessage.includes('API key not valid')) {
      throw new Error('Invalid Google API key. Please set a valid GOOGLE_API_KEY in your .env.local file.')
    }
    throw new Error('Failed to search with Gemini: ' + errorMessage)
  }
}