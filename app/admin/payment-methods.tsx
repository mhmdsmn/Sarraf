import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useStorage } from "@/hooks/storage-provider";
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Edit3,
  Trash2,
  X,
  Smartphone,
  Building2,
  Wallet,
  Check,
  AlertCircle,
} from "lucide-react-native";

interface PaymentMethod {
  id: string;
  name: string;
  details: string;
  phone?: string;
  enabled: boolean;
  type: 'wish_money' | 'bank_transfer' | 'mobile_payment' | 'other';
  createdAt: number;
}

export default function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const storage = useStorage();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [paymentName, setPaymentName] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const loadPaymentMethods = useCallback(async () => {
    try {
      const stored = await storage.getItem('@admin_payment_methods');
      
      if (stored && stored.trim()) {
        try {
          const trimmedStored = stored.trim();
          if (!trimmedStored.startsWith('{') && !trimmedStored.startsWith('[')) {
            throw new Error('Invalid JSON format - does not start with { or [');
          }
          
          const methods = JSON.parse(trimmedStored);
          if (Array.isArray(methods) && methods.length > 0) {
            const validMethods = methods.filter(method => 
              method && 
              typeof method === 'object' && 
              method.id && 
              method.name && 
              typeof method.enabled === 'boolean'
            );
            
            if (validMethods.length > 0) {
              setPaymentMethods(validMethods);
            } else {
              throw new Error('No valid payment methods found');
            }
          } else {
            throw new Error('Invalid data format - not a valid array');
          }
        } catch (parseError) {
          console.error('Error parsing payment methods JSON:', parseError);
          console.error('Stored data:', stored);
          await storage.removeItem('@admin_payment_methods');
          const defaultMethods = getDefaultPaymentMethods();
          setPaymentMethods(defaultMethods);
          await storage.setItem('@admin_payment_methods', JSON.stringify(defaultMethods));
        }
      } else {
        const defaultMethods = getDefaultPaymentMethods();
        setPaymentMethods(defaultMethods);
        await storage.setItem('@admin_payment_methods', JSON.stringify(defaultMethods));
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      const fallbackMethods = getDefaultPaymentMethods();
      setPaymentMethods(fallbackMethods);
    } finally {
      setIsLoading(false);
    }
  }, [storage]);

  const getDefaultPaymentMethods = (): PaymentMethod[] => [
    {
      id: '1',
      name: 'Wish Money',
      details: 'Send payment via Wish Money app to the number below',
      phone: '+961 70 123456',
      enabled: true,
      type: 'wish_money',
      createdAt: Date.now()
    }
  ];

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  const savePaymentMethods = async (methods: PaymentMethod[]) => {
    try {
      await storage.setItem('@admin_payment_methods', JSON.stringify(methods));
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error saving payment methods:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('خطأ', 'فشل في حفظ طرق الدفع');
      }
    }
  };

  const handleAddPaymentMethod = () => {
    setEditingPayment(null);
    setPaymentName('');
    setPaymentDetails('');
    setPaymentPhone('');
    setPaymentEnabled(true);
    setShowPaymentModal(true);
  };

  const handleEditPaymentMethod = (method: PaymentMethod) => {
    setEditingPayment(method);
    setPaymentName(method.name);
    setPaymentDetails(method.details);
    setPaymentPhone(method.phone || '');
    setPaymentEnabled(method.enabled);
    setShowPaymentModal(true);
  };

  const handleSavePaymentMethod = async () => {
    if (!paymentName.trim() || !paymentDetails.trim()) {
      if (Platform.OS !== 'web') {
        Alert.alert('خطأ', 'يرجى إدخال اسم الطريقة والتفاصيل');
      }
      return;
    }

    const newMethod: PaymentMethod = {
      id: editingPayment?.id || Date.now().toString(),
      name: paymentName.trim(),
      details: paymentDetails.trim(),
      phone: paymentPhone.trim() || undefined,
      enabled: paymentEnabled,
      type: paymentName.toLowerCase().includes('wish') ? 'wish_money' : 
            paymentName.toLowerCase().includes('bank') ? 'bank_transfer' :
            paymentName.toLowerCase().includes('mobile') ? 'mobile_payment' : 'other',
      createdAt: editingPayment?.createdAt || Date.now()
    };

    let updatedMethods;
    if (editingPayment) {
      updatedMethods = paymentMethods.map(m => m.id === editingPayment.id ? newMethod : m);
    } else {
      updatedMethods = [...paymentMethods, newMethod];
    }

    await savePaymentMethods(updatedMethods);
    setShowPaymentModal(false);
    if (Platform.OS !== 'web') {
      Alert.alert('تم الحفظ', 'تم حفظ طريقة الدفع بنجاح');
    }
  };

  const handleDeletePaymentMethod = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method) return;

    const enabledMethods = paymentMethods.filter(m => m.enabled);
    if (enabledMethods.length === 1 && method.enabled) {
      if (Platform.OS !== 'web') {
        Alert.alert('تحذير', 'لا يمكن حذف آخر طريقة دفع مفعلة. يجب أن تكون هناك طريقة واحدة على الأقل متاحة للعملاء.');
      }
      return;
    }

    if (Platform.OS !== 'web') {
      Alert.alert(
        'حذف طريقة الدفع',
        'هل أنت متأكد من حذف هذه الطريقة؟',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'حذف',
            style: 'destructive',
            onPress: async () => {
              const updatedMethods = paymentMethods.filter(m => m.id !== methodId);
              await savePaymentMethods(updatedMethods);
              Alert.alert('تم الحذف', 'تم حذف طريقة الدفع');
            }
          }
        ]
      );
    } else {
      const updatedMethods = paymentMethods.filter(m => m.id !== methodId);
      savePaymentMethods(updatedMethods);
    }
  };

  const handleTogglePaymentMethod = async (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method) return;

    const enabledMethods = paymentMethods.filter(m => m.enabled);
    if (enabledMethods.length === 1 && method.enabled) {
      if (Platform.OS !== 'web') {
        Alert.alert('تحذير', 'لا يمكن تعطيل آخر طريقة دفع مفعلة. يجب أن تكون هناك طريقة واحدة على الأقل متاحة للعملاء.');
      }
      return;
    }

    const updatedMethods = paymentMethods.map(m => 
      m.id === methodId ? { ...m, enabled: !m.enabled } : m
    );
    await savePaymentMethods(updatedMethods);
  };

  const getPaymentIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'wish_money':
      case 'mobile_payment':
        return Smartphone;
      case 'bank_transfer':
        return Building2;
      default:
        return Wallet;
    }
  };

  const enabledCount = paymentMethods.filter(m => m.enabled).length;
  const totalCount = paymentMethods.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Payment Methods</Text>
          <Text style={styles.subtitle}>Manage customer payment options</Text>
        </View>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{enabledCount}</Text>
          <Text style={styles.statLabel}>Active Methods</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalCount}</Text>
          <Text style={styles.statLabel}>Total Methods</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <AlertCircle size={20} color="#F59E0B" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Payment Method Rules</Text>
          <Text style={styles.infoText}>
            • At least one payment method must be enabled{"\n"}
            • Customers will only see enabled methods{"\n"}
            • Include clear payment instructions{"\n"}
            • Add phone numbers for mobile payments
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPaymentMethod}>
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </TouchableOpacity>

          <View style={styles.paymentMethodsList}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading payment methods...</Text>
              </View>
            ) : paymentMethods.length === 0 ? (
              <View style={styles.emptyContainer}>
                <CreditCard size={48} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No Payment Methods</Text>
                <Text style={styles.emptyDescription}>
                  Add your first payment method to start accepting payments
                </Text>
              </View>
            ) : (
              paymentMethods.map((method) => {
                const IconComponent = getPaymentIcon(method.type);
                return (
                  <View key={method.id} style={[
                    styles.paymentMethodItem,
                    !method.enabled && styles.disabledMethod
                  ]}>
                    <View style={styles.methodIcon}>
                      <IconComponent size={24} color={method.enabled ? "#4F46E5" : "#9CA3AF"} />
                    </View>
                    
                    <View style={styles.paymentMethodInfo}>
                      <View style={styles.paymentMethodHeader}>
                        <Text style={[
                          styles.paymentMethodName,
                          !method.enabled && styles.disabledText
                        ]}>
                          {method.name}
                        </Text>
                        <View style={styles.statusBadge}>
                          {method.enabled ? (
                            <Check size={12} color="#10B981" />
                          ) : null}
                          <Text style={[
                            styles.statusText,
                            { color: method.enabled ? "#10B981" : "#9CA3AF" }
                          ]}>
                            {method.enabled ? "Active" : "Disabled"}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={[
                        styles.paymentMethodDetails,
                        !method.enabled && styles.disabledText
                      ]}>
                        {method.details}
                      </Text>
                      
                      {method.phone && (
                        <Text style={[
                          styles.paymentMethodPhone,
                          !method.enabled && styles.disabledText
                        ]}>
                          📱 {method.phone}
                        </Text>
                      )}
                    </View>

                    <View style={styles.paymentMethodActions}>
                      <Switch
                        value={method.enabled}
                        onValueChange={() => handleTogglePaymentMethod(method.id)}
                        trackColor={{ false: "#E5E7EB", true: "#4F46E5" }}
                        thumbColor={method.enabled ? "#FFFFFF" : "#F3F4F6"}
                      />
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleEditPaymentMethod(method)}
                      >
                        <Edit3 size={16} color="#4F46E5" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleDeletePaymentMethod(method.id)}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPayment ? 'Edit Payment Method' : 'Add Payment Method'}
              </Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payment Method Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={paymentName}
                  onChangeText={setPaymentName}
                  placeholder="e.g., Wish Money, Bank Transfer"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payment Instructions *</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  value={paymentDetails}
                  onChangeText={setPaymentDetails}
                  placeholder="Provide clear instructions for customers on how to make payment using this method..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Phone Number</Text>
                <TextInput
                  style={styles.modalInput}
                  value={paymentPhone}
                  onChangeText={setPaymentPhone}
                  placeholder="+961 70 123456"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
                <Text style={styles.inputHint}>
                  Optional: Phone number for mobile payment methods
                </Text>
              </View>

              <View style={styles.switchGroup}>
                <View style={styles.switchInfo}>
                  <Text style={styles.inputLabel}>Enable Method</Text>
                  <Text style={styles.switchDescription}>
                    Customers will only see enabled payment methods
                  </Text>
                </View>
                <Switch
                  value={paymentEnabled}
                  onValueChange={setPaymentEnabled}
                  trackColor={{ false: "#E5E7EB", true: "#4F46E5" }}
                  thumbColor={paymentEnabled ? "#FFFFFF" : "#F3F4F6"}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSavePaymentMethod}
              >
                <Text style={styles.saveButtonText}>
                  {editingPayment ? 'Update' : 'Add'} Method
                </Text>
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
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 20,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#92400E",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  paymentMethodsList: {
    gap: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
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
    maxWidth: 280,
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  disabledMethod: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  paymentMethodName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  disabledText: {
    color: "#9CA3AF",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  paymentMethodDetails: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  paymentMethodPhone: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "500" as const,
  },
  paymentMethodActions: {
    alignItems: "center",
    gap: 12,
    marginLeft: 16,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    margin: 20,
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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  modalBody: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: {
    minHeight: 100,
  },
  inputHint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  switchGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  saveButton: {
    backgroundColor: "#4F46E5",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});