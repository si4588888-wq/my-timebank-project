import React, { useState, useEffect, useRef } from 'react';
import { UserPersona, Conversation, ChatMessage } from '../types';
import { AffiliateCard } from './AffiliateCard';
import { getRecommendationsForSkills } from '../lib/affiliateService';
import {
  subscribeToUserConversations,
  subscribeToConversationMessages,
  sendDirectChatMessage,
  ensureConversationExists,
  getConversationId,
} from '../lib/chatService';
import {
  MessageSquare,
  Send,
  Search,
  ArrowRightLeft,
  Clock,
  Sparkles,
  Calendar,
  CheckCheck,
  User as UserIcon,
  ChevronLeft,
  Info,
  Award,
  BookOpen,
  Crown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ChatViewProps {
  currentPersona: UserPersona;
  allPersonas: UserPersona[];
  activePartnerToChat?: UserPersona | null;
  onOpenSwapModal: (partner: UserPersona) => void;
  onViewPartnerProfile?: (partner: UserPersona) => void;
  onClearActivePartner?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentPersona,
  allPersonas,
  activePartnerToChat,
  onOpenSwapModal,
  onViewPartnerProfile,
  onClearActivePartner,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);
  const [showLearningResources, setShowLearningResources] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Subscribe to conversations for the current persona
  useEffect(() => {
    const unsubscribe = subscribeToUserConversations(currentPersona.id, (updated) => {
      setConversations(updated);
    });
    return () => unsubscribe();
  }, [currentPersona.id]);

  // 2. Handle pre-selected partner from MatchFinder or Profile
  useEffect(() => {
    if (activePartnerToChat && activePartnerToChat.id !== currentPersona.id) {
      const conv = ensureConversationExists(currentPersona, activePartnerToChat);
      setSelectedConversationId(conv.id);
      if (onClearActivePartner) {
        onClearActivePartner();
      }
    } else if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [activePartnerToChat, currentPersona, conversations]);

  // 3. Fallback selection if none selected
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [selectedConversationId, conversations]);

  // 4. Subscribe to real-time messages for the active conversation
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToConversationMessages(selectedConversationId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedConversationId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Identify partner in the selected conversation
  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);
  const partnerId = selectedConversation?.participantIds.find((id) => id !== currentPersona.id);
  const partnerPersona = allPersonas.find((p) => p.id === partnerId);
  const partnerDetails = partnerId && selectedConversation?.participantDetails?.[partnerId];

  // Contextual affiliate suggestions for current conversation
  const partnerSkills = partnerPersona ? partnerPersona.skillsOffered.map((s) => s.name) : [];
  const userDesiredSkills = currentPersona.skillsDesired.map((s) => s.name);
  const userOfferedSkills = currentPersona.skillsOffered.map((s) => s.name);
  const chatAffiliateRecs = getRecommendationsForSkills(
    [...partnerSkills, ...userDesiredSkills, ...userOfferedSkills],
    2
  );

  // Candidates available to start a new chat with
  const availablePartnersForNewChat = allPersonas.filter(
    (p) => p.id !== currentPersona.id
  );

  const handleStartChatWithPersona = (partner: UserPersona) => {
    const conv = ensureConversationExists(currentPersona, partner);
    setSelectedConversationId(conv.id);
    setShowNewChatDropdown(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedConversationId || !partnerId) return;

    const partner = partnerPersona || {
      id: partnerId,
      name: partnerDetails?.name || 'Community Member',
      avatar: partnerDetails?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=member',
      headline: partnerDetails?.headline || 'SkillBank Member',
      location: 'Community Hub',
      bio: '',
      timeBankBalance: 2.0,
      hoursTaught: 0,
      hoursLearned: 0,
      rating: 5.0,
      reviewCount: 1,
      skillsOffered: [],
      skillsDesired: [],
      availability: ['Flexible'],
      languages: ['English'],
      endorsements: [],
    };

    const textToSend = inputText;
    setInputText('');
    setIsSending(true);

    try {
      await sendDirectChatMessage({
        conversationId: selectedConversationId,
        sender: currentPersona,
        recipient: partner,
        text: textToSend,
      });
    } catch (err) {
      console.error('Failed to send chat message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Quick discussion starter chips
  const quickPrompts = [
    "👋 Hi! I'd love to swap skills with you.",
    "📅 What days and times work best for your schedule?",
    "⏳ Are you interested in a 1-hour direct reciprocal barter?",
    "🤝 Can we discuss the syllabus before booking a session?",
  ];

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const otherId = c.participantIds.find((id) => id !== currentPersona.id);
    const otherDetails = otherId ? c.participantDetails?.[otherId] : null;
    return (
      otherDetails?.name?.toLowerCase().includes(query) ||
      c.lastMessage?.toLowerCase().includes(query)
    );
  });

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[720px] max-h-[82vh]">
      {/* ========================================================================= */}
      {/* Left Sidebar: Conversations & Active Threads */}
      {/* ========================================================================= */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-stone-800 bg-stone-900/90 ${
        selectedConversationId ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Direct Messages
            </h2>
            <p className="text-[11px] text-stone-400">
              Discuss barter details & schedule swaps
            </p>
          </div>

          <div className="relative">
            <button
              id="new-chat-btn"
              onClick={() => setShowNewChatDropdown(!showNewChatDropdown)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 transition-colors shadow-sm"
              title="Start a new message with any community member"
            >
              + New Chat
            </button>

            {showNewChatDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowNewChatDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-64 max-h-72 overflow-y-auto bg-stone-850 border border-stone-750 rounded-2xl shadow-2xl p-2 z-40 space-y-1">
                  <div className="px-2 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider border-b border-stone-750">
                    Select Member to Message
                  </div>
                  {availablePartnersForNewChat.map((partner) => (
                    <button
                      key={partner.id}
                      onClick={() => handleStartChatWithPersona(partner)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-stone-800 text-left transition-colors"
                    >
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        className="w-8 h-8 rounded-lg object-cover border border-stone-700"
                      />
                      <div className="truncate flex-1">
                        <div className="text-xs font-semibold text-stone-200 truncate">
                          {partner.name}
                        </div>
                        <div className="text-[10px] text-stone-400 truncate">
                          {partner.headline}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search Conversations */}
        <div className="p-3 border-b border-stone-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-850 border border-stone-750 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-850">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-stone-600 mx-auto stroke-1" />
              <p className="text-xs text-stone-400 font-medium">No conversations found</p>
              <p className="text-[11px] text-stone-500">
                Click "+ New Chat" above or "Chat" on any match card to start a discussion.
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const otherId = conv.participantIds.find((id) => id !== currentPersona.id);
              const other = otherId ? conv.participantDetails?.[otherId] : null;
              const isSelected = conv.id === selectedConversationId;

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`w-full p-3.5 flex items-start gap-3 text-left transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-l-4 border-amber-500 text-stone-100'
                      : 'hover:bg-stone-850/60 text-stone-300'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={other?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=member'}
                      alt={other?.name || 'Partner'}
                      className="w-11 h-11 rounded-2xl object-cover border border-stone-700"
                    />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-stone-900 absolute -bottom-0.5 -right-0.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-semibold text-xs text-stone-200 truncate">
                        {other?.name || 'Community Member'}
                      </span>
                      <span className="text-[10px] text-stone-500 whitespace-nowrap">
                        {conv.lastMessageAt || 'Active'}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-400 truncate leading-relaxed">
                      {conv.lastSenderId === currentPersona.id && (
                        <span className="text-amber-400/80 mr-1">You:</span>
                      )}
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Current Persona Footer Badge */}
        <div className="p-3 bg-stone-950/70 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <img
              src={currentPersona.avatar}
              alt={currentPersona.name}
              className="w-6 h-6 rounded-lg object-cover border border-stone-700"
            />
            <span className="truncate max-w-[130px] font-medium text-stone-300">
              {currentPersona.name.split(' ')[0]}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
            {currentPersona.timeBankBalance.toFixed(1)} TC
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Right Pane: Active Chat Conversation Thread */}
      {/* ========================================================================= */}
      <div className={`flex-1 flex flex-col bg-stone-900 ${
        !selectedConversationId ? 'hidden md:flex' : 'flex'
      }`}>
        {selectedConversationId && partnerDetails ? (
          <>
            {/* Active Thread Header */}
            <div className="p-3.5 sm:p-4 border-b border-stone-800 bg-stone-900/95 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Back button for mobile */}
                <button
                  onClick={() => setSelectedConversationId(null)}
                  className="md:hidden p-1.5 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
                  title="Back to conversations"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="relative flex-shrink-0">
                  <img
                    src={partnerDetails.avatar}
                    alt={partnerDetails.name}
                    className="w-10 h-10 rounded-2xl object-cover border-2 border-amber-500/40"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-stone-900 absolute -bottom-0.5 -right-0.5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-stone-100 truncate">
                      {partnerDetails.name}
                    </h3>
                    {partnerPersona?.isProMember && (
                      <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black text-[9px] flex items-center gap-0.5 shadow-sm">
                        <Crown className="w-2.5 h-2.5 fill-stone-950" />
                        PRO
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium hidden sm:inline-flex">
                      Online in Community
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 truncate">
                    {partnerDetails.headline || 'SkillBank Barter Partner'}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Schedule Swap & Profile */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {chatAffiliateRecs.length > 0 && (
                  <button
                    onClick={() => setShowLearningResources(!showLearningResources)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      showLearningResources
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-stone-800 hover:bg-stone-750 text-stone-300 border-stone-700'
                    }`}
                    title="Curated affiliate courses and gear for this barter"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Learning Tools</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-900 text-amber-400 font-bold">
                      {chatAffiliateRecs.length}
                    </span>
                    {showLearningResources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}

                {partnerPersona && (
                  <button
                    id="schedule-swap-from-chat-btn"
                    onClick={() => onOpenSwapModal(partnerPersona)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    title="Schedule a 1:1 barter or Time Credit session with this partner"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Schedule</span> Swap
                  </button>
                )}

                {partnerPersona && onViewPartnerProfile && (
                  <button
                    onClick={() => onViewPartnerProfile(partnerPersona)}
                    className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-stone-100 border border-stone-700 transition-colors"
                    title="View full skills profile"
                  >
                    <UserIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Contextual Affiliate Resources Accordion / Banner */}
            {showLearningResources && chatAffiliateRecs.length > 0 && (
              <div className="p-3.5 bg-stone-850/95 border-b border-amber-500/40 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Recommended Courses & Tools for this Barter
                  </span>
                  <button
                    onClick={() => setShowLearningResources(false)}
                    className="text-[11px] text-stone-400 hover:text-stone-200"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {chatAffiliateRecs.map((rec) => (
                    <AffiliateCard
                      key={rec.id}
                      recommendation={rec}
                      currentUserId={currentPersona.id}
                      location="chat_suggestion"
                      compact={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Discussion Context Banner */}
            {partnerPersona && (
              <div className="px-4 py-2 bg-stone-850/60 border-b border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-stone-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] text-stone-400">Teaches:</span>
                  <div className="flex items-center gap-1">
                    {partnerPersona.skillsOffered.slice(0, 2).map((s) => (
                      <span
                        key={s.id}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-stone-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Time Credit Balance: <strong className="text-amber-400">{partnerPersona.timeBankBalance.toFixed(1)} TC</strong></span>
                </div>
              </div>
            )}

            {/* Messages Thread Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-200">
                      Start your discussion with {partnerDetails.name.split(' ')[0]}
                    </h4>
                    <p className="text-xs text-stone-400 max-w-sm mt-1">
                      Discuss schedule availability, exchange format, or learning objectives before scheduling a swap session.
                    </p>
                  </div>

                  {/* Suggestion Prompt Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 max-w-md w-full">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputText(prompt)}
                        className="p-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-750 text-left text-xs text-stone-300 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {/* Contextual Affiliate Course / Gear Suggestions in Empty Chat */}
                  {chatAffiliateRecs.length > 0 && (
                    <div className="pt-3 max-w-md w-full text-left space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-stone-400">
                        <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                          <BookOpen className="w-3 h-3 text-amber-400" />
                          Recommended Resources to Prepare:
                        </span>
                        <span className="text-[10px] text-stone-500">Partner Links</span>
                      </div>
                      <div className="space-y-2">
                        {chatAffiliateRecs.map((rec) => (
                          <AffiliateCard
                            key={rec.id}
                            recommendation={rec}
                            currentUserId={currentPersona.id}
                            location="chat_suggestion"
                            compact={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentPersona.id;
                  const timeStr = formatMessageTime(msg.createdAt);

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <img
                          src={msg.senderAvatar || partnerDetails.avatar}
                          alt={msg.senderName}
                          className="w-7 h-7 rounded-xl object-cover border border-stone-700 flex-shrink-0"
                        />
                      )}

                      <div className={`max-w-[80%] sm:max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                        {!isMe && (
                          <span className="text-[10px] text-stone-400 font-medium px-1 block">
                            {msg.senderName}
                          </span>
                        )}

                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-amber-500 text-stone-950 font-medium rounded-br-none'
                              : 'bg-stone-800 text-stone-100 border border-stone-700 rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>

                        <div className={`flex items-center gap-1 px-1 text-[10px] text-stone-500 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span>{timeStr}</span>
                          {isMe && <CheckCheck className="w-3 h-3 text-amber-400" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Discussion Prompt Quick-Select (Small Pill Bar) */}
            <div className="px-4 py-2 border-t border-stone-800/80 bg-stone-850/40 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
              <span className="text-[10px] text-stone-500 whitespace-nowrap uppercase tracking-wider font-semibold">
                Quick Prompts:
              </span>
              {quickPrompts.slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(prompt)}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 text-[11px] whitespace-nowrap border border-stone-700 transition-colors flex-shrink-0"
                >
                  {prompt.length > 34 ? `${prompt.substring(0, 34)}...` : prompt}
                </button>
              ))}
            </div>

            {/* Message Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 bg-stone-900 border-t border-stone-800 flex items-center gap-2"
            >
              <input
                id="chat-message-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${partnerDetails.name.split(' ')[0]} to arrange swap...`}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-850 border border-stone-700 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />

              <button
                id="send-chat-message-btn"
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 shadow-inner">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-stone-200">
              Select a conversation to start chatting
            </h3>
            <p className="text-xs text-stone-400 max-w-sm">
              Connect directly with mentors and learners, agree on reciprocal swap dates, and discuss curriculum before scheduling.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
