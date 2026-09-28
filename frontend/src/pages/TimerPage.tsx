import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '../components/AppLayout';
import {
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  Flag,
  Bell,
  Clock,
  Plus,
  Trash2,
  Volume2,
  Sparkles,
  Coffee,
  Brain,
  Flame,
  Zap,
} from 'lucide-react';

type Mode = 'stopwatch' | 'timer' | 'alarm';

interface LapItem {
  lap: number;
  time: number; // in ms
  diff: number;
}

interface AlarmItem {
  id: string;
  time: string; // HH:mm (24h)
  label: string;
  category: string;
  sound: 'digital' | 'bell' | 'chime' | 'radar' | 'voice';
  enabled: boolean;
  days: string[]; // ['Mon', 'Tue', ...]
}

// Web Audio API Sound Synthesizer for Alarms & Timer alerts
const playSynthesizedAlert = (soundType: string, label?: string) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (soundType === 'voice' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = label ? `Alert! Time for: ${label}!` : 'Timer finished! Great job on your study session!';
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.0;
      utter.pitch = 1.1;
      window.speechSynthesis.speak(utter);
      return;
    }

    const now = ctx.currentTime;

    if (soundType === 'chime') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.15);
        gain.gain.setValueAtTime(0.3, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.8);
      });
    } else if (soundType === 'bell') {
      [440, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.2);
        gain.gain.setValueAtTime(0.4, now + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.2);
        osc.stop(now + i * 0.2 + 1.2);
      });
    } else if (soundType === 'radar') {
      for (let r = 0; r < 3; r++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now + r * 0.3);
        osc.frequency.exponentialRampToValueAtTime(1400, now + r * 0.3 + 0.2);
        gain.gain.setValueAtTime(0.25, now + r * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + r * 0.3 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + r * 0.3);
        osc.stop(now + r * 0.3 + 0.25);
      }
    } else {
      // Standard Digital Beep
      for (let b = 0; b < 4; b++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(980, now + b * 0.2);
        gain.gain.setValueAtTime(0.2, now + b * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + b * 0.2 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + b * 0.2);
        osc.stop(now + b * 0.2 + 0.12);
      }
    }
  } catch (err) {
    console.warn('[Audio Alert Error]', err);
  }
};

export const TimerPage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<Mode>('stopwatch');

  // ==========================================
  // 1. STOPWATCH STATE
  // ==========================================
  const [stopwatchTime, setStopwatchTime] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<LapItem[]>([]);
  const stopwatchIntervalRef = useRef<any>(null);
  const stopwatchStartRef = useRef<number>(0);

  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchStartRef.current = Date.now() - stopwatchTime;
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime(Date.now() - stopwatchStartRef.current);
      }, 10);
    } else {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    }
    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    };
  }, [isStopwatchRunning]);

  const handleStopwatchStartPause = () => {
    setIsStopwatchRunning(!isStopwatchRunning);
  };

  const handleStopwatchReset = () => {
    setIsStopwatchRunning(false);
    setStopwatchTime(0);
    setLaps([]);
  };

  const handleStopwatchLap = () => {
    if (stopwatchTime === 0) return;
    const lastLapTime = laps.length > 0 ? laps[0].time : 0;
    const diff = stopwatchTime - lastLapTime;
    const newLap: LapItem = {
      lap: laps.length + 1,
      time: stopwatchTime,
      diff,
    };
    setLaps([newLap, ...laps]);
  };

  // Format Stopwatch Time: HH:MM:SS.ms
  const formatStopwatch = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
    return {
      hours: pad(hours),
      minutes: pad(minutes),
      seconds: pad(seconds),
      ms: pad(centiseconds),
    };
  };

  // ==========================================
  // 2. COUNTDOWN TIMER & POMODORO STATE
  // ==========================================
  const [timerDuration, setTimerDuration] = useState<number>(25 * 60); // in seconds
  const [timerRemaining, setTimerRemaining] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [customMinutes, setCustomMinutes] = useState<number>(25);
  const [customSeconds, setCustomSeconds] = useState<number>(0);
  const [pomodoroMode, setPomodoroMode] = useState<'study' | 'short-break' | 'long-break'>('study');
  const [soundChoice, setSoundChoice] = useState<'digital' | 'bell' | 'chime' | 'radar' | 'voice'>('bell');
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            // Trigger Alarm Audio Alert
            triggerAlarmModal('Countdown Timer Finished', 'Your scheduled focus session has completed!');
            playSynthesizedAlert(soundChoice, 'Focus session completed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, soundChoice]);

  const handleTimerStartPause = () => {
    if (timerRemaining === 0) {
      setTimerRemaining(timerDuration);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const handleTimerReset = () => {
    setIsTimerRunning(false);
    setTimerRemaining(timerDuration);
  };

  const handleSetPreset = (minutes: number, mode: 'study' | 'short-break' | 'long-break' = 'study') => {
    setIsTimerRunning(false);
    const secs = minutes * 60;
    setTimerDuration(secs);
    setTimerRemaining(secs);
    setPomodoroMode(mode);
    setCustomMinutes(minutes);
    setCustomSeconds(0);
  };

  const handleCustomTimerApply = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSecs = (Number(customMinutes) || 0) * 60 + (Number(customSeconds) || 0);
    if (totalSecs <= 0) return;
    setIsTimerRunning(false);
    setTimerDuration(totalSecs);
    setTimerRemaining(totalSecs);
  };

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
    return {
      hours: pad(h),
      minutes: pad(m),
      seconds: pad(s),
    };
  };

  // ==========================================
  // 3. ALERT ALARMS STATE
  // ==========================================
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    {
      id: '1',
      time: '09:00',
      label: 'Morning Deep Work & Learning AI',
      category: 'Computer Science',
      sound: 'bell',
      enabled: true,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    },
    {
      id: '2',
      time: '14:30',
      label: 'Assignment Review & RAG Q&A',
      category: 'Mathematics',
      sound: 'chime',
      enabled: true,
      days: ['Mon', 'Wed', 'Fri'],
    },
    {
      id: '3',
      time: '19:00',
      label: 'Memory Recall & Quiz Practice',
      category: 'General',
      sound: 'voice',
      enabled: false,
      days: ['Everyday'],
    },
  ]);

  const [newAlarmTime, setNewAlarmTime] = useState<string>('08:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState<string>('');
  const [newAlarmCategory, setNewAlarmCategory] = useState<string>('Computer Science');
  const [newAlarmSound, setNewAlarmSound] = useState<'digital' | 'bell' | 'chime' | 'radar' | 'voice'>('chime');
  const [isAddingAlarm, setIsAddingAlarm] = useState<boolean>(false);

  // Active Alert Trigger Modal
  const [activeAlertNotification, setActiveAlertNotification] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const lastTriggeredAlarmMinute = useRef<string>('');

  // Clock for checking scheduled alarms every 5 seconds
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;

      if (lastTriggeredAlarmMinute.current === currentTimeString) {
        return; // Already triggered this minute
      }

      const matching = alarms.find((a) => a.enabled && a.time === currentTimeString);
      if (matching) {
        lastTriggeredAlarmMinute.current = currentTimeString;
        triggerAlarmModal(`⏰ Scheduled Alarm: ${matching.time}`, matching.label);
        playSynthesizedAlert(matching.sound, matching.label);
      }
    };

    const interval = setInterval(checkAlarms, 2000);
    return () => clearInterval(interval);
  }, [alarms]);

  const triggerAlarmModal = (title: string, description: string) => {
    setActiveAlertNotification({ title, description });
  };

  const handleToggleAlarm = (id: string) => {
    setAlarms(
      alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms(alarms.filter((a) => a.id !== id));
  };

  const handleAddAlarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlarmTime) return;

    const newAlarm: AlarmItem = {
      id: Date.now().toString(),
      time: newAlarmTime,
      label: newAlarmLabel.trim() || 'Study Reminder',
      category: newAlarmCategory,
      sound: newAlarmSound,
      enabled: true,
      days: ['Everyday'],
    };

    setAlarms([newAlarm, ...alarms]);
    setNewAlarmLabel('');
    setIsAddingAlarm(false);
  };

  // Formatted times
  const sw = formatStopwatch(stopwatchTime);
  const cd = formatTimer(timerRemaining);
  const timerProgress = timerDuration > 0 ? ((timerDuration - timerRemaining) / timerDuration) * 100 : 0;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Top Header */}
        <div className="pb-4 border-b border-[#E8E1D2] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8E8] border border-[#E8E1D2] text-[11px] font-semibold text-[#111111] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F4C542]" />
              <span>Time & Focus Manager</span>
            </div>
            <h1 className="text-2xl font-black text-[#111111] tracking-tight">Study Clock & Focus Hub</h1>
            <p className="text-xs text-[#777777] mt-1">
              Precision stopwatch, Pomodoro focus timer, and scheduled alert alarms for students.
            </p>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex items-center bg-[#FFF8E8] p-1.5 rounded-full border border-[#E8E1D2] gap-1">
            <button
              onClick={() => setActiveMode('stopwatch')}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeMode === 'stopwatch'
                  ? 'bg-[#111111] text-[#F4C542] shadow-sm'
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Stopwatch</span>
            </button>

            <button
              onClick={() => setActiveMode('timer')}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeMode === 'timer'
                  ? 'bg-[#111111] text-[#F4C542] shadow-sm'
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              <TimerIcon className="w-3.5 h-3.5" />
              <span>Countdown & Pomodoro</span>
            </button>

            <button
              onClick={() => setActiveMode('alarm')}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeMode === 'alarm'
                  ? 'bg-[#111111] text-[#F4C542] shadow-sm'
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alert Alarms</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MODE 1: STOPWATCH                                              */}
        {/* ============================================================== */}
        {activeMode === 'stopwatch' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stopwatch Big Display Card */}
            <div className="bg-[#111111] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#222222] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-5 right-5 flex items-center gap-2 px-3 py-1 rounded-full bg-[#222222] border border-[#333333]">
                <span className={`w-2.5 h-2.5 rounded-full ${isStopwatchRunning ? 'bg-[#F4C542] animate-ping' : 'bg-[#666666]'}`} />
                <span className="text-[11px] font-semibold text-[#F4C542] uppercase tracking-wider">
                  {isStopwatchRunning ? 'Active Timing' : 'Paused'}
                </span>
              </div>

              {/* Digital Timer Display */}
              <div className="font-mono text-5xl sm:text-7xl font-black tracking-tight text-white select-none my-6 flex items-baseline">
                <span>{sw.hours}</span>
                <span className="text-[#F4C542] mx-1">:</span>
                <span>{sw.minutes}</span>
                <span className="text-[#F4C542] mx-1">:</span>
                <span>{sw.seconds}</span>
                <span className="text-2xl sm:text-4xl text-[#F4C542] font-semibold ml-2">.{sw.ms}</span>
              </div>

              <p className="text-xs text-[#888888] mb-8 font-mono">
                Hours : Minutes : Seconds . Centiseconds
              </p>

              {/* Controls */}
              <div className="flex items-center gap-3.5 flex-wrap justify-center">
                <button
                  onClick={handleStopwatchStartPause}
                  className="btn-primary text-sm py-3.5 px-8 gap-2 font-bold shadow-lg"
                >
                  {isStopwatchRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-[#111111]" />}
                  <span>{isStopwatchRunning ? 'Pause' : stopwatchTime === 0 ? 'Start Stopwatch' : 'Resume'}</span>
                </button>

                <button
                  onClick={handleStopwatchLap}
                  disabled={!isStopwatchRunning}
                  className="px-6 py-3.5 rounded-full font-bold text-sm bg-[#222222] hover:bg-[#333333] text-white border border-[#444444] flex items-center gap-2 transition-all disabled:opacity-30"
                >
                  <Flag className="w-4 h-4 text-[#F4C542]" />
                  <span>Lap Split</span>
                </button>

                <button
                  onClick={handleStopwatchReset}
                  disabled={stopwatchTime === 0}
                  className="px-6 py-3.5 rounded-full font-bold text-sm bg-[#222222] hover:bg-[#333333] text-[#999999] border border-[#333333] flex items-center gap-2 transition-all disabled:opacity-30"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Lap Times History Table */}
            {laps.length > 0 && (
              <div className="bg-white border border-[#E8E1D2] rounded-3xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-[#FFF8E8] border-b border-[#E8E1D2] flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#111111] flex items-center gap-2">
                    <Flag className="w-4 h-4 text-[#111111]" />
                    <span>Recorded Lap Splits ({laps.length})</span>
                  </h3>
                  <button
                    onClick={() => setLaps([])}
                    className="text-[11px] text-[#777777] hover:text-red-600 font-semibold"
                  >
                    Clear Laps
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-[#F0EBE0] font-mono text-xs">
                  {laps.map((lap, idx) => {
                    const l = formatStopwatch(lap.time);
                    const d = formatStopwatch(lap.diff);
                    return (
                      <div key={idx} className="px-6 py-3.5 flex items-center justify-between hover:bg-[#FFFDF7]">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-[#FFF8E8] border border-[#E8E1D2] text-[#111111] font-bold flex items-center justify-center text-[11px]">
                            #{lap.lap}
                          </span>
                          <span className="font-bold text-[#111111]">
                            {l.hours}:{l.minutes}:{l.seconds}.{l.ms}
                          </span>
                        </div>
                        <span className="text-[#777777] text-[11px] font-medium">
                          + {d.minutes}:{d.seconds}.{d.ms}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 2: COUNTDOWN TIMER & POMODORO                             */}
        {/* ============================================================== */}
        {activeMode === 'timer' && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick Preset Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {[
                { label: '5m Break', mins: 5, mode: 'short-break', icon: Coffee },
                { label: '15m Recess', mins: 15, mode: 'long-break', icon: Coffee },
                { label: '25m Pomodoro', mins: 25, mode: 'study', icon: Brain },
                { label: '45m Focus', mins: 45, mode: 'study', icon: Flame },
                { label: '60m Exam Sprint', mins: 60, mode: 'study', icon: Zap },
                { label: '90m Mastery', mins: 90, mode: 'study', icon: Sparkles },
              ].map((preset) => {
                const Icon = preset.icon;
                const isSelected = timerDuration === preset.mins * 60 && pomodoroMode === preset.mode;
                return (
                  <button
                    key={preset.label}
                    onClick={() => handleSetPreset(preset.mins, preset.mode as any)}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#111111] text-[#F4C542] border-[#111111] shadow-sm'
                        : 'bg-white text-[#555555] border-[#E8E1D2] hover:bg-[#FFF8E8] hover:text-[#111111]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#F4C542]' : 'text-[#111111]'}`} />
                    <span className="text-xs font-bold block">{preset.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Countdown Circular & Big Card */}
            <div className="bg-[#111111] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#222222] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-[#222222] text-[#F4C542] border border-[#333333]">
                  {pomodoroMode === 'study' ? '📚 Focus Study Session' : '☕ Rest & Rejuvenate'}
                </span>
              </div>

              {/* Countdown Digits */}
              <div className="font-mono text-6xl sm:text-8xl font-black tracking-tight text-white select-none my-4 flex items-center">
                {cd.hours !== '00' && (
                  <>
                    <span>{cd.hours}</span>
                    <span className="text-[#F4C542] mx-1">:</span>
                  </>
                )}
                <span>{cd.minutes}</span>
                <span className="text-[#F4C542] mx-1">:</span>
                <span>{cd.seconds}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md bg-[#222222] h-2.5 rounded-full overflow-hidden mb-8 border border-white/5">
                <div
                  className="bg-[#F4C542] h-full rounded-full transition-all duration-500"
                  style={{ width: `${timerProgress}%` }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-3.5 flex-wrap justify-center">
                <button
                  onClick={handleTimerStartPause}
                  className="btn-primary text-sm py-3.5 px-8 gap-2 font-bold shadow-lg"
                >
                  {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-[#111111]" />}
                  <span>{isTimerRunning ? 'Pause Timer' : timerRemaining === 0 ? 'Start Again' : 'Start Focus'}</span>
                </button>

                <button
                  onClick={handleTimerReset}
                  className="px-6 py-3.5 rounded-full font-bold text-sm bg-[#222222] hover:bg-[#333333] text-[#999999] border border-[#333333] flex items-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Alarm Sound Picker */}
              <div className="mt-8 flex items-center gap-2 text-xs text-[#999999] bg-[#222222] px-4 py-2 rounded-full border border-[#333333]">
                <Volume2 className="w-4 h-4 text-[#F4C542]" />
                <span>Timer Alert:</span>
                <select
                  value={soundChoice}
                  onChange={(e) => setSoundChoice(e.target.value as any)}
                  className="bg-[#111111] border border-[#333333] text-white text-xs rounded-full px-2.5 py-1 outline-none font-medium"
                >
                  <option value="bell">🔔 Gentle Bell</option>
                  <option value="chime">🎵 Harmonic Chime</option>
                  <option value="digital">📟 Digital Beep</option>
                  <option value="radar">🚨 Radar Pulse</option>
                  <option value="voice">🗣️ Spoken Voice</option>
                </select>
                <button
                  type="button"
                  onClick={() => playSynthesizedAlert(soundChoice, 'Focus timer')}
                  className="text-[11px] px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-full text-[#F4C542] ml-1 font-semibold"
                >
                  Test
                </button>
              </div>
            </div>

            {/* Custom Time Form */}
            <div className="bg-white border border-[#E8E1D2] rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-[#111111] mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#111111]" />
                <span>Set Custom Countdown Duration</span>
              </h3>
              <form onSubmit={handleCustomTimerApply} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-4">
                  <label className="text-[10px] font-bold text-[#777777] block mb-1 uppercase">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Number(e.target.value))}
                    className="input-clean text-xs w-full font-mono"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="text-[10px] font-bold text-[#777777] block mb-1 uppercase">Seconds</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customSeconds}
                    onChange={(e) => setCustomSeconds(Number(e.target.value))}
                    className="input-clean text-xs w-full font-mono"
                  />
                </div>
                <div className="sm:col-span-4 self-end">
                  <button
                    type="submit"
                    className="btn-primary text-xs py-2 w-full font-bold"
                  >
                    Apply Duration
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 3: ALERT ALARMS                                           */}
        {/* ============================================================== */}
        {activeMode === 'alarm' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header & Add Alarm Action */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
              <div>
                <h2 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#111111]" />
                  <span>Scheduled Study Alarms & Wakeups</span>
                </h2>
                <p className="text-xs text-[#777777]">
                  Synexora alerts you with rich audio chimes, synthesizers, or spoken voice when alarm triggers.
                </p>
              </div>

              <button
                onClick={() => setIsAddingAlarm(!isAddingAlarm)}
                className="btn-primary text-xs py-2 px-4 gap-1.5 font-bold"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingAlarm ? 'Close Form' : 'Set New Alarm'}</span>
              </button>
            </div>

            {/* Add Alarm Form Drawer */}
            {isAddingAlarm && (
              <div className="bg-[#FFF8E8] border border-[#E8E1D2] rounded-3xl p-6 animate-fade-in shadow-sm">
                <h3 className="text-xs font-bold text-[#111111] mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#111111]" />
                  <span>Configure Alarm Schedule</span>
                </h3>
                <form onSubmit={handleAddAlarmSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold text-[#555555] block mb-1 uppercase">Time (24h)</label>
                      <input
                        type="time"
                        value={newAlarmTime}
                        onChange={(e) => setNewAlarmTime(e.target.value)}
                        required
                        className="input-clean text-xs w-full font-mono font-bold"
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <label className="text-[10px] font-bold text-[#555555] block mb-1 uppercase">Alarm Label / Purpose</label>
                      <input
                        type="text"
                        value={newAlarmLabel}
                        onChange={(e) => setNewAlarmLabel(e.target.value)}
                        placeholder="e.g. Physics Revision, Math Homework Sprint"
                        className="input-clean text-xs w-full"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-[#555555] block mb-1 uppercase">Category</label>
                      <select
                        value={newAlarmCategory}
                        onChange={(e) => setNewAlarmCategory(e.target.value)}
                        className="input-clean text-xs w-full"
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="AI & Machine Learning">AI & ML</option>
                        <option value="Biomedical">Biomedical</option>
                        <option value="Economics">Economics</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-[#555555] block mb-1 uppercase">Ringtone</label>
                      <select
                        value={newAlarmSound}
                        onChange={(e) => setNewAlarmSound(e.target.value as any)}
                        className="input-clean text-xs w-full"
                      >
                        <option value="bell">🔔 Gentle Bell</option>
                        <option value="chime">🎵 Chime</option>
                        <option value="digital">📟 Digital Beep</option>
                        <option value="radar">🚨 Radar</option>
                        <option value="voice">🗣️ Voice</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingAlarm(false)}
                      className="btn-secondary text-xs py-2 px-4"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary text-xs py-2 px-5 font-bold"
                    >
                      Save Alarm
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Alarm Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className={`p-6 rounded-3xl border transition-all ${
                    alarm.enabled
                      ? 'bg-white border-[#E8E1D2] shadow-sm ring-1 ring-[#F4C542]/30'
                      : 'bg-[#FFFDF7] border-[#E8E1D2] opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black font-mono text-[#111111] tracking-tight">
                          {alarm.time}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2]">
                          {alarm.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#111111] mt-1.5">{alarm.label}</h4>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-[#777777]">
                        <span className="flex items-center gap-1">
                          <Volume2 className="w-3 h-3 text-[#111111]" />
                          <span className="capitalize">{alarm.sound} Sound</span>
                        </span>
                        <span>•</span>
                        <span>{alarm.days.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleToggleAlarm(alarm.id)}
                        className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                          alarm.enabled ? 'bg-[#111111]' : 'bg-[#E8E1D2]'
                        }`}
                        title={alarm.enabled ? 'Disable alarm' : 'Enable alarm'}
                      >
                        <span
                          className={`block w-5 h-5 rounded-full ${alarm.enabled ? 'bg-[#F4C542]' : 'bg-white'} shadow-sm transition-transform ${
                            alarm.enabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <button
                        onClick={() => handleDeleteAlarm(alarm.id)}
                        className="p-2 text-[#999999] hover:text-red-600 rounded-full hover:bg-red-50"
                        title="Delete alarm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ACTIVE ALARM POPUP ALERT MODAL                                 */}
        {/* ============================================================== */}
        {activeAlertNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-[#FFFDF7] rounded-3xl shadow-2xl border border-[#E8E1D2] max-w-md w-full p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#111111] text-[#F4C542] flex items-center justify-center mx-auto animate-bounce">
                <Bell className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-black text-[#111111]">
                  {activeAlertNotification.title}
                </h2>
                <p className="text-xs text-[#777777] mt-1.5 font-medium">
                  {activeAlertNotification.description}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => {
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                    setActiveAlertNotification(null);
                  }}
                  className="btn-secondary text-xs py-2.5 px-5"
                >
                  Snooze (5 Mins)
                </button>
                <button
                  onClick={() => {
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                    setActiveAlertNotification(null);
                  }}
                  className="btn-primary text-xs py-2.5 px-6 font-bold"
                >
                  Dismiss Alarm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
