import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowRight, DollarSign, TrendingUp, Shield, Globe } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tapCount, setTapCount] = useState(0);
  const [showAdminButton, setShowAdminButton] = useState(false);

  const handleLogoPress = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    
    if (newCount >= 5) {
      setShowAdminButton(true);
      setTimeout(() => {
        setTapCount(0);
      }, 3000);
    } else {
      setTimeout(() => {
        setTapCount(0);
      }, 2000);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={["#4F46E5", "#7C3AED", "#EC4899"]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.logoContainer}
            onPress={handleLogoPress}
            activeOpacity={0.8}
          >
            <DollarSign size={60} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>
          <Text style={styles.title}>Currency Exchange</Text>
          <Text style={styles.subtitle}>تطبيق صرافة العملات</Text>
          <Text style={styles.description}>
            أفضل تطبيق لإدارة عمليات صرف العملات بين الدولار الأمريكي والليرة اللبنانية
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <TrendingUp size={32} color="#4F46E5" />
            </View>
            <Text style={styles.featureTitle}>أسعار تنافسية</Text>
            <Text style={styles.featureDescription}>
              احصل على أفضل أسعار الصرف في السوق
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Shield size={32} color="#10B981" />
            </View>
            <Text style={styles.featureTitle}>آمن وموثوق</Text>
            <Text style={styles.featureDescription}>
              نظام أمان متقدم لحماية معاملاتك
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Globe size={32} color="#F59E0B" />
            </View>
            <Text style={styles.featureTitle}>دعم متعدد اللغات</Text>
            <Text style={styles.featureDescription}>
              واجهة بالعربية والإنجليزية
            </Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.primaryButtonText}>إنشاء حساب جديد</Text>
            <ArrowRight size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push("/signin")}
          >
            <Text style={styles.secondaryButtonText}>تسجيل الدخول</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => router.replace("/exchange")}
          >
            <Text style={styles.skipButtonText}>تخطي والمتابعة كضيف</Text>
          </TouchableOpacity>

          {showAdminButton && (
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={() => router.push("/secret-admin-portal")}
            >
              <Shield size={20} color="#DC2626" />
              <Text style={styles.adminButtonText}>🔒 Admin Portal</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  title: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: 20,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 16,
    fontWeight: "600" as const,
    textAlign: "center" as const,
  },
  description: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center" as const,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    marginBottom: 40,
    gap: 16,
  },
  featureCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center" as const,
  },
  featureDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center" as const,
    lineHeight: 20,
  },
  buttonsContainer: {
    gap: 16,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: "#4F46E5",
    fontSize: 18,
    fontWeight: "700" as const,
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600" as const,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  skipButtonText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    fontWeight: "500" as const,
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(220, 38, 38, 0.15)",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: "rgba(220, 38, 38, 0.4)",
    marginTop: 8,
  },
  adminButtonText: {
    color: "#FEE2E2",
    fontSize: 16,
    fontWeight: "700" as const,
  },
});
