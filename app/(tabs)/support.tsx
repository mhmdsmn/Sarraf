import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Send, 
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Crown,
  ExternalLink,
  MessageSquare,
  Headphones
} from "lucide-react-native";
import { useExchange } from "@/hooks/exchange-store";

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  isPremium?: boolean;
}

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const { isPremium } = useExchange();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSupport = () => {
    const emailBody = `
التطبيق: تطبيق الصرافة
النسخة: 1.0.0
النظام: ${Platform.OS}
الاشتراك: ${isPremium ? 'Premium' : 'Free'}

الرسالة:
${message}

---
معلومات إضافية:
البريد الإلكتروني: ${email}
الموضوع: ${subject}
    `.trim();

    const emailUrl = `mailto:support@exchangeapp.com?subject=${encodeURIComponent(subject || 'طلب دعم فني')}&body=${encodeURIComponent(emailBody)}`;
    
    Linking.openURL(emailUrl).catch(() => {
      Alert.alert("خطأ", "لا يمكن فتح تطبيق البريد الإلكتروني");
    });
  };

  const handleWhatsAppSupport = () => {
    const whatsappMessage = `
مرحباً، أحتاج مساعدة في تطبيق الصرافة

الموضوع: ${subject || 'طلب دعم فني'}
الرسالة: ${message}

الاشتراك: ${isPremium ? 'Premium' : 'Free'}
النظام: ${Platform.OS}
    `.trim();

    const whatsappUrl = `whatsapp://send?phone=96171234567&text=${encodeURIComponent(whatsappMessage)}`;
    
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert("خطأ", "لا يمكن فتح تطبيق واتساب");
    });
  };

  const handlePhoneSupport = () => {
    const phoneNumber = "tel:+96171234567";
    Linking.openURL(phoneNumber).catch(() => {
      Alert.alert("خطأ", "لا يمكن إجراء المكالمة");
    });
  };

  const handleLiveChat = () => {
    if (!isPremium) {
      Alert.alert(
        "ميزة Premium",
        "الدردشة المباشرة متاحة فقط لمشتركي Premium. يرجى الترقية للاستفادة من هذه الميزة.",
        [
          { text: "إلغاء", style: "cancel" },
          { text: "ترقية الآن", onPress: () => {} }
        ]
      );
      return;
    }
    
    Alert.alert("قريباً", "ميزة الدردشة المباشرة ستكون متاحة قريباً");
  };

  const handleSubmitTicket = async () => {
    if (!message.trim() || !email.trim() || !subject.trim()) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "تم الإرسال بنجاح",
        "تم إرسال طلب الدعم بنجاح. سنتواصل معك خلال 24 ساعة.",
        [{ text: "موافق", onPress: () => {
          setMessage("");
          setEmail("");
          setSubject("");
        }}]
      );
    }, 2000);
  };

  const supportOptions: SupportOption[] = [
    {
      id: "email",
      title: "البريد الإلكتروني",
      description: "أرسل رسالة مفصلة وسنرد خلال 24 ساعة",
      icon: <Mail size={24} color="#4F46E5" />,
      action: handleEmailSupport,
    },
    {
      id: "whatsapp",
      title: "واتساب",
      description: "تواصل معنا مباشرة عبر واتساب",
      icon: <MessageSquare size={24} color="#10B981" />,
      action: handleWhatsAppSupport,
    },
    {
      id: "phone",
      title: "المكالمة الهاتفية",
      description: "اتصل بنا مباشرة للحصول على مساعدة فورية",
      icon: <Phone size={24} color="#F59E0B" />,
      action: handlePhoneSupport,
    },
    {
      id: "live-chat",
      title: "الدردشة المباشرة",
      description: "دردشة فورية مع فريق الدعم",
      icon: <Headphones size={24} color="#8B5CF6" />,
      action: handleLiveChat,
      isPremium: true,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>الدعم الفني</Text>
          <Text style={styles.subtitle}>نحن هنا لمساعدتك في أي وقت</Text>
        </View>

        {/* Premium Status */}
        <View style={styles.section}>
          <View style={[styles.statusCard, isPremium ? styles.premiumCard : styles.freeCard]}>
            <View style={styles.statusHeader}>
              {isPremium ? (
                <>
                  <Crown size={24} color="#F59E0B" />
                  <Text style={styles.statusTitle}>عضو Premium</Text>
                  <View style={styles.priorityBadge}>
                    <Star size={16} color="#FFFFFF" />
                    <Text style={styles.priorityText}>أولوية</Text>
                  </View>
                </>
              ) : (
                <>
                  <MessageCircle size={24} color="#6B7280" />
                  <Text style={styles.statusTitle}>عضو مجاني</Text>
                </>
              )}
            </View>
            <Text style={styles.statusDescription}>
              {isPremium 
                ? "تحصل على دعم فني أولوية مع استجابة خلال 4 ساعات"
                : "الدعم الفني متاح خلال 24 ساعة"
              }
            </Text>
          </View>
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>طرق التواصل</Text>
          
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                option.isPremium && !isPremium && styles.disabledCard
              ]}
              onPress={option.action}
              disabled={option.isPremium && !isPremium}
            >
              <View style={styles.optionLeft}>
                {option.icon}
                <View style={styles.optionContent}>
                  <View style={styles.optionTitleRow}>
                    <Text style={[
                      styles.optionTitle,
                      option.isPremium && !isPremium && styles.disabledText
                    ]}>
                      {option.title}
                    </Text>
                    {option.isPremium && (
                      <View style={styles.premiumBadge}>
                        <Crown size={12} color="#F59E0B" />
                        <Text style={styles.premiumBadgeText}>Premium</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[
                    styles.optionDescription,
                    option.isPremium && !isPremium && styles.disabledText
                  ]}>
                    {option.description}
                  </Text>
                </View>
              </View>
              <ExternalLink size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Support Ticket Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إرسال طلب دعم</Text>
          
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>البريد الإلكتروني *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الموضوع *</Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="اختر موضوع المشكلة"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>وصف المشكلة *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="اشرح المشكلة بالتفصيل..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submittingButton]}
              onPress={handleSubmitTicket}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Text style={styles.submitButtonText}>جاري الإرسال...</Text>
              ) : (
                <>
                  <Send size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>إرسال طلب الدعم</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Response Times */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>أوقات الاستجابة</Text>
          
          <View style={styles.responseCard}>
            <View style={styles.responseItem}>
              <Clock size={20} color="#10B981" />
              <View style={styles.responseContent}>
                <Text style={styles.responseTitle}>الدردشة المباشرة</Text>
                <Text style={styles.responseTime}>
                  {isPremium ? "فوري - 2 دقيقة" : "Premium فقط"}
                </Text>
              </View>
              {isPremium && <CheckCircle size={16} color="#10B981" />}
            </View>

            <View style={styles.responseItem}>
              <Clock size={20} color="#F59E0B" />
              <View style={styles.responseContent}>
                <Text style={styles.responseTitle}>البريد الإلكتروني</Text>
                <Text style={styles.responseTime}>
                  {isPremium ? "4 ساعات" : "24 ساعة"}
                </Text>
              </View>
              <CheckCircle size={16} color="#10B981" />
            </View>

            <View style={styles.responseItem}>
              <Clock size={20} color="#8B5CF6" />
              <View style={styles.responseContent}>
                <Text style={styles.responseTitle}>المكالمة الهاتفية</Text>
                <Text style={styles.responseTime}>9 صباحاً - 6 مساءً</Text>
              </View>
              <CheckCircle size={16} color="#10B981" />
            </View>
          </View>
        </View>

        {/* FAQ Link */}
        <View style={styles.section}>
          <View style={styles.faqCard}>
            <AlertCircle size={24} color="#4F46E5" />
            <View style={styles.faqContent}>
              <Text style={styles.faqTitle}>لم تجد إجابة لسؤالك؟</Text>
              <Text style={styles.faqDescription}>
                تحقق من دليل الاستخدام والأسئلة الشائعة في تبويب "Help"
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1F2937",
    textAlign: "right" as const,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "right" as const,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "right" as const,
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  premiumCard: {
    backgroundColor: "#FEF3C7",
    borderWidth: 2,
    borderColor: "#F59E0B",
  },
  freeCard: {
    backgroundColor: "#FFFFFF",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    flex: 1,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priorityText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  statusDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "right" as const,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  disabledCard: {
    backgroundColor: "#F9FAFB",
    opacity: 0.6,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  optionDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "right" as const,
  },
  disabledText: {
    color: "#9CA3AF",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  premiumBadgeText: {
    color: "#92400E",
    fontSize: 10,
    fontWeight: "600" as const,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 8,
    textAlign: "right" as const,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    textAlign: "right" as const,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  submittingButton: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  responseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  responseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  responseContent: {
    flex: 1,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    textAlign: "right" as const,
  },
  responseTime: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "right" as const,
  },
  faqCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  faqContent: {
    flex: 1,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
    textAlign: "right" as const,
  },
  faqDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "right" as const,
  },
  bottomSpacing: {
    height: 40,
  },
});