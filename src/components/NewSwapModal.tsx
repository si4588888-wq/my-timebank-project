import React, { useState } from 'react';
import { UserPersona, SwapSession } from '../types';
import {
  ArrowRightLeft,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Crown,
  Zap
} from 'lucide-react';

interface NewSwapModalProps {
  partner: UserPersona;
  currentPersona: UserPersona;
  onClose: () => void;
  onBookSwap: (newSession: SwapSession, escrowCost: number) => void;
}

export const NewSwapModal: React.FC<NewSwapModalProps> = ({
  partner,
  currentPersona,
  onClose,
  onBookSwap,
}) => {
  // Check if mutual reciprocal skills exist
  const canDirectSwap =
    currentPersona.skillsOffered.length > 0 &&
    partner.skillsOffered.length > 0;

  const [exchangeMode, setExchangeMode] = useState<'direct_barter' | 'time_credit_learn' | 'time_credit_teach'>(
    canDirectSwap ? 'direct_barter' : 'time_credit_learn'
  );

  const [selectedLearnSkill, setSelectedLearnSkill] = useState<string>(
    partner.skillsOffered[0]?.name || ''
  );
  const [selectedTeachSkill, setSelectedTeachSkill] = useState<string>(
    currentPersona.skillsOffered[0]?.name || ''
  );
  const [scheduledDate, setScheduledDate] = useState<string>('2026-09-18');
  const [scheduledTime, setScheduledTime] = useState<string>('18:00 - 19:00 PST');
  const [agendaNotes, setAgendaNotes] = useState<string>(
    'Focus on initial foundations, practical live demonstration, and Q&A.'
  );

  const isPro = Boolean(currentPersona.isProMember || currentPersona.unlimitedSwaps);
  const hasEnoughCredit = currentPersona.timeBankBalance >= 1.0 || isPro;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (exchangeMode === 'time_credit_learn' && !hasEnoughCredit) {
      alert("You need at least 1.0 Time Credit in your balance to book a learning session. Teach a session or claim a community grant first!");
      return;
    }

    const isDirect = exchangeMode === 'direct_barter';
    const isLearning = exchangeMode === 'time_credit_learn';
    const escrow = isLearning ? 1.0 : 0;

    const newSession: SwapSession = {
      id: `sess_${Date.now()}`,
      title: isDirect
        ? `Reciprocal Barter: ${selectedLearnSkill} & ${selectedTeachSkill}`
        : isLearning
        ? `Time Bank: Learning ${selectedLearnSkill}`
        : `Time Bank: Teaching ${selectedTeachSkill}`,
      partnerId: partner.id,
      partnerName: partner.name,
      partnerAvatar: partner.avatar,
      role: isDirect ? 'mutual_barter' : isLearning ? 'learner' : 'teacher',
      skillYouLearn: isDirect || isLearning ? selectedLearnSkill : undefined,
      skillYouTeach: isDirect || !isLearning ? selectedTeachSkill : undefined,
      exchangeType: isDirect ? 'direct_barter' : 'time_credit',
      durationHours: 1.0,
      scheduledDate,
      timeSlot: scheduledTime,
      status: 'scheduled',
      meetingLink: `https://meet.jit.si/SkillBank-${Date.now().toString().slice(-6)}`,
      agendaNotes,
      escrowCredits: escrow,
    };

    onBookSwap(newSession, escrow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 text-stone-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-400" />
              Propose Moneyless Skill Exchange
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Coordinating with <span className="text-amber-400 font-semibold">{partner.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Exchange Mode Selector */}
          <div className="space-y-2">
            <label className="font-semibold text-stone-300 block">
              Select Exchange Mechanism:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Mode 1: Direct Barter */}
              <button
                type="button"
                onClick={() => setExchangeMode('direct_barter')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  exchangeMode === 'direct_barter'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                    : 'bg-stone-850 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <ArrowRightLeft className="w-4 h-4" />
                  Direct Barter
                </div>
                <p className="text-[11px] leading-tight text-stone-400">
                  0 Credits needed. 1-to-1 reciprocal swap (30m each).
                </p>
              </button>

              {/* Mode 2: Spend 1 TC */}
              <button
                type="button"
                onClick={() => setExchangeMode('time_credit_learn')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  exchangeMode === 'time_credit_learn'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                    : 'bg-stone-850 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <Clock className="w-4 h-4" />
                  Spend 1.0 TC
                </div>
                <p className="text-[11px] leading-tight text-stone-400">
                  Pay 1.0 Time Credit into escrow to learn for 1 hour.
                </p>
              </button>

              {/* Mode 3: Earn 1 TC */}
              <button
                type="button"
                onClick={() => setExchangeMode('time_credit_teach')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  exchangeMode === 'time_credit_teach'
                    ? 'bg-sky-500/15 border-sky-500/50 text-sky-300'
                    : 'bg-stone-850 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <Clock className="w-4 h-4" />
                  Earn 1.0 TC
                </div>
                <p className="text-[11px] leading-tight text-stone-400">
                  Teach Partner for 1 hour; earn 1.0 TC for future learning.
                </p>
              </button>
            </div>
          </div>

          {/* Insufficient Credit Warning */}
          {exchangeMode === 'time_credit_learn' && !hasEnoughCredit && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Your balance is <strong>{currentPersona.timeBankBalance.toFixed(1)} TC</strong>. You need 1.0 TC to learn via Time Bank. Choose "Direct Barter" or "Earn 1.0 TC" instead!
              </span>
            </div>
          )}

          {/* Pro Unlimited Swaps Active Banner */}
          {isPro && exchangeMode === 'time_credit_learn' && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>SkillBank PRO Perk:</strong> Unlimited Swaps enabled. No escrow deficit limits apply.
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black flex items-center gap-1">
                <Zap className="w-3 h-3 fill-stone-950" />
                ACTIVE
              </span>
            </div>
          )}

          {/* Skill Selection */}
          <div className="space-y-3">
            {(exchangeMode === 'direct_barter' || exchangeMode === 'time_credit_learn') && (
              <div className="space-y-1">
                <label className="font-medium text-stone-300 block">
                  Skill you want {partner.name.split(' ')[0]} to teach you:
                </label>
                <select
                  value={selectedLearnSkill}
                  onChange={(e) => setSelectedLearnSkill(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500 text-xs"
                >
                  {partner.skillsOffered.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.level} level - {s.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(exchangeMode === 'direct_barter' || exchangeMode === 'time_credit_teach') && (
              <div className="space-y-1">
                <label className="font-medium text-stone-300 block">
                  Skill you will teach {partner.name.split(' ')[0]}:
                </label>
                <select
                  value={selectedTeachSkill}
                  onChange={(e) => setSelectedTeachSkill(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500 text-xs"
                >
                  {currentPersona.skillsOffered.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.level} level - {s.category})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-stone-300 block">Proposed Date:</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-stone-300 block">Time Slot (60 mins):</label>
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500 text-xs"
              >
                <option value="10:00 - 11:00 PST">10:00 AM - 11:00 AM PST (Morning)</option>
                <option value="14:00 - 15:00 PST">02:00 PM - 03:00 PM PST (Afternoon)</option>
                <option value="18:00 - 19:00 PST">06:00 PM - 07:00 PM PST (Evening)</option>
                <option value="20:00 - 21:00 PST">08:00 PM - 09:00 PM PST (Night)</option>
              </select>
            </div>
          </div>

          {/* Agenda Notes */}
          <div className="space-y-1">
            <label className="font-medium text-stone-300 block">
              Session Focus & Preparation Notes:
            </label>
            <textarea
              rows={3}
              value={agendaNotes}
              onChange={(e) => setAgendaNotes(e.target.value)}
              placeholder="What specific questions or topics should be covered?"
              className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500 text-xs resize-none"
            />
          </div>

          {/* Time Bank Escrow Policy Notice */}
          <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 text-[11px] text-stone-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-stone-300">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Commitment & Escrow Guarantee</span>
            </div>
            <p>
              {exchangeMode === 'time_credit_learn'
                ? '1.0 Time Credit is locked in escrow now and released to the teacher only once you confirm the session is completed.'
                : exchangeMode === 'direct_barter'
                ? 'Direct Barter requires no credits. Both participants commit 30 minutes of instruction.'
                : 'You will receive 1.0 Time Credit in your ledger upon session completion.'}
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 border-t border-stone-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-schedule-swap-btn"
              disabled={exchangeMode === 'time_credit_learn' && !hasEnoughCredit}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm & Schedule Swap
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
