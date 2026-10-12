import React from 'react';
import { UserPersona } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  Sparkles,
  Users,
  Calendar,
  ArrowRightLeft,
  ShieldCheck,
  ChevronDown,
  Check,
  LogIn,
  LogOut,
  User as UserIcon,
  MessageSquare,
  Bell,
  Crown
} from 'lucide-react';
import { AppNotification } from '../types';
import { NotificationCenter } from './NotificationCenter';

interface NavbarProps {
  currentPersona: UserPersona;
  allPersonas: UserPersona[];
  onSelectPersona: (persona: UserPersona) => void;
  activeTab: 'matches' | 'timebank' | 'swaps' | 'profile' | 'chat';
  setActiveTab: (tab: 'matches' | 'timebank' | 'swaps' | 'profile' | 'chat') => void;
  onOpenTimeBankModal: () => void;
  onOpenAuthModal: () => void;
  scheduledSwapsCount: number;
  unreadMessagesCount?: number;
  notifications: AppNotification[];
  unreadNotificationsCount?: number;
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAllNotifications: () => void;
  onNavigateTab: (tab: 'chat' | 'swaps' | 'timebank' | 'matches' | 'profile', targetId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPersona,
  allPersonas,
  onSelectPersona,
  activeTab,
  setActiveTab,
  onOpenTimeBankModal,
  onOpenAuthModal,
  scheduledSwapsCount,
  unreadMessagesCount = 0,
  notifications = [],
  unreadNotificationsCount = 0,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onDeleteNotification,
  onClearAllNotifications,
  onNavigateTab,
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const { user, logout } = useAuth();

  return (
    <header id="main-header" className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-semibold shadow-inner">
              <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg tracking-tight text-stone-100">SkillBank</span>
                <span className="text-[10px] sm:text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Time Bank
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                1 Hour Taught = 1 Hour Learned
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-stone-800/80 p-1 rounded-xl border border-stone-700/60">
            <button
              id="tab-matches-btn"
              onClick={() => setActiveTab('matches')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'matches'
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Matchmaker
            </button>

            <button
              id="tab-timebank-btn"
              onClick={() => setActiveTab('timebank')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'timebank'
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <Clock className="w-4 h-4" />
              Time Bank
            </button>

            <button
              id="tab-swaps-btn"
              onClick={() => setActiveTab('swaps')}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'swaps'
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              My Swaps
              {scheduledSwapsCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-xs font-bold ${
                  activeTab === 'swaps' ? 'bg-stone-950 text-amber-400' : 'bg-amber-500 text-stone-950'
                }`}>
                  {scheduledSwapsCount}
                </span>
              )}
            </button>

            <button
              id="tab-chat-btn"
              onClick={() => setActiveTab('chat')}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
              {unreadMessagesCount && unreadMessagesCount > 0 ? (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              ) : null}
            </button>

            <button
              id="tab-profile-btn"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <Users className="w-4 h-4" />
              My Profile
            </button>
          </nav>

          {/* Right Side: Sign In Button, Time Bank Balance & Persona Switcher */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Balance Button */}
            <button
              id="open-timebank-balance-btn"
              onClick={onOpenTimeBankModal}
              title="Click to view Time Credit balance & ledger"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-pulse" />
              <div className="text-left">
                <span className="text-[10px] text-stone-400 hidden sm:block -mb-0.5">Time Bank</span>
                <span className="text-xs sm:text-sm font-bold text-amber-400 tracking-tight">
                  {currentPersona.timeBankBalance.toFixed(1)} <span className="text-[10px] sm:text-xs font-normal">TC</span>
                </span>
              </div>
            </button>

            {/* Notification Bell with Badge Counter */}
            <div className="relative">
              <button
                id="notification-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                title={unreadNotificationsCount > 0 ? `${unreadNotificationsCount} unread notification${unreadNotificationsCount > 1 ? 's' : ''}` : 'Notifications'}
                className={`relative p-2 rounded-xl border transition-all flex items-center justify-center ${
                  showNotifications
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                    : unreadNotificationsCount > 0
                    ? 'bg-stone-800 border-amber-500/40 text-amber-400 hover:bg-stone-750'
                    : 'bg-stone-800 border-stone-700 hover:border-stone-600 text-stone-300 hover:text-white'
                }`}
              >
                <Bell className={`w-4 h-4 transition-transform ${unreadNotificationsCount > 0 ? 'text-amber-400 group-hover:rotate-12' : 'text-stone-300'}`} />
                {unreadNotificationsCount > 0 && (
                  <span
                    id="notification-badge-counter"
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-stone-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse"
                  >
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              <NotificationCenter
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                notifications={notifications}
                unreadCount={unreadNotificationsCount}
                onMarkAsRead={onMarkNotificationAsRead}
                onMarkAllAsRead={onMarkAllNotificationsAsRead}
                onDeleteNotification={onDeleteNotification}
                onClearAll={onClearAllNotifications}
                onNavigate={onNavigateTab}
              />
            </div>

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                id="persona-switcher-btn"
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                title="Switch Member Persona to test matches from another perspective"
                className={`flex items-center gap-1.5 p-1.5 sm:pr-2.5 rounded-xl border transition-all text-left ${
                  currentPersona.isProMember
                    ? 'bg-amber-500/10 border-amber-500/40 hover:border-amber-400'
                    : 'bg-stone-800 border-stone-700 hover:border-stone-600'
                }`}
              >
                <div className="relative">
                  <img
                    src={currentPersona.avatar}
                    alt={currentPersona.name}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover ${
                      currentPersona.isProMember ? 'border border-amber-400' : 'border border-stone-600'
                    }`}
                  />
                  {currentPersona.isProMember && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-xs">
                      <Crown className="w-2 h-2 fill-stone-950" />
                    </span>
                  )}
                </div>
                <div className="hidden lg:block text-xs">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-stone-200 block truncate max-w-[80px]">
                      {currentPersona.name.split(' ')[0]}
                    </span>
                    {currentPersona.isProMember && (
                      <span className="text-[9px] font-black px-1 rounded bg-amber-400 text-stone-950">
                        PRO
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 block truncate max-w-[90px]">
                    Persona
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {showPersonaMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowPersonaMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-2 z-50 text-stone-200">
                    <div className="px-3 py-2 border-b border-stone-800">
                      <p className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                        Switch Active Persona
                      </p>
                      <p className="text-[11px] text-stone-400">
                        View matches & barters from this member's perspective.
                      </p>
                    </div>

                    <div className="py-1 space-y-1 max-h-72 overflow-y-auto">
                      {allPersonas.map((persona) => {
                        const isSelected = persona.id === currentPersona.id;
                        return (
                          <button
                            key={persona.id}
                            onClick={() => {
                              onSelectPersona(persona);
                              setShowPersonaMenu(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                              isSelected
                                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                                : 'hover:bg-stone-800/80 text-stone-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative flex-shrink-0">
                                <img
                                  src={persona.avatar}
                                  alt={persona.name}
                                  className="w-8 h-8 rounded-lg object-cover"
                                />
                                {persona.isProMember && (
                                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center">
                                    <Crown className="w-2.5 h-2.5 fill-stone-950" />
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-semibold truncate">{persona.name}</p>
                                  {persona.isProMember && (
                                    <span className="text-[9px] font-black px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                      PRO
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-stone-400 truncate">
                                  Teaches: {persona.skillsOffered[0]?.name}
                                </p>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-amber-400 flex-shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Prominent Sign In / User Status Section */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-stone-800">
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-stone-800/80 rounded-xl border border-stone-700/70">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                    {user.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-medium text-stone-200 max-w-[100px] truncate">
                    {user.displayName?.split(' ')[0]}
                  </span>
                </div>
                <button
                  id="navbar-signout-btn"
                  onClick={() => logout()}
                  title="Sign Out"
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-rose-400 border border-stone-700 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                id="navbar-signin-btn"
                onClick={onOpenAuthModal}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95 cursor-pointer flex-shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-stone-800">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-1 text-xs font-medium py-1 px-2.5 rounded-lg ${
              activeTab === 'matches' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Matches
          </button>
          <button
            onClick={() => setActiveTab('timebank')}
            className={`flex items-center gap-1 text-xs font-medium py-1 px-2.5 rounded-lg ${
              activeTab === 'timebank' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Time Bank
          </button>
          <button
            onClick={() => setActiveTab('swaps')}
            className={`flex items-center gap-1 text-xs font-medium py-1 px-2.5 rounded-lg ${
              activeTab === 'swaps' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Swaps {scheduledSwapsCount > 0 ? `(${scheduledSwapsCount})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1 text-xs font-medium py-1 px-2.5 rounded-lg ${
              activeTab === 'chat' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1 text-xs font-medium py-1 px-2.5 rounded-lg ${
              activeTab === 'profile' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Profile
          </button>
        </div>
      </div>
    </header>
  );
};
