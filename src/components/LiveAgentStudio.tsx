import React, { useState, useEffect, useRef } from 'react';
import { EngineStatus, TelemetryLog, RequestItem, ConversationTurn } from '../types';
import { audioEngine } from '../utils/audioEngine';
import {
  Zap,
  Play,
  Square,
  RotateCcw,
  Mic,
  Volume2,
  VolumeX,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Terminal,
  Clock,
  Sparkles,
  Train,
  CheckCircle2,
  XCircle,
  Copy,
  Trash2,
  Send,
} from 'lucide-react';

interface LiveAgentStudioProps {
  logs: TelemetryLog[];
  addLog: (level: TelemetryLog['level'], source: string, message: string, payload?: Record<string, unknown>) => void;
  onClearLogs: () => void;
  onRequestSelect?: (req: RequestItem) => void;
}

export const LiveAgentStudio: React.FC<LiveAgentStudioProps> = ({
  logs,
  addLog,
  onClearLogs,
}) => {
  const [engineState, setEngineState] = useState<EngineStatus>('LISTENING');
  const [activeGeneration, setActiveGeneration] = useState<number>(22);
  const [activeNonce, setActiveNonce] = useState<string>('0x8F22');
  const [isScenarioRunning, setIsScenarioRunning] = useState<boolean>(false);
  const [lastFlushLatency, setLastFlushLatency] = useState<number>(38);
  const [audioSpectrum, setAudioSpectrum] = useState<number[]>(new Array(42).fill(6));
  const [micLevel, setMicLevel] = useState<number>(0);
  const [customInput, setCustomInput] = useState<string>('');
  const [isHoldingMic, setIsHoldingMic] = useState<boolean>(false);

  // Scenario conversation turns
  const [conversation, setConversation] = useState<ConversationTurn[]>([
    {
      id: 'turn-1',
      sender: 'user',
      text: 'Book train Chennai to Bangalore for tomorrow 6 AM.',
      timestamp: '14:02:17.100',
      generation: 21,
      requestNonce: '0x4B21',
    },
    {
      id: 'turn-2',
      sender: 'agent',
      text: 'Searching IRCTC Tatkal availability... Found Shatabdi Express at 06:00, booking seat 42B...',
      interruptedPhrase: 'booking seat 42B...',
      timestamp: '14:02:17.412',
      isInterrupted: true,
      generation: 21,
      requestNonce: '0x4B21',
    },
    {
      id: 'turn-3',
      sender: 'user',
      text: 'Wait, stop! Change destination to Hyderabad instead!',
      timestamp: '14:02:18.520',
      generation: 22,
      requestNonce: '0x8F22',
    },
    {
      id: 'turn-4',
      sender: 'agent',
      text: 'Understood, rerouting destination to Hyderabad. Fetching Vande Bharat Express availability...',
      timestamp: '14:02:18.738',
      generation: 22,
      requestNonce: '0x8F22',
    },
  ]);

  // Dual Requests
  const [request21, setRequest21] = useState<RequestItem>({
    id: 'req-21',
    genId: 21,
    nonce: '0x4B21',
    query: 'Book train Chennai to Bangalore for tomorrow 6 AM',
    intent: 'irctc.book_train(from="MAS", to="SBC", departure="06:00")',
    status: 'CANCELLED',
    toolCall: {
      name: 'irctc_tatkal_book',
      args: { origin: 'MAS', destination: 'SBC', date: 'Tomorrow', seat: '42B' },
      status: 'DROPPED',
      executionTimeMs: 820,
    },
    durationMs: 412,
    createdAt: '14:02:17.100',
    cancelledAt: '14:02:18.520',
    staleResultIntercepted: true,
  });

  const [request22, setRequest22] = useState<RequestItem>({
    id: 'req-22',
    genId: 22,
    nonce: '0x8F22',
    query: 'Change destination to Hyderabad instead!',
    intent: 'irctc.book_train(from="MAS", to="HYB", class="VandeBharat")',
    status: 'COMMITTED',
    toolCall: {
      name: 'irctc_tatkal_book',
      args: { origin: 'MAS', destination: 'HYB', date: 'Tomorrow', train: 'Vande Bharat' },
      status: 'EXECUTED',
      executionTimeMs: 210,
    },
    durationMs: 184,
    createdAt: '14:02:18.520',
  });

  // Visualizer Animation frame loop
  const animRef = useRef<number | null>(null);
  useEffect(() => {
    const updateSpectrum = () => {
      if (engineState === 'SPEAKING') {
        const freq = audioEngine.getFrequencyData();
        const bands = [];
        for (let i = 0; i < 42; i++) {
          const val = freq[i % freq.length] || 0;
          // Normalized height 8px to 48px with slight random jitter for realism
          const height = Math.max(8, Math.min(48, Math.round((val / 255) * 44 + Math.random() * 8)));
          bands.push(height);
        }
        setAudioSpectrum(bands);
      } else if (engineState === 'LISTENING') {
        const bands = [];
        for (let i = 0; i < 42; i++) {
          // subtle ambient noise
          const height = Math.max(4, Math.round(6 + Math.sin(Date.now() / 200 + i) * 3));
          bands.push(height);
        }
        setAudioSpectrum(bands);
      } else if (engineState === 'INTERRUPTED') {
        // Flatline immediately
        setAudioSpectrum(new Array(42).fill(3));
      } else {
        setAudioSpectrum(new Array(42).fill(6));
      }
      animRef.current = requestAnimationFrame(updateSpectrum);
    };
    animRef.current = requestAnimationFrame(updateSpectrum);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [engineState]);

  // Scenario Runner: Deterministic Train Booking Interruption Flow
  const runDeterministicScenario = () => {
    if (isScenarioRunning) return;
    setIsScenarioRunning(true);
    setEngineState('LISTENING');

    addLog('INFO', 'SCENARIO_ENGINE', 'Starting Deterministic Train Booking Interruption Benchmark');

    // Step 1: User speaks Gen 21
    setTimeout(() => {
      setEngineState('THINKING');
      addLog('INFO', 'STT_INGRESS', 'User Query: "Book train Chennai to Bangalore for tomorrow 6 AM"', {
        nonce: '0x4B21',
        gen: 21,
      });

      // Update turn 1
      setConversation((prev) => [
        {
          id: `turn-${Date.now()}-1`,
          sender: 'user',
          text: 'Book train Chennai to Bangalore for tomorrow 6 AM.',
          timestamp: new Date().toLocaleTimeString(),
          generation: 21,
          requestNonce: '0x4B21',
        },
      ]);
      setActiveGeneration(21);
      setActiveNonce('0x4B21');
      setRequest21((prev) => ({ ...prev, status: 'EXECUTING' }));
    }, 600);

    // Step 2: Agent starts speaking and tool dispatched
    setTimeout(() => {
      setEngineState('SPEAKING');
      audioEngine.playVoiceSample(4500);
      addLog('INFO', 'RIME_TTS', 'Rime Neural Streamer active. TTFA: 218ms. Spoken audio chunk transmitting...', {
        nonce: '0x4B21',
        gen: 21,
      });
      addLog('INFO', 'TOOL_DISPATCH', 'Dispatched async IRCTC Tatkal query: origin="MAS", dest="SBC"', {
        tool: 'irctc_tatkal_book',
        nonce: '0x4B21',
      });

      setConversation((prev) => [
        ...prev,
        {
          id: `turn-${Date.now()}-2`,
          sender: 'agent',
          text: 'Searching IRCTC Tatkal availability... Found Shatabdi Express at 06:00, booking seat 42B...',
          timestamp: new Date().toLocaleTimeString(),
          generation: 21,
          requestNonce: '0x4B21',
        },
      ]);
    }, 1400);

    // Step 3: Barge-in at t=2800ms
    setTimeout(() => {
      triggerBargeIn();
    }, 2800);
  };

  // Immediate Interruption / Barge-in trigger (<150ms guarantee)
  const triggerBargeIn = () => {
    const startInterrupt = performance.now();
    const flushMs = audioEngine.stop();
    setLastFlushLatency(flushMs);

    setEngineState('INTERRUPTED');
    setActiveGeneration(22);
    setActiveNonce('0x8F22');

    addLog('INTERRUPT', 'VAD_BARGE_IN', `Hardware Voice Activity Triggered! Flushing audio sink buffer (${flushMs}ms)`, {
      cutLatencyMs: flushMs,
      slaTarget: '<150ms',
    });
    addLog('GUARD', 'NONCE_INVAL', 'Invalidated generational nonce 0x4B21. Forked generation to #22 (Nonce 0x8F22)');

    // Mark previous turn as interrupted with strikethrough
    setConversation((prev) => {
      const updated = [...prev];
      if (updated.length >= 2 && updated[updated.length - 1].sender === 'agent') {
        updated[updated.length - 1].isInterrupted = true;
        updated[updated.length - 1].interruptedPhrase = 'booking seat 42B...';
      }
      return [
        ...updated,
        {
          id: `turn-${Date.now()}-3`,
          sender: 'user',
          text: 'Wait, stop! Change destination to Hyderabad instead!',
          timestamp: new Date().toLocaleTimeString(),
          generation: 22,
          requestNonce: '0x8F22',
        },
      ];
    });

    setRequest21((prev) => ({
      ...prev,
      status: 'CANCELLED',
      toolCall: prev.toolCall ? { ...prev.toolCall, status: 'DROPPED' } : undefined,
      cancelledAt: new Date().toLocaleTimeString(),
    }));

    // Step 4: Delayed stale result arrives from Request 21 -> Intercepted and Dropped
    setTimeout(() => {
      addLog('WARN', 'STALE_GUARD', 'Late IRCTC callback arrived from Request #21 (Nonce: 0x4B21 != Active: 0x8F22)', {
        staleNonce: '0x4B21',
        activeNonce: '0x8F22',
        action: 'DROPPED_BEFORE_MUTATION',
      });
      setRequest21((prev) => ({ ...prev, staleResultIntercepted: true }));
    }, 450);

    // Step 5: Generation #22 committed and starts speaking response
    setTimeout(() => {
      setEngineState('SPEAKING');
      audioEngine.playVoiceSample(3500, () => {
        setEngineState('ACTIVE');
        setIsScenarioRunning(false);
      });

      addLog('COMMITTED', 'RIME_TTS', 'Synthesizing corrected route to Hyderabad. Audio buffer re-primed.', {
        gen: 22,
        nonce: '0x8F22',
      });

      setConversation((prev) => [
        ...prev,
        {
          id: `turn-${Date.now()}-4`,
          sender: 'agent',
          text: 'Understood, rerouting destination to Hyderabad. Fetching Vande Bharat Express availability...',
          timestamp: new Date().toLocaleTimeString(),
          generation: 22,
          requestNonce: '0x8F22',
        },
      ]);

      setRequest22((prev) => ({
        ...prev,
        status: 'COMMITTED',
        toolCall: prev.toolCall ? { ...prev.toolCall, status: 'EXECUTED' } : undefined,
      }));
    }, 900);
  };

  const handleReset = () => {
    audioEngine.stop();
    setIsScenarioRunning(false);
    setEngineState('LISTENING');
    setActiveGeneration(22);
    setActiveNonce('0x8F22');
    addLog('INFO', 'SYSTEM', 'Reset engine to initial standby state.');
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const query = customInput.trim();
    setCustomInput('');

    addLog('INFO', 'USER_INGRESS', `Manual prompt ingress: "${query}"`, {
      gen: activeGeneration,
      nonce: activeNonce,
    });

    setConversation((prev) => [
      ...prev,
      {
        id: `turn-${Date.now()}`,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString(),
        generation: activeGeneration,
        requestNonce: activeNonce,
      },
    ]);

    setEngineState('THINKING');
    setTimeout(() => {
      setEngineState('SPEAKING');
      audioEngine.playVoiceSample(3000, () => {
        setEngineState('ACTIVE');
      });
      setConversation((prev) => [
        ...prev,
        {
          id: `turn-${Date.now()}-resp`,
          sender: 'agent',
          text: `Processing: "${query}". Nonce guard verified generation #${activeGeneration}.`,
          timestamp: new Date().toLocaleTimeString(),
          generation: activeGeneration,
          requestNonce: activeNonce,
        },
      ]);
    }, 600);
  };

  // Copy telemetry
  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level}] [${l.source}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Operational Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 font-telemetry-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant">EPOCH:</span>
            <span className="rounded bg-surface-container-high px-1.5 py-0.5 text-primary-container font-bold">
              0x9AF4
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant">ACTIVE NONCE:</span>
            <span className="rounded bg-surface-container-high px-1.5 py-0.5 text-secondary font-bold">
              {activeNonce} (GEN_{activeGeneration})
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>ISOLATION SHIELD ENGAGED</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant">FLUSH SLA:</span>
            <span className="text-primary font-semibold">{lastFlushLatency}ms Observed</span>
            <span className="text-emerald-400 text-[10px]">(&lt; 150ms SLA)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded border border-outline-variant/30 bg-surface-container-high px-2 py-1 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (Voice Core & Visualizer) + Right Column (Travel Tool Guard & Stream) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Voice Core & Dynamic Visualizer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Voice Core Card */}
          <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-5 shadow-lg relative overflow-hidden">
            {/* Header / State Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-outline-variant/20">
              <div>
                <h2 className="font-headline-md font-bold text-on-surface flex items-center gap-2">
                  <span>Voice Core & Interruption Engine</span>
                  <span className="text-xs font-telemetry-sm px-2 py-0.5 rounded bg-primary-container/20 text-primary-container border border-primary-container/30">
                    SUB-150MS SLA
                  </span>
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Rime Neural TTS Streamer with Zero-Latency Audio Buffer Zero-Out
                </p>
              </div>

              {/* State Pills */}
              <div className="flex flex-wrap gap-1.5">
                {(['LISTENING', 'THINKING', 'SPEAKING', 'INTERRUPTED', 'TOOL_RUNNING', 'ACTIVE'] as EngineStatus[]).map(
                  (st) => {
                    const isActive = engineState === st;
                    return (
                      <span
                        key={st}
                        className={`px-2 py-0.5 rounded text-[10px] font-label-caps transition-all ${
                          isActive
                            ? st === 'INTERRUPTED'
                              ? 'bg-red-500 text-white font-bold animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                              : st === 'SPEAKING'
                              ? 'bg-primary-container text-on-primary-fixed font-bold shadow-[0_0_10px_rgba(0,242,254,0.4)]'
                              : st === 'THINKING'
                              ? 'bg-amber-400 text-black font-bold'
                              : 'bg-secondary-container text-white font-bold'
                            : 'bg-surface-container-high text-outline opacity-50'
                        }`}
                      >
                        {st}
                      </span>
                    );
                  }
                )}
              </div>
            </div>

            {/* Dynamic 42-Band Audio Spectrum Visualizer */}
            <div className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-4 relative">
              <div className="flex items-center justify-between text-xs font-telemetry-sm text-on-surface-variant mb-2">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5 text-primary" />
                  <span>Hardware Audio Buffer (48kHz Ring Buffer)</span>
                </span>
                <span className="text-primary-container font-medium">
                  {engineState === 'SPEAKING'
                    ? 'STREAMING AUDIO'
                    : engineState === 'INTERRUPTED'
                    ? 'DRAINED & ZEROED (<38ms)'
                    : 'IDLE / LISTENING'}
                </span>
              </div>

              {/* Spectrum Bars */}
              <div className="h-20 flex items-end justify-between gap-1 px-1 py-1">
                {audioSpectrum.map((val, idx) => {
                  const isInterrupted = engineState === 'INTERRUPTED';
                  const isSpeaking = engineState === 'SPEAKING';
                  return (
                    <div
                      key={idx}
                      style={{ height: `${val}px` }}
                      className={`flex-1 rounded-t transition-all duration-75 ${
                        isInterrupted
                          ? 'bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                          : isSpeaking
                          ? idx % 2 === 0
                            ? 'bg-primary-container shadow-[0_0_6px_rgba(0,242,254,0.3)]'
                            : 'bg-secondary'
                          : 'bg-surface-container-highest'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Visualizer Footer Latency Badge */}
              <div className="mt-3 flex items-center justify-between text-[11px] font-telemetry-sm pt-2 border-t border-outline-variant/20">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span>Hardware Zero-Out:</span>
                  <span className="text-primary font-bold">{lastFlushLatency}ms</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span>Barge-In Threshold:</span>
                  <span className="text-emerald-400 font-bold">45ms (100% Intercepted)</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span>Nonce Guard:</span>
                  <span className="text-secondary font-bold">ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Primary Action Controls */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                id="run-scenario-btn"
                onClick={runDeterministicScenario}
                disabled={isScenarioRunning}
                className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 font-semibold text-xs shadow transition-all ${
                  isScenarioRunning
                    ? 'bg-surface-container-highest text-outline cursor-not-allowed'
                    : 'bg-primary-container text-on-primary-fixed hover:bg-primary-fixed hover:shadow-[0_0_20px_rgba(0,242,254,0.35)] active:scale-98'
                }`}
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Run Train Booking Scenario</span>
              </button>

              <button
                id="interrupt-now-btn"
                onClick={triggerBargeIn}
                className="flex items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/20 px-4 py-2.5 text-xs font-semibold text-red-200 hover:bg-red-500/30 active:scale-98 transition-all"
              >
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span>Interrupt Agent Now (Barge-In)</span>
              </button>
            </div>

            {/* Custom Input / STT Control */}
            <form onSubmit={handleCustomSend} className="mt-4 flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Type custom utterance or instruction (e.g., 'Stop, reroute to Mumbai')..."
                className="flex-1 rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-xs text-on-surface placeholder:text-outline focus:border-primary-container focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center justify-center rounded-lg bg-surface-container-high px-3 py-2 text-xs text-primary hover:bg-surface-bright transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          {/* Real-Time Speech Stream */}
          <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-5 shadow-lg flex flex-col flex-1">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-outline-variant/20">
              <h3 className="text-xs font-bold font-telemetry-md uppercase tracking-wider text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[16px]">record_voice_over</span>
                <span>Real-Time Conversation Stream</span>
              </h3>
              <span className="text-[10px] font-telemetry-sm text-on-surface-variant">
                Continuous Ingress & Voice Sync
              </span>
            </div>

            {/* Conversation Messages */}
            <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
              {conversation.map((turn) => {
                const isAgent = turn.sender === 'agent';
                return (
                  <div
                    key={turn.id}
                    className={`flex flex-col gap-1 p-3 rounded-lg text-xs transition-all ${
                      isAgent
                        ? turn.isInterrupted
                          ? 'border border-red-500/40 bg-red-950/20'
                          : 'border border-primary/20 bg-surface-container'
                        : 'border border-outline-variant/30 bg-surface-container-high ml-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-telemetry-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            isAgent ? (turn.isInterrupted ? 'text-red-400' : 'text-primary') : 'text-secondary'
                          }`}
                        >
                          {isAgent ? 'RESCUEVOICE AGENT' : 'USER'}
                        </span>
                        {turn.requestNonce && (
                          <span className="rounded bg-surface-container-lowest px-1 py-0.2 text-outline">
                            Nonce: {turn.requestNonce}
                          </span>
                        )}
                        {turn.generation && (
                          <span className="text-on-surface-variant">Gen #{turn.generation}</span>
                        )}
                      </div>
                      <span className="text-outline">{turn.timestamp}</span>
                    </div>

                    <p className="text-xs font-body-md text-on-surface leading-relaxed mt-1">
                      {turn.isInterrupted ? (
                        <span>
                          {turn.text.replace(turn.interruptedPhrase || '', '')}
                          <span className="line-through text-red-400/80 bg-red-500/10 px-1 rounded">
                            {turn.interruptedPhrase}
                          </span>
                          <span className="ml-2 inline-flex items-center gap-1 rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-400 font-label-caps">
                            [INTERRUPTED @ 38ms]
                          </span>
                        </span>
                      ) : (
                        turn.text
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Travel Tool Execution Guard & Telemetry Terminal (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Travel Tool Execution Guard Diagram */}
          <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-outline-variant/20">
              <h3 className="text-xs font-bold font-telemetry-md uppercase tracking-wider text-on-surface flex items-center gap-2">
                <Train className="h-4 w-4 text-primary" />
                <span>Travel Tool Execution Guard</span>
              </h3>
              <span className="text-[10px] font-label-caps px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                ATOMIC LOCK
              </span>
            </div>

            {/* 3 Step Guard Diagram */}
            <div className="flex flex-col gap-2.5">
              {/* Step 1 */}
              <div className="flex items-start gap-3 rounded-lg border border-outline-variant/30 bg-surface-container p-2.5 text-xs">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[10px]">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-on-surface">IRCTC Tool Dispatched</span>
                    <span className="text-[10px] font-telemetry-sm text-secondary">0x4B21</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 font-telemetry-sm">
                    irctc.book_ticket(origin="MAS", dest="SBC")
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-950/20 p-2.5 text-xs">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-300">Epoch Outdated On Barge-In</span>
                    <span className="text-[10px] font-label-caps text-amber-400 bg-amber-500/10 px-1 rounded">
                      INVALIDATED
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 font-telemetry-sm">
                    User interrupted: 0x4B21 retired. Nonce 0x8F22 locked.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-950/20 p-2.5 text-xs">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 font-bold text-[10px]">
                  3
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-red-300">Stale Payload Dropped</span>
                    <span className="text-[10px] font-label-caps text-red-400 bg-red-500/10 px-1 rounded">
                      MUTATION PREVENTED
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 font-telemetry-sm">
                    Seat 42B allocated for Bangalore discarded safely!
                  </p>
                </div>
              </div>
            </div>

            {/* Dual Request Inspector: Side-by-Side Comparison */}
            <div className="mt-4 pt-3 border-t border-outline-variant/20 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Request 21 Card */}
              <div className="rounded-lg border border-red-500/30 bg-surface-container-lowest p-2.5 text-[11px]">
                <div className="flex items-center justify-between text-red-400 font-bold font-telemetry-sm">
                  <span>REQ #21 (Gen 1)</span>
                  <span className="text-[9px] bg-red-500/20 px-1.5 py-0.2 rounded text-red-300">CANCELLED</span>
                </div>
                <div className="mt-1.5 space-y-0.5 text-on-surface-variant font-telemetry-sm">
                  <div>Nonce: <span className="text-on-surface">0x4B21</span></div>
                  <div>Dest: <span className="text-on-surface">Bangalore (SBC)</span></div>
                  <div>Tool State: <span className="text-red-400 font-semibold">DISCARDED</span></div>
                </div>
              </div>

              {/* Request 22 Card */}
              <div className="rounded-lg border border-emerald-500/30 bg-surface-container-lowest p-2.5 text-[11px]">
                <div className="flex items-center justify-between text-emerald-400 font-bold font-telemetry-sm">
                  <span>REQ #22 (Gen 2)</span>
                  <span className="text-[9px] bg-emerald-500/20 px-1.5 py-0.2 rounded text-emerald-300">COMMITTED</span>
                </div>
                <div className="mt-1.5 space-y-0.5 text-on-surface-variant font-telemetry-sm">
                  <div>Nonce: <span className="text-primary-container">0x8F22</span></div>
                  <div>Dest: <span className="text-on-surface">Hyderabad (HYB)</span></div>
                  <div>Tool State: <span className="text-emerald-400 font-semibold">EXECUTED</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Millisecond Telemetry Stream Terminal */}
          <div className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-lg flex flex-col flex-1 font-telemetry-sm">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
                <Terminal className="h-3.5 w-3.5 text-primary-container" />
                <span>Millisecond Telemetry Stream</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLogs}
                  className="text-[10px] text-outline hover:text-on-surface flex items-center gap-1 transition-colors"
                  title="Copy logs"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={onClearLogs}
                  className="text-[10px] text-outline hover:text-red-400 flex items-center gap-1 transition-colors"
                  title="Clear stream"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Terminal logs list */}
            <div className="flex-1 overflow-y-auto max-h-[300px] space-y-1.5 text-[11px] pr-1">
              {logs.length === 0 ? (
                <div className="text-outline text-center py-6 text-xs">Awaiting telemetry events...</div>
              ) : (
                logs.map((log) => {
                  let badgeColor = 'text-outline bg-surface-container-high';
                  if (log.level === 'INTERRUPT') badgeColor = 'text-red-400 bg-red-950/40 border border-red-500/30';
                  if (log.level === 'GUARD') badgeColor = 'text-amber-400 bg-amber-950/40 border border-amber-500/30';
                  if (log.level === 'COMMITTED') badgeColor = 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30';
                  if (log.level === 'INFO') badgeColor = 'text-primary-container bg-primary-container/10';

                  return (
                    <div key={log.id} className="flex items-start gap-2 leading-tight">
                      <span className="text-outline/70 shrink-0">[{log.timestamp}]</span>
                      <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${badgeColor}`}>
                        {log.level}
                      </span>
                      <span className="text-secondary shrink-0 font-medium">[{log.source}]</span>
                      <span className="text-on-surface break-words">{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
