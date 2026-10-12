import React, { useState } from 'react';
import { UserPersona, TimeBankTransaction } from '../types';
import {
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Gift,
  HeartHandshake,
  Shield,
  HelpCircle,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface TimeBankLedgerProps {
  currentPersona: UserPersona;
  transactions: TimeBankTransaction[];
  onClaimCommunityGrant: () => void;
  onPayItForward: (amount: number) => void;
  communityPoolHours: number;
}

export const TimeBankLedger: React.FC<TimeBankLedgerProps> = ({
  currentPersona,
  transactions,
  onClaimCommunityGrant,
  onPayItForward,
  communityPoolHours,
}) => {
  const [filter, setFilter] = useState<'all' | 'earned' | 'spent' | 'escrow'>('all');
  const [showPrinciplesModal, setShowPrinciplesModal] = useState(false);
  const [payForwardNotification, setPayForwardNotification] = useState<string | null>(null);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'earned') return tx.type === 'earned' || tx.type === 'community_grant';
    if (filter === 'spent') return tx.type === 'spent';
    if (filter === 'escrow') return tx.type === 'escrow_hold' || tx.type === 'escrow_release';
    return true;
  });

  const escrowAmount = transactions
    .filter((tx) => tx.status === 'in_escrow')
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const handlePayForward = (amount: number) => {
    if (currentPersona.timeBankBalance < amount) {
      alert("You don't have enough time credits to donate right now. Teach a session to earn more!");
      return;
    }
    onPayItForward(amount);
    setPayForwardNotification(`Successfully contributed ${amount} Time Credit(s) to the Community Learning Pool!`);
    setTimeout(() => setPayForwardNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: The Ethos */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950/40 border border-stone-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Clock className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-stone-100">The Time-Banking Ledger</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-300 font-medium">
                1 Hour = 1 Hour
              </span>
            </div>
            <p className="text-sm text-stone-300 max-w-2xl leading-relaxed">
              In this community, monetary wealth has no power. Every human hour is valued equally: one hour of baking sourdough equals one hour of Python debugging or language immersion. Credits flow through teaching and learning.
            </p>
          </div>

          <button
            id="view-principles-btn"
            onClick={() => setShowPrinciplesModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800/90 border border-stone-700 hover:border-amber-500/50 text-stone-200 text-xs font-semibold transition-all hover:bg-stone-750"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            Time Bank Principles
          </button>
        </div>
      </div>

      {payForwardNotification && (
        <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{payForwardNotification}</span>
        </div>
      )}

      {/* Credit Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-stone-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>Available Balance</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">
              {currentPersona.timeBankBalance.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-stone-400">Hours / Credits</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Redeemable for 1-on-1 sessions with any community member.
          </p>
        </div>

        {/* Escrow Lock */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>In Escrow (Reserved)</span>
            <Lock className="w-4 h-4 text-amber-400/70" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-200">
              {escrowAmount.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-stone-400">Hours</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Held safely until scheduled swap sessions are completed.
          </p>
        </div>

        {/* Lifetime Taught */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>Community Contribution</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">
              {currentPersona.hoursTaught.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-stone-400">Hours Taught</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            {currentPersona.reviewCount} verified learning partners mentored.
          </p>
        </div>

        {/* Lifetime Learned */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>Skills Acquired</span>
            <ArrowDownLeft className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-sky-400">
              {currentPersona.hoursLearned.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-stone-400">Hours Received</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Across {currentPersona.skillsDesired.length} core learning objectives.
          </p>
        </div>
      </div>

      {/* Community Mutual Aid & Seed Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Seed Grant Claim */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-stone-200">Community Starter Grant</h3>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              New to skill-swapping? Don't wait until you teach to start learning. We provide an initial credit so you can immediately book a session and experience peer education.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
            <span className="text-xs text-stone-400">Grant Size: 1.0 Time Credit</span>
            <button
              id="claim-seed-grant-btn"
              onClick={onClaimCommunityGrant}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Request +1.0 TC Seed
            </button>
          </div>
        </div>

        {/* Community Pool & Pay it Forward */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-stone-200">Community Learning Pool</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                {communityPoolHours.toFixed(1)} Pool Hours
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Have extra credits? Donate hours to sponsor newcomers, students, and community members building vital trade or language skills.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
            <span className="text-xs text-stone-400">Pay it forward:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePayForward(0.5)}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors"
              >
                Donate 0.5 TC
              </button>
              <button
                onClick={() => handlePayForward(1.0)}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-medium border border-stone-700 transition-colors"
              >
                Donate 1.0 TC
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History & Filter */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-100">Transaction History</h3>
            <p className="text-xs text-stone-400">
              Audit trail of every hour contributed, earned, and held in escrow.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-stone-800/80 p-1 rounded-xl border border-stone-700/60 self-start sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === 'all' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilter('earned')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === 'earned' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              Earned
            </button>
            <button
              onClick={() => setFilter('spent')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === 'spent' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              Spent
            </button>
            <button
              onClick={() => setFilter('escrow')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === 'escrow' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              Escrow
            </button>
          </div>
        </div>

        {/* Table / List */}
        <div className="divide-y divide-stone-800/80">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-sm">
              No transactions matching this filter.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-stone-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        tx.status === 'in_escrow'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : isPositive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {tx.status === 'in_escrow' ? (
                        <Lock className="w-4 h-4" />
                      ) : isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-200 truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                        <span>{tx.date}</span>
                        {tx.counterpartyName && (
                          <>
                            <span>•</span>
                            <span>With {tx.counterpartyName}</span>
                          </>
                        )}
                        {tx.relatedSkill && (
                          <>
                            <span>•</span>
                            <span className="text-stone-300 font-medium">{tx.relatedSkill}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-sm font-bold ${
                        tx.status === 'in_escrow'
                          ? 'text-amber-400'
                          : isPositive
                          ? 'text-emerald-400'
                          : 'text-stone-300'
                      }`}
                    >
                      {isPositive ? `+${tx.amount.toFixed(1)}` : `${tx.amount.toFixed(1)}`} TC
                    </span>
                    <span
                      className={`block text-[10px] uppercase font-semibold tracking-wider ${
                        tx.status === 'in_escrow'
                          ? 'text-amber-400/90'
                          : 'text-stone-500'
                      }`}
                    >
                      {tx.status === 'in_escrow' ? 'Locked in Escrow' : 'Verified'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Time Banking Principles Modal */}
      {showPrinciplesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-stone-100">
                  The Core Principles of Time Banking
                </h3>
              </div>
              <button
                onClick={() => setShowPrinciplesModal(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-stone-300">
              <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-1">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  1. Assets: Everyone Has Something to Offer
                </h4>
                <p className="text-stone-400">
                  Every person has knowledge, techniques, craft, or life experience worth sharing. There are no "unskilled" participants.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-1">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  2. Redefining Work & Equal Time
                </h4>
                <p className="text-stone-400">
                  One hour of teaching bread baking is equal to one hour of teaching machine learning. Time is the universal democratic currency.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-1">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  3. Reciprocity: Give & Receive
                </h4>
                <p className="text-stone-400">
                  Helping is a two-way street. Asking for help is just as valuable as offering it, because it gives others the opportunity to contribute.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-1">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  4. Escrow & Community Trust
                </h4>
                <p className="text-stone-400">
                  When you schedule a session, credits are placed into escrow until both parties confirm the session was delivered. This prevents no-shows and honors commitments.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-800 flex justify-end">
              <button
                onClick={() => setShowPrinciplesModal(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors"
              >
                Understood, Return to Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
