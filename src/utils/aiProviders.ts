import { 
  GroqResponse, 
  GeminiResponse, 
  MistralResponse, 
  TogetherResponse, 
  DeepSeekResponse,
  AIProvider 
} from '../types';

// API Keys
const API_KEYS = {
  groq: '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',
  gemini: 'AIzaSyABTtAIlSwvPo_TRTRSV7hYmDUHT-AB0Io',
  mistral: 'uZBbj7146rvEdme8NrxLunXOLuNiSep8',
  together: 'tgp_v1_o2_1f2GiAh1hRU4QzCOVgMeneExwQCSOHArnTR8Lq-g',
  deepseek: 'sk-6cdeb51f10a4493fa0612737a836e233'
};

const createPrompt = (description: string, actions: string, objects: string): string => {
  return `Based on the following information, generate clean and concise step-by-step instructions on how to accomplish the task:

Description: ${description}
Actions: ${actions}
Objects: ${objects}

CRITICAL FORMATTING REQUIREMENTS - FOLLOW EXACTLY:
- Do NOT use asterisks (*) anywhere in your response
- Generate 5 to 7 steps total
- Each step MUST be on a single line with this EXACT format:
  "1. [Concise step description]: DUR [time estimate] Type: [instruction type]"
- Keep each step concise but informative - include key details without being overly verbose
- Instruction types MUST be either "Simple Instruction" or "Instruction with Reason"
- Use "Simple Instruction" for basic steps
- Use "Instruction with Reason" for steps that include explanation or important details
- Provide realistic time estimates for each step
- Use clear, concise language
- Focus on practical implementation

EXACT FORMAT EXAMPLE - COPY THIS STRUCTURE:
1. Gather teapot, water, tea leaves, and heating source: DUR 2 minutes Type: Simple Instruction
2. Fill teapot with fresh cold water: DUR 1 minute Type: Simple Instruction
3. Heat water on stovetop until boiling: DUR 5 minutes Type: Simple Instruction
4. Pour boiling water into clean teapot: DUR 1 minute Type: Simple Instruction
5. Add tea leaves to hot water: DUR 1 minute Type: Simple Instruction
6. Let tea steep for 3-5 minutes: DUR 4 minutes Type: Instruction with Reason
7. Strain tea leaves from liquid: DUR 1 minute Type: Simple Instruction
8. Pour tea into cups and serve: DUR 2 minutes Type: Simple Instruction

IMPORTANT: Each step must be on ONE LINE with DUR and Type on the same line as the step description. Keep steps concise but informative. Generate 5 to 7 steps in total`;
};

const generateWithGroq = async (description: string, actions: string, objects: string): Promise<string> => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEYS.groq}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates clear, step-by-step instructions for tasks. Always follow the exact formatting requirements provided by the user. Never use asterisks (*) in your responses. Each step must include duration estimates and instruction types (Simple Instruction or Instruction with Reason).'
        },
        {
          role: 'user',
          content: createPrompt(description, actions, objects)
        }
      ],
      max_tokens: 1200,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
  }

  const data: GroqResponse = await response.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from Groq API');
  }

  return data.choices[0].message.content.trim();
};

const generateWithGemini = async (description: string, actions: string, objects: string): Promise<string> => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEYS.gemini}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are a helpful assistant that creates clear, step-by-step instructions for tasks. Always follow the exact formatting requirements provided by the user. Never use asterisks (*) in your responses. Each step must include duration estimates and instruction types (Simple Instruction or Instruction with Reason).

${createPrompt(description, actions, objects)}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1200,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data: GeminiResponse = await response.json();
  
  if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content.parts[0]) {
    throw new Error('No response from Gemini API');
  }

  return data.candidates[0].content.parts[0].text.trim();
};

const generateWithMistral = async (description: string, actions: string, objects: string): Promise<string> => {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEYS.mistral}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates clear, step-by-step instructions for tasks. Always follow the exact formatting requirements provided by the user. Never use asterisks (*) in your responses. Each step must include duration estimates and instruction types (Simple Instruction or Instruction with Reason).'
        },
        {
          role: 'user',
          content: createPrompt(description, actions, objects)
        }
      ],
      max_tokens: 1200,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
  }

  const data: MistralResponse = await response.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from Mistral API');
  }

  return data.choices[0].message.content.trim();
};

const generateWithTogether = async (description: string, actions: string, objects: string): Promise<string> => {
  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEYS.together}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3-8b-chat-hf',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates clear, step-by-step instructions for tasks. Always follow the exact formatting requirements provided by the user. Never use asterisks (*) in your responses. Each step must include duration estimates and instruction types (Simple Instruction or Instruction with Reason).'
        },
        {
          role: 'user',
          content: createPrompt(description, actions, objects)
        }
      ],
      max_tokens: 1200,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Together AI error: ${response.status} ${response.statusText}`);
  }

  const data: TogetherResponse = await response.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from Together AI');
  }

  return data.choices[0].message.content.trim();
};

const generateWithDeepSeek = async (description: string, actions: string, objects: string): Promise<string> => {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEYS.deepseek}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates clear, step-by-step instructions for tasks. Always follow the exact formatting requirements provided by the user. Never use asterisks (*) in your responses. Each step must include duration estimates and instruction types (Simple Instruction or Instruction with Reason).'
        },
        {
          role: 'user',
          content: createPrompt(description, actions, objects)
        }
      ],
      max_tokens: 1200,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
  }

  const data: DeepSeekResponse = await response.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from DeepSeek API');
  }

  return data.choices[0].message.content.trim();
};

export const generateDurationEstimate = async (
  description: string,
  actions: string,
  objects: string
): Promise<string> => {
  const prompt = `Based on the following task information, provide an estimated duration for completing this task:

Description: ${description}
Actions: ${actions}
Objects: ${objects}

Please provide a realistic time estimate in a clear, concise format. Consider:
- Complexity of the task
- Number of steps involved
- Skill level required
- Tools or equipment needed

Respond with just the time estimate (e.g., "5-10 minutes", "2-3 hours", "30-45 minutes").`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEYS.groq}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides accurate time estimates for tasks. Always respond with just the time estimate in a clear format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data: GroqResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from Groq API');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating duration estimate:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to generate duration estimate: ${error.message}`
        : 'Failed to generate duration estimate'
    );
  }
};

export const generateInstructions = async (
  description: string,
  actions: string,
  objects: string,
  provider: AIProvider = 'groq'
): Promise<string> => {
  try {
    switch (provider) {
      case 'groq':
        return await generateWithGroq(description, actions, objects);
      case 'gemini':
        return await generateWithGemini(description, actions, objects);
      case 'mistral':
        return await generateWithMistral(description, actions, objects);
      case 'together':
        return await generateWithTogether(description, actions, objects);
      case 'deepseek':
        return await generateWithDeepSeek(description, actions, objects);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error generating instructions with ${provider}:`, error);
    throw new Error(
      error instanceof Error 
        ? `Failed to generate instructions using ${provider}: ${error.message}`
        : `Failed to generate instructions using ${provider}`
    );
  }
};

export const AI_PROVIDERS = [
  {
    id: 'groq' as AIProvider,
    name: 'Groq',
    description: 'Fast inference with Llama 3'
  },
  {
    id: 'gemini' as AIProvider,
    name: 'Gemini 1.5',
    description: 'Google\'s advanced AI model'
  },
  {
    id: 'mistral' as AIProvider,
    name: 'Mistral',
    description: 'European AI with strong reasoning'
  },
  {
    id: 'together' as AIProvider,
    name: 'Together AI',
    description: 'Open-source models at scale'
  },
  {
    id: 'deepseek' as AIProvider,
    name: 'DeepSeek',
    description: 'Advanced reasoning capabilities'
  }
];