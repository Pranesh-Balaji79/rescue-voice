import React from 'react';
import { NavigationTab } from '../types';
import { Mic, MicOff, Zap, ShieldCheck, Activity, Cpu } from 'lucide-react';

interface HeaderProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  micActive: boolean;
  onToggleMic: () => void;
  onTriggerDemo: () => void;
  isScenarioRunning?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  micActive,
  onToggleMic,
  onTriggerDemo,
  isScenarioRunning = false,
}) => {
  const tabs: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'studio', label: 'Live Agent Studio', icon: 'mic' },
    { id: 'timeline', label: 'Request Timeline & State Machine', icon: 'timeline' },
    { id: 'metrics', label: 'Metrics & Evidence Telemetry', icon: 'monitoring' },
    { id: 'architecture', label: 'System Architecture & Docs', icon: 'account_tree' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant/30 bg-surface-container-lowest/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Engine Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-primary/30 bg-surface-container-high shadow-[0_0_15px_rgba(0,242,254,0.15)]">
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1UW_u1A8-vqIHJcVq99VJJvRozBY7XVTUS3Ma1RSGWjpFKqT7hwIWIyGjtepF75pzfYzziQGZMGUa2eHIzpbRXvRJE43QvgeI3JcP7NAAcTvtMFvMqFAY-4cZxgNu4-Y9JfsGHafZNlkYiJChjWPUG9ZeRSdaQVVx8EZlWrBrdUh75iOa2qAn7lM3ktoj_69Alz5B4Aut_mATQJ-eOFjkpQ7jljEErankpeD2ea3kCkJ5eDYjawn5ktNeXX"
                alt="RescueVoice Logo"
                className="h-7 w-7 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-md tracking-tight font-bold text-primary">RescueVoice</span>
                <span className="hidden sm:inline-block rounded border border-primary-container/40 bg-primary-container/10 px-1.5 py-0.5 font-label-caps text-[10px] text-primary-container font-semibold">
                  INTERRUPT. CORRECT. CONTINUE.
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant font-telemetry-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ENGINE: ONLINE</span>
                <span className="text-outline/60">•</span>
                <span className="text-secondary font-medium">Rime TTS + WebAudio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <nav className="hidden lg:flex items-center gap-1 rounded-xl border border-outline-variant/30 bg-surface-container-low p-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-container text-on-primary-fixed shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions & SLA Guarantee */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* SLA Badge */}
          <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-telemetry-sm text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>&lt; 150ms Stop Guarantee</span>
          </div>

          {/* Mic Toggle */}
          <button
            id="header-mic-toggle-btn"
            onClick={onToggleMic}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              micActive
                ? 'border-red-500/50 bg-red-500/20 text-red-300 hover:bg-red-500/30'
                : 'border-outline-variant/40 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
            title={micActive ? 'Mute Microphone' : 'Enable Microphone (Simulated STT)'}
          >
            {micActive ? <Mic className="h-3.5 w-3.5 text-red-400 animate-pulse" /> : <MicOff className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{micActive ? 'Mic Active' : 'Mic Muted'}</span>
          </button>

          {/* Quick Interruption Demo Trigger */}
          <button
            id="header-run-demo-btn"
            onClick={onTriggerDemo}
            disabled={isScenarioRunning}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow transition-all ${
              isScenarioRunning
                ? 'bg-surface-container-highest text-outline cursor-not-allowed'
                : 'bg-primary-container text-on-primary-fixed hover:bg-primary-fixed hover:shadow-[0_0_15px_rgba(0,242,254,0.3)] active:scale-95'
            }`}
          >
            <Zap className={`h-3.5 w-3.5 ${isScenarioRunning ? 'animate-spin' : 'fill-current'}`} />
            <span>{isScenarioRunning ? 'Scenario Active...' : 'Interruption Demo'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Tabs */}
      <div className="flex lg:hidden overflow-x-auto border-t border-outline-variant/20 bg-surface-container-low/80 px-2 py-1 scrollbar-none">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-fixed font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
