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
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Gift,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Percent,
  DollarSign,
  Users,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { useAdmin, type Promotion } from "@/hooks/admin-store";

export default function AdminPromotionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { promotions, addPromotion, updatePromotion, deletePromotion, language } = useAdmin();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [newPromotion, setNewPromotion] = useState({
    title: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    maxUsage: "",
    couponCode: "",
  });

  const handleAddPromotion = useCallback(async () => {
    if (!newPromotion.title.trim() || !newPromotion.description.trim()) {
      Alert.alert("خطأ", "يرجى إدخال العنوان والوصف");
      return;
    }

    const discountValue = parseFloat(newPromotion.discountValue);
    if (isNaN(discountValue) || discountValue <= 0) {
      Alert.alert("خطأ", "يرجى إدخال قيمة خصم صحيحة");
      return;
    }

    if (newPromotion.discountType === "percentage" && discountValue > 100) {
      Alert.alert("خطأ", "نسبة الخصم لا يمكن أن تزيد عن 100%");
      return;
    }

    const maxUsage = newPromotion.maxUsage ? parseInt(newPromotion.maxUsage) : undefined;
    if (newPromotion.maxUsage && (isNaN(maxUsage!) || maxUsage! <= 0)) {
      Alert.alert("خطأ", "يرجى إدخال حد استخدام صحيح");
      return;
    }

    const promotionData: Omit<Promotion, "id" | "usageCount"> = {
      title: newPromotion.title.trim(),
      description: newPromotion.description.trim(),
      discountType: newPromotion.discountType,
      discountValue,
      startDate: newPromotion.startDate.getTime(),
      endDate: newPromotion.endDate.getTime(),
      isActive: true,
      maxUsage,
      couponCode: newPromotion.couponCode.trim() || undefined,
    };

    await addPromotion(promotionData);
    resetForm();
    setShowAddModal(false);
    Alert.alert("تم بنجاح", "تم إضافة العرض الترويجي");
  }, [newPromotion, addPromotion]);

  const handleEditPromotion = useCallback(async () => {
    if (!editingPromotion) return;

    if (!newPromotion.title.trim() || !newPromotion.description.trim()) {
      Alert.alert("خطأ", "يرجى إدخال العنوان والوصف");
      return;
    }

    const discountValue = parseFloat(newPromotion.discountValue);
    if (isNaN(discountValue) || discountValue <= 0) {
      Alert.alert("خطأ", "يرجى إدخال قيمة خصم صحيحة");
      return;
    }

    const maxUsage = newPromotion.maxUsage ? parseInt(newPromotion.maxUsage) : undefined;
    if (newPromotion.maxUsage && (isNaN(maxUsage!) || maxUsage! <= 0)) {
      Alert.alert("خطأ", "يرجى إدخال حد استخدام صحيح");
      return;
    }

    const updates: Partial<Promotion> = {
      title: newPromotion.title.trim(),
      description: newPromotion.description.trim(),
      discountType: newPromotion.discountType,
      discountValue,
      startDate: newPromotion.startDate.getTime(),
      endDate: newPromotion.endDate.getTime(),
      maxUsage,
      couponCode: newPromotion.couponCode.trim() || undefined,
    };

    await updatePromotion(editingPromotion.id, updates);
    resetForm();
    setEditingPromotion(null);
    Alert.alert("تم بنجاح", "تم تحديث العرض الترويجي");
  }, [editingPromotion, newPromotion, updatePromotion]);

  const handleDeletePromotion = useCallback((promotion: Promotion) => {
    Alert.alert(
      "حذف العرض",
      `هل أنت متأكد من حذف العرض "${promotion.title}"؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            await deletePromotion(promotion.id);
            Alert.alert("تم الحذف", "تم حذف العرض الترويجي");
          }
        }
      ]
    );
  }, [deletePromotion]);

  const handleToggleActive = useCallback(async (promotion: Promotion) => {
    await updatePromotion(promotion.id, { isActive: !promotion.isActive });
  }, [updatePromotion]);

  const startEdit = useCallback((promotion: Promotion) => {
    setEditingPromotion(promotion);
    setNewPromotion({
      title: promotion.title,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue.toString(),
      startDate: new Date(promotion.startDate),
      endDate: new Date(promotion.endDate),
      maxUsage: promotion.maxUsage?.toString() || "",
      couponCode: promotion.couponCode || "",
    });
    setShowAddModal(true);
  }, []);

  const resetForm = useCallback(() => {
    setNewPromotion({
      title: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxUsage: "",
      couponCode: "",
    });
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ar-SA");
  };

  const isExpired = (endDate: number) => {
    return endDate < Date.now();
  };

  const texts = {
    ar: {
      title: "العروض والخصومات",
      addPromotion: "إضافة عرض جديد",
      editPromotion: "تعديل العرض",
      promotionTitle: "عنوان العرض",
      description: "الوصف",
      discountType: "نوع الخصم",
      percentage: "نسبة مئوية",
      fixed: "مبلغ ثابت",
      discountValue: "قيمة الخصم",
      startDate: "تاريخ البداية",
      endDate: "تاريخ النهاية",
      maxUsage: "حد الاستخدام",
      couponCode: "كود الكوبون",
      active: "نشط",
      inactive: "غير نشط",
      expired: "منتهي الصلاحية",
      usageCount: "مرات الاستخدام",
      unlimited: "غير محدود",
      cancel: "إلغاء",
      add: "إضافة",
      save: "حفظ",
      edit: "تعديل",
      delete: "حذف",
      toggle: "تفعيل/إلغاء",
    },
    en: {
      title: "Promotions & Offers",
      addPromotion: "Add New Promotion",
      editPromotion: "Edit Promotion",
      promotionTitle: "Promotion Title",
      description: "Description",
      discountType: "Discount Type",
      percentage: "Percentage",
      fixed: "Fixed Amount",
      discountValue: "Discount Value",
      startDate: "Start Date",
      endDate: "End Date",
      maxUsage: "Usage Limit",
      couponCode: "Coupon Code",
      active: "Active",
      inactive: "Inactive",
      expired: "Expired",
      usageCount: "Usage Count",
      unlimited: "Unlimited",
      cancel: "Cancel",
      add: "Add",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      toggle: "Toggle",
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

      {/* Promotions List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {promotions.map((promotion) => (
          <View key={promotion.id} style={styles.promotionCard}>
            <View style={styles.promotionHeader}>
              <View style={styles.promotionInfo}>
                <Text style={styles.promotionTitle}>{promotion.title}</Text>
                <Text style={styles.promotionDescription}>{promotion.description}</Text>
              </View>
              <View style={styles.promotionActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleToggleActive(promotion)}
                >
                  {promotion.isActive ? (
                    <Eye size={16} color="#10B981" />
                  ) : (
                    <EyeOff size={16} color="#6B7280" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => startEdit(promotion)}
                >
                  <Edit3 size={16} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeletePromotion(promotion)}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.promotionDetails}>
              <View style={styles.discountInfo}>
                {promotion.discountType === "percentage" ? (
                  <View style={styles.discountBadge}>
                    <Percent size={16} color="#F59E0B" />
                    <Text style={styles.discountText}>{promotion.discountValue}%</Text>
                  </View>
                ) : (
                  <View style={styles.discountBadge}>
                    <DollarSign size={16} color="#10B981" />
                    <Text style={styles.discountText}>{promotion.discountValue} LBP</Text>
                  </View>
                )}
              </View>

              <View style={styles.dateInfo}>
                <Calendar size={14} color="#6B7280" />
                <Text style={styles.dateText}>
                  {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                </Text>
              </View>

              <View style={styles.usageInfo}>
                <Users size={14} color="#6B7280" />
                <Text style={styles.usageText}>
                  {promotion.usageCount} / {promotion.maxUsage || t.unlimited}
                </Text>
              </View>

              {promotion.couponCode && (
                <View style={styles.couponInfo}>
                  <Text style={styles.couponCode}>{promotion.couponCode}</Text>
                </View>
              )}
            </View>

            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                isExpired(promotion.endDate) 
                  ? styles.expiredBadge
                  : promotion.isActive 
                    ? styles.activeBadge 
                    : styles.inactiveBadge
              ]}>
                <Text style={[
                  styles.statusText,
                  isExpired(promotion.endDate) 
                    ? styles.expiredText
                    : promotion.isActive 
                      ? styles.activeText 
                      : styles.inactiveText
                ]}>
                  {isExpired(promotion.endDate) 
                    ? t.expired
                    : promotion.isActive 
                      ? t.active 
                      : t.inactive
                  }
                </Text>
              </View>
            </View>
          </View>
        ))}

        {promotions.length === 0 && (
          <View style={styles.emptyState}>
            <Gift size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>لا توجد عروض ترويجية</Text>
            <TouchableOpacity 
              style={styles.addFirstButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.addFirstButtonText}>إضافة أول عرض</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Promotion Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAddModal(false);
          setEditingPromotion(null);
          resetForm();
        }}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowAddModal(false);
              setEditingPromotion(null);
              resetForm();
            }}>
              <Text style={styles.modalCancelButton}>{t.cancel}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingPromotion ? t.editPromotion : t.addPromotion}
            </Text>
            <TouchableOpacity onPress={editingPromotion ? handleEditPromotion : handleAddPromotion}>
              <Text style={styles.modalAddButton}>
                {editingPromotion ? t.save : t.add}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.promotionTitle} *</Text>
              <TextInput
                style={styles.input}
                value={newPromotion.title}
                onChangeText={(text) => setNewPromotion({ ...newPromotion, title: text })}
                placeholder="خصم العيد"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.description} *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newPromotion.description}
                onChangeText={(text) => setNewPromotion({ ...newPromotion, description: text })}
                placeholder="وصف العرض الترويجي"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.discountType}</Text>
              <View style={styles.discountTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.discountTypeButton,
                    newPromotion.discountType === "percentage" && styles.discountTypeButtonActive
                  ]}
                  onPress={() => setNewPromotion({ ...newPromotion, discountType: "percentage" })}
                >
                  <Percent size={16} color={newPromotion.discountType === "percentage" ? "#FFFFFF" : "#6B7280"} />
                  <Text style={[
                    styles.discountTypeText,
                    newPromotion.discountType === "percentage" && styles.discountTypeTextActive
                  ]}>
                    {t.percentage}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.discountTypeButton,
                    newPromotion.discountType === "fixed" && styles.discountTypeButtonActive
                  ]}
                  onPress={() => setNewPromotion({ ...newPromotion, discountType: "fixed" })}
                >
                  <DollarSign size={16} color={newPromotion.discountType === "fixed" ? "#FFFFFF" : "#6B7280"} />
                  <Text style={[
                    styles.discountTypeText,
                    newPromotion.discountType === "fixed" && styles.discountTypeTextActive
                  ]}>
                    {t.fixed}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t.discountValue} * ({newPromotion.discountType === "percentage" ? "%" : "LBP"})
              </Text>
              <TextInput
                style={styles.input}
                value={newPromotion.discountValue}
                onChangeText={(text) => setNewPromotion({ ...newPromotion, discountValue: text })}
                placeholder={newPromotion.discountType === "percentage" ? "20" : "5000"}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.maxUsage}</Text>
              <TextInput
                style={styles.input}
                value={newPromotion.maxUsage}
                onChangeText={(text) => setNewPromotion({ ...newPromotion, maxUsage: text })}
                placeholder="100 (اتركه فارغاً للاستخدام غير المحدود)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.couponCode}</Text>
              <TextInput
                style={styles.input}
                value={newPromotion.couponCode}
                onChangeText={(text) => setNewPromotion({ ...newPromotion, couponCode: text.toUpperCase() })}
                placeholder="EID2024"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  promotionCard: {
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
  promotionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  promotionInfo: {
    flex: 1,
    marginRight: 16,
  },
  promotionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  promotionDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  promotionActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  promotionDetails: {
    gap: 8,
    marginBottom: 16,
  },
  discountInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  discountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: "#6B7280",
  },
  usageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  usageText: {
    fontSize: 14,
    color: "#6B7280",
  },
  couponInfo: {
    alignItems: "flex-start",
  },
  couponCode: {
    backgroundColor: "#EEF2FF",
    color: "#4F46E5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "600" as const,
    fontFamily: "monospace",
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: "#DCFCE7",
  },
  inactiveBadge: {
    backgroundColor: "#F3F4F6",
  },
  expiredBadge: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  activeText: {
    color: "#166534",
  },
  inactiveText: {
    color: "#6B7280",
  },
  expiredText: {
    color: "#991B1B",
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
  addFirstButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
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
  textArea: {
    height: 80,
    textAlignVertical: "top" as const,
  },
  discountTypeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  discountTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  discountTypeButtonActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  discountTypeText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  discountTypeTextActive: {
    color: "#FFFFFF",
  },
});