import React, { useState } from 'react';
import { UserPersona } from '../types';
import {
  Sparkles,
  Search,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  BookOpen,
  Filter,
  MapPin,
  RefreshCw,
  Zap,
  MessageSquare
} from 'lucide-react';

interface MatchFinderProps {
  currentPersona: UserPersona;
  candidates: UserPersona[];
  onSelectCandidateForAnalysis: (candidate: UserPersona) => void;
  onSelectCandidateForSwap: (candidate: UserPersona) => void;
  onSelectCandidateForCurriculum: (candidate: UserPersona) => void;
  onOpenChat?: (candidate: UserPersona) => void;
}

export const MatchFinder: React.FC<MatchFinderProps> = ({
  currentPersona,
  candidates,
  onSelectCandidateForAnalysis,
  onSelectCandidateForSwap,
  onSelectCandidateForCurriculum,
  onOpenChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [exchangeTypeFilter, setExchangeTypeFilter] = useState<'all' | 'direct' | 'timebank'>('all');
  const [aiSearching, setAiSearching] = useState(false);
  const [aiSearchInsight, setAiSearchInsight] = useState<string | null>(null);
  const [aiRankings, setAiRankings] = useState<Record<string, { score: number; highlight: string; why: string }> | null>(null);

  // Compute direct reciprocal barter overlap
  const getMatchSynergy = (candidate: UserPersona) => {
    // Check if current user offers something candidate wants
    const candidateWantsCurrentUserOffer = candidate.skillsDesired.some((cd) =>
      currentPersona.skillsOffered.some((co) =>
        co.name.toLowerCase().includes(cd.name.toLowerCase()) || cd.name.toLowerCase().includes(co.name.toLowerCase())
      )
    );

    // Check if candidate offers something current user wants
    const currentUserWantsCandidateOffer = currentPersona.skillsDesired.some((cud) =>
      candidate.skillsOffered.some((co) =>
        co.name.toLowerCase().includes(cud.name.toLowerCase()) || cud.name.toLowerCase().includes(co.name.toLowerCase())
      )
    );

    const isDirectBarter = candidateWantsCurrentUserOffer && currentUserWantsCandidateOffer;
    const isOneWay = candidateWantsCurrentUserOffer || currentUserWantsCandidateOffer;

    let defaultScore = isDirectBarter ? 95 : isOneWay ? 84 : 65;

    // Check if AI search gave custom score
    if (aiRankings && aiRankings[candidate.id]) {
      defaultScore = aiRankings[candidate.id].score;
    }

    return {
      isDirectBarter,
      canTeachYou: currentUserWantsCandidateOffer,
      wantsToLearnFromYou: candidateWantsCurrentUserOffer,
      score: defaultScore,
      aiHighlight: aiRankings?.[candidate.id]?.highlight,
      aiWhy: aiRankings?.[candidate.id]?.why,
    };
  };

  const handleAiSmartSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAiSearching(true);
    setAiSearchInsight(null);

    try {
      const res = await fetch('/api/match/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUser: currentPersona,
          query: searchQuery || 'Find best direct reciprocal and time bank skill matches',
          candidates: candidates.filter((c) => c.id !== currentPersona.id),
        }),
      });

      const data = await res.json();
      if (data.recommendations) {
        const rankingMap: Record<string, { score: number; highlight: string; why: string }> = {};
        data.recommendations.forEach((rec: any) => {
          rankingMap[rec.candidateId] = {
            score: rec.aiScore,
            highlight: rec.matchHighlight,
            why: rec.whyRecommended,
          };
        });
        setAiRankings(rankingMap);
        setAiSearchInsight(data.searchInsight || 'AI Matchmaker ranked candidates based on reciprocal interest and schedule fit.');
      }
    } catch (err) {
      console.error('Error querying AI Matchmaker:', err);
    } finally {
      setAiSearching(false);
    }
  };

  const resetAiSearch = () => {
    setSearchQuery('');
    setAiRankings(null);
    setAiSearchInsight(null);
  };

  // Filter candidates
  const filteredCandidates = candidates
    .filter((c) => c.id !== currentPersona.id)
    .filter((candidate) => {
      const synergy = getMatchSynergy(candidate);

      if (exchangeTypeFilter === 'direct' && !synergy.isDirectBarter) return false;
      if (exchangeTypeFilter === 'timebank' && synergy.isDirectBarter) return false;

      if (selectedCategory !== 'All') {
        const offersCat = candidate.skillsOffered.some((s) => s.category === selectedCategory);
        const desiresCat = candidate.skillsDesired.some((s) => s.category === selectedCategory);
        if (!offersCat && !desiresCat) return false;
      }

      if (searchQuery.trim() && !aiRankings) {
        const q = searchQuery.toLowerCase();
        const nameMatch = candidate.name.toLowerCase().includes(q);
        const skillOfferMatch = candidate.skillsOffered.some((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
        const skillDesireMatch = candidate.skillsDesired.some((s) => s.name.toLowerCase().includes(q) || s.learningGoal.toLowerCase().includes(q));
        if (!nameMatch && !skillOfferMatch && !skillDesireMatch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const scoreA = getMatchSynergy(a).score;
      const scoreB = getMatchSynergy(b).score;
      return scoreB - scoreA;
    });

  const categories = [
    'All',
    'Culinary',
    'Technology',
    'Languages',
    'Arts & Crafts',
    'Music',
    'Trades & DIY',
    'Life & Wellness',
  ];

  return (
    <div className="space-y-6">
      {/* Current User Skill Bar / Context Banner */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={currentPersona.avatar}
              alt={currentPersona.name}
              className="w-12 h-12 rounded-xl object-cover border border-amber-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-100">{currentPersona.name}</h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-300">
                  {currentPersona.headline}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                <span className="text-emerald-400 font-medium">You Teach:</span>
                {currentPersona.skillsOffered.map((s) => (
                  <span key={s.id} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px]">
                    {s.name}
                  </span>
                ))}
                <span className="text-stone-500">|</span>
                <span className="text-sky-400 font-medium">You Seek:</span>
                {currentPersona.skillsDesired.map((s) => (
                  <span key={s.id} className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[11px]">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                Time Credits
              </span>
              <span className="text-base font-bold text-amber-400">
                {currentPersona.timeBankBalance.toFixed(1)} TC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Smart Matchmaker Search Bar */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-amber-500/30 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-stone-200">
              AI Matchmaker & Barter Engine
            </span>
          </div>
          {aiRankings && (
            <button
              onClick={resetAiSearch}
              className="text-xs text-stone-400 hover:text-amber-400 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset AI Rankings
            </button>
          )}
        </div>

        <form onSubmit={handleAiSmartSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="ai-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. 'I want someone to teach me Python in exchange for sourdough baking' or 'Find someone who knows French'..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-800/90 border border-stone-700 focus:border-amber-500 text-stone-100 placeholder-stone-400 text-sm focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            id="run-ai-match-btn"
            disabled={aiSearching}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {aiSearching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing Synergy...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-stone-950" />
                Find Best Match
              </>
            )}
          </button>
        </form>

        {aiSearchInsight && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>{aiSearchInsight}</span>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
        {/* Exchange Type Tabs */}
        <div className="flex items-center gap-1.5 bg-stone-850 p-1 rounded-xl border border-stone-800">
          <button
            onClick={() => setExchangeTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              exchangeTypeFilter === 'all'
                ? 'bg-stone-700 text-white font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            All Partners ({candidates.length - 1})
          </button>
          <button
            onClick={() => setExchangeTypeFilter('direct')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              exchangeTypeFilter === 'direct'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-stone-400 hover:text-emerald-400'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Direct Barter (0 TC)
          </button>
          <button
            onClick={() => setExchangeTypeFilter('timebank')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              exchangeTypeFilter === 'timebank'
                ? 'bg-amber-600 text-white font-semibold shadow-sm'
                : 'text-stone-400 hover:text-amber-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Time Bank (1 TC)
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <span className="text-xs text-stone-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-stone-700 text-amber-300 font-semibold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredCandidates.map((candidate) => {
          const synergy = getMatchSynergy(candidate);

          return (
            <div
              key={candidate.id}
              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                synergy.isDirectBarter
                  ? 'bg-stone-900/95 border-emerald-500/40 shadow-emerald-950/20 shadow-lg'
                  : 'bg-stone-900/80 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Header: Avatar, Name, Compatibility Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={candidate.avatar}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-xl object-cover border border-stone-700 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-base font-bold text-stone-100 truncate">
                          {candidate.name}
                        </h4>
                        <span className="text-xs text-amber-400 font-semibold">
                          ★ {candidate.rating.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          ({candidate.reviewCount} sessions)
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 truncate">{candidate.headline}</p>
                      <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {candidate.location}
                      </p>
                    </div>
                  </div>

                  {/* Synergy Match Score Badge */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <div
                      className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        synergy.score >= 90
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : synergy.score >= 75
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-stone-800 text-stone-300 border border-stone-700'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{synergy.score}% Synergy</span>
                    </div>

                    {synergy.isDirectBarter ? (
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mt-1 flex items-center gap-1">
                        <ArrowRightLeft className="w-3 h-3" />
                        Direct Mutual Barter
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400/90 font-medium mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Time Bank Credit
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Rationale / Match Highlight */}
                {synergy.aiHighlight && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-0.5">
                    <span className="font-semibold block">AI Highlight:</span>
                    <p className="text-stone-300 text-[11px]">{synergy.aiWhy || synergy.aiHighlight}</p>
                  </div>
                )}

                {/* Reciprocal Synergies Alert */}
                {synergy.isDirectBarter && !synergy.aiHighlight && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      <strong>Direct Barter Match:</strong> You teach what they want, and they teach what you want!
                    </span>
                  </div>
                )}

                {/* Skills Offered */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      Can Teach You:
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {candidate.skillsOffered.length} skills listed
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skillsOffered.map((skill) => {
                      const isWanted = currentPersona.skillsDesired.some((sd) =>
                        sd.name.toLowerCase().includes(skill.name.toLowerCase()) || skill.name.toLowerCase().includes(sd.name.toLowerCase())
                      );
                      return (
                        <div
                          key={skill.id}
                          className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 ${
                            isWanted
                              ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-semibold'
                              : 'bg-stone-800/80 border border-stone-700/80 text-stone-300'
                          }`}
                        >
                          <span>{skill.name}</span>
                          <span className="text-[10px] px-1 py-0.2 rounded bg-stone-700 text-stone-300">
                            {skill.level}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Skills Desired */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-sky-400 flex items-center gap-1">
                      Wants to Learn:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skillsDesired.map((skill) => {
                      const isOfferedByYou = currentPersona.skillsOffered.some((so) =>
                        so.name.toLowerCase().includes(skill.name.toLowerCase()) || skill.name.toLowerCase().includes(so.name.toLowerCase())
                      );
                      return (
                        <div
                          key={skill.id}
                          className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 ${
                            isOfferedByYou
                              ? 'bg-sky-500/20 border border-sky-500/50 text-sky-300 font-semibold'
                              : 'bg-stone-800/80 border border-stone-700/80 text-stone-400'
                          }`}
                        >
                          <span>{skill.name}</span>
                          <span className="text-[10px] text-stone-400">({skill.targetLevel})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Availability Preview */}
                <div className="flex items-center gap-1.5 text-xs text-stone-400 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Available: {candidate.availability.join(', ')}</span>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-stone-850/90 border-t border-stone-800/90 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Chat / Direct Message */}
                  {onOpenChat && (
                    <button
                      onClick={() => onOpenChat(candidate)}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                      title={`Send direct message to ${candidate.name.split(' ')[0]}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      Chat
                    </button>
                  )}

                  {/* AI Deep Dive */}
                  <button
                    onClick={() => onSelectCandidateForAnalysis(candidate)}
                    className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-xs font-semibold text-stone-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    AI Synergy Analysis
                  </button>

                  {/* AI Curriculum Generator */}
                  <button
                    onClick={() => onSelectCandidateForCurriculum(candidate)}
                    className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-xs font-medium text-stone-300 flex items-center gap-1.5 transition-colors hidden sm:flex"
                    title="Generate 3-week mutual syllabus"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                    Syllabus
                  </button>
                </div>

                {/* Propose Swap Button */}
                <button
                  onClick={() => onSelectCandidateForSwap(candidate)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    synergy.isDirectBarter
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950'
                      : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  {synergy.isDirectBarter ? 'Swap Skills (0 TC)' : 'Book Session (1 TC)'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
