import React, { useState } from 'react';
import { UserPersona } from '../types';
import {
  Crown,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRightLeft,
  X,
  Star,
  Award
} from 'lucide-react';

interface ProMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona: UserPersona;
  onUpgradeToPro: (plan: 'pro_monthly' | 'pro_annual') => void;
  onDowngradeFromPro?: () => void;
}

export const ProMembershipModal: React.FC<ProMembershipModalProps> = ({
  isOpen,
  onClose,
  currentPersona,
  onUpgradeToPro,
  onDowngradeFromPro,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const isAlreadyPro = !!currentPersona.isProMember;

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onUpgradeToPro(billingCycle === 'annual' ? 'pro_annual' : 'pro_monthly');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-stone-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-100 overflow-hidden">
        {/* Decorative Golden Accent Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-lg shadow-amber-500/20 mb-2">
            <Crown className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-stone-100">
              SkillBank PRO Membership
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
              {isAlreadyPro ? 'Active Tier' : 'VIP Access'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 max-w-sm mx-auto">
            Unlock unlimited skill barter swaps, premium gold badges, and top-tier AI matching priority.
          </p>
        </div>

        {/* Billing Cycle Switcher */}
        {!isAlreadyPro && (
          <div className="flex items-center justify-center mb-6">
            <div className="p-1 rounded-2xl bg-stone-850 border border-stone-750 flex items-center gap-1 text-xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-xl font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-stone-700 text-stone-100 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Monthly ($9.99/mo)
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Annual ($79/yr)
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-stone-900 text-amber-300">
                  Save 34%
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Benefits Matrix */}
        <div className="space-y-3 mb-6 bg-stone-850/60 p-4 rounded-2xl border border-stone-800">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-200">Unlimited Skill Swaps</h4>
              <p className="text-[11px] text-stone-400">
                Bypass Time Bank deficit checks. Propose and accept barter sessions without minimum balance limits.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-200">Verified PRO Gold Badge</h4>
              <p className="text-[11px] text-stone-400">
                Prominently displayed beside your avatar and in search results, establishing trusted mentor authority.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-200">Priority AI Matchmaker Boost</h4>
              <p className="text-[11px] text-stone-400">
                Your profile is boosted to top position in mutual barter suggestions and algorithmic skill pairings.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-200">Zero Escrow Hold Delays</h4>
              <p className="text-[11px] text-stone-400">
                Instant Time Credit settlement directly to your balance upon session completion.
              </p>
            </div>
          </div>
        </div>

        {/* Current Status or CTA */}
        {isAlreadyPro ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>You are an active PRO Member ({currentPersona.proPlan === 'pro_annual' ? 'Annual Plan' : 'Monthly Plan'})</span>
              </div>
              <span className="text-[11px] font-bold text-amber-400">Active</span>
            </div>

            {onDowngradeFromPro && (
              <button
                onClick={() => {
                  onDowngradeFromPro();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-stone-200 text-xs font-semibold transition-colors"
              >
                Switch to Standard Free Tier
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Crown className="w-4 h-4" />
              Upgrade to PRO Now ({billingCycle === 'annual' ? '$79/year' : '$9.99/month'})
            </button>
            <p className="text-[10px] text-center text-stone-500">
              Mock checkout enabled for demonstration. Instantly activates PRO status & badges. Cancel anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
