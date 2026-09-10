export type EngineStatus =
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'INTERRUPTED'
  | 'TOOL_RUNNING'
  | 'ACTIVE';

export type NavigationTab =
  | 'studio'
  | 'timeline'
  | 'metrics'
  | 'architecture';

export interface TelemetryLog {
  id: string;
  timestamp: string;
  epochMs: number;
  level: 'INFO' | 'WARN' | 'INTERRUPT' | 'GUARD' | 'COMMITTED';
  source: string;
  message: string;
  payload?: Record<string, unknown>;
}

export interface RequestItem {
  id: string;
  genId: number;
  nonce: string;
  query: string;
  intent: string;
  status: 'PENDING' | 'EXECUTING' | 'CANCELLED' | 'COMMITTED' | 'DROPPED';
  toolCall?: {
    name: string;
    args: Record<string, string | number>;
    status: 'DISPATCHED' | 'OUTDATED' | 'DROPPED' | 'EXECUTED';
    executionTimeMs?: number;
  };
  durationMs: number;
  createdAt: string;
  cancelledAt?: string;
  staleResultIntercepted?: boolean;
}

export interface ConversationTurn {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  isInterrupted?: boolean;
  interruptedPhrase?: string;
  continuedPhrase?: string;
  requestNonce?: string;
  generation: number;
}

export interface AssertionTest {
  id: string;
  name: string;
  description: string;
  slaTarget: string;
  measuredTime: string;
  status: 'PASS' | 'RUNNING' | 'PENDING' | 'FAIL';
  details: string;
}
