import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Gift,
  Settings,
  LogOut,
  Globe,
  Shield,
  Activity,
  Calendar,
  MessageSquare,
  Crown,
  CreditCard,
  Tv,
} from "lucide-react-native";
import { useAdmin } from "@/hooks/admin-store";

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { 
    isAuthenticated, 
    logout, 
    dashboardStats, 
    language, 
    toggleLanguage,
    isLoading,
    generateMockData,
  } = useAdmin();
  
  const [refreshing, setRefreshing] = useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/secret-admin-portal");
    }
  }, [isAuthenticated, router]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      language === "ar" ? "تسجيل الخروج" : "Logout",
      language === "ar" ? "هل أنت متأكد من تسجيل الخروج؟" : "Are you sure you want to logout?",
      [
        { 
          text: language === "ar" ? "إلغاء" : "Cancel", 
          style: "cancel" 
        },
        { 
          text: language === "ar" ? "خروج" : "Logout", 
          onPress: () => {
            logout();
            router.replace("/secret-admin-portal");
          }
        }
      ]
    );
  }, [logout, router, language]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await generateMockData();
    setRefreshing(false);
  }, [generateMockData]);

  const navigateTo = useCallback((route: string) => {
    router.push(`/admin/${route}` as any);
  }, [router]);

  if (!isAuthenticated) {
    return null;
  }

  const texts = {
    ar: {
      title: "لوحة تحكم المدير",
      subtitle: "نظرة عامة على التطبيق",
      totalRevenue: "إجمالي الإيرادات",
      avgDaily: "متوسط يومي",
      totalUsers: "إجمالي المستخدمين",
      premiumUsers: "مستخدمين مميزين",
      openTickets: "تذاكر مفتوحة",
      activePromotions: "عروض نشطة",
      quickActions: "إجراءات سريعة",
      userManagement: "إدارة المستخدمين",
      userManagementDesc: "مراقبة وإدارة المستخدمين",
      priceControl: "التحكم في الأسعار",
      priceControlDesc: "تحديث أسعار الصرف",
      promotions: "العروض والخصومات",
      promotionsDesc: "إدارة العروض الترويجية",
      analytics: "التقارير والإحصائيات",
      analyticsDesc: "تحليلات الأداء",
      support: "الدعم الفني",
      supportDesc: "إدارة تذاكر الدعم",
      subscriptions: "إدارة الاشتراكات",
      subscriptionsDesc: "مراجعة طلبات الاشتراك المميز",
      paymentMethods: "طرق الدفع",
      paymentMethodsDesc: "إدارة طرق الدفع للعملاء",
      adsSettings: "إعدادات الإعلانات",
      adsSettingsDesc: "إدارة نظام الإعلانات",
      settings: "الإعدادات",
      settingsDesc: "إعدادات التطبيق",
      language: "اللغة",
      logout: "تسجيل الخروج",
    },
    en: {
      title: "Admin Dashboard",
      subtitle: "Application Overview",
      totalRevenue: "Total Revenue",
      avgDaily: "Daily Average",
      totalUsers: "Total Users",
      premiumUsers: "Premium Users",
      openTickets: "Open Tickets",
      activePromotions: "Active Promotions",
      quickActions: "Quick Actions",
      userManagement: "User Management",
      userManagementDesc: "Monitor and manage users",
      priceControl: "Price Control",
      priceControlDesc: "Update exchange rates",
      promotions: "Promotions & Offers",
      promotionsDesc: "Manage promotional offers",
      analytics: "Reports & Analytics",
      analyticsDesc: "Performance analytics",
      support: "Technical Support",
      supportDesc: "Manage support tickets",
      subscriptions: "Subscription Management",
      subscriptionsDesc: "Review premium subscription requests",
      paymentMethods: "Payment Methods",
      paymentMethodsDesc: "Manage customer payment options",
      adsSettings: "Ads Settings",
      adsSettingsDesc: "Manage advertising system",
      settings: "Settings",
      settingsDesc: "Application settings",
      language: "Language",
      logout: "Logout",
    }
  };

  const t = texts[language];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Shield size={24} color="#4F46E5" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{t.title}</Text>
            <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={toggleLanguage}>
            <Globe size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.revenueCard]}>
              <DollarSign size={24} color="#10B981" />
              <Text style={styles.statValue}>
                {dashboardStats.totalRevenue.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>{t.totalRevenue}</Text>
              <Text style={styles.statSubtext}>
                {t.avgDaily}: {dashboardStats.avgDailyRevenue.toFixed(0)}
              </Text>
            </View>
            
            <View style={[styles.statCard, styles.usersCard]}>
              <Users size={24} color="#3B82F6" />
              <Text style={styles.statValue}>{dashboardStats.totalUsers}</Text>
              <Text style={styles.statLabel}>{t.totalUsers}</Text>
              <Text style={styles.statSubtext}>
                {t.premiumUsers}: {dashboardStats.premiumUsers}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.ticketsCard]}>
              <MessageSquare size={24} color="#F59E0B" />
              <Text style={styles.statValue}>{dashboardStats.openTickets}</Text>
              <Text style={styles.statLabel}>{t.openTickets}</Text>
            </View>
            
            <View style={[styles.statCard, styles.promotionsCard]}>
              <Gift size={24} color="#8B5CF6" />
              <Text style={styles.statValue}>{dashboardStats.activePromotions}</Text>
              <Text style={styles.statLabel}>{t.activePromotions}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.quickActions}</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigateTo("users")}
            >
              <Users size={32} color="#3B82F6" />
              <Text style={styles.actionTitle}>{t.userManagement}</Text>
              <Text style={styles.actionDescription}>{t.userManagementDesc}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigateTo("pricing")}
            >
              <TrendingUp size={32} color="#10B981" />
              <Text style={styles.actionTitle}>{t.priceControl}</Text>
              <Text style={styles.actionDescription}>{t.priceControlDesc}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigateTo("promotions")}
            >
              <Gift size={32} color="#F59E0B" />
              <Text style={styles.actionTitle}>{t.promotions}</Text>
              <Text style={styles.actionDescription}>{t.promotionsDesc}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigateTo("analytics")}
            >
              <BarChart3 size={32} color="#8B5CF6" />
              <Text style={styles.actionTitle}>{t.analytics}</Text>
              <Text style={styles.actionDescription}>{t.analyticsDesc}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigateTo("support")}
            >
              <MessageSquare size={32} color="#EF4444" />
              <Text style={styles.actionTitle}>{t.support}</Text>
              <Text style={styles.actionDescription}>{t.supportDesc}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigateTo("subscriptions")}
            >
              <Crown size={32} color="#F59E0B" />
              <Text style={styles.actionTitle}>{t.subscriptions}</Text>
              <Text style={styles.actionDescription}>{t.subscriptionsDesc}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigateTo("payment-methods")}
            >
              <CreditCard size={32} color="#10B981" />
              <Text style={styles.actionTitle}>{t.paymentMethods}</Text>
              <Text style={styles.actionDescription}>{t.paymentMethodsDesc}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigateTo("ads-settings")}
            >
              <Tv size={32} color="#EC4899" />
              <Text style={styles.actionTitle}>{t.adsSettings}</Text>
              <Text style={styles.actionDescription}>{t.adsSettingsDesc}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigateTo("settings")}
            >
              <Settings size={32} color="#6B7280" />
              <Text style={styles.actionTitle}>{t.settings}</Text>
              <Text style={styles.actionDescription}>{t.settingsDesc}</Text>
            </TouchableOpacity>
          </View>
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  revenueCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  usersCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  ticketsCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  promotionsCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center" as const,
  },
  actionDescription: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center" as const,
    lineHeight: 16,
  },
});