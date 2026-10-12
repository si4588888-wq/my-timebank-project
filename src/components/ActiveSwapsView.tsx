import React, { useState } from 'react';
import { SwapSession, UserPersona } from '../types';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  ArrowRightLeft,
  Award,
  Star,
  ExternalLink,
  MessageSquare,
  FileText,
  Sparkles,
  Check
} from 'lucide-react';

interface ActiveSwapsViewProps {
  sessions: SwapSession[];
  currentPersona: UserPersona;
  onCompleteSession: (sessionId: string) => void;
  onEndorsePartner: (sessionId: string, partnerName: string, skill: string) => void;
  onOpenNewSwap: () => void;
  onOpenChat?: (partnerId: string) => void;
}

export const ActiveSwapsView: React.FC<ActiveSwapsViewProps> = ({
  sessions,
  currentPersona,
  onCompleteSession,
  onEndorsePartner,
  onOpenNewSwap,
  onOpenChat,
}) => {
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed'>('all');
  const [activeStudioSession, setActiveStudioSession] = useState<SwapSession | null>(null);
  const [endorseModalSession, setEndorseModalSession] = useState<SwapSession | null>(null);
  const [endorsementComment, setEndorsementComment] = useState('');
  const [endorsedSuccessMessage, setEndorsedSuccessMessage] = useState<string | null>(null);

  const filteredSessions = sessions.filter((s) => {
    if (filter === 'scheduled') return s.status === 'scheduled';
    if (filter === 'completed') return s.status === 'completed';
    return true;
  });

  const handleEndorseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!endorseModalSession) return;

    const skill = endorseModalSession.skillYouLearn || endorseModalSession.skillYouTeach || 'Skill Sharing';
    onEndorsePartner(endorseModalSession.id, endorseModalSession.partnerName, skill);
    setEndorseModalSession(null);
    setEndorsementComment('');
    setEndorsedSuccessMessage(`Endorsed ${endorseModalSession.partnerName} for "${skill}"!`);
    setTimeout(() => setEndorsedSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Skill Swap Sessions & Escrow Releases
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Track scheduled 1-on-1 swaps, launch live collaborative studios, and release time credits upon completion.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-stone-800/80 p-1 rounded-xl border border-stone-700/60 self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'all' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            All ({sessions.length})
          </button>
          <button
            onClick={() => setFilter('scheduled')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'scheduled' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'completed' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {endorsedSuccessMessage && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{endorsedSuccessMessage}</span>
        </div>
      )}

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-stone-600 mx-auto" />
          <h3 className="text-base font-semibold text-stone-300">No sessions found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            You don't have any sessions matching this view. Check the AI Matchmaker to discover a partner!
          </p>
          <button
            onClick={onOpenNewSwap}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors"
          >
            Find a Skill Swap Partner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredSessions.map((session) => {
            const isCompleted = session.status === 'completed';
            const isDirect = session.exchangeType === 'direct_barter';

            return (
              <div
                key={session.id}
                className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-stone-900/60 border-stone-800/80 opacity-90'
                    : 'bg-stone-900/90 border-stone-750 shadow-md'
                }`}
              >
                <div className="p-5 space-y-4">
                  {/* Card Header: Partner info & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={session.partnerAvatar}
                        alt={session.partnerName}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-stone-100">
                            {session.partnerName}
                          </h3>
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {isCompleted ? 'Completed' : 'Scheduled'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {session.title}
                        </p>
                      </div>
                    </div>

                    {/* Escrow Tag */}
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                          isDirect
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {isDirect ? 'Direct Barter' : `${session.escrowCredits.toFixed(1)} TC Escrow`}
                      </span>
                    </div>
                  </div>

                  {/* Date & Time Slot */}
                  <div className="flex items-center gap-4 text-xs text-stone-300 bg-stone-850 p-3 rounded-xl border border-stone-800">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{session.scheduledDate}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{session.timeSlot}</span>
                    </div>
                  </div>

                  {/* Skills involved */}
                  <div className="space-y-1 text-xs">
                    {session.skillYouLearn && (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">You Learn:</span>
                        <span className="font-semibold text-sky-400">
                          {session.skillYouLearn}
                        </span>
                      </div>
                    )}
                    {session.skillYouTeach && (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">You Teach:</span>
                        <span className="font-semibold text-emerald-400">
                          {session.skillYouTeach}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Agenda Notes */}
                  {session.agendaNotes && (
                    <div className="text-xs bg-stone-850/50 p-2.5 rounded-xl border border-stone-800 text-stone-400 italic">
                      "{session.agendaNotes}"
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-stone-850/80 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2">
                  {!isCompleted ? (
                    <>
                      <div className="flex items-center gap-2">
                        {onOpenChat && (
                          <button
                            onClick={() => onOpenChat(session.partnerId)}
                            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 border border-stone-700 transition-colors"
                            title={`Chat with ${session.partnerName}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                            Chat with {session.partnerName.split(' ')[0]}
                          </button>
                        )}

                        <button
                          onClick={() => setActiveStudioSession(session)}
                          className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 flex items-center gap-1.5 border border-stone-700 transition-colors"
                        >
                          <Video className="w-3.5 h-3.5 text-amber-400" />
                          Virtual Studio
                        </button>
                      </div>

                      <button
                        onClick={() => onCompleteSession(session.id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isDirect ? 'Complete Barter' : 'Complete & Release Credit'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        {onOpenChat && (
                          <button
                            onClick={() => onOpenChat(session.partnerId)}
                            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-300 hover:text-stone-100 flex items-center gap-1.5 border border-stone-700 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                            Chat History
                          </button>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                          <Check className="w-4 h-4" />
                          <span>Credits settled & hours logged</span>
                        </div>
                      </div>

                      {!session.userEndorsed ? (
                        <button
                          onClick={() => setEndorseModalSession(session)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          Endorse {session.partnerName.split(' ')[0]}
                        </button>
                      ) : (
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          Endorsement Submitted
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Virtual Studio Mock Modal */}
      {activeStudioSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 text-stone-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <div>
                  <h3 className="text-base font-bold text-stone-100">
                    Active Virtual Skill Studio: {activeStudioSession.title}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Live with {activeStudioSession.partnerName} • 1-on-1 Moneyless Exchange
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveStudioSession(null)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Video Placeholder Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-56 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col items-center justify-center relative overflow-hidden">
                <img
                  src={activeStudioSession.partnerAvatar}
                  alt={activeStudioSession.partnerName}
                  className="w-16 h-16 rounded-2xl object-cover mb-2 border border-stone-700"
                />
                <span className="text-xs font-semibold text-stone-300">
                  {activeStudioSession.partnerName} (Connected)
                </span>
                <span className="absolute bottom-2 left-3 text-[10px] text-emerald-400 font-medium">
                  ● Mic Active • HD 1080p
                </span>
              </div>

              <div className="h-56 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col items-center justify-center relative overflow-hidden">
                <img
                  src={currentPersona.avatar}
                  alt={currentPersona.name}
                  className="w-16 h-16 rounded-2xl object-cover mb-2 border border-stone-700"
                />
                <span className="text-xs font-semibold text-stone-300">
                  You ({currentPersona.name})
                </span>
                <span className="absolute bottom-2 left-3 text-[10px] text-emerald-400 font-medium">
                  ● Camera Active
                </span>
              </div>
            </div>

            {/* Interactive Notes & Timer */}
            <div className="bg-stone-850 p-4 rounded-2xl border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  Live Session Scratchpad & Key Concepts
                </span>
                <span className="text-amber-400 font-bold">54:12 remaining</span>
              </div>
              <textarea
                rows={3}
                defaultValue={`Session Goals:\n- Cover key questions for ${activeStudioSession.skillYouLearn || activeStudioSession.skillYouTeach}\n- Practice live hands-on exercise\n- Recap takeaways for Time Bank endorsement`}
                className="w-full bg-stone-900 border border-stone-750 rounded-xl p-3 text-xs text-stone-200 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-800">
              <button
                onClick={() => setActiveStudioSession(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300"
              >
                Leave Call
              </button>

              <button
                onClick={() => {
                  onCompleteSession(activeStudioSession.id);
                  setActiveStudioSession(null);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Conclude Session & Release Credit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Endorse Modal */}
      {endorseModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-stone-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-stone-100">
                  Endorse {endorseModalSession.partnerName}
                </h3>
              </div>
              <button
                onClick={() => setEndorseModalSession(null)}
                className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEndorseSubmit} className="space-y-3 text-xs">
              <p className="text-stone-300">
                Endorsements power our reputation system. Validate their skill in{' '}
                <strong className="text-amber-400">
                  {endorseModalSession.skillYouLearn || endorseModalSession.skillYouTeach}
                </strong>
                .
              </p>

              <div className="flex items-center gap-1 text-amber-400 text-lg">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-400" />
                ))}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-300 block">
                  Feedback or Review Note:
                </label>
                <textarea
                  rows={3}
                  value={endorsementComment}
                  onChange={(e) => setEndorsementComment(e.target.value)}
                  placeholder="e.g., Incredible mentor! Very patient, explained the underlying fundamentals with crystal clarity."
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setEndorseModalSession(null)}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  Submit Endorsement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
