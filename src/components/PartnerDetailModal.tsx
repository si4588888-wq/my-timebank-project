import React, { useState, useEffect } from 'react';
import { UserPersona, AIMatchAnalysis } from '../types';
import {
  Sparkles,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  MessageSquare,
  Copy,
  Check,
  MapPin,
  Star,
  Award,
  BookOpen
} from 'lucide-react';

interface PartnerDetailModalProps {
  partner: UserPersona;
  currentPersona: UserPersona;
  onClose: () => void;
  onOpenSwapModal: (partner: UserPersona) => void;
  onOpenCurriculumModal: (partner: UserPersona) => void;
  onOpenChat?: (partner: UserPersona) => void;
}

export const PartnerDetailModal: React.FC<PartnerDetailModalProps> = ({
  partner,
  currentPersona,
  onClose,
  onOpenSwapModal,
  onOpenCurriculumModal,
  onOpenChat,
}) => {
  const [analysis, setAnalysis] = useState<AIMatchAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedIcebreaker, setCopiedIcebreaker] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/match/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userA: currentPersona,
            userB: partner,
          }),
        });
        const data = await res.json();
        if (isMounted) {
          setAnalysis(data);
        }
      } catch (err) {
        console.error('Failed to fetch AI analysis:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalysis();
    return () => {
      isMounted = false;
    };
  }, [partner, currentPersona]);

  const copyIcebreaker = () => {
    if (!analysis?.suggestedIcebreaker) return;
    navigator.clipboard.writeText(analysis.suggestedIcebreaker);
    setCopiedIcebreaker(true);
    setTimeout(() => setCopiedIcebreaker(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-6 text-stone-200 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-5">
          <div className="flex items-center gap-4">
            <img
              src={partner.avatar}
              alt={partner.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-stone-100">{partner.name}</h2>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{partner.rating.toFixed(2)}</span>
                  <span className="text-stone-400 font-normal">({partner.reviewCount})</span>
                </div>
              </div>
              <p className="text-sm text-stone-400">{partner.headline}</p>
              <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {partner.location}
                </span>
                <span>•</span>
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {partner.timeBankBalance.toFixed(1)} TC balance
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            About {partner.name.split(' ')[0]}
          </h4>
          <p className="text-sm text-stone-300 leading-relaxed bg-stone-850 p-3.5 rounded-xl border border-stone-800">
            {partner.bio}
          </p>
        </div>

        {/* AI Synergy & Compatibility Section */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-850 to-stone-900 border border-amber-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-stone-100">
                AI Matchmaker Deep Synergy Analysis
              </h3>
            </div>
            {analysis && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                {analysis.compatibilityScore}% Synergy
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2 text-stone-400 text-xs">
              <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
              <p>Analyzing skill compatibility, reciprocity, and schedule...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-4 text-xs">
              <p className="text-stone-200 font-semibold text-sm">
                "{analysis.headline}"
              </p>

              {/* Why it works */}
              <div className="space-y-1.5">
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                  Why this exchange works:
                </span>
                <ul className="space-y-1 text-stone-300">
                  {analysis.whyItWorks?.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Barter Recommendation */}
              <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/80 space-y-1">
                <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Recommended Swap Structure
                </span>
                <p className="text-stone-300 text-xs leading-relaxed">
                  {analysis.barterRecommendation}
                </p>
              </div>

              {/* Icebreaker */}
              {analysis.suggestedIcebreaker && (
                <div className="p-3 rounded-xl bg-stone-900 border border-stone-700/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-sky-400" />
                      Suggested Message to Partner
                    </span>
                    <button
                      onClick={copyIcebreaker}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      {copiedIcebreaker ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedIcebreaker ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-stone-200 italic text-xs">
                    "{analysis.suggestedIcebreaker}"
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Skills Offered vs Desired Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              Skills Offered by {partner.name.split(' ')[0]}
            </h4>
            <div className="space-y-2">
              {partner.skillsOffered.map((skill) => (
                <div key={skill.id} className="p-2.5 rounded-xl bg-stone-850 border border-stone-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-stone-200">
                    <span>{skill.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {skill.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1">
              Skills {partner.name.split(' ')[0]} Desires to Learn
            </h4>
            <div className="space-y-2">
              {partner.skillsDesired.map((skill) => (
                <div key={skill.id} className="p-2.5 rounded-xl bg-stone-850 border border-stone-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-stone-200">
                    <span>{skill.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      Target: {skill.targetLevel}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400">{skill.learningGoal}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onOpenChat && (
              <button
                onClick={() => {
                  onClose();
                  onOpenChat(partner);
                }}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-2 border border-stone-700 transition-colors"
                title={`Send a direct message to ${partner.name}`}
              >
                <MessageSquare className="w-4 h-4 text-amber-400" />
                Chat with {partner.name.split(' ')[0]}
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenCurriculumModal(partner);
              }}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold flex items-center gap-2 border border-stone-700 transition-colors hidden sm:flex"
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              Generate Syllabus
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenSwapModal(partner);
            }}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Propose Skill Swap Session
          </button>
        </div>
      </div>
    </div>
  );
};
