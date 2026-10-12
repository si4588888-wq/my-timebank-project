import React, { useState, useEffect } from 'react';
import { UserPersona, AICurriculum } from '../types';
import { AffiliateCard } from './AffiliateCard';
import { getRecommendationsForSkills } from '../lib/affiliateService';
import {
  BookOpen,
  Sparkles,
  Clock,
  CheckCircle2,
  Calendar,
  Share2,
  ArrowRightLeft,
  Check,
  Copy
} from 'lucide-react';

interface CurriculumModalProps {
  partner: UserPersona;
  currentPersona: UserPersona;
  onClose: () => void;
  onBookFromSyllabus: (partner: UserPersona) => void;
}

export const CurriculumModal: React.FC<CurriculumModalProps> = ({
  partner,
  currentPersona,
  onClose,
  onBookFromSyllabus,
}) => {
  const [curriculum, setCurriculum] = useState<AICurriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedSessions, setCompletedSessions] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  const skillA = currentPersona.skillsOffered[0]?.name || 'Skill A';
  const skillB = partner.skillsOffered[0]?.name || 'Skill B';

  useEffect(() => {
    let isMounted = true;
    const fetchCurriculum = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/curriculum/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userA: currentPersona,
            userB: partner,
            skillAToTeach: skillA,
            skillBToTeach: skillB,
            sessionCount: 3,
          }),
        });
        const data = await res.json();
        if (isMounted) {
          setCurriculum(data);
        }
      } catch (err) {
        console.error('Failed to generate curriculum:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCurriculum();
    return () => {
      isMounted = false;
    };
  }, [partner, currentPersona]);

  const toggleSessionCompletion = (sessionNum: number) => {
    setCompletedSessions((prev) =>
      prev.includes(sessionNum)
        ? prev.filter((n) => n !== sessionNum)
        : [...prev, sessionNum]
    );
  };

  const copySyllabus = () => {
    if (!curriculum) return;
    const text = `${curriculum.curriculumTitle}\n\n${curriculum.overview}\n\n` +
      curriculum.sessions.map((s) =>
        `Session ${s.sessionNumber}: ${s.title} (${s.duration})\n- ${s.part1Focus.teacher}: ${s.part1Focus.topic}\n- ${s.part2Focus.teacher}: ${s.part2Focus.topic}\nPractice: ${s.suggestedPractice}`
      ).join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 text-stone-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                AI Barter Curriculum Architect
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-stone-400">
                Mutual learning syllabus for {currentPersona.name.split(' ')[0]} & {partner.name.split(' ')[0]}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-stone-400 text-xs">
            <Sparkles className="w-7 h-7 text-amber-400 animate-spin" />
            <p className="font-medium text-stone-300">
              Drafting reciprocal syllabus with Gemini...
            </p>
            <p className="text-[11px] text-stone-400">
              Structuring equal 30/30-minute teaching milestones between {skillA} and {skillB}.
            </p>
          </div>
        ) : curriculum ? (
          <div className="space-y-5 text-xs">
            {/* Title & Overview */}
            <div className="p-4 rounded-2xl bg-stone-850 border border-stone-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-400">
                  {curriculum.curriculumTitle}
                </h3>
                <button
                  onClick={copySyllabus}
                  className="text-stone-400 hover:text-amber-400 text-xs flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Syllabus'}</span>
                </button>
              </div>
              <p className="text-stone-300 leading-relaxed text-xs">
                {curriculum.overview}
              </p>
            </div>

            {/* Sessions Roadmap */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Structured Roadmap ({curriculum.sessions.length} Sessions)
              </h4>

              {curriculum.sessions.map((sess) => {
                const isChecked = completedSessions.includes(sess.sessionNumber);
                return (
                  <div
                    key={sess.sessionNumber}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-800/60'
                        : 'bg-stone-850/80 border-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => toggleSessionCompletion(sess.sessionNumber)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isChecked
                              ? 'bg-emerald-500 border-emerald-400 text-stone-950'
                              : 'border-stone-600 bg-stone-800 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <h5 className={`font-bold text-sm ${isChecked ? 'text-stone-400 line-through' : 'text-stone-200'}`}>
                          Session {sess.sessionNumber}: {sess.title}
                        </h5>
                      </div>
                      <span className="text-[11px] text-amber-400/90 font-medium px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        {sess.duration}
                      </span>
                    </div>

                    {/* 2-Part Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Part 1 */}
                      <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide block">
                          Part 1 (30m) • {sess.part1Focus.teacher}
                        </span>
                        <p className="font-semibold text-stone-200 text-xs">
                          {sess.part1Focus.topic}
                        </p>
                        <p className="text-[11px] text-stone-400">
                          {sess.part1Focus.keyTakeaway}
                        </p>
                      </div>

                      {/* Part 2 */}
                      <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 space-y-1">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wide block">
                          Part 2 (30m) • {sess.part2Focus.teacher}
                        </span>
                        <p className="font-semibold text-stone-200 text-xs">
                          {sess.part2Focus.topic}
                        </p>
                        <p className="text-[11px] text-stone-400">
                          {sess.part2Focus.keyTakeaway}
                        </p>
                      </div>
                    </div>

                    {/* Suggested Practice */}
                    {sess.suggestedPractice && (
                      <div className="text-[11px] text-stone-400 bg-stone-900/60 p-2 rounded-lg border border-stone-800/80">
                        <strong className="text-stone-300">Between-session practice: </strong>
                        {sess.suggestedPractice}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Contextual Affiliate Learning Resources & Companion Tools for this Syllabus */}
            {(() => {
              const syllabusRecs = getRecommendationsForSkills([skillA, skillB], 2);
              if (syllabusRecs.length === 0) return null;
              return (
                <div className="p-3 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Recommended Courses & Tools for this Curriculum
                    </span>
                    <span className="text-[10px] text-stone-500">Partner Resources</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {syllabusRecs.map((rec) => (
                      <AffiliateCard
                        key={rec.id}
                        recommendation={rec}
                        currentUserId={currentPersona.id}
                        location="syllabus_generator"
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Equivalence Rule */}
            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-[11px] text-stone-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{curriculum.timeBankEquivalenceNote}</span>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onBookFromSyllabus(partner);
            }}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Book Session 1 from Syllabus
          </button>
        </div>
      </div>
    </div>
  );
};
