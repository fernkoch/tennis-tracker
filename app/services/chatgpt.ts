import { TennisMatch } from '../types/match';

const CHATGPT_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function getScheduleResponse(
  query: string,
  matches: TennisMatch[],
  previousMessages: ChatGPTMessage[] = []
): Promise<string> {
  if (!CHATGPT_API_KEY) {
    throw new Error('ChatGPT API key not configured');
  }

  const matchesContext = matches.map(m => 
    `${m.opponent} plays in the ${m.round} at ${m.time} on ${m.court || 'TBA'} (${m.tournament})`
  ).join('\n');

  const messages: ChatGPTMessage[] = [
    {
      role: 'system',
      content: `You are a helpful tennis schedule assistant. Here is today's schedule:\n${matchesContext}\n\nRespond concisely and focus on schedule-related information. If asked about setting reminders or notifications, explain how to use the bell icon next to the match.`
    },
    ...previousMessages,
    { role: 'user', content: query }
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHATGPT_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get ChatGPT response');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting ChatGPT response:', error);
    return 'I apologize, but I\'m having trouble processing your request right now. Please try asking in a different way or check the schedule display above.';
  }
} 