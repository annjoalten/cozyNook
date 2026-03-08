export interface AlexaSlot {
  name: string;
  value?: string;
  confirmationStatus?: 'NONE' | 'CONFIRMED' | 'DENIED';
}

export interface AlexaIntent {
  name: string;
  confirmationStatus?: 'NONE' | 'CONFIRMED' | 'DENIED';
  slots?: Record<string, AlexaSlot>;
}

export interface AlexaRequest {
  version: string;
  session?: {
    new: boolean;
    sessionId: string;
    application: { applicationId: string };
    user: { userId: string };
  };
  request: {
    type: 'LaunchRequest' | 'IntentRequest' | 'SessionEndedRequest';
    requestId: string;
    timestamp: string;
    locale: string;
    intent?: AlexaIntent;
    reason?: string;
  };
}

export interface AlexaOutputSpeech {
  type: 'PlainText' | 'SSML';
  text?: string;
  ssml?: string;
}

export interface AlexaResponse {
  version: string;
  response: {
    outputSpeech: AlexaOutputSpeech;
    shouldEndSession?: boolean;
    reprompt?: {
      outputSpeech: AlexaOutputSpeech;
    };
  };
}
