import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  Crown, 
  Clock, 
  Check, 
  X, 
  Eye, 
  Calendar, 
  DollarSign,
  CreditCard,
  MessageCircle,
  ArrowLeft,
  Filter,
  Search
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useExchange } from "@/hooks/exchange-store";


interface SubscriptionRequest {
  id: string;
  packageId: string;
  packageName: string;
  duration: string;
  price: number;
  currency: string;
  paymentMethod: string;
  paymentProof: string;
  customerNotes: string;
  customerPhone?: string;
  paymentImage?: string | null;
  status: "pending_approval" | "approved" | "rejected";
  requestDate: number;
  userId: string;
  adminNotes?: string;
  processedDate?: number;
  processedBy?: string;
}

type FilterStatus = "all" | "pending_approval" | "approved" | "rejected";

export default function AdminSubscriptionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activatePremium, deactivatePremium } = useExchange();
  
  const [subscriptionRequests, setSubscriptionRequests] = useState<SubscriptionRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SubscriptionRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFreeSubscriptionModal, setShowFreeSubscriptionModal] = useState(false);
  const [freeSubscriptionUserId, setFreeSubscriptionUserId] = useState("");
  const [freeSubscriptionDuration, setFreeSubscriptionDuration] = useState("30");

  // Load subscription requests
  useEffect(() => {
    loadSubscriptionRequests();
  }, []);

  // Filter requests based on status and search
  useEffect(() => {
    let filtered = subscriptionRequests;
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(req => req.status === filterStatus);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req => 
        req.packageName.toLowerCase().includes(query) ||
        req.paymentMethod.toLowerCase().includes(query) ||
        req.userId.toLowerCase().includes(query) ||
        req.id.toLowerCase().includes(query)
      );
    }
    
    // Sort by request date (newest first)
    filtered.sort((a, b) => b.requestDate - a.requestDate);
    
    setFilteredRequests(filtered);
  }, [subscriptionRequests, filterStatus, searchQuery]);

  const loadSubscriptionRequests = async () => {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const stored = await AsyncStorage.default.getItem('@subscription_requests');
      if (stored) {
        const requests = JSON.parse(stored);
        setSubscriptionRequests(requests);
      }
    } catch (error) {
      console.error("Error loading subscription requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (request: SubscriptionRequest) => {
    if (!request?.id?.trim()) {
      Alert.alert("Error", "Invalid request selected.");
      return;
    }
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleProcessRequest = (request: SubscriptionRequest) => {
    if (!request?.id?.trim() || request.status !== "pending_approval") {
      Alert.alert("Error", "Invalid request or request already processed.");
      return;
    }
    setSelectedRequest(request);
    setAdminNotes("");
    setShowProcessModal(true);
  };

  const processSubscriptionRequest = async (action: "approve" | "reject") => {
    if (!selectedRequest) return;

    const updatedRequest: SubscriptionRequest = {
      ...selectedRequest,
      status: action === "approve" ? "approved" : "rejected",
      adminNotes: adminNotes.trim(),
      processedDate: Date.now(),
      processedBy: "Admin", // In real app, get from auth
    };

    try {
      const updatedRequests = subscriptionRequests.map(req =>
        req.id === selectedRequest.id ? updatedRequest : req
      );
      
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.setItem('@subscription_requests', JSON.stringify(updatedRequests));
      setSubscriptionRequests(updatedRequests);
      
      // If approved, activate premium for the user
      if (action === "approve") {
        await activatePremiumForUser(selectedRequest);
      }
      
      setShowProcessModal(false);
      setSelectedRequest(null);
      setAdminNotes("");
      
      Alert.alert(
        "Request Processed",
        `Subscription request has been ${action === "approve" ? "approved" : "rejected"} successfully.`
      );
    } catch (error) {
      console.error("Error processing subscription request:", error);
      Alert.alert("Error", "Failed to process subscription request. Please try again.");
    }
  };

  const activatePremiumForUser = async (request: SubscriptionRequest) => {
    try {
      // Calculate expiry date based on package duration
      let durationInDays = 30; // Default monthly
      if (request.duration.includes("3")) durationInDays = 90; // Quarterly
      if (request.duration.includes("12")) durationInDays = 365; // Yearly
      
      // Use the activatePremium function from exchange store
      await activatePremium(durationInDays);
      
      console.log(`Premium activated for user ${request.userId} for ${durationInDays} days`);
    } catch (error) {
      console.error("Error activating premium:", error);
    }
  };

  const handleActivateFreeSubscription = () => {
    setFreeSubscriptionUserId("");
    setFreeSubscriptionDuration("30");
    setShowFreeSubscriptionModal(true);
  };

  const activateFreeSubscription = async () => {
    if (!freeSubscriptionUserId.trim() || !freeSubscriptionDuration.trim()) {
      Alert.alert("Missing Information", "Please enter user ID and duration.");
      return;
    }

    const durationInDays = parseInt(freeSubscriptionDuration);
    if (isNaN(durationInDays) || durationInDays <= 0) {
      Alert.alert("Invalid Duration", "Please enter a valid number of days.");
      return;
    }

    try {
      // Create a free subscription record
      const freeSubscriptionRequest: SubscriptionRequest = {
        id: Date.now().toString(),
        packageId: "free",
        packageName: `Free Premium (${durationInDays} days)`,
        duration: `${durationInDays} days`,
        price: 0,
        currency: "USD",
        paymentMethod: "Admin Granted",
        paymentProof: "Free subscription granted by admin",
        customerNotes: "Free subscription activated by admin",
        customerPhone: "",
        paymentImage: null,
        status: "approved" as const,
        requestDate: Date.now(),
        userId: freeSubscriptionUserId.trim(),
        adminNotes: `Free ${durationInDays}-day subscription granted by admin`,
        processedDate: Date.now(),
        processedBy: "Admin",
      };

      // Add to subscription requests
      const updatedRequests = [...subscriptionRequests, freeSubscriptionRequest];
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.setItem('@subscription_requests', JSON.stringify(updatedRequests));
      setSubscriptionRequests(updatedRequests);

      // Activate premium for the user using the exchange store function
      await activatePremium(durationInDays);

      setShowFreeSubscriptionModal(false);
      const expiryDate = Date.now() + (durationInDays * 24 * 60 * 60 * 1000);
      Alert.alert(
        "Free Subscription Activated",
        `Free premium subscription has been activated for user ${freeSubscriptionUserId} for ${durationInDays} days.\n\nExpires: ${new Date(expiryDate).toLocaleDateString()}`
      );
    } catch (error) {
      console.error("Error activating free subscription:", error);
      Alert.alert("Error", "Failed to activate free subscription. Please try again.");
    }
  };

  const getStatusColor = (status: SubscriptionRequest["status"]) => {
    switch (status) {
      case "pending_approval": return "#F59E0B";
      case "approved": return "#10B981";
      case "rejected": return "#EF4444";
      default: return "#6B7280";
    }
  };

  const getStatusText = (status: SubscriptionRequest["status"]) => {
    switch (status) {
      case "pending_approval": return "Pending";
      case "approved": return "Approved";
      case "rejected": return "Rejected";
      default: return "Unknown";
    }
  };

  const getStatusIcon = (status: SubscriptionRequest["status"]) => {
    switch (status) {
      case "pending_approval": return Clock;
      case "approved": return Check;
      case "rejected": return X;
      default: return Clock;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const pendingCount = subscriptionRequests.filter(req => req.status === "pending_approval").length;
  const approvedCount = subscriptionRequests.filter(req => req.status === "approved").length;
  const rejectedCount = subscriptionRequests.filter(req => req.status === "rejected").length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Subscription Requests</Text>
          <Text style={styles.subtitle}>Manage premium subscriptions</Text>
        </View>
        <TouchableOpacity 
          style={styles.freeSubscriptionButton}
          onPress={handleActivateFreeSubscription}
        >
          <Crown size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderLeftColor: "#F59E0B" }]}>
          <Text style={styles.statNumber}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: "#10B981" }]}>
          <Text style={styles.statNumber}>{approvedCount}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: "#EF4444" }]}>
          <Text style={styles.statNumber}>{rejectedCount}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search requests..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {[
          { key: "all", label: "All" },
          { key: "pending_approval", label: "Pending" },
          { key: "approved", label: "Approved" },
          { key: "rejected", label: "Rejected" }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              filterStatus === tab.key && styles.filterTabActive
            ]}
            onPress={() => setFilterStatus(tab.key as FilterStatus)}
          >
            <Text style={[
              styles.filterTabText,
              filterStatus === tab.key && styles.filterTabTextActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Requests List */}
      <ScrollView style={styles.requestsList} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        ) : filteredRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Crown size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Subscription Requests</Text>
            <Text style={styles.emptyDescription}>
              {filterStatus === "all" 
                ? "No subscription requests found."
                : `No ${filterStatus.replace("_", " ")} requests found.`
              }
            </Text>
          </View>
        ) : (
          filteredRequests.map((request) => {
            const StatusIcon = getStatusIcon(request.status);
            return (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestPackage}>{request.packageName}</Text>
                    <Text style={styles.requestUser}>User: {request.userId}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + "20" }]}>
                    <StatusIcon size={14} color={getStatusColor(request.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                      {getStatusText(request.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestDetails}>
                  <View style={styles.requestDetailRow}>
                    <Calendar size={16} color="#6B7280" />
                    <Text style={styles.requestDetailText}>
                      {formatDate(request.requestDate)}
                    </Text>
                  </View>
                  <View style={styles.requestDetailRow}>
                    <DollarSign size={16} color="#6B7280" />
                    <Text style={styles.requestDetailText}>
                      ${request.price} {request.currency} • {request.duration}
                    </Text>
                  </View>
                  <View style={styles.requestDetailRow}>
                    <CreditCard size={16} color="#6B7280" />
                    <Text style={styles.requestDetailText}>
                      {request.paymentMethod}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      if (request?.id?.trim()) {
                        handleViewDetails(request);
                      }
                    }}
                  >
                    <Eye size={16} color="#4F46E5" />
                    <Text style={styles.actionButtonText}>View Details</Text>
                  </TouchableOpacity>
                  
                  {request.status === "pending_approval" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.processActionButton]}
                      onPress={() => handleProcessRequest(request)}
                    >
                      <MessageCircle size={16} color="#10B981" />
                      <Text style={[styles.actionButtonText, { color: "#10B981" }]}>Process</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Subscription Request Details</Text>
                <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {selectedRequest && (
                <View style={styles.detailsContainer}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Package Information</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Package:</Text>
                      <Text style={styles.detailValue}>{selectedRequest.packageName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Duration:</Text>
                      <Text style={styles.detailValue}>{selectedRequest.duration}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Price:</Text>
                      <Text style={styles.detailValue}>
                        ${selectedRequest.price} {selectedRequest.currency}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Payment Information</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Method:</Text>
                      <Text style={styles.detailValue}>{selectedRequest.paymentMethod}</Text>
                    </View>
                    <View style={styles.detailColumn}>
                      <Text style={styles.detailLabel}>Payment Proof:</Text>
                      <Text style={styles.detailValueMultiline}>{selectedRequest.paymentProof}</Text>
                    </View>
                    {selectedRequest.customerNotes && (
                      <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>Customer Notes:</Text>
                        <Text style={styles.detailValueMultiline}>{selectedRequest.customerNotes}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Request Information</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>User ID:</Text>
                      <Text style={styles.detailValue}>{selectedRequest.userId}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Request Date:</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedRequest.requestDate)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <Text style={[styles.detailValue, { color: getStatusColor(selectedRequest.status) }]}>
                        {getStatusText(selectedRequest.status)}
                      </Text>
                    </View>
                    {selectedRequest.processedDate && (
                      <>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Processed Date:</Text>
                          <Text style={styles.detailValue}>{formatDate(selectedRequest.processedDate)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Processed By:</Text>
                          <Text style={styles.detailValue}>{selectedRequest.processedBy}</Text>
                        </View>
                      </>
                    )}
                    {selectedRequest.adminNotes && (
                      <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>Admin Notes:</Text>
                        <Text style={styles.detailValueMultiline}>{selectedRequest.adminNotes}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Process Modal */}
      <Modal
        visible={showProcessModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProcessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Process Subscription Request</Text>
              <TouchableOpacity onPress={() => setShowProcessModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <View style={styles.processContainer}>
                <View style={styles.processInfo}>
                  <Text style={styles.processPackage}>{selectedRequest.packageName}</Text>
                  <Text style={styles.processPrice}>
                    ${selectedRequest.price} {selectedRequest.currency} • {selectedRequest.duration}
                  </Text>
                  <Text style={styles.processUser}>User: {selectedRequest.userId}</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Admin Notes (Optional)</Text>
                  <TextInput
                    style={styles.notesInput}
                    value={adminNotes}
                    onChangeText={setAdminNotes}
                    placeholder="Add notes about this decision..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.processActions}>
                  <TouchableOpacity
                    style={[styles.processButton, styles.rejectButton]}
                    onPress={() => processSubscriptionRequest("reject")}
                  >
                    <X size={20} color="#FFFFFF" />
                    <Text style={styles.processButtonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.processButton, styles.approveButton]}
                    onPress={() => processSubscriptionRequest("approve")}
                  >
                    <Check size={20} color="#FFFFFF" />
                    <Text style={styles.processButtonText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Free Subscription Modal */}
      <Modal
        visible={showFreeSubscriptionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFreeSubscriptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Activate Free Subscription</Text>
              <TouchableOpacity onPress={() => setShowFreeSubscriptionModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.freeSubscriptionContainer}>
              <View style={styles.freeSubscriptionInfo}>
                <Crown size={24} color="#F59E0B" />
                <View style={styles.freeSubscriptionText}>
                  <Text style={styles.freeSubscriptionTitle}>Grant Free Premium Access</Text>
                  <Text style={styles.freeSubscriptionDescription}>
                    Manually activate premium subscription for a user without payment
                  </Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>User ID *</Text>
                <TextInput
                  style={styles.freeSubscriptionInput}
                  value={freeSubscriptionUserId}
                  onChangeText={setFreeSubscriptionUserId}
                  placeholder="Enter user ID or identifier"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration (Days) *</Text>
                <TextInput
                  style={styles.freeSubscriptionInput}
                  value={freeSubscriptionDuration}
                  onChangeText={setFreeSubscriptionDuration}
                  placeholder="30"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
                <Text style={styles.inputHint}>
                  Number of days the free subscription will be active
                </Text>
              </View>

              <View style={styles.durationPresets}>
                <Text style={styles.presetsLabel}>Quick Select:</Text>
                <View style={styles.presetButtons}>
                  {["7", "30", "90", "365"].map((days) => (
                    <TouchableOpacity
                      key={days}
                      style={[
                        styles.presetButton,
                        freeSubscriptionDuration === days && styles.presetButtonActive
                      ]}
                      onPress={() => setFreeSubscriptionDuration(days)}
                    >
                      <Text style={[
                        styles.presetButtonText,
                        freeSubscriptionDuration === days && styles.presetButtonTextActive
                      ]}>
                        {days}d
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.processActions}>
              <TouchableOpacity
                style={[styles.processButton, styles.rejectButton]}
                onPress={() => setShowFreeSubscriptionModal(false)}
              >
                <X size={20} color="#FFFFFF" />
                <Text style={styles.processButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.processButton, styles.approveButton]}
                onPress={activateFreeSubscription}
              >
                <Crown size={20} color="#FFFFFF" />
                <Text style={styles.processButtonText}>Activate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 12,
  },
  filterButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterTabActive: {
    backgroundColor: "#4F46E5",
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  requestsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center" as const,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  requestInfo: {
    flex: 1,
  },
  requestPackage: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  requestUser: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  requestDetails: {
    gap: 8,
    marginBottom: 16,
  },
  requestDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requestDetailText: {
    fontSize: 14,
    color: "#6B7280",
  },
  requestActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  processActionButton: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#4F46E5",
  },
  bottomSpacing: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    maxWidth: 500,
    width: "100%",
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  detailsContainer: {
    gap: 24,
  },
  detailSection: {
    gap: 12,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailColumn: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  detailValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500" as const,
  },
  detailValueMultiline: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  processContainer: {
    gap: 20,
  },
  processInfo: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  processPackage: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  processPrice: {
    fontSize: 16,
    color: "#4F46E5",
    fontWeight: "500" as const,
    marginBottom: 8,
  },
  processUser: {
    fontSize: 14,
    color: "#6B7280",
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
  },
  notesInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 100,
  },
  processActions: {
    flexDirection: "row",
    gap: 12,
  },
  processButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  rejectButton: {
    backgroundColor: "#EF4444",
  },
  approveButton: {
    backgroundColor: "#10B981",
  },
  processButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  freeSubscriptionButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  freeSubscriptionContainer: {
    gap: 20,
  },
  freeSubscriptionInfo: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  freeSubscriptionText: {
    flex: 1,
    marginLeft: 12,
  },
  freeSubscriptionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#92400E",
    marginBottom: 4,
  },
  freeSubscriptionDescription: {
    fontSize: 14,
    color: "#92400E",
  },
  freeSubscriptionInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputHint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  durationPresets: {
    gap: 8,
  },
  presetsLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
  },
  presetButtons: {
    flexDirection: "row",
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  presetButtonActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  presetButtonTextActive: {
    color: "#FFFFFF",
  },
});