import React, { useState } from 'react';
import { TelemetryLog } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  RefreshCw,
  Terminal,
} from 'lucide-react';

interface RequestTimelineViewProps {
  logs: TelemetryLog[];
  addLog: (level: TelemetryLog['level'], source: string, message: string, payload?: Record<string, unknown>) => void;
}

export const RequestTimelineView: React.FC<RequestTimelineViewProps> = ({
  logs,
  addLog,
}) => {
  const [jitterMs, setJitterMs] = useState<number>(850);
  const [isSimulatingPacket, setIsSimulatingPacket] = useState<boolean>(false);
  const [packetProgress, setPacketProgress] = useState<number>(0);
  const [packetBlocked, setPacketBlocked] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<string>('NONCE_GUARD');

  const handleSimulateStalePacket = () => {
    if (isSimulatingPacket) return;
    setIsSimulatingPacket(true);
    setPacketBlocked(false);
    setPacketProgress(0);

    addLog('INFO', 'SANDBOX', `Dispatched delayed tool response from Request #21 with ${jitterMs}ms network jitter`, {
      staleNonce: '0x4B21',
      payload: 'irctc_seat_MAS_SBC_42B',
    });

    const startTime = performance.now();
    const duration = Math.min(2200, Math.max(600, jitterMs));

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setPacketProgress(progress);

      if (progress >= 75 && !packetBlocked) {
        setPacketBlocked(true);
        addLog('GUARD', 'NONCE_BARRIER', 'CRITICAL RACE INTERCEPTED: Stale tool payload for Request #21 (Nonce 0x4B21) collided with Nonce Guard 0x8F22!', {
          staleNonce: '0x4B21',
          currentNonce: '0x8F22',
          action: 'DISCARDED_BEFORE_MUTATION',
          verdict: 'RACE_PREVENTED',
        });
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsSimulatingPacket(false);
        }, 1500);
      }
    }, 40);
  };

  const fsmNodes = [
    {
      id: 'INGRESS',
      name: 'Ingress & STT',
      badge: 'Continuous',
      desc: 'Streams client audio chunks and detects utterance boundary.',
      sla: '< 18ms',
      color: 'border-blue-500/40 text-blue-300',
    },
    {
      id: 'NONCE_GUARD',
      name: 'Nonce Guard',
      badge: '0x8F22 Active',
      desc: 'Enforces strictly monotonically increasing generational nonces. Rejects mismatched callbacks.',
      sla: '< 4ms',
      color: 'border-primary-container text-primary-container bg-primary-container/10',
    },
    {
      id: 'LLM_REASONING',
      name: 'LLM Agent',
      badge: 'Tool Intent',
      desc: 'Parses traveler request and creates IRCTC booking parameters.',
      sla: '180ms',
      color: 'border-purple-500/40 text-purple-300',
    },
    {
      id: 'TOOL_EXEC',
      name: 'IRCTC Tool Executor',
      badge: 'Async API',
      desc: 'Issues non-blocking HTTP call to railway reservation gateway with nonce binding.',
      sla: '400-1200ms',
      color: 'border-amber-500/40 text-amber-300',
    },
    {
      id: 'RIME_AUDIO',
      name: 'Rime TTS & Sink',
      badge: 'Streaming',
      desc: 'Sub-200ms audio streaming with instantaneous <38ms zero-out on barge-in signal.',
      sla: '< 38ms Flush',
      color: 'border-emerald-500/40 text-emerald-300',
    },
  ];

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Operational Sub-Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 font-telemetry-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant">EPOCH:</span>
            <span className="rounded bg-surface-container-high px-1.5 py-0.5 text-primary-container font-bold">
              0x9AF4
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant">STATE MONITORING:</span>
            <span className="rounded bg-surface-container-high px-1.5 py-0.5 text-secondary font-bold">
              GEN_22 // LOCKED
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>ISOLATION SHIELD ENGAGED</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant">FLUSH GUARANTEE:</span>
            <span className="text-primary font-semibold">38ms Observed</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-telemetry-sm text-emerald-300 border border-emerald-500/20">
            Zero Race Leakage
          </span>
        </div>
      </div>

      {/* Interactive FSM Architecture Spec 2.1 Diagram */}
      <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-outline-variant/20">
          <div>
            <h2 className="font-headline-md font-bold text-on-surface flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <span>Finite State Machine Architecture Spec 2.1</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Generational Nonce Isolation & Deterministic Barge-In Invariants
            </p>
          </div>
          <span className="rounded bg-surface-container-high px-2 py-1 text-xs font-telemetry-sm text-secondary">
            SPEC: RFC-VOICE-FSM-2.1
          </span>
        </div>

        {/* Pipeline Nodes Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 relative">
          {fsmNodes.map((node) => {
            const isSelected = selectedNode === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className={`flex flex-col text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? `${node.color} ring-1 ring-primary shadow-lg scale-[1.02]`
                    : 'border-outline-variant/30 bg-surface-container hover:bg-surface-container-high'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-telemetry-sm mb-1.5">
                  <span className="font-bold">{node.badge}</span>
                  <span className="text-outline">{node.sla}</span>
                </div>
                <div className="font-semibold text-xs text-on-surface">{node.name}</div>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-snug line-clamp-2">
                  {node.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Barge-In Fork Branch Callout */}
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-950/20 p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-bold text-red-300">
                <span>BARGE-IN HARD INTERRUPT BRANCH</span>
                <span className="text-[10px] font-label-caps px-1.5 py-0.2 rounded bg-red-500/20 text-red-200">
                  CRITICAL PATH &lt; 38ms
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                VAD Trigger → Audio Sink Flush (0-fill) → Increment Generation Nonce (0x4B21 → 0x8F22) → Invalidate in-flight callbacks.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center font-telemetry-sm text-[11px]">
            <span className="text-on-surface-variant">Observed Flush:</span>
            <span className="text-primary font-bold">38ms</span>
          </div>
        </div>
      </div>

      {/* Dual Deep Inspector: Request #21 vs. Request #22 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Request #21 (Gen 1 - Cancelled) */}
        <div className="rounded-xl border border-red-500/30 bg-surface-container-low p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/20 text-red-400 font-bold text-xs">
                #21
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-on-surface">Request #21</span>
                  <span className="rounded bg-red-500/20 text-red-300 px-1.5 py-0.2 text-[10px] font-bold">
                    CANCELLED
                  </span>
                </div>
                <span className="text-[11px] text-outline font-telemetry-sm">Nonce: 0x4B21 • Generation 1</span>
              </div>
            </div>
            <XCircle className="h-5 w-5 text-red-400" />
          </div>

          <div className="space-y-2 text-xs font-telemetry-sm">
            <div className="rounded bg-surface-container p-2.5">
              <span className="text-outline text-[10px] block mb-0.5">USER INTENT:</span>
              <span className="text-on-surface font-medium font-body-md">
                "Book train Chennai to Bangalore for tomorrow 6 AM"
              </span>
            </div>

            <div className="rounded bg-surface-container p-2.5 space-y-1">
              <div className="flex justify-between">
                <span className="text-outline">Tool Dispatched:</span>
                <span className="text-secondary">irctc.book_train(origin="MAS", dest="SBC")</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Barge-in Interruption:</span>
                <span className="text-red-400 font-bold">At t=412ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Tool Result State:</span>
                <span className="text-red-300 font-semibold">DROPPED (Nonce Expired)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Database Mutation:</span>
                <span className="text-emerald-400 font-bold">PREVENTED (0 Leaks)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Request #22 (Gen 2 - Active & Committed) */}
        <div className="rounded-xl border border-emerald-500/30 bg-surface-container-low p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                #22
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-on-surface">Request #22</span>
                  <span className="rounded bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 text-[10px] font-bold">
                    ACTIVE & COMMITTED
                  </span>
                </div>
                <span className="text-[11px] text-outline font-telemetry-sm">Nonce: 0x8F22 • Generation 2</span>
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>

          <div className="space-y-2 text-xs font-telemetry-sm">
            <div className="rounded bg-surface-container p-2.5">
              <span className="text-outline text-[10px] block mb-0.5">CORRECTED USER INTENT:</span>
              <span className="text-on-surface font-medium font-body-md">
                "Wait, stop! Change destination to Hyderabad instead!"
              </span>
            </div>

            <div className="rounded bg-surface-container p-2.5 space-y-1">
              <div className="flex justify-between">
                <span className="text-outline">Tool Dispatched:</span>
                <span className="text-primary-container font-semibold">irctc.book_train(origin="MAS", dest="HYB")</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Barge-in Cut Latency:</span>
                <span className="text-emerald-400 font-bold">38ms hard flush</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Tool Result State:</span>
                <span className="text-emerald-300 font-semibold">COMMITTED (Nonce Matched)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Audio Stream Status:</span>
                <span className="text-primary font-bold">Playing Rime TTS Stream</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Stale Result Protection Sandbox */}
      <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-outline-variant/20">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2 font-telemetry-md">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Interactive Stale Result Protection Sandbox</span>
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Simulate delayed asynchronous callbacks arriving after a user barge-in event
            </p>
          </div>

          {/* Jitter Slider & Action */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-telemetry-sm">
              <Sliders className="h-3.5 w-3.5 text-outline" />
              <span className="text-on-surface-variant">Simulated Jitter:</span>
              <input
                type="range"
                min="100"
                max="2500"
                step="50"
                value={jitterMs}
                onChange={(e) => setJitterMs(Number(e.target.value))}
                className="w-24 sm:w-32 accent-primary-container cursor-pointer"
              />
              <span className="font-bold text-primary w-14">{jitterMs}ms</span>
            </div>

            <button
              id="simulate-stale-packet-btn"
              onClick={handleSimulateStalePacket}
              disabled={isSimulatingPacket}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold shadow transition-all ${
                isSimulatingPacket
                  ? 'bg-surface-container-highest text-outline cursor-not-allowed'
                  : 'bg-amber-400 text-black hover:bg-amber-300 active:scale-95'
              }`}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Simulate Delayed Callback (Req #21)</span>
            </button>
          </div>
        </div>

        {/* Animated Wire / Pipe Representation */}
        <div className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-4 relative">
          <div className="flex items-center justify-between text-xs font-telemetry-sm text-on-surface-variant mb-2">
            <span>Async Callback Ingress Pipe</span>
            <span>Nonce Security Barrier</span>
            <span>Internal State Store</span>
          </div>

          {/* Pipe Track */}
          <div className="relative h-14 rounded-lg bg-surface-container border border-outline-variant/20 overflow-hidden flex items-center px-4">
            {/* Background Grid markings */}
            <div className="absolute inset-0 opacity-10 flex justify-between items-center px-2 pointer-events-none">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-full w-[1px] bg-white" />
              ))}
            </div>

            {/* Nonce Barrier (at 75% width) */}
            <div className="absolute left-[75%] top-0 bottom-0 w-2.5 bg-primary-container shadow-[0_0_15px_rgba(0,242,254,0.6)] z-10 flex items-center justify-center">
              <div className="w-1 h-full bg-white animate-pulse" />
            </div>
            <div className="absolute left-[75%] top-1 -translate-x-1/2 z-20 text-[9px] font-label-caps bg-surface-container-lowest px-1.5 py-0.2 rounded border border-primary-container text-primary-container font-bold">
              NONCE 0x8F22
            </div>

            {/* Traveling Stale Packet */}
            {isSimulatingPacket && (
              <div
                style={{ left: `${Math.min(74, packetProgress)}%` }}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 transition-all duration-75 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-telemetry-sm font-bold shadow-lg ${
                  packetBlocked
                    ? 'bg-red-600 text-white animate-bounce shadow-[0_0_20px_rgba(239,68,68,0.8)]'
                    : 'bg-amber-400 text-black'
                }`}
              >
                <span>{packetBlocked ? '⛔ REJECTED' : '📦 RES_42B'}</span>
                <span className="text-[8px] bg-black/30 px-1 rounded">0x4B21</span>
              </div>
            )}

            {/* Destination State Store Indicator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-telemetry-sm text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Protected DB State</span>
            </div>
          </div>

          {/* Collision / Alert Notification */}
          {packetBlocked && (
            <div className="mt-3 rounded-md border border-red-500/40 bg-red-950/30 p-2.5 flex items-center gap-2 text-xs text-red-300">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span className="font-telemetry-sm">
                <strong>STALE CALLBACK INTERCEPTED:</strong> Response for Bangalore seat reservation carrying outdated nonce <code className="bg-red-900/50 px-1 py-0.5 rounded text-white">0x4B21</code> was rejected at barrier because active generation is <code className="bg-primary/20 px-1 py-0.5 rounded text-primary-container">0x8F22</code>. Zero state pollution occurred!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Formal State Machine Transition Matrix Table */}
      <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-5 shadow-lg overflow-x-auto">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
          <div>
            <h3 className="text-xs font-bold font-telemetry-md uppercase tracking-wider text-on-surface flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              <span>Formal State Machine Transition Matrix</span>
            </h3>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              Strict Mathematical Guard Specifications & Guaranteed Flush SLA Limits
            </p>
          </div>
        </div>

        <table className="w-full text-left text-xs font-telemetry-sm">
          <thead>
            <tr className="border-b border-outline-variant/30 text-on-surface-variant text-[11px]">
              <th className="py-2 px-3">Current State</th>
              <th className="py-2 px-3">Trigger Event</th>
              <th className="py-2 px-3">Guard Invariant</th>
              <th className="py-2 px-3">Next State</th>
              <th className="py-2 px-3">Action & Hardware SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 text-on-surface">
            <tr>
              <td className="py-2.5 px-3 font-semibold text-blue-300">IDLE / LISTENING</td>
              <td className="py-2.5 px-3">USER_SPEECH_START</td>
              <td className="py-2.5 px-3 text-outline">VAD Energy &gt; -38dB</td>
              <td className="py-2.5 px-3 text-primary-container font-semibold">LISTENING</td>
              <td className="py-2.5 px-3 text-emerald-400">Lock Ingress Buffer</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold text-blue-300">LISTENING</td>
              <td className="py-2.5 px-3">SPEECH_ENDPOINT</td>
              <td className="py-2.5 px-3 text-outline">Silence Duration &gt; 250ms</td>
              <td className="py-2.5 px-3 text-amber-400 font-semibold">THINKING</td>
              <td className="py-2.5 px-3 text-secondary">Commit Nonce 0x8F22</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold text-amber-400">THINKING</td>
              <td className="py-2.5 px-3">FIRST_AUDIO_CHUNK</td>
              <td className="py-2.5 px-3 text-outline">Rime TTFA &lt; 250ms</td>
              <td className="py-2.5 px-3 text-primary font-semibold">SPEAKING</td>
              <td className="py-2.5 px-3 text-emerald-400">Start 48kHz Output Ring</td>
            </tr>
            <tr className="bg-red-950/20">
              <td className="py-2.5 px-3 font-semibold text-primary">SPEAKING</td>
              <td className="py-2.5 px-3 font-bold text-red-400">BARGE_IN_TRIGGER</td>
              <td className="py-2.5 px-3 text-red-300">Hardware VAD Cut &lt; 20ms</td>
              <td className="py-2.5 px-3 text-red-400 font-bold">INTERRUPTED</td>
              <td className="py-2.5 px-3 font-bold text-red-300">Flush Output Sink (&lt;38ms)</td>
            </tr>
            <tr className="bg-amber-950/20">
              <td className="py-2.5 px-3 font-semibold text-amber-300">TOOL_RUNNING</td>
              <td className="py-2.5 px-3">ASYNC_CALLBACK</td>
              <td className="py-2.5 px-3 text-amber-400">cb.nonce != active.nonce</td>
              <td className="py-2.5 px-3 text-red-400 font-semibold">DROPPED</td>
              <td className="py-2.5 px-3 text-emerald-400 font-bold">0 Mutation / Discard Payload</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
