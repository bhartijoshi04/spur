import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = 'https://spur-d3wk.onrender.com/api';

if (!API_BASE_URL) {
  throw new Error('API URL not configured');
}

interface ChatResponse {
  reply: string;
  sessionId: string;
}

interface ApiError {
  message: string;
  status: number;
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error
  );
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      if (isApiError(errorData)) {
        errorMessage = errorData.message;
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
  // Input validation
  if (!message.trim()) {
    throw new Error('Message cannot be empty');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify({
        message: message.trim(),
        sessionId: sessionId || uuidv4(),
      }),
    });

    return handleApiResponse<ChatResponse>(response);
  } catch (error) {
    // Don't expose internal error details to the user
    console.error('API Error:', error);
    throw new Error('Failed to send message. Please try again later.');
  }
}
