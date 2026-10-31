import React, { useState } from 'react';
import { X, Users, UserPlus, Trash2, Shield, Heart, Utensils, DollarSign } from 'lucide-react';
import { TripMember, MemberRole } from '../../types';

interface GroupMembersModalProps {
  tripId: string;
  members: TripMember[];
  onAddMember: (member: Partial<TripMember>) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  onClose: () => void;
  readOnly?: boolean;
}

export const GroupMembersModal: React.FC<GroupMembersModalProps> = ({
  tripId,
  members,
  onAddMember,
  onRemoveMember,
  onClose,
  readOnly = false,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('editor');
  const [dietary, setDietary] = useState('');
  const [budgetPref, setBudgetPref] = useState('');
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsAdding(true);
    try {
      const dietaryList = dietary ? dietary.split(',').map(s => s.trim()).filter(Boolean) : [];
      await onAddMember({
        name,
        email: email || undefined,
        role,
        dietary_preferences: dietaryList,
        budget_preference: budgetPref ? Number(budgetPref) : undefined,
        notes: notes || undefined,
      });
      setName('');
      setEmail('');
      setDietary('');
      setBudgetPref('');
      setNotes('');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Trip Collaborators & Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {members.length} member{members.length > 1 ? 's' : ''} collaborating on this trip
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Members List */}
        <div className="py-4 space-y-3 overflow-y-auto flex-1">
          {members.map((m) => (
            <div
              key={m.id}
              className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      m.role === 'owner'
                        ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400'
                        : m.role === 'editor'
                        ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {m.role}
                    </span>
                  </div>

                  {m.email && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {m.email}
                    </div>
                  )}

                  {/* Preferences badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {m.dietary_preferences && m.dietary_preferences.length > 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                        <Utensils className="w-3 h-3" />
                        <span>{m.dietary_preferences.join(', ')}</span>
                      </div>
                    )}
                    {m.budget_preference && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        <DollarSign className="w-3 h-3" />
                        <span>Pref: ${m.budget_preference}</span>
                      </div>
                    )}
                    {m.notes && (
                      <div className="text-[11px] text-slate-500 italic mt-0.5">
                        "{m.notes}"
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!readOnly && m.role !== 'owner' && (
                <button
                  onClick={() => onRemoveMember(m.id)}
                  title="Remove collaborator"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Member Form */}
        {!readOnly && (
          <form onSubmit={handleAdd} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
              <span>Add Collaborator & Preferences</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (e.g. Maya Lin)"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as MemberRole)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="editor">Editor (Can edit)</option>
                <option value="viewer">Viewer (Read-only)</option>
              </select>

              <input
                type="text"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                placeholder="Dietary (e.g. Vegan, Halal)"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <input
                type="number"
                value={budgetPref}
                onChange={(e) => setBudgetPref(e.target.value)}
                placeholder="Target Budget ($)"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isAdding}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 disabled:opacity-50 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isAdding ? 'Adding...' : 'Add Member'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
