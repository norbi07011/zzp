/**
 * =====================================================
 * CLEANING MESSAGES PAGE - Messages List
 * =====================================================
 * Features: Recent messages, grouped by conversation, unread badges
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import {
  PageContainer,
  PageHeader,
  ContentCard,
} from "../../../components/common/PageContainer";
import cleaningCompanyService from "../../services/cleaningCompanyService";

interface MessageWithProfiles {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject?: string;
  content: string;
  is_read?: boolean;
  read?: boolean | null;
  read_at?: string | null;
  created_at: string | null;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  } | null;
  recipient?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  } | null;
}

interface ConversationGroup {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  messages: MessageWithProfiles[];
  unreadCount: number;
  lastMessage: MessageWithProfiles;
}

export const CleaningMessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<MessageWithProfiles[]>([]);
  const [conversations, setConversations] = useState<ConversationGroup[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadMessages();
    }
  }, [user?.id]);

  const loadMessages = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      console.log('📬 CLEANING MESSAGES - Loading for user:', {
        user_id: user.id,
        role: user.role
      });

      // Get company profile
      const company = await cleaningCompanyService.getMyCleaningCompany(
        user.id
      );
      
      console.log('📬 CLEANING MESSAGES - Company result:', company ? {
        id: company.id,
        company_name: company.company_name,
        profile_id: company.profile_id
      } : 'NULL - no company found!');

      if (!company) {
        console.warn('⚠️ No cleaning company profile found - redirecting to dashboard');
        navigate("/cleaning/dashboard");
        return;
      }

      // Load messages
      console.log('📬 CLEANING MESSAGES - Loading messages...');
      const messagesData = await cleaningCompanyService.getRecentMessages(
        user.id,
        50
      );
      
      console.log('📬 CLEANING MESSAGES - Messages loaded:', messagesData.length);
      setMessages(messagesData as any);

      // Group by conversation partner
      groupMessagesByConversation(messagesData as any);
    } catch (err) {
      console.error("❌ Error loading messages:", err);
      alert('Błąd ładowania wiadomości: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const groupMessagesByConversation = (msgs: MessageWithProfiles[]) => {
    const grouped = new Map<string, ConversationGroup>();

    msgs.forEach((msg) => {
      // Determine conversation partner
      const isCurrentUserSender = msg.sender_id === user?.id;
      const partnerId = isCurrentUserSender ? msg.recipient_id : msg.sender_id;
      const partnerName = isCurrentUserSender
        ? msg.recipient?.full_name || "Unknown"
        : msg.sender?.full_name || "Unknown";
      const partnerAvatar = isCurrentUserSender
        ? msg.recipient?.avatar_url
        : msg.sender?.avatar_url;

      // Get or create conversation group
      let group = grouped.get(partnerId);
      if (!group) {
        group = {
          partnerId,
          partnerName,
          partnerAvatar,
          messages: [],
          unreadCount: 0,
          lastMessage: msg,
        };
        grouped.set(partnerId, group);
      }

      // Add message to group
      group.messages.push(msg);

      // Count unread (only messages sent TO current user)
      if (
        !isCurrentUserSender &&
        (msg.is_read === false || msg.read === false)
      ) {
        group.unreadCount++;
      }

      // Update last message (most recent)
      const msgDate = msg.created_at ? new Date(msg.created_at).getTime() : 0;
      const groupDate = group.lastMessage.created_at
        ? new Date(group.lastMessage.created_at).getTime()
        : 0;
      if (msgDate > groupDate) {
        group.lastMessage = msg;
      }
    });

    // Convert to array and sort by last message time
    const conversationsArray = Array.from(grouped.values()).sort((a, b) => {
      const aTime = a.lastMessage.created_at
        ? new Date(a.lastMessage.created_at).getTime()
        : 0;
      const bTime = b.lastMessage.created_at
        ? new Date(b.lastMessage.created_at).getTime()
        : 0;
      return bTime - aTime;
    });

    setConversations(conversationsArray);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Teraz";
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours}h temu`;
    if (diffDays < 7) return `${diffDays} dni temu`;

    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const truncateText = (text: string, maxLength: number = 80): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleConversationClick = (partnerId: string) => {
    // Navigate to full conversation view (Task #13 will add this route)
    navigate(`/messages/${partnerId}`);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie wiadomości...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        icon="💬"
        title="Wiadomości"
        subtitle={`${conversations.length} ${
          conversations.length === 1 ? "konwersacja" : "konwersacji"
        }`}
        actionButton={
          <button
            onClick={() => navigate("/cleaning/dashboard")}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 font-medium border border-blue-200"
          >
            ← Powrót do dashboard
          </button>
        }
      />

      <ContentCard>
        {conversations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-2 text-6xl">💬</p>
            <p className="text-gray-600 font-medium text-lg mb-2">
              Brak wiadomości
            </p>
            <p className="text-sm text-gray-500">
              Twoje konwersacje z klientami pojawią się tutaj
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map((conv) => {
              const isCurrentUserSender =
                conv.lastMessage.sender_id === user?.id;
              const lastMessagePreview = isCurrentUserSender
                ? `Ty: ${conv.lastMessage.content}`
                : conv.lastMessage.content;

              return (
                <div
                  key={conv.partnerId}
                  onClick={() => handleConversationClick(conv.partnerId)}
                  className={`
                    p-4 hover:bg-gray-50 cursor-pointer transition-colors
                    ${conv.unreadCount > 0 ? "bg-blue-50" : ""}
                  `}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {conv.partnerAvatar ? (
                        <img
                          src={conv.partnerAvatar}
                          alt={conv.partnerName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {conv.partnerName[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3
                          className={`font-semibold ${
                            conv.unreadCount > 0
                              ? "text-blue-900"
                              : "text-gray-900"
                          }`}
                        >
                          {conv.partnerName}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatDate(conv.lastMessage.created_at || "")}
                        </span>
                      </div>

                      {/* Subject */}
                      {conv.lastMessage.subject && (
                        <p className="text-sm text-gray-700 font-medium mb-1">
                          {conv.lastMessage.subject}
                        </p>
                      )}

                      {/* Last message preview */}
                      <p
                        className={`text-sm ${
                          conv.unreadCount > 0
                            ? "text-blue-800 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        {truncateText(lastMessagePreview)}
                      </p>

                      {/* Message count and unread badge */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500">
                          {conv.messages.length}{" "}
                          {conv.messages.length === 1
                            ? "wiadomość"
                            : "wiadomości"}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {conv.unreadCount} nowe
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ContentCard>
    </PageContainer>
  );
};

export default CleaningMessagesPage;
