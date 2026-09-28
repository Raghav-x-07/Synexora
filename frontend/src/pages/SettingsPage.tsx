import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, CheckCircle2, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [dailyGoal, setDailyGoal] = useState(user?.preferences?.dailyStudyGoalMinutes || 120);
  const [learningStyle, setLearningStyle] = useState(user?.preferences?.learningStyle || 'socratic');
  const [notifications, setNotifications] = useState(user?.preferences?.notificationsEnabled ?? true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const res = await updateProfile({
      preferences: {
        dailyStudyGoalMinutes: Number(dailyGoal),
        learningStyle,
        notificationsEnabled: notifications,
      },
    });

    if (res.success) {
      setStatusMessage('Preferences saved successfully.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl pb-16">
        {/* Header */}
        <div className="pb-6 border-b border-[#E8E1D2] flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#F4C542] flex items-center justify-center shadow-sm">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#111111] tracking-tight">
              Platform Settings & Preferences
            </h1>
            <p className="text-xs text-[#777777] font-medium mt-0.5">
              Configure study targets, AI learning modes, and account options
            </p>
          </div>
        </div>

        {statusMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white border border-[#E8E1D2] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
              Daily Study Goal (Minutes)
            </label>
            <input
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              min={15}
              max={600}
              className="input-clean"
            />
            <p className="text-[11px] text-[#777777] mt-1.5">Target focused study duration per day.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
              AI Learning Mode
            </label>
            <select
              value={learningStyle}
              onChange={(e) => setLearningStyle(e.target.value)}
              className="input-clean"
            >
              <option value="socratic">Socratic (Step-by-step guided questions)</option>
              <option value="hands-on">Hands-on (Code and practical examples)</option>
              <option value="fast-paced">Concise (Direct summaries & formulas)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="notifToggle"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-4 h-4 text-[#111111] accent-[#111111] rounded border-[#E8E1D2] focus:ring-[#111111]"
            />
            <label htmlFor="notifToggle" className="text-xs font-medium text-[#111111] cursor-pointer">
              Enable study reminders and upcoming deadline notifications
            </label>
          </div>

          <div className="pt-4 border-t border-[#E8E1D2] flex justify-end">
            <button type="submit" className="btn-primary gap-1.5 text-xs py-2.5 px-5 font-bold">
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>

        {/* Danger zone */}
        <div className="bg-white border border-[#E8E1D2] rounded-3xl p-6 sm:p-8 shadow-xs">
          <h3 className="text-sm font-bold text-[#111111] mb-1">Session Control</h3>
          <p className="text-xs text-[#777777] mb-4">
            Sign out of your active Synexora session on this device.
          </p>
          <button
            onClick={handleLogout}
            className="btn-secondary text-xs text-rose-600 hover:bg-rose-50 gap-1.5 border-rose-200 font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

