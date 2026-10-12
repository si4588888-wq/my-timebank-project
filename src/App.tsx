import React, { useState, useEffect } from 'react';
import { UserPersona, TimeBankTransaction, SwapSession, AppNotification } from './types';
import {
  INITIAL_COMMUNITY_MEMBERS,
  INITIAL_TRANSACTIONS,
  INITIAL_SESSIONS
} from './mockData';
import { Navbar } from './components/Navbar';
import { MatchFinder } from './components/MatchFinder';
import { TimeBankLedger } from './components/TimeBankLedger';
import { ActiveSwapsView } from './components/ActiveSwapsView';
import { ProfileView } from './components/ProfileView';
import { ChatView } from './components/ChatView';
import { PartnerDetailModal } from './components/PartnerDetailModal';
import { NewSwapModal } from './components/NewSwapModal';
import { CurriculumModal } from './components/CurriculumModal';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import {
  getUserNotifications,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  subscribeToNotifications
} from './lib/notificationService';
import { CheckCircle2, Clock, Sparkles, ArrowRightLeft } from 'lucide-react';

export default function App() {
  // Load state from localStorage or initial defaults
  const [personas, setPersonas] = useState<UserPersona[]>(() => {
    const saved = localStorage.getItem('skillbank_personas');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use default */ }
    }
    return INITIAL_COMMUNITY_MEMBERS;
  });

  const [currentPersonaId, setCurrentPersonaId] = useState<string>(() => {
    return localStorage.getItem('skillbank_active_persona') || 'user_elena';
  });

  const [transactions, setTransactions] = useState<TimeBankTransaction[]>(() => {
    const saved = localStorage.getItem('skillbank_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use default */ }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [sessions, setSessions] = useState<SwapSession[]>(() => {
    const saved = localStorage.getItem('skillbank_sessions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use default */ }
    }
    return INITIAL_SESSIONS;
  });

  const [communityPoolHours, setCommunityPoolHours] = useState<number>(42.5);
  const [activeTab, setActiveTab] = useState<'matches' | 'timebank' | 'swaps' | 'profile' | 'chat'>('matches');
  const [activePartnerToChat, setActivePartnerToChat] = useState<UserPersona | null>(null);

  // In-App Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return getUserNotifications(currentPersonaId);
  });

  // Auth & Modals
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPartnerForAnalysis, setSelectedPartnerForAnalysis] = useState<UserPersona | null>(null);
  const [selectedPartnerForSwap, setSelectedPartnerForSwap] = useState<UserPersona | null>(null);
  const [selectedPartnerForCurriculum, setSelectedPartnerForCurriculum] = useState<UserPersona | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync notifications with active persona changes and Firestore
  useEffect(() => {
    const unsubscribe = subscribeToNotifications(currentPersonaId, (updated) => {
      setNotifications(updated);
    });
    return () => unsubscribe();
  }, [currentPersonaId]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Sync logged in user to personas list if new
  useEffect(() => {
    if (user) {
      setPersonas((prev) => {
        const exists = prev.find((p) => p.id === user.uid);
        if (exists) return prev;
        const newPersona: UserPersona = {
          id: user.uid,
          name: user.displayName || 'Community Member',
          headline: 'Community Member & Lifelong Learner',
          avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          bio: 'Verified SkillBank member ready to trade knowledge for time.',
          location: 'Global Community Hub',
          timeBankBalance: 2.0,
          hoursTaught: 0,
          hoursLearned: 0,
          rating: 5.0,
          reviewCount: 0,
          skillsOffered: [
            {
              id: `sk_off_${Date.now()}`,
              name: 'Creative & Technical Guidance',
              category: 'Technology',
              level: 'Intermediate',
              description: 'Open to barter teaching skills, problem solving, and mentorship.',
            }
          ],
          skillsDesired: [
            {
              id: `sk_des_${Date.now()}`,
              name: 'Conversational Languages & Arts',
              category: 'Languages',
              targetLevel: 'Intermediate',
              learningGoal: 'Skill expansion and community learning',
            }
          ],
          availability: ['Weekday Evenings', 'Weekend Afternoons'],
          languages: ['English'],
          endorsements: [{ skill: 'Technology Guidance', count: 1 }],
        };
        return [newPersona, ...prev];
      });
      setCurrentPersonaId(user.uid);
      showToast(`Welcome, ${user.displayName || 'Member'}! You are signed in.`);
    }
  }, [user]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('skillbank_personas', JSON.stringify(personas));
  }, [personas]);

  useEffect(() => {
    localStorage.setItem('skillbank_active_persona', currentPersonaId);
  }, [currentPersonaId]);

  useEffect(() => {
    localStorage.setItem('skillbank_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('skillbank_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const currentPersona = personas.find((p) => p.id === currentPersonaId) || personas[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Persona actions
  const handleSelectPersona = (persona: UserPersona) => {
    setCurrentPersonaId(persona.id);
    showToast(`Switched active view to ${persona.name}. You are now viewing matches from their perspective.`);
  };

  const handleUpdatePersona = (updated: UserPersona) => {
    setPersonas((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast('Profile and skills updated successfully!');
  };

  // Time Bank actions
  const handleClaimCommunityGrant = () => {
    const newTx: TimeBankTransaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: 1.0,
      type: 'community_grant',
      description: 'Community Learning Seed Grant (+1.0 TC)',
      status: 'completed',
    };

    setTransactions((prev) => [newTx, ...prev]);
    setPersonas((prev) =>
      prev.map((p) =>
        p.id === currentPersonaId
          ? { ...p, timeBankBalance: p.timeBankBalance + 1.0 }
          : p
      )
    );

    // Trigger in-app notification
    addNotification({
      userId: currentPersonaId,
      type: 'timebank_credit',
      title: 'Community Seed Grant (+1.0 TC)',
      message: '+1.0 Time Credit added to your balance. Ready for booking community mentors!',
      linkTab: 'timebank',
      actionLabel: 'View Balance',
    }).catch(() => {});

    showToast('Claimed +1.0 Time Credit! You can now book any 1-hour session from community mentors.');
  };

  const handlePayItForward = (amount: number) => {
    const newTx: TimeBankTransaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: -amount,
      type: 'spent',
      description: `Donated ${amount} TC to Community Learning Pool`,
      status: 'completed',
    };

    setTransactions((prev) => [newTx, ...prev]);
    setPersonas((prev) =>
      prev.map((p) =>
        p.id === currentPersonaId
          ? { ...p, timeBankBalance: Math.max(0, p.timeBankBalance - amount) }
          : p
      )
    );
    setCommunityPoolHours((prev) => prev + amount);

    showToast(`Donated ${amount} Time Credit(s) to the Community Pool. Thank you for paying it forward!`);
  };

  // Session actions
  const handleBookSwap = (newSession: SwapSession, escrowCost: number) => {
    setSessions((prev) => [newSession, ...prev]);

    if (escrowCost > 0) {
      // Deduct balance and put into escrow
      setPersonas((prev) =>
        prev.map((p) =>
          p.id === currentPersonaId
            ? { ...p, timeBankBalance: Math.max(0, p.timeBankBalance - escrowCost) }
            : p
        )
      );

      const escrowTx: TimeBankTransaction = {
        id: `tx_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        amount: -escrowCost,
        type: 'escrow_hold',
        description: `Escrow hold for upcoming session with ${newSession.partnerName}`,
        counterpartyId: newSession.partnerId,
        counterpartyName: newSession.partnerName,
        relatedSkill: newSession.skillYouLearn,
        sessionId: newSession.id,
        status: 'in_escrow',
      };

      setTransactions((prev) => [escrowTx, ...prev]);
    }

    // Trigger in-app notifications for both users
    addNotification({
      userId: newSession.partnerId,
      type: 'proposal',
      title: `New Swap Proposed: ${newSession.title}`,
      message: `${currentPersona.name} proposed a session: "${newSession.title}" for ${newSession.scheduledDate} at ${newSession.timeSlot}.`,
      senderId: currentPersona.id,
      senderName: currentPersona.name,
      senderAvatar: currentPersona.avatar,
      linkTab: 'swaps',
      linkTargetId: newSession.id,
      actionLabel: 'Review Swap',
    }).catch(() => {});

    addNotification({
      userId: currentPersonaId,
      type: 'session_update',
      title: `Session Confirmed with ${newSession.partnerName}`,
      message: `Your barter session "${newSession.title}" is scheduled for ${newSession.scheduledDate} at ${newSession.timeSlot}.`,
      senderId: newSession.partnerId,
      senderName: newSession.partnerName,
      senderAvatar: newSession.partnerAvatar,
      linkTab: 'swaps',
      linkTargetId: newSession.id,
      actionLabel: 'View Schedule',
    }).catch(() => {});

    showToast(`Skill Swap scheduled with ${newSession.partnerName}! Added to your active sessions.`);
    setActiveTab('swaps');
  };

  const handleCompleteSession = (sessionId: string) => {
    const sess = sessions.find((s) => s.id === sessionId);
    if (!sess || sess.status === 'completed') return;

    // Mark session as completed
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'completed' } : s))
    );

    // Trigger status update notifications for both parties
    addNotification({
      userId: currentPersonaId,
      type: 'session_completed',
      title: `Session Completed: ${sess.title}`,
      message: `Your skill swap with ${sess.partnerName} is marked complete. Hours & credits have been updated!`,
      senderId: sess.partnerId,
      senderName: sess.partnerName,
      senderAvatar: sess.partnerAvatar,
      linkTab: 'swaps',
      linkTargetId: sess.id,
      actionLabel: 'View Swaps',
    }).catch(() => {});

    addNotification({
      userId: sess.partnerId,
      type: 'session_completed',
      title: `Session Completed: ${sess.title}`,
      message: `${currentPersona.name} marked "${sess.title}" as completed. Credits have been settled to your ledger.`,
      senderId: currentPersona.id,
      senderName: currentPersona.name,
      senderAvatar: currentPersona.avatar,
      linkTab: 'timebank',
      actionLabel: 'View Ledger',
    }).catch(() => {});

    const today = new Date().toISOString().split('T')[0];

    if (sess.exchangeType === 'time_credit') {
      if (sess.role === 'learner') {
        // Current user was learner: release escrow transaction to completed, and credit the teacher
        setTransactions((prev) =>
          prev.map((tx) =>
            tx.sessionId === sessionId ? { ...tx, status: 'completed' } : tx
          )
        );

        // Update teacher's balance
        setPersonas((prev) =>
          prev.map((p) => {
            if (p.id === sess.partnerId) {
              return {
                ...p,
                timeBankBalance: p.timeBankBalance + 1.0,
                hoursTaught: p.hoursTaught + 1.0,
              };
            }
            if (p.id === currentPersonaId) {
              return {
                ...p,
                hoursLearned: p.hoursLearned + 1.0,
              };
            }
            return p;
          })
        );

        showToast(`Session completed! 1.0 Time Credit released from escrow to ${sess.partnerName}.`);
      } else if (sess.role === 'teacher') {
        // Current user was teacher: receive 1.0 TC
        setPersonas((prev) =>
          prev.map((p) => {
            if (p.id === currentPersonaId) {
              return {
                ...p,
                timeBankBalance: p.timeBankBalance + 1.0,
                hoursTaught: p.hoursTaught + 1.0,
              };
            }
            if (p.id === sess.partnerId) {
              return {
                ...p,
                hoursLearned: p.hoursLearned + 1.0,
              };
            }
            return p;
          })
        );

        const earnTx: TimeBankTransaction = {
          id: `tx_${Date.now()}`,
          date: today,
          amount: 1.0,
          type: 'earned',
          description: `Taught 1 hour of ${sess.skillYouTeach || 'Skill'} to ${sess.partnerName}`,
          counterpartyId: sess.partnerId,
          counterpartyName: sess.partnerName,
          relatedSkill: sess.skillYouTeach,
          sessionId: sess.id,
          status: 'completed',
        };

        setTransactions((prev) => [earnTx, ...prev]);
        showToast(`Session completed! You earned +1.0 Time Credit for teaching ${sess.partnerName}.`);
      }
    } else {
      // Direct barter: both taught and learned 0.5 - 1.0 hours
      setPersonas((prev) =>
        prev.map((p) => {
          if (p.id === currentPersonaId || p.id === sess.partnerId) {
            return {
              ...p,
              hoursTaught: p.hoursTaught + 0.5,
              hoursLearned: p.hoursLearned + 0.5,
            };
          }
          return p;
        })
      );

      const barterTx: TimeBankTransaction = {
        id: `tx_${Date.now()}`,
        date: today,
        amount: 0.0,
        type: 'earned',
        description: `Completed mutual 1-to-1 barter with ${sess.partnerName} (${sess.skillYouTeach} <-> ${sess.skillYouLearn})`,
        counterpartyId: sess.partnerId,
        counterpartyName: sess.partnerName,
        sessionId: sess.id,
        status: 'completed',
      };

      setTransactions((prev) => [barterTx, ...prev]);
      showToast(`Reciprocal barter completed with ${sess.partnerName}! Hours logged to community history.`);
    }
  };

  const handleEndorsePartner = (sessionId: string, partnerName: string, skill: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, userEndorsed: true } : s))
    );

    setPersonas((prev) =>
      prev.map((p) => {
        if (p.name === partnerName) {
          const existingEndorsement = p.endorsements.find((e) => e.skill === skill);
          const updatedEndorsements = existingEndorsement
            ? p.endorsements.map((e) => (e.skill === skill ? { ...e, count: e.count + 1 } : e))
            : [...p.endorsements, { skill, count: 1 }];

          return {
            ...p,
            reviewCount: p.reviewCount + 1,
            endorsements: updatedEndorsements,
          };
        }
        return p;
      })
    );

    showToast(`Submitted skill endorsement for ${partnerName}!`);
  };

  const handleOpenChatWithPartner = (partner: UserPersona) => {
    setActivePartnerToChat(partner);
    setActiveTab('chat');
  };

  const handleOpenChatByPartnerId = (partnerId: string) => {
    const found = personas.find((p) => p.id === partnerId);
    if (found) {
      handleOpenChatWithPartner(found);
    } else {
      setActiveTab('chat');
    }
  };

  // Notification actions
  const handleMarkNotificationAsRead = (id: string) => {
    markNotificationAsRead(currentPersonaId, id);
  };

  const handleMarkAllNotificationsAsRead = () => {
    markAllNotificationsAsRead(currentPersonaId);
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(currentPersonaId, id);
  };

  const handleClearAllNotifications = () => {
    clearAllNotifications(currentPersonaId);
  };

  const handleNavigateFromNotification = (
    tab: 'chat' | 'swaps' | 'timebank' | 'matches' | 'profile',
    targetId?: string
  ) => {
    if (tab === 'chat') {
      if (targetId) {
        const found = personas.find((p) => p.id === targetId);
        if (found) {
          setActivePartnerToChat(found);
        }
      }
      setActiveTab('chat');
    } else if (tab === 'swaps') {
      setActiveTab('swaps');
    } else if (tab === 'timebank') {
      setActiveTab('timebank');
    } else {
      setActiveTab(tab);
    }
  };

  const scheduledSwapsCount = sessions.filter((s) => s.status === 'scheduled').length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-stone-900 border border-amber-500/50 text-stone-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentPersona={currentPersona}
        allPersonas={personas}
        onSelectPersona={handleSelectPersona}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTimeBankModal={() => setActiveTab('timebank')}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        scheduledSwapsCount={scheduledSwapsCount}
        notifications={notifications}
        unreadNotificationsCount={unreadNotificationsCount}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onDeleteNotification={handleDeleteNotification}
        onClearAllNotifications={handleClearAllNotifications}
        onNavigateTab={handleNavigateFromNotification}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'matches' && (
          <MatchFinder
            currentPersona={currentPersona}
            candidates={personas}
            onSelectCandidateForAnalysis={(cand) => setSelectedPartnerForAnalysis(cand)}
            onSelectCandidateForSwap={(cand) => setSelectedPartnerForSwap(cand)}
            onSelectCandidateForCurriculum={(cand) => setSelectedPartnerForCurriculum(cand)}
            onOpenChat={handleOpenChatWithPartner}
          />
        )}

        {activeTab === 'chat' && (
          <ChatView
            currentPersona={currentPersona}
            allPersonas={personas}
            activePartnerToChat={activePartnerToChat}
            onOpenSwapModal={(partner) => setSelectedPartnerForSwap(partner)}
            onViewPartnerProfile={(partner) => setSelectedPartnerForAnalysis(partner)}
            onClearActivePartner={() => setActivePartnerToChat(null)}
          />
        )}

        {activeTab === 'timebank' && (
          <TimeBankLedger
            currentPersona={currentPersona}
            transactions={transactions}
            onClaimCommunityGrant={handleClaimCommunityGrant}
            onPayItForward={handlePayItForward}
            communityPoolHours={communityPoolHours}
          />
        )}

        {activeTab === 'swaps' && (
          <ActiveSwapsView
            sessions={sessions}
            currentPersona={currentPersona}
            onCompleteSession={handleCompleteSession}
            onEndorsePartner={handleEndorsePartner}
            onOpenNewSwap={() => setActiveTab('matches')}
            onOpenChat={handleOpenChatByPartnerId}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            currentPersona={currentPersona}
            onUpdatePersona={handleUpdatePersona}
            allPersonas={personas}
            onSelectPersona={handleSelectPersona}
            onOpenChat={handleOpenChatWithPartner}
          />
        )}
      </main>

      {/* Modals */}
      {selectedPartnerForAnalysis && (
        <PartnerDetailModal
          partner={selectedPartnerForAnalysis}
          currentPersona={currentPersona}
          onClose={() => setSelectedPartnerForAnalysis(null)}
          onOpenSwapModal={(partner) => setSelectedPartnerForSwap(partner)}
          onOpenCurriculumModal={(partner) => setSelectedPartnerForCurriculum(partner)}
          onOpenChat={handleOpenChatWithPartner}
        />
      )}

      {selectedPartnerForSwap && (
        <NewSwapModal
          partner={selectedPartnerForSwap}
          currentPersona={currentPersona}
          onClose={() => setSelectedPartnerForSwap(null)}
          onBookSwap={handleBookSwap}
        />
      )}

      {selectedPartnerForCurriculum && (
        <CurriculumModal
          partner={selectedPartnerForCurriculum}
          currentPersona={currentPersona}
          onClose={() => setSelectedPartnerForCurriculum(null)}
          onBookFromSyllabus={(partner) => setSelectedPartnerForSwap(partner)}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-stone-850 bg-stone-950 py-6 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-300">SkillBank</span>
            <span>•</span>
            <span>Moneyless Knowledge Economy</span>
            <span>•</span>
            <span className="text-amber-400 font-medium">1 Hour = 1 Hour</span>
          </div>
          <p className="text-stone-400">
            Powered by AI Matchmaking & Collaborative Time-Banking.
          </p>
        </div>
      </footer>
    </div>
  );
}
