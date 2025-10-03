import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  Crown, 
  Star, 
  Gift, 
  Check, 
  X, 
  CreditCard, 
  Smartphone, 
  Building2,
  Clock,
  ArrowLeft,
  Camera,
  Upload,
  Phone
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useExchange } from "@/hooks/exchange-store";
import { useAdmin } from "@/hooks/admin-store";
import { useStorage } from "@/hooks/storage-provider";
import * as ImagePicker from 'expo-image-picker';

interface SubscriptionPackage {
  id: string;
  name: string;
  duration: string;
  price: number;
  currency: string;
  originalPrice?: number;
  features: string[];
  popular?: boolean;
  savings?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  details: string;
  phone?: string;
  enabled: boolean;
  type: 'wish_money' | 'bank_transfer' | 'mobile_payment' | 'other';
  createdAt: number;
}


export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPremium, premiumExpiry } = useExchange();
  const { settings } = useAdmin();

  // Generate packages from admin settings
  const packages: SubscriptionPackage[] = [
    {
      id: "monthly",
      name: "Monthly Premium",
      duration: "1 Month",
      price: settings.premiumPricing.monthly,
      currency: "USD",
      features: [
        "Unlimited transactions",
        "No ads - Clean interface",
        "Excel export functionality",
        "Priority support"
      ]
    },
    {
      id: "quarterly",
      name: "Quarterly Premium",
      duration: "3 Months",
      price: settings.premiumPricing.quarterly,
      currency: "USD",
      originalPrice: settings.premiumPricing.monthly * 3,
      savings: `Save ${Math.round((1 - settings.premiumPricing.quarterly / (settings.premiumPricing.monthly * 3)) * 100)}%`,
      popular: true,
      features: [
        "All Monthly features",
        "Advanced analytics",
        "Extended support"
      ]
    },
    {
      id: "yearly",
      name: "Yearly Premium",
      duration: "12 Months",
      price: settings.premiumPricing.yearly,
      currency: "USD",
      originalPrice: settings.premiumPricing.monthly * 12,
      savings: `Save ${Math.round((1 - settings.premiumPricing.yearly / (settings.premiumPricing.monthly * 12)) * 100)}%`,
      features: [
        "All Quarterly features",
        "Best value for money",
        "Priority email support",
        "Early access to new features"
      ]
    }
  ];

  const { getItem, setItem, removeItem } = useStorage();
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true);
  const [paymentMethodsError, setPaymentMethodsError] = useState<string | null>(null);

  const loadPaymentMethods = useCallback(async () => {
    try {
      setIsLoadingPaymentMethods(true);
      setPaymentMethodsError(null);
      
      console.log('Loading payment methods...');
      
      const stored = await getItem('@admin_payment_methods');
      console.log('Stored payment methods:', stored);
      
      if (stored && stored.trim()) {
        try {
          const trimmedStored = stored.trim();
          
          // Validate JSON format
          if (!trimmedStored.startsWith('[') && !trimmedStored.startsWith('{')) {
            throw new Error('Invalid JSON format');
          }
          
          const methods = JSON.parse(trimmedStored);
          console.log('Parsed payment methods:', methods);
          
          if (Array.isArray(methods)) {
            // Filter for enabled methods with proper validation
            const enabledMethods = methods.filter((m: any) => {
              return (
                m &&
                typeof m === 'object' &&
                typeof m.enabled === 'boolean' &&
                m.enabled &&
                m.id &&
                typeof m.id === 'string' &&
                m.id.trim() &&
                m.name &&
                typeof m.name === 'string' &&
                m.name.trim() &&
                m.details &&
                typeof m.details === 'string'
              );
            });
            
            console.log('Enabled payment methods:', enabledMethods);
            
            if (enabledMethods.length > 0) {
              setPaymentMethods(enabledMethods);
            } else {
              console.log('No enabled methods found, using defaults');
              const defaultMethods = getDefaultMethods();
              setPaymentMethods(defaultMethods);
              await setItem('@admin_payment_methods', JSON.stringify(defaultMethods));
            }
          } else {
            throw new Error('Data is not an array');
          }
        } catch (parseError) {
          console.error('Error parsing payment methods:', parseError);
          console.error('Raw stored data:', stored);
          
          // Clear corrupted data and use defaults
          await removeItem('@admin_payment_methods');
          const defaultMethods = getDefaultMethods();
          setPaymentMethods(defaultMethods);
          await setItem('@admin_payment_methods', JSON.stringify(defaultMethods));
          
          setPaymentMethodsError('Payment methods data was corrupted and has been reset');
        }
      } else {
        console.log('No stored payment methods, using defaults');
        const defaultMethods = getDefaultMethods();
        setPaymentMethods(defaultMethods);
        await setItem('@admin_payment_methods', JSON.stringify(defaultMethods));
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setPaymentMethodsError(`Failed to load payment methods: ${errorMessage}`);
      
      // Always provide fallback methods
      const fallbackMethods = getDefaultMethods();
      setPaymentMethods(fallbackMethods);
    } finally {
      setIsLoadingPaymentMethods(false);
    }
  }, [getItem, setItem, removeItem]);

  // Load payment methods on mount
  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  const getDefaultMethods = (): PaymentMethod[] => [
    {
      id: 'wish_money_default',
      name: 'Wish Money',
      details: 'Send payment to the number below and upload screenshot',
      phone: '+961 70 123456',
      enabled: true,
      type: 'wish_money',
      createdAt: Date.now()
    }
  ];
  
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [paymentProof, setPaymentProof] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentImage, setPaymentImage] = useState<string | null>(null);

  const handlePackageSelect = (pkg: SubscriptionPackage) => {
    if (!pkg?.id?.trim() || !pkg?.name?.trim() || pkg.price <= 0) {
      Alert.alert("Invalid Package", "Please select a valid subscription package.");
      return;
    }
    if (isPremium) {
      Alert.alert(
        "Already Premium",
        "You already have an active premium subscription. Would you like to upgrade or extend?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Continue", onPress: () => setSelectedPackage(pkg) }
        ]
      );
      return;
    }
    setSelectedPackage(pkg);
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    if (!method?.id?.trim() || !method?.name?.trim()) {
      Alert.alert("Invalid Selection", "Please select a valid payment method.");
      return;
    }
    setSelectedPaymentMethod(method);
    setShowPaymentModal(false);
    setShowProofModal(true);
  };

  const handleSubmitSubscription = async () => {
    if (!selectedPackage || !selectedPaymentMethod || !paymentProof.trim() || !customerPhone.trim()) {
      Alert.alert("Missing Information", "Please fill in all required fields including your phone number.");
      return;
    }

    // Validate image upload
    if (!paymentImage) {
      Alert.alert(
        "Missing Payment Proof", 
        "Please upload a screenshot of your payment before submitting."
      );
      return;
    }

    try {
      // Create subscription request
      const subscriptionRequest = {
        id: Date.now().toString(),
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        duration: selectedPackage.duration,
        price: selectedPackage.price,
        currency: selectedPackage.currency,
        paymentMethod: selectedPaymentMethod.name,
        paymentProof: paymentProof.trim(),
        customerNotes: customerNotes.trim(),
        customerPhone: customerPhone.trim(),
        paymentImage: paymentImage, // Store image URI locally
        status: "pending_approval",
        requestDate: Date.now(),
        userId: "current_user", // In real app, get from auth
      };

      console.log('Submitting subscription request:', {
        ...subscriptionRequest,
        paymentImage: paymentImage ? 'Image attached' : 'No image'
      });

      // Store the subscription request locally (no server required)
      let AsyncStorage;
      if (Platform.OS === 'web') {
        // Use localStorage for web
        const existingRequests = localStorage.getItem('@subscription_requests');
        const requests = existingRequests ? JSON.parse(existingRequests) : [];
        requests.push(subscriptionRequest);
        localStorage.setItem('@subscription_requests', JSON.stringify(requests));
      } else {
        // Use AsyncStorage for mobile
        AsyncStorage = await import('@react-native-async-storage/async-storage');
        const existingRequests = await AsyncStorage.default.getItem('@subscription_requests');
        const requests = existingRequests ? JSON.parse(existingRequests) : [];
        requests.push(subscriptionRequest);
        await AsyncStorage.default.setItem('@subscription_requests', JSON.stringify(requests));
      }

      // Reset form
      setShowProofModal(false);
      setSelectedPackage(null);
      setSelectedPaymentMethod(null);
      setPaymentProof("");
      setCustomerNotes("");
      setCustomerPhone("");
      setPaymentImage(null);

      Alert.alert(
        "Subscription Request Submitted",
        "Your subscription request has been submitted successfully. Our admin will review your payment proof and activate your premium account within 24 hours.\n\nYou will receive a notification once approved.",
        [
          { text: "OK", onPress: () => router.back() }
        ]
      );
    } catch (error) {
      console.error("Error submitting subscription:", error);
      Alert.alert(
        "Error", 
        "Failed to submit subscription request. Please try again. If the problem persists, try restarting the app."
      );
    }
  };

  const getPremiumStatusText = () => {
    if (!isPremium) return null;
    if (!premiumExpiry) return "Premium Account";
    
    const daysLeft = Math.ceil((premiumExpiry - Date.now()) / (24 * 60 * 60 * 1000));
    if (daysLeft <= 0) return "Premium Expired";
    return `Premium Active (${daysLeft} days left)`;
  };

  const handleImagePicker = async () => {
    try {
      // Check if we're on web platform
      if (Platform.OS === 'web') {
        Alert.alert(
          "Web Platform Notice",
          "Image upload from gallery is available. Camera access may be limited on web browsers.",
          [
            { text: "Continue with Gallery", onPress: () => pickImageFromGallery() },
            { text: "Cancel", style: "cancel" }
          ]
        );
        return;
      }

      // Request permissions for mobile
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to upload payment screenshots."
        );
        return;
      }

      Alert.alert(
        "Upload Payment Proof",
        "Choose how to upload your payment screenshot:",
        [
          { text: "Camera", onPress: () => pickImageFromCamera() },
          { text: "Gallery", onPress: () => pickImageFromGallery() },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert("Error", "Failed to request permissions. Please try again.");
    }
  };

  const pickImageFromCamera = async () => {
    try {
      // Check if camera is available on this platform
      if (Platform.OS === 'web') {
        Alert.alert(
          "Camera Not Available",
          "Camera access is not available on web. Please use the gallery option instead."
        );
        return;
      }

      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera permissions to take photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPaymentImage(result.assets[0].uri);
        Alert.alert("Success", "Payment proof image captured successfully!");
      }
    } catch (error) {
      console.error('Error picking image from camera:', error);
      Alert.alert("Error", "Failed to capture image. Please try again.");
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false, // Don't include base64 to avoid memory issues
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setPaymentImage(imageUri);
        console.log('Image selected:', imageUri);
        Alert.alert("Success", "Payment proof image selected successfully!");
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert(
        "Error", 
        "Failed to select image. Please try again. If the problem persists, try restarting the app."
      );
    }
  };

  const getPaymentIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'wish_money':
      case 'mobile_payment':
        return Smartphone;
      case 'bank_transfer':
        return Building2;
      default:
        return CreditCard;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Premium Subscription</Text>
          <Text style={styles.subtitle}>Choose your plan</Text>
        </View>
      </View>

      {isPremium && (
        <View style={styles.currentStatusCard}>
          <Crown size={24} color="#F59E0B" />
          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>{getPremiumStatusText()}</Text>
            <Text style={styles.statusDescription}>
              You can upgrade or extend your subscription below
            </Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.packagesContainer}>
          {packages.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.packageCard,
                pkg.popular && styles.popularPackage
              ]}
              onPress={() => handlePackageSelect(pkg)}
            >
              {pkg.popular && (
                <View style={styles.popularBadge}>
                  <Star size={12} color="#FFFFFF" />
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              )}
              
              <View style={styles.packageHeader}>
                <Text style={styles.packageName}>{pkg.name}</Text>
                <Text style={styles.packageDuration}>{pkg.duration}</Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  ${pkg.price}
                  <Text style={styles.currency}> {pkg.currency}</Text>
                </Text>
                {pkg.originalPrice && (
                  <View style={styles.savingsContainer}>
                    <Text style={styles.originalPrice}>${pkg.originalPrice}</Text>
                    <Text style={styles.savings}>{pkg.savings}</Text>
                  </View>
                )}
              </View>

              <View style={styles.featuresContainer}>
                {pkg.features.map((feature) => (
                  <View key={feature} style={styles.featureItem}>
                    <Check size={16} color="#10B981" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Select Plan</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.guaranteeCard}>
          <Gift size={24} color="#10B981" />
          <View style={styles.guaranteeContent}>
            <Text style={styles.guaranteeTitle}>30-Day Money Back Guarantee</Text>
            <Text style={styles.guaranteeDescription}>
              Not satisfied? Get a full refund within 30 days, no questions asked.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Payment Method Selection Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Method</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedPackage && (
              <View style={styles.selectedPackageInfo}>
                <Text style={styles.selectedPackageName}>{selectedPackage.name}</Text>
                <Text style={styles.selectedPackagePrice}>
                  ${selectedPackage.price} {selectedPackage.currency}
                </Text>
              </View>
            )}

            <Text style={styles.paymentDescription}>
              Choose how you&apos;d like to pay for your subscription:
            </Text>

            {isLoadingPaymentMethods ? (
              <View style={styles.loadingPaymentMethods}>
                <Text style={styles.loadingPaymentMethodsText}>
                  Loading payment methods...
                </Text>
              </View>
            ) : paymentMethodsError ? (
              <View style={styles.errorPaymentMethods}>
                <Text style={styles.errorPaymentMethodsText}>
                  {paymentMethodsError}
                </Text>
                <TouchableOpacity 
                  style={styles.retryButton} 
                  onPress={loadPaymentMethods}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : paymentMethods.length === 0 ? (
              <View style={styles.noPaymentMethods}>
                <Text style={styles.noPaymentMethodsText}>
                  No payment methods available. Please contact support.
                </Text>
              </View>
            ) : (
              paymentMethods
                .filter((method) => method?.id?.trim() && method?.name?.trim())
                .map((method) => {
                  const IconComponent = getPaymentIcon(method.type);
                  return (
                    <TouchableOpacity
                      key={method.id}
                      style={styles.paymentMethodOption}
                      onPress={() => handlePaymentMethodSelect(method)}
                    >
                      <IconComponent size={24} color="#4F46E5" />
                      <View style={styles.paymentMethodContent}>
                        <Text style={styles.paymentMethodName}>{method.name}</Text>
                        <Text style={styles.paymentMethodDescription}>{method.details}</Text>
                        {method.phone && (
                          <View style={styles.phoneContainer}>
                            <Phone size={14} color="#10B981" />
                            <Text style={styles.phoneText}>{method.phone}</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
            )}
          </View>
        </View>
      </Modal>

      {/* Payment Proof Modal */}
      <Modal
        visible={showProofModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProofModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.proofModalScroll}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Payment Proof</Text>
                <TouchableOpacity onPress={() => setShowProofModal(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {selectedPackage && selectedPaymentMethod && (
                <View style={styles.orderSummary}>
                  <Text style={styles.orderSummaryTitle}>Order Summary</Text>
                  <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>Package:</Text>
                    <Text style={styles.orderValue}>{selectedPackage.name}</Text>
                  </View>
                  <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>Duration:</Text>
                    <Text style={styles.orderValue}>{selectedPackage.duration}</Text>
                  </View>
                  <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>Payment Method:</Text>
                    <Text style={styles.orderValue}>{selectedPaymentMethod.name}</Text>
                  </View>
                  <View style={[styles.orderRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>
                      ${selectedPackage.price} {selectedPackage.currency}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.instructionsCard}>
                <Clock size={20} color="#F59E0B" />
                <View style={styles.instructionsContent}>
                  <Text style={styles.instructionsTitle}>Payment Instructions</Text>
                  <Text style={styles.instructionsText}>
                    1. Make the payment using your selected method{"\n"}
                    2. Take a screenshot or photo of the payment confirmation{"\n"}
                    3. Upload the proof and enter your phone number below{"\n"}
                    4. Our admin will verify and activate your account within 24 hours
                  </Text>
                </View>
              </View>

              {selectedPaymentMethod && (
                <View style={styles.paymentDetailsCard}>
                  <Text style={styles.paymentDetailsTitle}>Payment Details</Text>
                  <Text style={styles.paymentDetailsText}>{selectedPaymentMethod.details}</Text>
                  {selectedPaymentMethod.phone && (
                    <View style={styles.phoneContainer}>
                      <Phone size={16} color="#10B981" />
                      <Text style={styles.phoneText}>{selectedPaymentMethod.phone}</Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Upload Payment Screenshot *</Text>
                <TouchableOpacity style={styles.imageUploadButton} onPress={handleImagePicker}>
                  {paymentImage ? (
                    <View style={styles.imagePreview}>
                      <Image 
                        source={{ uri: paymentImage }} 
                        style={styles.previewImage}
                        onError={(error) => {
                          console.error('Image load error:', error);
                          Alert.alert('Image Error', 'Failed to load image. Please try selecting another image.');
                        }}
                      />
                      <View style={styles.imageOverlay}>
                        <Camera size={20} color="#FFFFFF" />
                        <Text style={styles.changeImageText}>Change Image</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Upload size={32} color="#9CA3AF" />
                      <Text style={styles.uploadText}>Tap to upload payment screenshot</Text>
                      <Text style={styles.uploadSubtext}>
                        {Platform.OS === 'web' ? 'JPG, PNG up to 10MB (Gallery only)' : 'JPG, PNG up to 10MB'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                {paymentImage && (
                  <Text style={styles.imageSuccessText}>✓ Payment screenshot uploaded successfully</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payment Details *</Text>
                <TextInput
                  style={styles.proofInput}
                  value={paymentProof}
                  onChangeText={setPaymentProof}
                  placeholder="Enter transaction ID, reference number, or payment details..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Phone Number *</Text>
                <TextInput
                  style={styles.phoneInput}
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  placeholder="+961 70 123456"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
                <Text style={styles.inputHint}>
                  We&apos;ll contact you on this number for verification
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  value={customerNotes}
                  onChangeText={setCustomerNotes}
                  placeholder="Any additional information for the admin..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowProofModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleSubmitSubscription}
                >
                  <Text style={styles.submitButtonText}>Submit Request</Text>
                </TouchableOpacity>
              </View>
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
  currentStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  statusContent: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  statusDescription: {
    fontSize: 14,
    color: "#92400E",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  packagesContainer: {
    padding: 20,
    gap: 16,
  },
  packageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  popularPackage: {
    borderColor: "#4F46E5",
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: "absolute",
    top: -8,
    left: 24,
    right: 24,
    backgroundColor: "#4F46E5",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  popularText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  packageHeader: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  packageName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
    textAlign: "center" as const,
  },
  packageDuration: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  priceContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  price: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  currency: {
    fontSize: 18,
    color: "#6B7280",
  },
  savingsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: "#9CA3AF",
    textDecorationLine: "line-through" as const,
  },
  savings: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600" as const,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  selectButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  selectButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  guaranteeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  guaranteeContent: {
    flex: 1,
    marginLeft: 16,
  },
  guaranteeTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  guaranteeDescription: {
    fontSize: 14,
    color: "#6B7280",
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
    maxWidth: 400,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  proofModalScroll: {
    flexGrow: 1,
    justifyContent: "center",
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
  selectedPackageInfo: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  selectedPackageName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  selectedPackagePrice: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#4F46E5",
    marginTop: 4,
  },
  paymentDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center" as const,
  },
  paymentMethodOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  paymentMethodContent: {
    flex: 1,
    marginLeft: 16,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  orderSummary: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 12,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  orderValue: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#1F2937",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#4F46E5",
  },
  instructionsCard: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionsContent: {
    flex: 1,
    marginLeft: 12,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#92400E",
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
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
  proofInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 100,
  },
  notesInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 80,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
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
  submitButton: {
    backgroundColor: "#10B981",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  noPaymentMethods: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  noPaymentMethodsText: {
    fontSize: 14,
    color: "#DC2626",
    textAlign: "center" as const,
  },
  loadingPaymentMethods: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  loadingPaymentMethodsText: {
    fontSize: 14,
    color: "#0369A1",
    textAlign: "center" as const,
  },
  errorPaymentMethods: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorPaymentMethodsText: {
    fontSize: 14,
    color: "#DC2626",
    textAlign: "center" as const,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  phoneText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500" as const,
  },
  paymentDetailsCard: {
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  paymentDetailsTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#0369A1",
    marginBottom: 8,
  },
  paymentDetailsText: {
    fontSize: 14,
    color: "#0369A1",
    lineHeight: 20,
    marginBottom: 8,
  },
  imageUploadButton: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed" as const,
    overflow: "hidden",
  },
  imagePreview: {
    position: "relative",
    height: 200,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover" as const,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  changeImageText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500" as const,
  },
  uploadPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#374151",
  },
  uploadSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  phoneInput: {
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
  imageSuccessText: {
    fontSize: 12,
    color: "#10B981",
    marginTop: 8,
    fontWeight: "500" as const,
  },
});