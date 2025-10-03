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
  Search,
  Filter,
  UserCheck,
  UserX,
  Crown,
  Activity,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Plus,
} from "lucide-react-native";
import { useAdmin, type User } from "@/hooks/admin-store";

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { users, updateUserStatus, addUser, language } = useAdmin();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "suspended" | "premium">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone.includes(searchQuery) ||
                         (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterStatus === "all" ||
                         (filterStatus === "active" && user.status === "active") ||
                         (filterStatus === "suspended" && user.status === "suspended") ||
                         (filterStatus === "premium" && user.isPremium);
    
    return matchesSearch && matchesFilter;
  });

  const handleStatusToggle = useCallback((user: User) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    const actionText = newStatus === "active" ? "تفعيل" : "تعليق";
    
    Alert.alert(
      `${actionText} الحساب`,
      `هل أنت متأكد من ${actionText} حساب ${user.name}؟`,
      [
        { text: "إلغاء", style: "cancel" },
        { 
          text: actionText, 
          onPress: () => updateUserStatus(user.id, newStatus),
          style: newStatus === "suspended" ? "destructive" : "default"
        }
      ]
    );
  }, [updateUserStatus]);

  const handleAddUser = useCallback(async () => {
    if (!newUser.name.trim() || !newUser.phone.trim()) {
      Alert.alert("خطأ", "يرجى إدخال الاسم ورقم الهاتف على الأقل");
      return;
    }

    const userData: Omit<User, "id"> = {
      name: newUser.name.trim(),
      phone: newUser.phone.trim(),
      email: newUser.email.trim() || undefined,
      registrationDate: Date.now(),
      transactionCount: 0,
      totalVolume: 0,
      status: "active",
      isPremium: false,
      lastActivity: Date.now(),
    };

    await addUser(userData);
    setNewUser({ name: "", phone: "", email: "" });
    setShowAddModal(false);
    Alert.alert("تم بنجاح", "تم إضافة المستخدم الجديد");
  }, [newUser, addUser]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ar-SA");
  };

  const formatLastActivity = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} يوم`;
    if (hours > 0) return `${hours} ساعة`;
    return "الآن";
  };

  const texts = {
    ar: {
      title: "إدارة المستخدمين",
      search: "البحث عن مستخدم...",
      all: "الكل",
      active: "نشط",
      suspended: "معلق",
      premium: "مميز",
      addUser: "إضافة مستخدم",
      name: "الاسم",
      phone: "الهاتف",
      email: "البريد الإلكتروني",
      registrationDate: "تاريخ التسجيل",
      transactions: "المعاملات",
      volume: "الحجم",
      lastActivity: "آخر نشاط",
      status: "الحالة",
      actions: "الإجراءات",
      activate: "تفعيل",
      suspend: "تعليق",
      cancel: "إلغاء",
      add: "إضافة",
    },
    en: {
      title: "User Management",
      search: "Search users...",
      all: "All",
      active: "Active",
      suspended: "Suspended",
      premium: "Premium",
      addUser: "Add User",
      name: "Name",
      phone: "Phone",
      email: "Email",
      registrationDate: "Registration Date",
      transactions: "Transactions",
      volume: "Volume",
      lastActivity: "Last Activity",
      status: "Status",
      actions: "Actions",
      activate: "Activate",
      suspend: "Suspend",
      cancel: "Cancel",
      add: "Add",
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
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Plus size={24} color="#4F46E5" />
        </TouchableOpacity>
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
              { key: "active", label: t.active },
              { key: "suspended", label: t.suspended },
              { key: "premium", label: t.premium },
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

      {/* Users List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredUsers.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName}>{user.name}</Text>
                  {user.isPremium && <Crown size={16} color="#F59E0B" />}
                </View>
                <View style={styles.userDetails}>
                  <View style={styles.userDetailItem}>
                    <Phone size={14} color="#6B7280" />
                    <Text style={styles.userDetailText}>{user.phone}</Text>
                  </View>
                  {user.email && (
                    <View style={styles.userDetailItem}>
                      <Mail size={14} color="#6B7280" />
                      <Text style={styles.userDetailText}>{user.email}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.userActions}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    user.status === "active" ? styles.activeButton : styles.suspendedButton,
                  ]}
                  onPress={() => handleStatusToggle(user)}
                >
                  {user.status === "active" ? (
                    <UserCheck size={16} color="#10B981" />
                  ) : (
                    <UserX size={16} color="#EF4444" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Calendar size={16} color="#6B7280" />
                <Text style={styles.statLabel}>{t.registrationDate}</Text>
                <Text style={styles.statValue}>{formatDate(user.registrationDate)}</Text>
              </View>
              <View style={styles.statItem}>
                <TrendingUp size={16} color="#6B7280" />
                <Text style={styles.statLabel}>{t.transactions}</Text>
                <Text style={styles.statValue}>{user.transactionCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Activity size={16} color="#6B7280" />
                <Text style={styles.statLabel}>{t.lastActivity}</Text>
                <Text style={styles.statValue}>{formatLastActivity(user.lastActivity)}</Text>
              </View>
            </View>

            <View style={styles.volumeInfo}>
              <Text style={styles.volumeLabel}>{t.volume}:</Text>
              <Text style={styles.volumeValue}>
                {user.totalVolume.toLocaleString()} LBP
              </Text>
            </View>
          </View>
        ))}

        {filteredUsers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>لا توجد نتائج</Text>
          </View>
        )}
      </ScrollView>

      {/* Add User Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancelButton}>{t.cancel}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t.addUser}</Text>
            <TouchableOpacity onPress={handleAddUser}>
              <Text style={styles.modalAddButton}>{t.add}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.name} *</Text>
              <TextInput
                style={styles.input}
                value={newUser.name}
                onChangeText={(text) => setNewUser({ ...newUser, name: text })}
                placeholder="أدخل اسم المستخدم"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.phone} *</Text>
              <TextInput
                style={styles.input}
                value={newUser.phone}
                onChangeText={(text) => setNewUser({ ...newUser, phone: text })}
                placeholder="+961 70 123456"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.email}</Text>
              <TextInput
                style={styles.input}
                value={newUser.email}
                onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                placeholder="user@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
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
  userCard: {
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
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  userDetails: {
    gap: 4,
  },
  userDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userDetailText: {
    fontSize: 14,
    color: "#6B7280",
  },
  userActions: {
    marginLeft: 16,
  },
  statusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activeButton: {
    backgroundColor: "#DCFCE7",
  },
  suspendedButton: {
    backgroundColor: "#FEE2E2",
  },
  userStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  volumeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  volumeLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  volumeValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#10B981",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
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
  modalAddButton: {
    fontSize: 16,
    color: "#4F46E5",
    fontWeight: "600" as const,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});