import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { User, CheckCircle2, Loader2, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [major, setMajor] = useState(user?.major || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const res = await updateProfile({ name, major, university });
    setIsSaving(false);
    if (res.success) {
      setStatusMessage('Profile information updated successfully.');
      setTimeout(() => setStatusMessage(null), 3500);
    } else {
      setStatusMessage(res.message || 'Failed to update profile.');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl pb-16">
        {/* Header */}
        <div className="pb-6 border-b border-[#E8E1D2] flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#F4C542] flex items-center justify-center shadow-sm">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#111111] tracking-tight">
              Student Profile
            </h1>
            <p className="text-xs text-[#777777] font-medium mt-0.5">
              Manage your personal information and university affiliation
            </p>
          </div>
        </div>

        {statusMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSave} className="bg-white border border-[#E8E1D2] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-clean"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
              Email Address (Account ID)
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input-clean bg-[#FFF8E8] text-[#777777] cursor-not-allowed border-[#E8E1D2]"
            />
            <p className="text-[11px] text-[#777777] mt-1.5">Email is tied to your authentication credentials.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                Academic Major
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g. Computer Science"
                className="input-clean"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                University / Institution
              </label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. State University"
                className="input-clean"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E1D2] flex items-center justify-between">
            <span className="text-xs text-[#777777]">
              Account Role: <strong className="text-[#111111] capitalize">{user?.role?.replace('_', ' ') || 'student'}</strong>
            </span>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary gap-1.5 text-xs py-2.5 px-5 font-bold disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

