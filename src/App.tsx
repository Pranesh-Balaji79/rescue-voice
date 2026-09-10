import React, { useState } from 'react';
import { NavigationTab, TelemetryLog } from './types';
import { Header } from './components/Header';
import { LiveAgentStudio } from './components/LiveAgentStudio';
import { RequestTimelineView } from './components/RequestTimelineView';
import { MetricsTelemetryView } from './components/MetricsTelemetryView';
import { SystemArchitectureView } from './components/SystemArchitectureView';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('studio');
  const [micActive, setMicActive] = useState<boolean>(true);
  const [isScenarioTriggered, setIsScenarioTriggered] = useState<boolean>(false);

  // Shared millisecond telemetry logs
  const [logs, setLogs] = useState<TelemetryLog[]>([
    {
      id: 'log-1',
      timestamp: '14:02:17.100',
      epochMs: 1774792937100,
      level: 'INFO',
      source: 'INGRESS',
      message: 'Continuous STT ingress locked frame. Nonce: 0x4B21 (Gen 21)',
    },
    {
      id: 'log-2',
      timestamp: '14:02:17.412',
      epochMs: 1774792937412,
      level: 'INFO',
      source: 'RIME_TTS',
      message: 'Rime Neural TTFA: 218ms. Streaming audio chunk: "Searching IRCTC Tatkal availability..."',
    },
    {
      id: 'log-3',
      timestamp: '14:02:17.480',
      epochMs: 1774792937480,
      level: 'INFO',
      source: 'IRCTC_TOOL',
      message: 'Async dispatch: book_ticket(origin="MAS", dest="SBC", departure="06:00")',
    },
    {
      id: 'log-4',
      timestamp: '14:02:18.520',
      epochMs: 1774792938520,
      level: 'INTERRUPT',
      source: 'VAD_BARGE_IN',
      message: 'Hardware energy threshold -28.4dB exceeded. Flushing audio sink buffer (38ms)',
      payload: { cutLatencyMs: 38 },
    },
    {
      id: 'log-5',
      timestamp: '14:02:18.524',
      epochMs: 1774792938524,
      level: 'GUARD',
      source: 'NONCE_GUARD',
      message: 'Invalidated generational nonce 0x4B21. Forked generation to #22 (Nonce 0x8F22)',
    },
    {
      id: 'log-6',
      timestamp: '14:02:18.972',
      epochMs: 1774792938972,
      level: 'GUARD',
      source: 'STALE_GUARD',
      message: 'Late IRCTC callback arrived for Request #21 (Nonce: 0x4B21 != Active: 0x8F22). Dropped before mutation!',
    },
    {
      id: 'log-7',
      timestamp: '14:02:19.190',
      epochMs: 1774792939190,
      level: 'COMMITTED',
      source: 'RIME_TTS',
      message: 'Synthesizing corrected route to Hyderabad. Audio buffer re-primed for Gen #22.',
    },
  ]);

  const addLog = (
    level: TelemetryLog['level'],
    source: string,
    message: string,
    payload?: Record<string, unknown>
  ) => {
    const newLog: TelemetryLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString() + '.' + String(Date.now() % 1000).padStart(3, '0'),
      epochMs: Date.now(),
      level,
      source,
      message,
      payload,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleToggleMic = () => {
    setMicActive((prev) => {
      const next = !prev;
      addLog(
        'INFO',
        'AUDIO_HARDWARE',
        next ? 'Microphone audio stream active' : 'Microphone audio input muted'
      );
      return next;
    });
  };

  const handleTriggerDemo = () => {
    // If not in studio, switch to studio and trigger scenario
    if (activeTab !== 'studio') {
      setActiveTab('studio');
    }
    setIsScenarioTriggered(true);
    setTimeout(() => {
      setIsScenarioTriggered(false);
    }, 1000);

    // Click the scenario button in studio if present
    const btn = document.getElementById('run-scenario-btn');
    if (btn) {
      btn.click();
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col font-body-md selection:bg-primary-container selection:text-on-primary-fixed">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        micActive={micActive}
        onToggleMic={handleToggleMic}
        onTriggerDemo={handleTriggerDemo}
        isScenarioRunning={isScenarioTriggered}
      />

      {/* Main Tab Content */}
      <main className="flex-1 w-full pb-12">
        {activeTab === 'studio' && (
          <LiveAgentStudio
            logs={logs}
            addLog={addLog}
            onClearLogs={handleClearLogs}
          />
        )}

        {activeTab === 'timeline' && (
          <RequestTimelineView
            logs={logs}
            addLog={addLog}
          />
        )}

        {activeTab === 'metrics' && (
          <MetricsTelemetryView
            onRunScenario={handleTriggerDemo}
          />
        )}

        {activeTab === 'architecture' && (
          <SystemArchitectureView />
        )}
      </main>

      {/* Persistent Bottom Operational Footer */}
      <footer className="border-t border-outline-variant/30 bg-surface-container-low/60 backdrop-blur px-4 py-2.5 text-xs text-on-surface-variant font-telemetry-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span>RESCUEVOICE CORE v2.1</span>
            <span className="text-outline">•</span>
            <span>Rime TTS Neural Streamer + WebAudio Sink</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Active Epoch: <strong className="text-primary-container font-semibold">0x9AF4</strong></span>
            <span>Observed Stop Latency: <strong className="text-emerald-400 font-semibold">38ms</strong></span>
            <span>Race Isolation: <strong className="text-secondary font-semibold">100% Guaranteed</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
