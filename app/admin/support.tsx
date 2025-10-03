import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  MessageSquare,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageCircle,
} from "lucide-react-native";
import { useAdmin, type SupportTicket } from "@/hooks/admin-store";

export default function AdminSupportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { supportTickets, updateTicketStatus, language } = useAdmin();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "in_progress" | "resolved" | "closed">("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || ticket.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleStatusChange = useCallback(async (ticket: SupportTicket, newStatus: SupportTicket["status"]) => {
    await updateTicketStatus(ticket.id, newStatus);
    Alert.alert("تم التحديث", "تم تحديث حالة التذكرة بنجاح");
  }, [updateTicketStatus]);

  const handleAddResponse = useCallback(async () => {
    if (!selectedTicket || !adminResponse.trim()) {
      Alert.alert("خطأ", "يرجى إدخال الرد");
      return;
    }

    await updateTicketStatus(selectedTicket.id, "resolved", adminResponse.trim());
    setAdminResponse("");
    setSelectedTicket(null);
    setShowResponseModal(false);
    Alert.alert("تم الإرسال", "تم إرسال الرد وتحديث حالة التذكرة إلى 'محلولة'");
  }, [selectedTicket, adminResponse, updateTicketStatus]);

  const openResponseModal = useCallback((ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setAdminResponse(ticket.adminResponse || "");
    setShowResponseModal(true);
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("ar-SA");
  };

  const getStatusColor = (status: SupportTicket["status"]) => {
    switch (status) {
      case "open": return "#EF4444";
      case "in_progress": return "#F59E0B";
      case "resolved": return "#10B981";
      case "closed": return "#6B7280";
      default: return "#6B7280";
    }
  };

  const getStatusIcon = (status: SupportTicket["status"]) => {
    switch (status) {
      case "open": return <AlertCircle size={16} color="#EF4444" />;
      case "in_progress": return <Clock size={16} color="#F59E0B" />;
      case "resolved": return <CheckCircle size={16} color="#10B981" />;
      case "closed": return <XCircle size={16} color="#6B7280" />;
      default: return <MessageCircle size={16} color="#6B7280" />;
    }
  };

  const getPriorityColor = (priority: SupportTicket["priority"]) => {
    switch (priority) {
      case "high": return "#EF4444";
      case "medium": return "#F59E0B";
      case "low": return "#10B981";
      default: return "#6B7280";
    }
  };

  const texts = {
    ar: {
      title: "الدعم الفني",
      search: "البحث في التذاكر...",
      all: "الكل",
      open: "مفتوح",
      inProgress: "قيد المعالجة",
      resolved: "محلول",
      closed: "مغلق",
      priority: "الأولوية",
      high: "عالية",
      medium: "متوسطة",
      low: "منخفضة",
      createdAt: "تاريخ الإنشاء",
      updatedAt: "آخر تحديث",
      respond: "رد",
      markInProgress: "قيد المعالجة",
      markResolved: "محلول",
      markClosed: "إغلاق",
      adminResponse: "رد المدير",
      sendResponse: "إرسال الرد",
      cancel: "إلغاء",
      send: "إرسال",
      noTickets: "لا توجد تذاكر دعم",
      responseHint: "اكتب ردك هنا...",
    },
    en: {
      title: "Technical Support",
      search: "Search tickets...",
      all: "All",
      open: "Open",
      inProgress: "In Progress",
      resolved: "Resolved",
      closed: "Closed",
      priority: "Priority",
      high: "High",
      medium: "Medium",
      low: "Low",
      createdAt: "Created At",
      updatedAt: "Updated At",
      respond: "Respond",
      markInProgress: "Mark In Progress",
      markResolved: "Mark Resolved",
      markClosed: "Mark Closed",
      adminResponse: "Admin Response",
      sendResponse: "Send Response",
      cancel: "Cancel",
      send: "Send",
      noTickets: "No support tickets",
      responseHint: "Write your response here...",
    }
  };

  const t = texts[language];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t.search}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filters}>
            {[
              { key: "all", label: t.all },
              { key: "open", label: t.open },
              { key: "in_progress", label: t.inProgress },
              { key: "resolved", label: t.resolved },
              { key: "closed", label: t.closed },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  filterStatus === filter.key && styles.filterButtonActive,
                ]}
                onPress={() => setFilterStatus(filter.key as any)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterStatus === filter.key && styles.filterButtonTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Tickets List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredTickets.map((ticket) => (
          <View key={ticket.id} style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketSubject}>{ticket.subject}</Text>
                <View style={styles.ticketMeta}>
                  <User size={14} color="#6B7280" />
                  <Text style={styles.ticketUser}>{ticket.userName}</Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(ticket.priority) + "20" }]}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(ticket.priority) }]}>
                      {ticket.priority === "high" ? t.high : ticket.priority === "medium" ? t.medium : t.low}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.ticketStatus}>
                {getStatusIcon(ticket.status)}
              </View>
            </View>

            <Text style={styles.ticketMessage} numberOfLines={3}>
              {ticket.message}
            </Text>

            {ticket.adminResponse && (
              <View style={styles.adminResponseContainer}>
                <Text style={styles.adminResponseLabel}>{t.adminResponse}:</Text>
                <Text style={styles.adminResponseText}>{ticket.adminResponse}</Text>
              </View>
            )}

            <View style={styles.ticketFooter}>
              <View style={styles.ticketDates}>
                <Text style={styles.ticketDate}>
                  {t.createdAt}: {formatDate(ticket.createdAt)}
                </Text>
                {ticket.updatedAt !== ticket.createdAt && (
                  <Text style={styles.ticketDate}>
                    {t.updatedAt}: {formatDate(ticket.updatedAt)}
                  </Text>
                )}
              </View>
              
              <View style={styles.ticketActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openResponseModal(ticket)}
                >
                  <MessageSquare size={16} color="#4F46E5" />
                  <Text style={styles.actionButtonText}>{t.respond}</Text>
                </TouchableOpacity>

                {ticket.status === "open" && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.progressButton]}
                    onPress={() => handleStatusChange(ticket, "in_progress")}
                  >
                    <Clock size={16} color="#F59E0B" />
                  </TouchableOpacity>
                )}

                {(ticket.status === "open" || ticket.status === "in_progress") && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.resolveButton]}
                    onPress={() => handleStatusChange(ticket, "resolved")}
                  >
                    <CheckCircle size={16} color="#10B981" />
                  </TouchableOpacity>
                )}

                {ticket.status !== "closed" && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.closeButton]}
                    onPress={() => handleStatusChange(ticket, "closed")}
                  >
                    <XCircle size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}

        {filteredTickets.length === 0 && (
          <View style={styles.emptyState}>
            <MessageSquare size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>{t.noTickets}</Text>
          </View>
        )}
      </ScrollView>

      {/* Response Modal */}
      <Modal
        visible={showResponseModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowResponseModal(false);
          setSelectedTicket(null);
          setAdminResponse("");
        }}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowResponseModal(false);
              setSelectedTicket(null);
              setAdminResponse("");
            }}>
              <Text style={styles.modalCancelButton}>{t.cancel}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t.sendResponse}</Text>
            <TouchableOpacity onPress={handleAddResponse}>
              <Text style={styles.modalSendButton}>{t.send}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedTicket && (
              <>
                <View style={styles.ticketSummary}>
                  <Text style={styles.ticketSummaryTitle}>{selectedTicket.subject}</Text>
                  <Text style={styles.ticketSummaryUser}>من: {selectedTicket.userName}</Text>
                  <Text style={styles.ticketSummaryMessage}>{selectedTicket.message}</Text>
                </View>

                <View style={styles.responseInputContainer}>
                  <Text style={styles.responseInputLabel}>{t.adminResponse}</Text>
                  <TextInput
                    style={styles.responseInput}
                    value={adminResponse}
                    onChangeText={setAdminResponse}
                    placeholder={t.responseHint}
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  headerRight: {
    width: 24,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 12,
    paddingLeft: 8,
  },
  filtersContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterButtonActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  ticketCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketSubject: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  ticketMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ticketUser: {
    fontSize: 14,
    color: "#6B7280",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  ticketStatus: {
    marginLeft: 16,
  },
  ticketMessage: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 16,
  },
  adminResponseContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  adminResponseLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#166534",
    marginBottom: 4,
  },
  adminResponseText: {
    fontSize: 14,
    color: "#166534",
    lineHeight: 18,
  },
  ticketFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 16,
  },
  ticketDates: {
    marginBottom: 12,
  },
  ticketDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  ticketActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  progressButton: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
  },
  resolveButton: {
    backgroundColor: "#DCFCE7",
    borderColor: "#BBF7D0",
  },
  closeButton: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  actionButtonText: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "500" as const,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6B7280",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  modalCancelButton: {
    fontSize: 16,
    color: "#6B7280",
  },
  modalSendButton: {
    fontSize: 16,
    color: "#4F46E5",
    fontWeight: "600" as const,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  ticketSummary: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  ticketSummaryTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  ticketSummaryUser: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  ticketSummaryMessage: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  responseInputContainer: {
    marginBottom: 20,
  },
  responseInputLabel: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  responseInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    height: 120,
    textAlignVertical: "top" as const,
  },
});