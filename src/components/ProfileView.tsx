import React, { useState, useEffect } from 'react';
import { UserPersona, SkillOffering, SkillDesire, ProficiencyLevel, AffiliateRecommendation } from '../types';
import { AffiliateCard } from './AffiliateCard';
import { ProMembershipModal } from './ProMembershipModal';
import { getRecommendationsForSkills, getAffiliateClickStats } from '../lib/affiliateService';
import {
  User,
  Clock,
  Award,
  Plus,
  Trash2,
  Edit2,
  Check,
  Star,
  MapPin,
  Calendar,
  Sparkles,
  Layers,
  MessageSquare,
  ArrowRight,
  Crown,
  Zap,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  BarChart2
} from 'lucide-react';

interface ProfileViewProps {
  currentPersona: UserPersona;
  onUpdatePersona: (updated: UserPersona) => void;
  allPersonas: UserPersona[];
  onSelectPersona: (persona: UserPersona) => void;
  onOpenChat?: (partner: UserPersona) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentPersona,
  onUpdatePersona,
  allPersonas,
  onSelectPersona,
  onOpenChat,
}) => {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(currentPersona.bio);
  const [headlineInput, setHeadlineInput] = useState(currentPersona.headline);

  // New Skill Offering Form
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [newOfferName, setNewOfferName] = useState('');
  const [newOfferCategory, setNewOfferCategory] = useState<SkillOffering['category']>('Technology');
  const [newOfferLevel, setNewOfferLevel] = useState<ProficiencyLevel>('Intermediate');
  const [newOfferDesc, setNewOfferDesc] = useState('');

  // New Skill Desire Form
  const [showAddDesire, setShowAddDesire] = useState(false);
  const [newDesireName, setNewDesireName] = useState('');
  const [newDesireCategory, setNewDesireCategory] = useState<SkillDesire['category']>('Culinary');
  const [newDesireLevel, setNewDesireLevel] = useState<ProficiencyLevel>('Beginner');
  const [newDesireGoal, setNewDesireGoal] = useState('');

  const handleSaveBio = () => {
    onUpdatePersona({
      ...currentPersona,
      bio: bioInput,
      headline: headlineInput,
    });
    setIsEditingBio(false);
  };

  const handleAddOffering = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferName.trim()) return;

    const newOffer: SkillOffering = {
      id: `so_${Date.now()}`,
      name: newOfferName.trim(),
      category: newOfferCategory,
      level: newOfferLevel,
      description: newOfferDesc || 'Practical 1-on-1 instruction and mentoring.',
    };

    onUpdatePersona({
      ...currentPersona,
      skillsOffered: [...currentPersona.skillsOffered, newOffer],
    });

    setNewOfferName('');
    setNewOfferDesc('');
    setShowAddOffer(false);
  };

  const handleRemoveOffering = (id: string) => {
    onUpdatePersona({
      ...currentPersona,
      skillsOffered: currentPersona.skillsOffered.filter((s) => s.id !== id),
    });
  };

  const handleAddDesire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesireName.trim()) return;

    const newDesire: SkillDesire = {
      id: `sd_${Date.now()}`,
      name: newDesireName.trim(),
      category: newDesireCategory,
      targetLevel: newDesireLevel,
      learningGoal: newDesireGoal || 'Learn fundamental patterns and build hands-on skills.',
    };

    onUpdatePersona({
      ...currentPersona,
      skillsDesired: [...currentPersona.skillsDesired, newDesire],
    });

    setNewDesireName('');
    setNewDesireGoal('');
    setShowAddDesire(false);
  };

  const handleRemoveDesire = (id: string) => {
    onUpdatePersona({
      ...currentPersona,
      skillsDesired: currentPersona.skillsDesired.filter((s) => s.id !== id),
    });
  };

  // Pro Membership & Affiliate State
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [affiliateTab, setAffiliateTab] = useState<'all' | 'learning' | 'teaching'>('all');
  const [clickStats, setClickStats] = useState(() => getAffiliateClickStats(currentPersona.id));

  useEffect(() => {
    const handleAffiliateClick = () => {
      setClickStats(getAffiliateClickStats(currentPersona.id));
    };
    window.addEventListener('skillbank_affiliate_clicked', handleAffiliateClick);
    return () => window.removeEventListener('skillbank_affiliate_clicked', handleAffiliateClick);
  }, [currentPersona.id]);

  const handleUpgradeToPro = (plan: 'pro_monthly' | 'pro_annual') => {
    onUpdatePersona({
      ...currentPersona,
      isProMember: true,
      proPlan: plan,
      proMemberSince: new Date().toISOString(),
      unlimitedSwaps: true,
    });
  };

  const handleDowngradeFromPro = () => {
    onUpdatePersona({
      ...currentPersona,
      isProMember: false,
      proPlan: null,
      unlimitedSwaps: false,
    });
  };

  // Derive relevant skills based on user desires and offerings
  const learningSkillNames = currentPersona.skillsDesired.map((s) => s.name);
  const teachingSkillNames = currentPersona.skillsOffered.map((s) => s.name);

  let activeFilterSkills = [...learningSkillNames, ...teachingSkillNames];
  if (affiliateTab === 'learning') {
    activeFilterSkills = learningSkillNames.length > 0 ? learningSkillNames : activeFilterSkills;
  } else if (affiliateTab === 'teaching') {
    activeFilterSkills = teachingSkillNames.length > 0 ? teachingSkillNames : activeFilterSkills;
  }

  const recommendations = getRecommendationsForSkills(activeFilterSkills, 6);

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={currentPersona.avatar}
                alt={currentPersona.name}
                className={`w-20 h-20 rounded-2xl object-cover border-2 shadow-md ${
                  currentPersona.isProMember ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-amber-500/50'
                }`}
              />
              {currentPersona.isProMember && (
                <div className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black text-[9px] flex items-center gap-0.5 shadow-md">
                  <Crown className="w-2.5 h-2.5 fill-stone-950" />
                  PRO
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-stone-100">{currentPersona.name}</h2>
                {currentPersona.isProMember && (
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black text-[10px] flex items-center gap-1 shadow-sm">
                    <Crown className="w-3 h-3 fill-stone-950" />
                    PRO MENTOR
                  </span>
                )}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold flex items-center gap-1">
                  ★ {currentPersona.rating.toFixed(2)} ({currentPersona.reviewCount} reviews)
                </span>
              </div>

              {isEditingBio ? (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={headlineInput}
                    onChange={(e) => setHeadlineInput(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    placeholder="Headline / Profession"
                  />
                  <textarea
                    rows={3}
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-xs text-stone-100 focus:outline-none focus:border-amber-500 resize-none"
                    placeholder="Tell members about your craft and teaching style"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="px-3 py-1 rounded-lg bg-stone-800 text-stone-400 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveBio}
                      className="px-4 py-1 rounded-lg bg-amber-500 text-stone-950 font-semibold text-xs"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-stone-400 font-medium">{currentPersona.headline}</p>
                  <p className="text-xs text-stone-300 max-w-xl leading-relaxed mt-1">
                    {currentPersona.bio}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-stone-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {currentPersona.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {currentPersona.availability.join(', ')}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {!isEditingBio && (
            <button
              onClick={() => {
                setBioInput(currentPersona.bio);
                setHeadlineInput(currentPersona.headline);
                setIsEditingBio(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-300 text-xs font-medium flex items-center gap-1.5 transition-colors self-start"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
              Edit Bio
            </button>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-800">
          <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800">
            <span className="text-[11px] text-stone-400 block">Time Credits</span>
            <span className="text-lg font-bold text-amber-400">
              {currentPersona.timeBankBalance.toFixed(1)} TC
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800">
            <span className="text-[11px] text-stone-400 block">Hours Taught</span>
            <span className="text-lg font-bold text-emerald-400">
              {currentPersona.hoursTaught.toFixed(1)} hrs
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800">
            <span className="text-[11px] text-stone-400 block">Hours Learned</span>
            <span className="text-lg font-bold text-sky-400">
              {currentPersona.hoursLearned.toFixed(1)} hrs
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800">
            <span className="text-[11px] text-stone-400 block">Endorsements</span>
            <span className="text-lg font-bold text-stone-200">
              {currentPersona.endorsements.reduce((acc, curr) => acc + curr.count, 0)} received
            </span>
          </div>
        </div>
      </div>

      {/* 1. Go Pro / Membership Section */}
      <div
        className={`rounded-3xl p-6 transition-all border ${
          currentPersona.isProMember
            ? 'bg-gradient-to-br from-amber-500/10 via-stone-900 to-stone-900 border-amber-500/40 shadow-xl shadow-amber-500/5'
            : 'bg-stone-900/90 border-stone-800 hover:border-amber-500/30'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                currentPersona.isProMember
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-amber-500/20'
                  : 'bg-stone-800 border border-stone-700 text-amber-400'
              }`}
            >
              <Crown className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-stone-100">
                  {currentPersona.isProMember ? 'SkillBank PRO Membership' : 'Go Pro: SkillBank Membership'}
                </h3>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    currentPersona.isProMember
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                >
                  {currentPersona.isProMember
                    ? currentPersona.proPlan === 'pro_annual'
                      ? 'PRO Annual Tier'
                      : 'PRO Monthly Tier'
                    : 'Community Tier'}
                </span>
              </div>

              <p className="text-xs text-stone-400 max-w-xl leading-relaxed">
                {currentPersona.isProMember
                  ? 'Your PRO privileges are fully active! Enjoy unlimited skill barter sessions with zero deficit restrictions, verified gold badge status, and top search priority.'
                  : 'Upgrade to PRO to unlock unlimited swaps (barter with 0 TC balance), verified gold mentor badges, priority AI matchmaking, and instant escrow settlements.'}
              </p>

              {/* Feature Chips */}
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <span className="text-[11px] px-2.5 py-1 rounded-xl bg-stone-850 border border-stone-750 text-stone-300 flex items-center gap-1.5 font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Unlimited Swaps
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-xl bg-stone-850 border border-stone-750 text-stone-300 flex items-center gap-1.5 font-medium">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  Gold Verified Badge
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-xl bg-stone-850 border border-stone-750 text-stone-300 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Priority AI Matchmaker
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-xl bg-stone-850 border border-stone-750 text-stone-300 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Instant Escrow
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 flex-shrink-0">
            <button
              onClick={() => setIsProModalOpen(true)}
              className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-md ${
                currentPersona.isProMember
                  ? 'bg-stone-800 hover:bg-stone-750 text-amber-300 border border-amber-500/40 hover:border-amber-400'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-amber-500/20 transform hover:-translate-y-0.5'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>{currentPersona.isProMember ? 'Manage Membership' : 'Upgrade to PRO ($9.99/mo)'}</span>
            </button>
            <span className="text-[10px] text-stone-500">
              {currentPersona.isProMember ? 'Active auto-renewing plan' : 'Instant activation • Cancel anytime'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Contextual Affiliate Recommendations Section */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Curated Courses & Gear for Your Skills
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700">
                Partner Hub
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Hand-picked masterclasses, Coursera specializations, and professional gear matched to skills you are learning and teaching.
            </p>
          </div>

          {/* Analytics Badge */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="px-2.5 py-1 rounded-xl bg-stone-850 border border-stone-750 flex items-center gap-1.5 text-[11px] text-stone-300">
              <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
              <span>
                <strong className="text-amber-400">{clickStats.totalClicks}</strong> clicks tracked
              </span>
            </div>
          </div>
        </div>

        {/* Skill Category Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-800 pb-3 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setAffiliateTab('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              affiliateTab === 'all'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
            }`}
          >
            All Recommended ({recommendations.length})
          </button>
          <button
            onClick={() => setAffiliateTab('learning')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              affiliateTab === 'learning'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
            }`}
          >
            For Skills You Are Learning ({learningSkillNames.length})
          </button>
          <button
            onClick={() => setAffiliateTab('teaching')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              affiliateTab === 'teaching'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
            }`}
          >
            For Skills You Teach ({teachingSkillNames.length})
          </button>
        </div>

        {/* Affiliate Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <AffiliateCard
              key={rec.id}
              recommendation={rec}
              currentUserId={currentPersona.id}
              location="profile_view"
            />
          ))}
        </div>

        {/* Affiliate Disclosure Note */}
        <p className="text-[10px] text-stone-500 text-center pt-2">
          SkillBank participates in affiliate partnerships with Coursera, Udemy, MasterClass, and equipment vendors. When you purchase via these links, SkillBank earns a referral commission that funds our community time-banking infrastructure.
        </p>
      </div>

      {/* Skills Offered Section */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Skills You Offer to Teach
            </h3>
            <p className="text-xs text-stone-400">
              The skills you can share in direct reciprocal barters or in exchange for 1.0 Time Credit per hour.
            </p>
          </div>

          <button
            onClick={() => setShowAddOffer(!showAddOffer)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Skill to Teach
          </button>
        </div>

        {/* Add Offering Form */}
        {showAddOffer && (
          <form onSubmit={handleAddOffering} className="p-4 rounded-2xl bg-stone-850 border border-emerald-500/30 space-y-3 text-xs">
            <h4 className="font-bold text-emerald-400 text-sm">Offer a New Skill</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newOfferName}
                onChange={(e) => setNewOfferName(e.target.value)}
                placeholder="Skill Name (e.g. Sourdough Baking, Rust Lang)"
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-emerald-500"
                required
              />
              <select
                value={newOfferCategory}
                onChange={(e) => setNewOfferCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Culinary">Culinary</option>
                <option value="Technology">Technology</option>
                <option value="Languages">Languages</option>
                <option value="Arts & Crafts">Arts & Crafts</option>
                <option value="Music">Music</option>
                <option value="Trades & DIY">Trades & DIY</option>
                <option value="Life & Wellness">Life & Wellness</option>
              </select>
              <select
                value={newOfferLevel}
                onChange={(e) => setNewOfferLevel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            <textarea
              rows={2}
              value={newOfferDesc}
              onChange={(e) => setNewOfferDesc(e.target.value)}
              placeholder="What will you teach in a 60-minute session? Key concepts covered..."
              className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-emerald-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddOffer(false)}
                className="px-3 py-1.5 rounded-xl bg-stone-800 text-stone-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Save Offering
              </button>
            </div>
          </form>
        )}

        {/* Skill Offerings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentPersona.skillsOffered.map((skill) => (
            <div
              key={skill.id}
              className="p-4 rounded-2xl bg-stone-850 border border-stone-800 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-stone-100 block">
                      {skill.name}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Category: {skill.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                      {skill.level}
                    </span>
                    <button
                      onClick={() => handleRemoveOffering(skill.id)}
                      className="text-stone-500 hover:text-rose-400 p-1"
                      title="Remove skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                  {skill.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Desired Section */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Skills You Want to Learn
            </h3>
            <p className="text-xs text-stone-400">
              The AI Matchmaker cross-references these learning goals with other community mentors.
            </p>
          </div>

          <button
            onClick={() => setShowAddDesire(!showAddDesire)}
            className="px-3.5 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Learning Goal
          </button>
        </div>

        {/* Add Desire Form */}
        {showAddDesire && (
          <form onSubmit={handleAddDesire} className="p-4 rounded-2xl bg-stone-850 border border-sky-500/30 space-y-3 text-xs">
            <h4 className="font-bold text-sky-400 text-sm">Add a Learning Objective</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newDesireName}
                onChange={(e) => setNewDesireName(e.target.value)}
                placeholder="Skill to Learn (e.g. Italian Pasta, French)"
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-sky-500"
                required
              />
              <select
                value={newDesireCategory}
                onChange={(e) => setNewDesireCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-sky-500"
              >
                <option value="Culinary">Culinary</option>
                <option value="Technology">Technology</option>
                <option value="Languages">Languages</option>
                <option value="Arts & Crafts">Arts & Crafts</option>
                <option value="Music">Music</option>
                <option value="Trades & DIY">Trades & DIY</option>
                <option value="Life & Wellness">Life & Wellness</option>
              </select>
              <select
                value={newDesireLevel}
                onChange={(e) => setNewDesireLevel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-sky-500"
              >
                <option value="Beginner">Target: Beginner</option>
                <option value="Intermediate">Target: Intermediate</option>
                <option value="Advanced">Target: Advanced</option>
              </select>
            </div>
            <textarea
              rows={2}
              value={newDesireGoal}
              onChange={(e) => setNewDesireGoal(e.target.value)}
              placeholder="What is your learning goal? (e.g. Build an app, speak conversationally for a trip)"
              className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-sky-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddDesire(false)}
                className="px-3 py-1.5 rounded-xl bg-stone-800 text-stone-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
              >
                Save Goal
              </button>
            </div>
          </form>
        )}

        {/* Skill Desires Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentPersona.skillsDesired.map((skill) => (
            <div
              key={skill.id}
              className="p-4 rounded-2xl bg-stone-850 border border-stone-800 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-stone-100 block">
                      {skill.name}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Category: {skill.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold">
                      Target: {skill.targetLevel}
                    </span>
                    <button
                      onClick={() => handleRemoveDesire(skill.id)}
                      className="text-stone-500 hover:text-rose-400 p-1"
                      title="Remove skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                  Goal: {skill.learningGoal}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Network & Direct Messages */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Community Network & Direct Messages
            </h3>
            <p className="text-xs text-stone-400">
              Send direct messages to discuss barter syllabus, schedule slots, or Time Credit swaps.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allPersonas
            .filter((p) => p.id !== currentPersona.id)
            .map((partner) => (
              <div
                key={partner.id}
                className="p-3.5 rounded-2xl bg-stone-850 border border-stone-800 hover:border-stone-700 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={partner.avatar}
                    alt={partner.name}
                    className="w-10 h-10 rounded-xl object-cover border border-stone-700 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-stone-200 block truncate">
                      {partner.name}
                    </span>
                    <span className="text-[10px] text-amber-400 block truncate">
                      Offers: {partner.skillsOffered[0]?.name || 'Skill Barter'}
                    </span>
                  </div>
                </div>

                {onOpenChat && (
                  <button
                    onClick={() => onOpenChat(partner)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
                    title={`Chat with ${partner.name}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    Chat
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Pro Membership Modal */}
      <ProMembershipModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        currentPersona={currentPersona}
        onUpgradeToPro={handleUpgradeToPro}
        onDowngradeFromPro={handleDowngradeFromPro}
      />
    </div>
  );
};
