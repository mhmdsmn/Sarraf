import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Save,
  RefreshCw,
  Globe,
  Settings,
} from "lucide-react-native";
import { useAdmin } from "@/hooks/admin-store";

export default function AdminPricingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, updateSettings, language } = useAdmin();
  
  const [buyRate, setBuyRate] = useState(settings.globalBuyRate.toString());
  const [sellRate, setSellRate] = useState(settings.globalSellRate.toString());
  const [monthlyPrice, setMonthlyPrice] = useState(settings.premiumPricing.monthly.toString());
  const [quarterlyPrice, setQuarterlyPrice] = useState(settings.premiumPricing.quarterly.toString());
  const [yearlyPrice, setYearlyPrice] = useState(settings.premiumPricing.yearly.toString());
  const [freeLimit, setFreeLimit] = useState(settings.freeTransactionLimit.toString());
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);

  const handleSaveRates = useCallback(async () => {
    const newBuyRate = parseFloat(buyRate);
    const newSellRate = parseFloat(sellRate);

    if (isNaN(newBuyRate) || newBuyRate <= 0) {
      Alert.alert("خطأ", "يرجى إدخال سعر شراء صحيح");
      return;
    }

    if (isNaN(newSellRate) || newSellRate <= 0) {
      Alert.alert("خطأ", "يرجى إدخال سعر بيع صحيح");
      return;
    }

    if (newBuyRate >= newSellRate) {
      Alert.alert("خطأ", "سعر البيع يجب أن يكون أعلى من سعر الشراء");
      return;
    }

    await updateSettings({
      globalBuyRate: newBuyRate,
      globalSellRate: newSellRate,
    });

    Alert.alert("تم الحفظ", "تم تحديث أسعار الصرف بنجاح");
  }, [buyRate, sellRate, updateSettings]);

  const handleSavePricing = useCallback(async () => {
    const monthly = parseFloat(monthlyPrice);
    const quarterly = parseFloat(quarterlyPrice);
    const yearly = parseFloat(yearlyPrice);
    const limit = parseInt(freeLimit);

    if (isNaN(monthly) || monthly <= 0) {
      Alert.alert("خطأ", "يرجى إدخال سعر الاشتراك الشهري صحيح");
      return;
    }

    if (isNaN(quarterly) || quarterly <= 0) {
      Alert.alert("خطأ", "يرجى إدخال سعر الاشتراك الربع سنوي صحيح");
      return;
    }

    if (isNaN(yearly) || yearly <= 0) {
      Alert.alert("خطأ", "يرجى إدخال سعر الاشتراك السنوي صحيح");
      return;
    }

    if (isNaN(limit) || limit < 0) {
      Alert.alert("خطأ", "يرجى إدخال حد المعاملات المجانية صحيح");
      return;
    }

    await updateSettings({
      premiumPricing: {
        monthly,
        quarterly,
        yearly,
      },
      freeTransactionLimit: limit,
      maintenanceMode,
    });

    Alert.alert("تم الحفظ", "تم تحديث إعدادات التسعير بنجاح");
  }, [monthlyPrice, quarterlyPrice, yearlyPrice, freeLimit, maintenanceMode, updateSettings]);

  const resetToDefaults = useCallback(() => {
    Alert.alert(
      "إعادة تعيين",
      "هل أنت متأكد من إعادة تعيين جميع الأسعار إلى القيم الافتراضية؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "إعادة تعيين",
          style: "destructive",
          onPress: () => {
            setBuyRate("98000");
            setSellRate("100000");
            setMonthlyPrice("9.99");
            setQuarterlyPrice("24.99");
            setYearlyPrice("89.99");
            setFreeLimit("10");
            setMaintenanceMode(false);
          }
        }
      ]
    );
  }, []);

  const texts = {
    ar: {
      title: "التحكم في الأسعار",
      exchangeRates: "أسعار الصرف",
      buyRate: "سعر الشراء (أشتري الدولار)",
      sellRate: "سعر البيع (أبيع الدولار)",
      profitMargin: "هامش الربح",
      premiumPricing: "أسعار الاشتراك المميز",
      monthly: "شهري",
      quarterly: "ربع سنوي",
      yearly: "سنوي",
      freeLimit: "حد المعاملات المجانية",
      maintenanceMode: "وضع الصيانة",
      saveRates: "حفظ أسعار الصرف",
      savePricing: "حفظ أسعار الاشتراك",
      resetDefaults: "إعادة تعيين افتراضية",
      lbp: "ليرة لبنانية",
      usd: "دولار أمريكي",
      perMonth: "في الشهر",
      perQuarter: "في الربع",
      perYear: "في السنة",
      transactions: "معاملة",
    },
    en: {
      title: "Price Control",
      exchangeRates: "Exchange Rates",
      buyRate: "Buy Rate (I buy USD)",
      sellRate: "Sell Rate (I sell USD)",
      profitMargin: "Profit Margin",
      premiumPricing: "Premium Subscription Pricing",
      monthly: "Monthly",
      quarterly: "Quarterly",
      yearly: "Yearly",
      freeLimit: "Free Transaction Limit",
      maintenanceMode: "Maintenance Mode",
      saveRates: "Save Exchange Rates",
      savePricing: "Save Subscription Pricing",
      resetDefaults: "Reset to Defaults",
      lbp: "Lebanese Pounds",
      usd: "US Dollars",
      perMonth: "per month",
      perQuarter: "per quarter",
      perYear: "per year",
      transactions: "transactions",
    }
  };

  const t = texts[language];

  const profitMargin = parseFloat(sellRate) - parseFloat(buyRate);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <TouchableOpacity onPress={resetToDefaults}>
          <RefreshCw size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Exchange Rates Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe size={24} color="#4F46E5" />
            <Text style={styles.sectionTitle}>{t.exchangeRates}</Text>
          </View>

          <View style={styles.ratesContainer}>
            <View style={styles.rateCard}>
              <View style={styles.rateHeader}>
                <TrendingDown size={20} color="#10B981" />
                <Text style={styles.rateLabel}>{t.buyRate}</Text>
              </View>
              <TextInput
                style={styles.rateInput}
                value={buyRate}
                onChangeText={setBuyRate}
                keyboardType="numeric"
                placeholder="98000"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.rateCurrency}>{t.lbp}</Text>
            </View>

            <View style={styles.rateCard}>
              <View style={styles.rateHeader}>
                <TrendingUp size={20} color="#EF4444" />
                <Text style={styles.rateLabel}>{t.sellRate}</Text>
              </View>
              <TextInput
                style={styles.rateInput}
                value={sellRate}
                onChangeText={setSellRate}
                keyboardType="numeric"
                placeholder="100000"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.rateCurrency}>{t.lbp}</Text>
            </View>
          </View>

          <View style={styles.profitCard}>
            <Text style={styles.profitLabel}>{t.profitMargin}</Text>
            <Text style={[styles.profitValue, profitMargin > 0 ? styles.profitPositive : styles.profitNegative]}>
              {profitMargin.toLocaleString()} {t.lbp}
            </Text>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveRates}>
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>{t.saveRates}</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Pricing Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={24} color="#F59E0B" />
            <Text style={styles.sectionTitle}>{t.premiumPricing}</Text>
          </View>

          <View style={styles.pricingContainer}>
            <View style={styles.pricingCard}>
              <Text style={styles.pricingLabel}>{t.monthly}</Text>
              <View style={styles.pricingInputContainer}>
                <Text style={styles.pricingCurrency}>$</Text>
                <TextInput
                  style={styles.pricingInput}
                  value={monthlyPrice}
                  onChangeText={setMonthlyPrice}
                  keyboardType="numeric"
                  placeholder="9.99"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <Text style={styles.pricingPeriod}>{t.perMonth}</Text>
            </View>

            <View style={styles.pricingCard}>
              <Text style={styles.pricingLabel}>{t.quarterly}</Text>
              <View style={styles.pricingInputContainer}>
                <Text style={styles.pricingCurrency}>$</Text>
                <TextInput
                  style={styles.pricingInput}
                  value={quarterlyPrice}
                  onChangeText={setQuarterlyPrice}
                  keyboardType="numeric"
                  placeholder="24.99"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <Text style={styles.pricingPeriod}>{t.perQuarter}</Text>
            </View>

            <View style={styles.pricingCard}>
              <Text style={styles.pricingLabel}>{t.yearly}</Text>
              <View style={styles.pricingInputContainer}>
                <Text style={styles.pricingCurrency}>$</Text>
                <TextInput
                  style={styles.pricingInput}
                  value={yearlyPrice}
                  onChangeText={setYearlyPrice}
                  keyboardType="numeric"
                  placeholder="89.99"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <Text style={styles.pricingPeriod}>{t.perYear}</Text>
            </View>
          </View>

          <View style={styles.limitCard}>
            <Text style={styles.limitLabel}>{t.freeLimit}</Text>
            <View style={styles.limitInputContainer}>
              <TextInput
                style={styles.limitInput}
                value={freeLimit}
                onChangeText={setFreeLimit}
                keyboardType="numeric"
                placeholder="10"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.limitText}>{t.transactions}</Text>
            </View>
          </View>

          <View style={styles.maintenanceCard}>
            <View style={styles.maintenanceInfo}>
              <Settings size={20} color="#6B7280" />
              <Text style={styles.maintenanceLabel}>{t.maintenanceMode}</Text>
            </View>
            <Switch
              value={maintenanceMode}
              onValueChange={setMaintenanceMode}
              trackColor={{ false: "#E5E7EB", true: "#4F46E5" }}
              thumbColor={maintenanceMode ? "#FFFFFF" : "#F3F4F6"}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSavePricing}>
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>{t.savePricing}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  ratesContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  rateCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  rateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  rateLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  rateInput: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
    textAlign: "center" as const,
  },
  rateCurrency: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center" as const,
  },
  profitCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  profitLabel: {
    fontSize: 14,
    color: "#166534",
    marginBottom: 4,
  },
  profitValue: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  profitPositive: {
    color: "#16A34A",
  },
  profitNegative: {
    color: "#DC2626",
  },
  pricingContainer: {
    gap: 16,
    marginBottom: 20,
  },
  pricingCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pricingLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  pricingInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  pricingCurrency: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#6B7280",
    marginRight: 8,
  },
  pricingInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    paddingVertical: 12,
  },
  pricingPeriod: {
    fontSize: 12,
    color: "#6B7280",
  },
  limitCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  limitLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#92400E",
    marginBottom: 8,
  },
  limitInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  limitInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    width: 80,
    textAlign: "center" as const,
  },
  limitText: {
    fontSize: 14,
    color: "#92400E",
  },
  maintenanceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  maintenanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  maintenanceLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#991B1B",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    padding: 16,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});