export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface SkillOffering {
  id: string;
  name: string;
  category: 'Culinary' | 'Technology' | 'Languages' | 'Arts & Crafts' | 'Music' | 'Life & Wellness' | 'Trades & DIY';
  level: ProficiencyLevel;
  description: string;
}

export interface SkillDesire {
  id: string;
  name: string;
  category: 'Culinary' | 'Technology' | 'Languages' | 'Arts & Crafts' | 'Music' | 'Life & Wellness' | 'Trades & DIY';
  targetLevel: ProficiencyLevel;
  learningGoal: string;
}

export interface UserPersona {
  id: string;
  name: string;
  headline: string;
  avatar: string;
  location: string;
  bio: string;
  timeBankBalance: number; // in hours (1.0 = 1 hour)
  hoursTaught: number;
  hoursLearned: number;
  rating: number;
  reviewCount: number;
  skillsOffered: SkillOffering[];
  skillsDesired: SkillDesire[];
  availability: string[];
  languages: string[];
  endorsements: { skill: string; count: number }[];
  isProMember?: boolean;
  proPlan?: 'pro_monthly' | 'pro_annual' | null;
  proMemberSince?: string;
  unlimitedSwaps?: boolean;
}

export type TransactionType = 'earned' | 'spent' | 'escrow_hold' | 'escrow_release' | 'community_grant';

export interface TimeBankTransaction {
  id: string;
  date: string;
  amount: number; // +1.0 or -1.0
  type: TransactionType;
  description: string;
  counterpartyId?: string;
  counterpartyName?: string;
  relatedSkill?: string;
  sessionId?: string;
  status: 'completed' | 'in_escrow';
}

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface SwapSession {
  id: string;
  title: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  role: 'teacher' | 'learner' | 'mutual_barter';
  skillYouTeach?: string;
  skillYouLearn?: string;
  exchangeType: 'direct_barter' | 'time_credit';
  durationHours: number;
  scheduledDate: string;
  timeSlot: string;
  status: SessionStatus;
  meetingLink?: string;
  agendaNotes: string;
  escrowCredits: number;
  userEndorsed?: boolean;
}

export interface AIMatchAnalysis {
  compatibilityScore: number;
  matchType: 'direct_barter' | 'time_bank_exchange' | 'potential_triangle';
  headline: string;
  whyItWorks: string[];
  learningSynergy: string;
  barterRecommendation: string;
  potentialFrictionPoints: string[];
  suggestedIcebreaker: string;
}

export interface CurriculumSession {
  sessionNumber: number;
  title: string;
  duration: string;
  part1Focus: {
    teacher: string;
    topic: string;
    keyTakeaway: string;
  };
  part2Focus: {
    teacher: string;
    topic: string;
    keyTakeaway: string;
  };
  suggestedPractice: string;
}

export interface AICurriculum {
  curriculumTitle: string;
  overview: string;
  sessions: CurriculumSession[];
  timeBankEquivalenceNote: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp?: any;
  createdAt: string; // ISO string
  isSystemNotification?: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantDetails: Record<string, {
    name: string;
    avatar: string;
    headline?: string;
  }>;
  lastMessage: string;
  lastSenderId: string;
  updatedAt: any;
  lastMessageAt?: string;
  unreadCount?: Record<string, number>;
}

export type NotificationType =
  | 'message'
  | 'proposal'
  | 'session_update'
  | 'session_completed'
  | 'timebank_credit';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  read: boolean;
  createdAt: string; // ISO format string
  timestamp?: any;
  linkTab?: 'chat' | 'swaps' | 'timebank' | 'matches' | 'profile';
  linkTargetId?: string; // e.g. partnerId or sessionId
  actionLabel?: string;
}

export type AffiliatePlatform =
  | 'Coursera'
  | 'Udemy'
  | 'Amazon Gear'
  | 'Skillshare'
  | 'MasterClass'
  | 'O\'Reilly';

export interface AffiliateRecommendation {
  id: string;
  title: string;
  provider: AffiliatePlatform;
  category: string;
  matchingSkills: string[];
  description: string;
  rating: number;
  reviewCount: number;
  priceDisplay: string;
  badge?: string; // e.g. 'Bestseller', 'Top Rated', 'Essential Starter Kit'
  affiliateUrl: string;
  commissionNotice?: string;
  image?: string;
}

export interface AffiliateClickEvent {
  id: string;
  userId: string;
  affiliateId: string;
  title: string;
  provider: AffiliatePlatform;
  location: 'profile_view' | 'chat_suggestion' | 'syllabus_generator';
  timestamp: string;
}
