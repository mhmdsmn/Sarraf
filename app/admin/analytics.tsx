import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Activity,
  PieChart,
} from "lucide-react-native";
import { useAdmin } from "@/hooks/admin-store";

const { width } = Dimensions.get("window");

export default function AdminAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { analytics, users, language } = useAdmin();
  
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "monthly">("daily");

  const calculateGrowth = useCallback((current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }, []);

  const texts = {
    ar: {
      title: "التقارير والإحصائيات",
      overview: "نظرة عامة",
      revenue: "الإيرادات",
      transactions: "المعاملات",
      users: "المستخدمين",
      growth: "النمو",
      daily: "يومي",
      monthly: "شهري",
      totalRevenue: "إجمالي الإيرادات",
      totalTransactions: "إجمالي المعاملات",
      totalUsers: "إجمالي المستخدمين",
      activeUsers: "مستخدمين نشطين",
      premiumUsers: "مستخدمين مميزين",
      newUsers: "مستخدمين جدد",
      topUsers: "أفضل المستخدمين",
      revenueChart: "مخطط الإيرادات",
      userStats: "إحصائيات المستخدمين",
      transactionStats: "إحصائيات المعاملات",
      today: "اليوم",
      thisWeek: "هذا الأسبوع",
      thisMonth: "هذا الشهر",
      volume: "الحجم",
      lbp: "ليرة لبنانية",
    },
    en: {
      title: "Reports & Analytics",
      overview: "Overview",
      revenue: "Revenue",
      transactions: "Transactions",
      users: "Users",
      growth: "Growth",
      daily: "Daily",
      monthly: "Monthly",
      totalRevenue: "Total Revenue",
      totalTransactions: "Total Transactions",
      totalUsers: "Total Users",
      activeUsers: "Active Users",
      premiumUsers: "Premium Users",
      newUsers: "New Users",
      topUsers: "Top Users",
      revenueChart: "Revenue Chart",
      userStats: "User Statistics",
      transactionStats: "Transaction Statistics",
      today: "Today",
      thisWeek: "This Week",
      thisMonth: "This Month",
      volume: "Volume",
      lbp: "LBP",
    }
  };

  const t = texts[language];

  const revenueData = selectedPeriod === "daily" ? analytics.dailyRevenue : analytics.monthlyRevenue;
  const maxRevenue = Math.max(...revenueData.map(item => item.amount));

  const todayGrowth = calculateGrowth(analytics.transactionStats.today, 30); // Mock previous day
  const weekGrowth = calculateGrowth(analytics.transactionStats.thisWeek, 200); // Mock previous week
  const monthGrowth = calculateGrowth(analytics.transactionStats.thisMonth, 750); // Mock previous month

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Overview Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.overview}</Text>
          
          <View style={styles.overviewGrid}>
            <View style={[styles.overviewCard, styles.revenueCard]}>
              <DollarSign size={24} color="#10B981" />
              <Text style={styles.overviewValue}>
                {revenueData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </Text>
              <Text style={styles.overviewLabel}>{t.totalRevenue}</Text>
              <Text style={styles.overviewCurrency}>{t.lbp}</Text>
            </View>

            <View style={[styles.overviewCard, styles.transactionCard]}>
              <Activity size={24} color="#3B82F6" />
              <Text style={styles.overviewValue}>
                {analytics.transactionStats.total.toLocaleString()}
              </Text>
              <Text style={styles.overviewLabel}>{t.totalTransactions}</Text>
            </View>

            <View style={[styles.overviewCard, styles.userCard]}>
              <Users size={24} color="#8B5CF6" />
              <Text style={styles.overviewValue}>
                {analytics.userStats.total}
              </Text>
              <Text style={styles.overviewLabel}>{t.totalUsers}</Text>
            </View>

            <View style={[styles.overviewCard, styles.activeCard]}>
              <TrendingUp size={24} color="#F59E0B" />
              <Text style={styles.overviewValue}>
                {analytics.userStats.active}
              </Text>
              <Text style={styles.overviewLabel}>{t.activeUsers}</Text>
            </View>
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={styles.section}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>{t.revenueChart}</Text>
            <View style={styles.periodToggle}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === "daily" && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod("daily")}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === "daily" && styles.periodButtonTextActive
                ]}>
                  {t.daily}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === "monthly" && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod("monthly")}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === "monthly" && styles.periodButtonTextActive
                ]}>
                  {t.monthly}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chart}>
                {revenueData.map((item, index) => {
                  const height = (item.amount / maxRevenue) * 120;
                  return (
                    <View key={index} style={styles.chartBar}>
                      <View style={styles.chartBarContainer}>
                        <View style={[styles.chartBarFill, { height }]} />
                      </View>
                      <Text style={styles.chartLabel}>
                        {selectedPeriod === "daily" 
                          ? ('date' in item ? item.date.split('-')[2] : '')
                          : ('month' in item ? item.month.split('-')[1] : '')
                        }
                      </Text>
                      <Text style={styles.chartValue}>
                        {(item.amount / 1000).toFixed(0)}K
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Transaction Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.transactionStats}</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Calendar size={20} color="#10B981" />
                <Text style={styles.statLabel}>{t.today}</Text>
              </View>
              <Text style={styles.statValue}>{analytics.transactionStats.today}</Text>
              <View style={styles.growthContainer}>
                <TrendingUp size={14} color={todayGrowth >= 0 ? "#10B981" : "#EF4444"} />
                <Text style={[
                  styles.growthText,
                  { color: todayGrowth >= 0 ? "#10B981" : "#EF4444" }
                ]}>
                  {todayGrowth >= 0 ? "+" : ""}{todayGrowth.toFixed(1)}%
                </Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Calendar size={20} color="#3B82F6" />
                <Text style={styles.statLabel}>{t.thisWeek}</Text>
              </View>
              <Text style={styles.statValue}>{analytics.transactionStats.thisWeek}</Text>
              <View style={styles.growthContainer}>
                <TrendingUp size={14} color={weekGrowth >= 0 ? "#10B981" : "#EF4444"} />
                <Text style={[
                  styles.growthText,
                  { color: weekGrowth >= 0 ? "#10B981" : "#EF4444" }
                ]}>
                  {weekGrowth >= 0 ? "+" : ""}{weekGrowth.toFixed(1)}%
                </Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Calendar size={20} color="#8B5CF6" />
                <Text style={styles.statLabel}>{t.thisMonth}</Text>
              </View>
              <Text style={styles.statValue}>{analytics.transactionStats.thisMonth}</Text>
              <View style={styles.growthContainer}>
                <TrendingUp size={14} color={monthGrowth >= 0 ? "#10B981" : "#EF4444"} />
                <Text style={[
                  styles.growthText,
                  { color: monthGrowth >= 0 ? "#10B981" : "#EF4444" }
                ]}>
                  {monthGrowth >= 0 ? "+" : ""}{monthGrowth.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* User Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.userStats}</Text>
          
          <View style={styles.userStatsContainer}>
            <View style={styles.userStatsPie}>
              <PieChart size={80} color="#4F46E5" />
              <View style={styles.pieCenter}>
                <Text style={styles.pieCenterValue}>{analytics.userStats.total}</Text>
                <Text style={styles.pieCenterLabel}>{t.users}</Text>
              </View>
            </View>
            
            <View style={styles.userStatsLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: "#10B981" }]} />
                <Text style={styles.legendLabel}>{t.activeUsers}</Text>
                <Text style={styles.legendValue}>{analytics.userStats.active}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: "#F59E0B" }]} />
                <Text style={styles.legendLabel}>{t.premiumUsers}</Text>
                <Text style={styles.legendValue}>{analytics.userStats.premium}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: "#3B82F6" }]} />
                <Text style={styles.legendLabel}>{t.newUsers}</Text>
                <Text style={styles.legendValue}>{analytics.userStats.newThisMonth}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Top Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.topUsers}</Text>
          
          <View style={styles.topUsersList}>
            {analytics.topUsers.map((user, index) => (
              <View key={user.userId} style={styles.topUserItem}>
                <View style={styles.topUserRank}>
                  <Text style={styles.topUserRankText}>{index + 1}</Text>
                </View>
                <View style={styles.topUserInfo}>
                  <Text style={styles.topUserName}>{user.name}</Text>
                  <Text style={styles.topUserVolume}>
                    {t.volume}: {user.volume.toLocaleString()} {t.lbp}
                  </Text>
                </View>
                <View style={styles.topUserBadge}>
                  <TrendingUp size={16} color="#10B981" />
                </View>
              </View>
            ))}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  headerRight: {
    width: 24,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  overviewCard: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderLeftWidth: 4,
  },
  revenueCard: {
    borderLeftColor: "#10B981",
  },
  transactionCard: {
    borderLeftColor: "#3B82F6",
  },
  userCard: {
    borderLeftColor: "#8B5CF6",
  },
  activeCard: {
    borderLeftColor: "#F59E0B",
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginTop: 8,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center" as const,
  },
  overviewCurrency: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  periodToggle: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: "#4F46E5",
  },
  periodButtonText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },
  chartContainer: {
    height: 180,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 140,
    paddingHorizontal: 10,
  },
  chartBar: {
    alignItems: "center",
    marginHorizontal: 8,
    minWidth: 40,
  },
  chartBarContainer: {
    height: 120,
    width: 24,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  chartBarFill: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    width: "100%",
  },
  chartLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
  },
  chartValue: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  growthContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  growthText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  userStatsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  userStatsPie: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  pieCenter: {
    position: "absolute",
    alignItems: "center",
  },
  pieCenterValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  pieCenterLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  userStatsLegend: {
    flex: 1,
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
  },
  legendValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  topUsersList: {
    gap: 12,
  },
  topUserItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  topUserRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  topUserRankText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  topUserInfo: {
    flex: 1,
  },
  topUserName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 2,
  },
  topUserVolume: {
    fontSize: 12,
    color: "#6B7280",
  },
  topUserBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
});