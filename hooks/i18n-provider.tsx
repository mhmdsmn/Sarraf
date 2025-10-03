import { useState, useEffect, useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { Platform, I18nManager } from "react-native";
import * as Localization from "expo-localization";

const LANGUAGE_STORAGE_KEY = "@app_language";

export type Language = "ar" | "en";

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

const translations: Translations = {
  welcome: {
    ar: "مرحباً",
    en: "Welcome",
  },
  currencyExchange: {
    ar: "صرافة العملات",
    en: "Currency Exchange",
  },
  exchange: {
    ar: "الصرافة",
    en: "Exchange",
  },
  history: {
    ar: "السجل",
    en: "History",
  },
  settings: {
    ar: "الإعدادات",
    en: "Settings",
  },
  help: {
    ar: "المساعدة",
    en: "Help",
  },
  support: {
    ar: "الدعم",
    en: "Support",
  },
  admin: {
    ar: "المدير",
    en: "Admin",
  },
  signUp: {
    ar: "إنشاء حساب",
    en: "Sign Up",
  },
  signIn: {
    ar: "تسجيل الدخول",
    en: "Sign In",
  },
  logout: {
    ar: "تسجيل الخروج",
    en: "Logout",
  },
  language: {
    ar: "اللغة",
    en: "Language",
  },
  arabic: {
    ar: "العربية",
    en: "Arabic",
  },
  english: {
    ar: "الإنجليزية",
    en: "English",
  },
  changeLanguage: {
    ar: "تغيير اللغة",
    en: "Change Language",
  },
  totalProfit: {
    ar: "إجمالي الربح",
    en: "Total Profit",
  },
  transactions: {
    ar: "المعاملات",
    en: "Transactions",
  },
  unlimited: {
    ar: "غير محدود",
    en: "Unlimited",
  },
  limitReached: {
    ar: "تم الوصول للحد!",
    en: "Limit reached!",
  },
  nearLimit: {
    ar: "قريب من الحد",
    en: "Near limit",
  },
  freeLimit: {
    ar: "الحد المجاني",
    en: "Free limit",
  },
  vaultBalance: {
    ar: "رصيد الخزنة",
    en: "Vault Balance",
  },
  edit: {
    ar: "تعديل",
    en: "Edit",
  },
  cancel: {
    ar: "إلغاء",
    en: "Cancel",
  },
  save: {
    ar: "حفظ",
    en: "Save",
  },
  update: {
    ar: "تحديث",
    en: "Update",
  },
  clear: {
    ar: "مسح",
    en: "Clear",
  },
  myBox: {
    ar: "صندوقي",
    en: "My Box",
  },
  hisBox: {
    ar: "صندوقه",
    en: "His Box",
  },
  exchangeRates: {
    ar: "أسعار الصرف",
    en: "Exchange Rates",
  },
  buyRate: {
    ar: "سعر الشراء",
    en: "Buy Rate",
  },
  sellRate: {
    ar: "سعر البيع",
    en: "Sell Rate",
  },
  updateRates: {
    ar: "تحديث الأسعار",
    en: "Update Rates",
  },
  inputCurrency: {
    ar: "عملة الإدخال",
    en: "Input Currency",
  },
  executeTransaction: {
    ar: "تنفيذ المعاملة",
    en: "Execute Transaction",
  },
  transactionComplete: {
    ar: "تمت المعاملة",
    en: "Transaction Complete",
  },
  profit: {
    ar: "الربح",
    en: "Profit",
  },
  addedTo: {
    ar: "أضيف إلى",
    en: "Added to",
  },
  error: {
    ar: "خطأ",
    en: "Error",
  },
  success: {
    ar: "نجح",
    en: "Success",
  },
  loading: {
    ar: "جاري التحميل...",
    en: "Loading...",
  },
  name: {
    ar: "الاسم",
    en: "Name",
  },
  email: {
    ar: "البريد الإلكتروني",
    en: "Email",
  },
  phone: {
    ar: "رقم الهاتف",
    en: "Phone",
  },
  password: {
    ar: "كلمة المرور",
    en: "Password",
  },
  confirmPassword: {
    ar: "تأكيد كلمة المرور",
    en: "Confirm Password",
  },
  fullName: {
    ar: "الاسم الكامل",
    en: "Full Name",
  },
  optional: {
    ar: "اختياري",
    en: "Optional",
  },
  createAccount: {
    ar: "إنشاء الحساب",
    en: "Create Account",
  },
  alreadyHaveAccount: {
    ar: "لديك حساب بالفعل؟",
    en: "Already have an account?",
  },
  dontHaveAccount: {
    ar: "ليس لديك حساب؟",
    en: "Don't have an account?",
  },
  createNewAccount: {
    ar: "إنشاء حساب جديد",
    en: "Create New Account",
  },
  skipAndContinue: {
    ar: "تخطي والمتابعة كضيف",
    en: "Skip and continue as guest",
  },
  bestExchangeApp: {
    ar: "أفضل تطبيق لإدارة عمليات صرف العملات",
    en: "Best app for managing currency exchange",
  },
  competitivePrices: {
    ar: "أسعار تنافسية",
    en: "Competitive Prices",
  },
  secureAndReliable: {
    ar: "آمن وموثوق",
    en: "Secure & Reliable",
  },
  multiLanguageSupport: {
    ar: "دعم متعدد اللغات",
    en: "Multi-language Support",
  },
  getBestRates: {
    ar: "احصل على أفضل أسعار الصرف في السوق",
    en: "Get the best exchange rates in the market",
  },
  advancedSecurity: {
    ar: "نظام أمان متقدم لحماية معاملاتك",
    en: "Advanced security system to protect your transactions",
  },
  arabicEnglishInterface: {
    ar: "واجهة بالعربية والإنجليزية",
    en: "Arabic and English interface",
  },
};

const createStorage = () => {
  if (Platform.OS === "web") {
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
          // Ignore
        }
      },
    };
  } else {
    let AsyncStorage: any;
    try {
      AsyncStorage = require("@react-native-async-storage/async-storage").default;
    } catch {
      return {
        getItem: async () => null,
        setItem: async () => {},
      };
    }
    return AsyncStorage;
  }
};

export const [I18nProvider, useI18n] = createContextHook(() => {
  const storage = useMemo(() => createStorage(), []);
  
  // Detect device language automatically
  const detectDeviceLanguage = (): Language => {
    try {
      const deviceLocale = Localization.getLocales()[0]?.languageCode || "en";
      console.log("Device locale detected:", deviceLocale);
      
      // Check if device language is Arabic
      if (deviceLocale === "ar" || deviceLocale.startsWith("ar")) {
        return "ar";
      }
      
      // Default to English for all other languages
      return "en";
    } catch (error) {
      console.error("Error detecting device language:", error);
      return "en"; // Default to English on error
    }
  };
  
  const [language, setLanguage] = useState<Language>(detectDeviceLanguage());
  const [isRTL, setIsRTL] = useState(detectDeviceLanguage() === "ar");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLanguage = await storage.getItem(LANGUAGE_STORAGE_KEY);
        
        if (storedLanguage === "ar" || storedLanguage === "en") {
          // User has manually selected a language, use it
          console.log("Using stored language preference:", storedLanguage);
          setLanguage(storedLanguage);
          setIsRTL(storedLanguage === "ar");
        } else {
          // No stored preference, use device language
          const deviceLang = detectDeviceLanguage();
          console.log("No stored preference, using device language:", deviceLang);
          setLanguage(deviceLang);
          setIsRTL(deviceLang === "ar");
          
          // Save the detected language as default
          await storage.setItem(LANGUAGE_STORAGE_KEY, deviceLang);
        }
      } catch (error) {
        console.error("Error loading language:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, [storage]);

  const changeLanguage = useCallback(
    async (newLanguage: Language) => {
      try {
        setLanguage(newLanguage);
        setIsRTL(newLanguage === "ar");
        await storage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);

        if (Platform.OS !== "web") {
          I18nManager.forceRTL(newLanguage === "ar");
        }
      } catch (error) {
        console.error("Error changing language:", error);
      }
    },
    [storage]
  );

  const toggleLanguage = useCallback(() => {
    const newLanguage = language === "ar" ? "en" : "ar";
    changeLanguage(newLanguage);
  }, [language, changeLanguage]);

  const t = useCallback(
    (key: string): string => {
      if (translations[key]) {
        return translations[key][language];
      }
      return key;
    },
    [language]
  );

  return {
    language,
    isRTL,
    isLoading,
    changeLanguage,
    toggleLanguage,
    t,
  };
});
