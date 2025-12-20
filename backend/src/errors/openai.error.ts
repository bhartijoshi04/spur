export class OpenAIError extends Error {
  constructor(message: string, public readonly statusCode: number = 500) {
    super(message);
    this.name = 'OpenAIError';
  }
}

export function handleOpenAIError(error: unknown): OpenAIError {
  if (error instanceof OpenAIError) {
    return error;
  }

  if (error instanceof Error) {
    // Handle validation errors
    if (error.message.includes('Message too long')) {
      return new OpenAIError(error.message, 400);
    }

    // Handle specific OpenAI API errors
    if (error.message.includes('Request timeout')) {
      return new OpenAIError('The AI service is taking too long to respond. Please try again.', 504);
    }
    if (error.message.includes('Rate limit')) {
      return new OpenAIError('The service is experiencing high demand. Please try again in a moment.', 429);
    }
    if (error.message.includes('Incorrect API key') || error.message.includes('invalid_api_key')) {
      return new OpenAIError('There was an authentication error with the AI service. Please check your API key.', 401);
    }
    if (error.message.includes('insufficient_quota')) {
      return new OpenAIError('The AI service is temporarily unavailable.', 503);
    }

    // Return the original error message for other known errors
    return new OpenAIError(error.message, 400);
  }

  // Generic fallback
  return new OpenAIError('An unexpected error occurred with the AI service.', 500);
}
