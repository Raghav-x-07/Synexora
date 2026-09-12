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
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-green-600" />
            <span>Platform Settings & Preferences</span>
          </h1>
          <p className="text-xs text-slate-500">Configure study targets and account options</p>
        </div>

        {statusMessage && (
          <div className="p-3.5 rounded-md bg-green-50 border border-green-200 text-green-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Daily Study Goal (Minutes)
            </label>
            <input
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              min={15}
              max={600}
              className="input-clean text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">Target focused study duration per day.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              AI Learning Mode
            </label>
            <select
              value={learningStyle}
              onChange={(e) => setLearningStyle(e.target.value)}
              className="input-clean text-xs"
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
              className="w-4 h-4 text-green-600 rounded border-slate-300 focus:ring-green-500"
            />
            <label htmlFor="notifToggle" className="text-xs font-medium text-slate-700 cursor-pointer">
              Enable study reminders and upcoming deadline notifications
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button type="submit" className="btn-primary gap-1.5 text-xs">
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>

        {/* Danger zone */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Session Control</h3>
          <p className="text-xs text-slate-500 mb-4">
            Sign out of your active Synexora session on this device.
          </p>
          <button
            onClick={handleLogout}
            className="btn-secondary text-xs text-red-600 hover:bg-red-50 gap-1.5 border-red-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
};
