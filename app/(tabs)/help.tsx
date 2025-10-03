import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  ChevronDown, 
  ChevronRight, 
  ArrowLeftRight, 
  DollarSign, 
  Calculator,
  TrendingUp,
  Vault,
  History,
  Crown,
  Download,
  Smartphone,
  RefreshCw
} from "lucide-react-native";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ReactNode;
}

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const faqData: FAQItem[] = [
    {
      id: "basics",
      question: "كيف يعمل التطبيق؟",
      answer: "التطبيق يعمل كصراف إلكتروني. أنت تحدد سعرين: سعر الشراء (منخفض) وسعر البيع (مرتفع). الفرق بينهما هو ربحك. العملاء يأتون إليك لتبديل العملات وأنت تحصل على الربح من الفرق في الأسعار.",
      icon: <ArrowLeftRight size={20} color="#4F46E5" />
    },
    {
      id: "rates",
      question: "كيف أحدد أسعار الصرف؟",
      answer: "في الصفحة الرئيسية، يمكنك تعديل سعر الشراء وسعر البيع. سعر الشراء هو السعر الذي تشتري به الدولار من العميل (أقل). سعر البيع هو السعر الذي تبيع به الدولار للعميل (أعلى). مثال: شراء 98,000 ليرة، بيع 100,000 ليرة.",
      icon: <DollarSign size={20} color="#10B981" />
    },
    {
      id: "calculations",
      question: "كيف يتم حساب المعاملات؟",
      answer: "هناك سيناريوهان فقط:\n\n1. العميل يريد دولار (يدفع ليرة):\n   المبلغ بالليرة ÷ سعر البيع = دولار\n\n2. العميل يريد ليرة (يدفع دولار):\n   المبلغ بالدولار × سعر الشراء = ليرة\n\nالربح = الفرق بين سعري البيع والشراء",
      icon: <Calculator size={20} color="#8B5CF6" />
    },
    {
      id: "boxes",
      question: "ما هي صناديق 'My Box' و 'His Box'؟",
      answer: "هذه الصناديق تتبع الأرباح:\n\n• My Box: عندما تشتري من العميل (العميل يبيع لك)\n• His Box: عندما تبيع للعميل (العميل يشتري منك)\n\nالقواعد:\n- شراء USD→LBP: My Box\n- بيع USD→LBP: His Box\n- شراء LBP→USD: My Box\n- بيع LBP→USD: His Box",
      icon: <TrendingUp size={20} color="#F59E0B" />
    },
    {
      id: "vault",
      question: "كيف أدير رصيد الخزنة؟",
      answer: "الخزنة تحتوي على رصيدك الفعلي من الليرة والدولار. يمكنك:\n\n• تحديث الرصيد من الإعدادات\n• مراقبة الرصيد المتبقي\n• الرصيد يتغير تلقائياً مع كل معاملة\n\nمثال: إذا بعت 100 دولار، سينقص رصيد الدولار ويزيد رصيد الليرة.",
      icon: <Vault size={20} color="#EF4444" />
    },
    {
      id: "history",
      question: "كيف أتابع المعاملات؟",
      answer: "في تبويب 'History' يمكنك:\n\n• مشاهدة جميع المعاملات\n• فلترة حسب التاريخ أو النوع\n• مشاهدة تفاصيل كل معاملة\n• حساب إجمالي الأرباح\n• تصدير البيانات (Premium)",
      icon: <History size={20} color="#6366F1" />
    },
    {
      id: "premium",
      question: "ما هي مميزات Premium؟",
      answer: "الاشتراك المميز يوفر:\n\n• معاملات غير محدودة (بدلاً من 10)\n• تصدير البيانات إلى Excel\n• النسخ الاحتياطي التلقائي اليومي\n• حفظ على الهاتف أو إرسال بالإيميل\n• دعم فني أولوية\n• تقارير متقدمة",
      icon: <Crown size={20} color="#F59E0B" />
    },
    {
      id: "export",
      question: "كيف أصدر البيانات؟",
      answer: "مع Premium يمكنك:\n\n• تصدير جميع المعاملات إلى Excel\n• اختيار الفترة الزمنية\n• حفظ الملف على الهاتف\n• إرسال الملف بالإيميل\n• النسخ الاحتياطي التلقائي اليومي",
      icon: <Download size={20} color="#10B981" />
    },
    {
      id: "autosave",
      question: "كيف يعمل الحفظ التلقائي؟",
      answer: "مع Premium، يمكنك تفعيل الحفظ التلقائي:\n\n• حفظ يومي تلقائي\n• خيار الحفظ على الهاتف\n• خيار الإرسال بالإيميل\n• نسخة احتياطية كاملة من البيانات\n• استرداد البيانات عند الحاجة",
      icon: <Smartphone size={20} color="#8B5CF6" />
    },
    {
      id: "reset",
      question: "كيف أعيد تعيين البيانات؟",
      answer: "في الإعدادات يمكنك:\n\n• إعادة تعيين الأسعار للقيم الافتراضية\n• مسح تاريخ المعاملات\n• إعادة تعيين أرصدة الصناديق\n• إعادة تعيين رصيد الخزنة\n• إعادة تعيين جميع البيانات\n\n⚠️ تأكد قبل الحذف - العملية غير قابلة للتراجع!",
      icon: <RefreshCw size={20} color="#EF4444" />
    }
  ];

  const renderFAQItem = (item: FAQItem) => {
    const isExpanded = expandedItems.includes(item.id);
    
    return (
      <View key={item.id} style={styles.faqItem}>
        <TouchableOpacity 
          style={styles.faqHeader}
          onPress={() => toggleExpanded(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.faqHeaderLeft}>
            {item.icon}
            <Text style={styles.faqQuestion}>{item.question}</Text>
          </View>
          {isExpanded ? (
            <ChevronDown size={20} color="#6B7280" />
          ) : (
            <ChevronRight size={20} color="#6B7280" />
          )}
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{item.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>دليل الاستخدام</Text>
          <Text style={styles.subtitle}>شرح مفصل لجميع ميزات التطبيق</Text>
        </View>

        {/* Quick Start Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>البدء السريع</Text>
          
          <View style={styles.quickStartCard}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>حدد أسعار الصرف</Text>
                <Text style={styles.stepDescription}>
                  اذهب للصفحة الرئيسية وحدد سعر الشراء وسعر البيع
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>اضبط رصيد الخزنة</Text>
                <Text style={styles.stepDescription}>
                  من الإعدادات، حدد كمية الليرة والدولار في خزنتك
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>ابدأ التصريف</Text>
                <Text style={styles.stepDescription}>
                  أدخل المبلغ واختر العملة، التطبيق سيحسب كل شيء تلقائياً
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>تابع الأرباح</Text>
                <Text style={styles.stepDescription}>
                  راقب أرباحك في تبويب التاريخ والإحصائيات
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الأسئلة الشائعة</Text>
          
          <View style={styles.faqContainer}>
            {faqData.map(renderFAQItem)}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نصائح مهمة</Text>
          
          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>
                احرص على تحديث رصيد الخزنة بانتظام لتجنب النقص
              </Text>
            </View>

            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>📊</Text>
              <Text style={styles.tipText}>
                راقب الأرباح يومياً لمعرفة أداء عملك
              </Text>
            </View>

            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>💾</Text>
              <Text style={styles.tipText}>
                فعل النسخ الاحتياطي التلقائي لحماية بياناتك
              </Text>
            </View>

            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>⚡</Text>
              <Text style={styles.tipText}>
                استخدم Premium للحصول على ميزات متقدمة
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
  quickStartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
    textAlign: "right" as const,
  },
  stepDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    textAlign: "right" as const,
  },
  faqContainer: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  faqHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    flex: 1,
    textAlign: "right" as const,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
    textAlign: "right" as const,
  },
  tipsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    lineHeight: 20,
    textAlign: "right" as const,
  },
  bottomSpacing: {
    height: 40,
  },
});