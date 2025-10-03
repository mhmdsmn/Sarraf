import { useState, useEffect, useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { Alert, Platform } from "react-native";

// Admin storage keys
const ADMIN_STORAGE_KEYS = {
  IS_AUTHENTICATED: "@admin_is_authenticated",
  CURRENT_USER: "@current_user",
  HAS_ONBOARDED: "@has_onboarded",
  ALL_APP_USERS: "@all_app_users",
  USERS: "@admin_users",
  GLOBAL_RATES: "@admin_global_rates",
  PROMOTIONS: "@admin_promotions",
  LANGUAGE: "@admin_language",
  SUPPORT_TICKETS: "@admin_support_tickets",
  ANALYTICS: "@admin_analytics",
  SETTINGS: "@admin_settings",
  ADMIN_PASSWORD: "@admin_password",
};

const DEFAULT_ADMIN_PASSWORD = "admin123456";

// Types
export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  registrationDate: number;
  transactionCount: number;
  totalVolume: number;
  status: "active" | "suspended";
  isPremium: boolean;
  premiumExpiry?: number;
  lastActivity: number;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: number;
  endDate: number;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
  couponCode?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: number;
  updatedAt: number;
  adminResponse?: string;
}

export interface Analytics {
  dailyRevenue: { date: string; amount: number }[];
  monthlyRevenue: { month: string; amount: number }[];
  transactionStats: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  userStats: {
    total: number;
    active: number;
    premium: number;
    newThisMonth: number;
  };
  topUsers: { userId: string; name: string; volume: number }[];
}

export interface AdminSettings {
  globalBuyRate: number;
  globalSellRate: number;
  premiumPricing: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  freeTransactionLimit: number;
  autoBackupEnabled: boolean;
  maintenanceMode: boolean;
  supportEmail: string;
  appVersion: string;
}

const DEFAULT_SETTINGS: AdminSettings = {
  globalBuyRate: 98000,
  globalSellRate: 100000,
  premiumPricing: {
    monthly: 9.99,
    quarterly: 24.99,
    yearly: 89.99,
  },
  freeTransactionLimit: 10,
  autoBackupEnabled: true,
  maintenanceMode: false,
  supportEmail: "support@exchangeapp.com",
  appVersion: "1.0.0",
};

// Create a storage interface that works with both web and native
const createStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: async (key: string) => {
        try {
          if (!key?.trim()) return null;
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          if (!key?.trim() || !value) return;
          localStorage.setItem(key, value);
        } catch {
          // Ignore errors
        }
      },
      removeItem: async (key: string) => {
        try {
          if (!key?.trim()) return;
          localStorage.removeItem(key);
        } catch {
          // Ignore errors
        }
      }
    };
  } else {
    // Dynamic import for AsyncStorage
    let AsyncStorage: any;
    try {
      AsyncStorage = require('@react-native-async-storage/async-storage').default;
    } catch {
      // Fallback if AsyncStorage is not available
      return {
        getItem: async () => null,
        setItem: async () => {},
        removeItem: async () => {}
      };
    }
    return AsyncStorage;
  }
};

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  registrationDate: number;
}

export const [AdminProvider, useAdmin] = createContextHook(() => {
  const storage = useMemo(() => createStorage(), []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    dailyRevenue: [],
    monthlyRevenue: [],
    transactionStats: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
    userStats: { total: 0, active: 0, premium: 0, newThisMonth: 0 },
    topUsers: [],
  });
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [isLoading, setIsLoading] = useState(true);
  const [allAppUsers, setAllAppUsers] = useState<AuthUser[]>([]);
  const [adminPassword, setAdminPassword] = useState<string>(DEFAULT_ADMIN_PASSWORD);
  const [isInitialized, setIsInitialized] = useState(false);

  // Generate mock data for demonstration
  const generateMockData = useCallback(async () => {
    const mockUsers: User[] = [
      {
        id: "1",
        name: "أحمد محمد",
        phone: "+961 70 123456",
        email: "ahmed@example.com",
        registrationDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
        transactionCount: 45,
        totalVolume: 125000,
        status: "active",
        isPremium: true,
        premiumExpiry: Date.now() + 15 * 24 * 60 * 60 * 1000,
        lastActivity: Date.now() - 2 * 60 * 60 * 1000,
      },
      {
        id: "2",
        name: "فاطمة علي",
        phone: "+961 71 789012",
        email: "fatima@example.com",
        registrationDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
        transactionCount: 23,
        totalVolume: 67000,
        status: "active",
        isPremium: false,
        lastActivity: Date.now() - 5 * 60 * 60 * 1000,
      },
      {
        id: "3",
        name: "محمد حسن",
        phone: "+961 76 345678",
        registrationDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
        transactionCount: 12,
        totalVolume: 34000,
        status: "active",
        isPremium: false,
        lastActivity: Date.now() - 1 * 24 * 60 * 60 * 1000,
      },
    ];

    const mockPromotions: Promotion[] = [
      {
        id: "1",
        title: "خصم العيد",
        description: "خصم 20% على جميع المعاملات",
        discountType: "percentage",
        discountValue: 20,
        startDate: Date.now(),
        endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
        isActive: true,
        usageCount: 15,
        maxUsage: 100,
        couponCode: "EID2024",
      },
      {
        id: "2",
        title: "عرض المستخدمين الجدد",
        description: "خصم ثابت 5000 ليرة للمستخدمين الجدد",
        discountType: "fixed",
        discountValue: 5000,
        startDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
        endDate: Date.now() + 20 * 24 * 60 * 60 * 1000,
        isActive: true,
        usageCount: 8,
        couponCode: "WELCOME",
      },
    ];

    const mockTickets: SupportTicket[] = [
      {
        id: "1",
        userId: "1",
        userName: "أحمد محمد",
        subject: "مشكلة في التصدير إلى Excel",
        message: "لا أستطيع تصدير البيانات إلى Excel، الزر لا يعمل",
        status: "open",
        priority: "medium",
        createdAt: Date.now() - 2 * 60 * 60 * 1000,
        updatedAt: Date.now() - 2 * 60 * 60 * 1000,
      },
      {
        id: "2",
        userId: "2",
        userName: "فاطمة علي",
        subject: "استفسار عن الاشتراك المميز",
        message: "أريد معرفة المزيد عن مميزات الاشتراك المميز",
        status: "resolved",
        priority: "low",
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 12 * 60 * 60 * 1000,
        adminResponse: "تم الرد عبر البريد الإلكتروني مع جميع التفاصيل",
      },
    ];

    const mockAnalytics: Analytics = {
      dailyRevenue: [
        { date: "2024-01-01", amount: 15000 },
        { date: "2024-01-02", amount: 22000 },
        { date: "2024-01-03", amount: 18000 },
        { date: "2024-01-04", amount: 25000 },
        { date: "2024-01-05", amount: 19000 },
      ],
      monthlyRevenue: [
        { month: "2023-11", amount: 450000 },
        { month: "2023-12", amount: 520000 },
        { month: "2024-01", amount: 380000 },
      ],
      transactionStats: {
        total: 1250,
        today: 45,
        thisWeek: 280,
        thisMonth: 890,
      },
      userStats: {
        total: 156,
        active: 134,
        premium: 23,
        newThisMonth: 18,
      },
      topUsers: [
        { userId: "1", name: "أحمد محمد", volume: 125000 },
        { userId: "2", name: "فاطمة علي", volume: 67000 },
        { userId: "3", name: "محمد حسن", volume: 34000 },
      ],
    };

    setUsers(mockUsers);
    setPromotions(mockPromotions);
    setSupportTickets(mockTickets);
    setAnalytics(mockAnalytics);

    // Save to storage
    await Promise.all([
      storage.setItem(ADMIN_STORAGE_KEYS.USERS, JSON.stringify(mockUsers)),
      storage.setItem(ADMIN_STORAGE_KEYS.PROMOTIONS, JSON.stringify(mockPromotions)),
      storage.setItem(ADMIN_STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(mockTickets)),
      storage.setItem(ADMIN_STORAGE_KEYS.ANALYTICS, JSON.stringify(mockAnalytics)),
    ]);
  }, [storage]);

  // Load admin data on mount
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [
          storedAuth,
          storedCurrentUser,
          storedOnboarding,
          storedAllAppUsers,
          storedUsers,
          storedPromotions,
          storedTickets,
          storedAnalytics,
          storedSettings,
          storedLanguage,
          storedAdminPassword,
        ] = await Promise.all([
          storage.getItem(ADMIN_STORAGE_KEYS.IS_AUTHENTICATED),
          storage.getItem(ADMIN_STORAGE_KEYS.CURRENT_USER),
          storage.getItem(ADMIN_STORAGE_KEYS.HAS_ONBOARDED),
          storage.getItem(ADMIN_STORAGE_KEYS.ALL_APP_USERS),
          storage.getItem(ADMIN_STORAGE_KEYS.USERS),
          storage.getItem(ADMIN_STORAGE_KEYS.PROMOTIONS),
          storage.getItem(ADMIN_STORAGE_KEYS.SUPPORT_TICKETS),
          storage.getItem(ADMIN_STORAGE_KEYS.ANALYTICS),
          storage.getItem(ADMIN_STORAGE_KEYS.SETTINGS),
          storage.getItem(ADMIN_STORAGE_KEYS.LANGUAGE),
          storage.getItem(ADMIN_STORAGE_KEYS.ADMIN_PASSWORD),
        ]);

        if (storedAuth) setIsAuthenticated(JSON.parse(storedAuth));
        if (storedCurrentUser) setCurrentUser(JSON.parse(storedCurrentUser));
        if (storedOnboarding) setHasCompletedOnboarding(JSON.parse(storedOnboarding));
        if (storedAllAppUsers) setAllAppUsers(JSON.parse(storedAllAppUsers));
        if (storedUsers) setUsers(JSON.parse(storedUsers));
        if (storedPromotions) setPromotions(JSON.parse(storedPromotions));
        if (storedTickets) setSupportTickets(JSON.parse(storedTickets));
        if (storedAnalytics) setAnalytics(JSON.parse(storedAnalytics));
        if (storedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
        if (storedLanguage) setLanguage(storedLanguage as "ar" | "en");
        if (storedAdminPassword) setAdminPassword(storedAdminPassword);

        // Generate mock data if empty
        if (!storedUsers) {
          generateMockData();
        }
      } catch (error) {
        console.error("Error loading admin data:", error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadAdminData();
  }, [storage, generateMockData]);

  // User registration
  const registerUser = useCallback(async (userData: { name: string; email: string; phone?: string; password: string }) => {
    const newUser: AuthUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      isAdmin: false,
      registrationDate: Date.now(),
    };
    
    const updatedAppUsers = [...allAppUsers, newUser];
    setAllAppUsers(updatedAppUsers);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setHasCompletedOnboarding(true);
    
    await Promise.all([
      storage.setItem(ADMIN_STORAGE_KEYS.ALL_APP_USERS, JSON.stringify(updatedAppUsers)),
      storage.setItem(ADMIN_STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser)),
      storage.setItem(ADMIN_STORAGE_KEYS.IS_AUTHENTICATED, JSON.stringify(true)),
      storage.setItem(ADMIN_STORAGE_KEYS.HAS_ONBOARDED, JSON.stringify(true)),
    ]);
    
    return newUser;
  }, [allAppUsers, storage]);

  // User login
  const loginUser = useCallback(async (email: string, password: string) => {
    const user = allAppUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      await Promise.all([
        storage.setItem(ADMIN_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user)),
        storage.setItem(ADMIN_STORAGE_KEYS.IS_AUTHENTICATED, JSON.stringify(true)),
      ]);
      return user;
    }
    return null;
  }, [allAppUsers, storage]);

  // Admin login function with password verification
  const loginAdmin = useCallback(async (password: string): Promise<boolean> => {
    if (password === adminPassword) {
      setIsAuthenticated(true);
      await storage.setItem(ADMIN_STORAGE_KEYS.IS_AUTHENTICATED, JSON.stringify(true));
      return true;
    }
    return false;
  }, [storage, adminPassword]);
  
  // Change admin password
  const changeAdminPassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (currentPassword !== adminPassword) {
      return false;
    }
    
    if (newPassword.length < 6) {
      return false;
    }
    
    setAdminPassword(newPassword);
    await storage.setItem(ADMIN_STORAGE_KEYS.ADMIN_PASSWORD, newPassword);
    return true;
  }, [storage, adminPassword]);
  
  // Get admin password (for verification)
  const verifyAdminPassword = useCallback((password: string): boolean => {
    return password === adminPassword;
  }, [adminPassword]);

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(true);
    await storage.setItem(ADMIN_STORAGE_KEYS.HAS_ONBOARDED, JSON.stringify(true));
  }, [storage]);

  // Logout function
  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    await Promise.all([
      storage.setItem(ADMIN_STORAGE_KEYS.IS_AUTHENTICATED, JSON.stringify(false)),
      storage.removeItem(ADMIN_STORAGE_KEYS.CURRENT_USER),
    ]);
  }, [storage]);

  // User management functions
  const updateUserStatus = useCallback(async (userId: string, status: "active" | "suspended") => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, status } : user
    );
    setUsers(updatedUsers);
    await storage.setItem(ADMIN_STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    
    if (Platform.OS !== 'web') {
      Alert.alert(
        "تم التحديث",
        `تم ${status === "active" ? "تفعيل" : "تعليق"} الحساب بنجاح`
      );
    }
  }, [users, storage]);

  const addUser = useCallback(async (userData: Omit<User, "id">) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    await storage.setItem(ADMIN_STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
  }, [users, storage]);

  // Promotion management functions
  const addPromotion = useCallback(async (promotionData: Omit<Promotion, "id" | "usageCount">) => {
    const newPromotion: Promotion = {
      ...promotionData,
      id: Date.now().toString(),
      usageCount: 0,
    };
    const updatedPromotions = [...promotions, newPromotion];
    setPromotions(updatedPromotions);
    await storage.setItem(ADMIN_STORAGE_KEYS.PROMOTIONS, JSON.stringify(updatedPromotions));
  }, [promotions, storage]);

  const updatePromotion = useCallback(async (promotionId: string, updates: Partial<Promotion>) => {
    const updatedPromotions = promotions.map(promo =>
      promo.id === promotionId ? { ...promo, ...updates } : promo
    );
    setPromotions(updatedPromotions);
    await storage.setItem(ADMIN_STORAGE_KEYS.PROMOTIONS, JSON.stringify(updatedPromotions));
  }, [promotions, storage]);

  const deletePromotion = useCallback(async (promotionId: string) => {
    const updatedPromotions = promotions.filter(promo => promo.id !== promotionId);
    setPromotions(updatedPromotions);
    await storage.setItem(ADMIN_STORAGE_KEYS.PROMOTIONS, JSON.stringify(updatedPromotions));
  }, [promotions, storage]);

  // Support ticket functions
  const updateTicketStatus = useCallback(async (
    ticketId: string, 
    status: SupportTicket["status"],
    adminResponse?: string
  ) => {
    const updatedTickets = supportTickets.map(ticket =>
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            status, 
            updatedAt: Date.now(),
            ...(adminResponse && { adminResponse })
          } 
        : ticket
    );
    setSupportTickets(updatedTickets);
    await storage.setItem(ADMIN_STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(updatedTickets));
  }, [supportTickets, storage]);

  // Settings management
  const updateSettings = useCallback(async (newSettings: Partial<AdminSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await storage.setItem(ADMIN_STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
  }, [settings, storage]);

  // Language management
  const toggleLanguage = useCallback(async () => {
    const newLanguage = language === "ar" ? "en" : "ar";
    setLanguage(newLanguage);
    await storage.setItem(ADMIN_STORAGE_KEYS.LANGUAGE, newLanguage);
  }, [language, storage]);

  // Analytics calculations
  const dashboardStats = useMemo(() => {
    const totalRevenue = analytics.dailyRevenue.reduce((sum, day) => sum + day.amount, 0);
    const avgDailyRevenue = analytics.dailyRevenue.length > 0 
      ? totalRevenue / analytics.dailyRevenue.length 
      : 0;
    
    const openTickets = supportTickets.filter(ticket => ticket.status === "open").length;
    const activePromotions = promotions.filter(promo => promo.isActive).length;

    return {
      totalRevenue,
      avgDailyRevenue,
      openTickets,
      activePromotions,
      totalUsers: users.length,
      premiumUsers: users.filter(user => user.isPremium).length,
    };
  }, [analytics, supportTickets, promotions, users]);

  return {
    // Authentication
    isAuthenticated,
    currentUser,
    hasCompletedOnboarding,
    allAppUsers,
    isInitialized,
    registerUser,
    loginUser,
    login: loginUser,
    loginAdmin,
    logout,
    completeOnboarding,
    
    // Data
    users,
    promotions,
    supportTickets,
    analytics,
    settings,
    language,
    isLoading,
    
    // User management
    updateUserStatus,
    addUser,
    
    // Promotion management
    addPromotion,
    updatePromotion,
    deletePromotion,
    
    // Support management
    updateTicketStatus,
    
    // Settings
    updateSettings,
    toggleLanguage,
    
    // Analytics
    dashboardStats,
    
    // Admin password management
    adminPassword,
    changeAdminPassword,
    verifyAdminPassword,
    
    // Utilities
    generateMockData,
  };
});