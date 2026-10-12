import React, { useState } from 'react';
import { AffiliateRecommendation, AffiliatePlatform } from '../types';
import { trackAffiliateClick } from '../lib/affiliateService';
import {
  ExternalLink,
  Star,
  Sparkles,
  ShoppingBag,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Tag
} from 'lucide-react';

interface AffiliateCardProps {
  recommendation: AffiliateRecommendation;
  currentUserId: string;
  location: 'profile_view' | 'chat_suggestion' | 'syllabus_generator';
  compact?: boolean;
  onLinkClick?: (rec: AffiliateRecommendation) => void;
}

export const AffiliateCard: React.FC<AffiliateCardProps> = ({
  recommendation,
  currentUserId,
  location,
  compact = false,
  onLinkClick,
}) => {
  const [clicked, setClicked] = useState(false);

  const getProviderIcon = (provider: AffiliatePlatform) => {
    switch (provider) {
      case 'Coursera':
        return <GraduationCap className="w-3.5 h-3.5 text-blue-400" />;
      case 'Udemy':
        return <BookOpen className="w-3.5 h-3.5 text-purple-400" />;
      case 'Amazon Gear':
        return <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />;
      case 'MasterClass':
        return <Sparkles className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Tag className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getProviderBadgeStyle = (provider: AffiliatePlatform) => {
    switch (provider) {
      case 'Coursera':
        return 'bg-blue-500/15 border-blue-500/30 text-blue-300';
      case 'Udemy':
        return 'bg-purple-500/15 border-purple-500/30 text-purple-300';
      case 'Amazon Gear':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
      case 'MasterClass':
        return 'bg-rose-500/15 border-rose-500/30 text-rose-300';
      default:
        return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setClicked(true);

    // Track analytics click event (saved in localStorage & Firestore)
    trackAffiliateClick(currentUserId, recommendation, location);

    if (onLinkClick) {
      onLinkClick(recommendation);
    }

    // Open target affiliate link in safe new window
    window.open(recommendation.affiliateUrl, '_blank', 'noopener,noreferrer');

    setTimeout(() => setClicked(false), 2000);
  };

  if (compact) {
    return (
      <div className="p-3 rounded-2xl bg-stone-850/80 border border-stone-750 hover:border-amber-500/40 transition-all flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center flex-shrink-0">
            {getProviderIcon(recommendation.provider)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${getProviderBadgeStyle(recommendation.provider)}`}>
                {recommendation.provider}
              </span>
              <span className="text-[10px] text-amber-400 font-semibold">
                {recommendation.priceDisplay}
              </span>
            </div>
            <h5 className="text-xs font-semibold text-stone-200 truncate mt-0.5">
              {recommendation.title}
            </h5>
          </div>
        </div>

        <button
          onClick={handleClick}
          className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-200 font-bold text-[11px] border border-stone-700 hover:border-amber-400 transition-all flex items-center gap-1 flex-shrink-0 shadow-sm"
        >
          {clicked ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Visited</span>
            </>
          ) : (
            <>
              <span>View</span>
              <ExternalLink className="w-3 h-3" />
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-stone-850/90 border border-stone-750/90 hover:border-amber-500/40 transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header info */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold flex items-center gap-1 ${getProviderBadgeStyle(recommendation.provider)}`}>
              {getProviderIcon(recommendation.provider)}
              {recommendation.provider}
            </span>
            {recommendation.badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                {recommendation.badge}
              </span>
            )}
          </div>

          <span className="text-xs font-bold text-amber-400">
            {recommendation.priceDisplay}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-xs sm:text-sm font-bold text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
          {recommendation.title}
        </h4>

        {/* Rating & reviews */}
        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-400">
          <div className="flex items-center text-amber-400 gap-0.5 font-semibold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{recommendation.rating}</span>
          </div>
          <span>•</span>
          <span>{recommendation.reviewCount.toLocaleString()} ratings</span>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-400 line-clamp-2 mt-2 leading-relaxed">
          {recommendation.description}
        </p>

        {/* Matched skills tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {recommendation.matchingSkills.slice(0, 3).map((skill, idx) => (
            <span
              key={idx}
              className="text-[9px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700/60"
            >
              #{skill}
            </span>
          ))}
        </div>
      </div>

      {/* Footer CTA & Disclosure */}
      <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between gap-2">
        <span className="text-[9px] text-stone-500 tracking-tight">
          Partner Link • Supports Community
        </span>

        <button
          onClick={handleClick}
          className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-200 text-xs font-bold border border-stone-700 hover:border-amber-400 transition-all flex items-center gap-1.5 shadow-sm"
        >
          {clicked ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Visited</span>
            </>
          ) : (
            <>
              <span>Explore Course</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

