import { useState, useEffect, useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform, Alert, Linking } from "react-native";
import * as XLSX from "xlsx";
import type { Transaction } from "@/types/exchange";
import { useStorage } from "@/hooks/storage-provider";

const STORAGE_KEYS = {
  BUY_RATE: "@exchange_buy_rate",
  SELL_RATE: "@exchange_sell_rate",
  TRANSACTIONS: "@exchange_transactions",
  MY_BALANCE: "@exchange_my_balance",
  HIS_BALANCE: "@exchange_his_balance",
  LBP_BALANCE: "@exchange_lbp_balance",
  USD_BALANCE: "@exchange_usd_balance",
  PREMIUM_STATUS: "@exchange_premium_status",
  PREMIUM_EXPIRY: "@exchange_premium_expiry",
  TRANSACTION_COUNT: "@exchange_transaction_count",
  AUTO_SAVE_PREFERENCE: "@exchange_auto_save_preference",
  LAST_AUTO_SAVE: "@exchange_last_auto_save",
};

const DEFAULT_BUY_RATE = 98000;
const DEFAULT_SELL_RATE = 100000;
const DEFAULT_LBP_BALANCE = 500000000; // 500 million LBP
const DEFAULT_USD_BALANCE = 6500; // 6500 USD

export const [ExchangeProvider, useExchange] = createContextHook(() => {
  const storage = useStorage();
  const [buyRate, setBuyRate] = useState(DEFAULT_BUY_RATE);
  const [sellRate, setSellRate] = useState(DEFAULT_SELL_RATE);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [myBalance, setMyBalance] = useState(0);
  const [hisBalance, setHisBalance] = useState(0);
  const [lbpBalance, setLbpBalance] = useState(DEFAULT_LBP_BALANCE);
  const [usdBalance, setUsdBalance] = useState(DEFAULT_USD_BALANCE);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiry, setPremiumExpiry] = useState<number | null>(null);
  const [transactionCount, setTransactionCount] = useState(0);
  const [autoSavePreference, setAutoSavePreference] = useState<'phone' | 'email' | 'none'>('none');
  const [lastAutoSave, setLastAutoSave] = useState<number>(0);

  // Load persisted data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          storedBuyRate,
          storedSellRate,
          storedTransactions,
          storedMyBalance,
          storedHisBalance,
          storedLbpBalance,
          storedUsdBalance,
          storedPremiumStatus,
          storedPremiumExpiry,
          storedTransactionCount,
          storedAutoSavePreference,
          storedLastAutoSave,
        ] = await Promise.all([
          storage.getItem(STORAGE_KEYS.BUY_RATE),
          storage.getItem(STORAGE_KEYS.SELL_RATE),
          storage.getItem(STORAGE_KEYS.TRANSACTIONS),
          storage.getItem(STORAGE_KEYS.MY_BALANCE),
          storage.getItem(STORAGE_KEYS.HIS_BALANCE),
          storage.getItem(STORAGE_KEYS.LBP_BALANCE),
          storage.getItem(STORAGE_KEYS.USD_BALANCE),
          storage.getItem(STORAGE_KEYS.PREMIUM_STATUS),
          storage.getItem(STORAGE_KEYS.PREMIUM_EXPIRY),
          storage.getItem(STORAGE_KEYS.TRANSACTION_COUNT),
          storage.getItem(STORAGE_KEYS.AUTO_SAVE_PREFERENCE),
          storage.getItem(STORAGE_KEYS.LAST_AUTO_SAVE),
        ]);

        if (storedBuyRate) setBuyRate(parseFloat(storedBuyRate));
        if (storedSellRate) setSellRate(parseFloat(storedSellRate));
        if (storedTransactions) {
          const parsedTransactions = JSON.parse(storedTransactions);
          setTransactions(parsedTransactions);
          setTransactionCount(parsedTransactions.length);
        }
        if (storedMyBalance) setMyBalance(parseFloat(storedMyBalance));
        if (storedHisBalance) setHisBalance(parseFloat(storedHisBalance));
        if (storedLbpBalance) setLbpBalance(parseFloat(storedLbpBalance));
        if (storedUsdBalance) setUsdBalance(parseFloat(storedUsdBalance));
        if (storedPremiumStatus) {
          const premiumStatus = JSON.parse(storedPremiumStatus);
          setIsPremium(premiumStatus);
        }
        if (storedPremiumExpiry) {
          const expiry = parseInt(storedPremiumExpiry);
          setPremiumExpiry(expiry);
          // Check if premium has expired
          if (expiry < Date.now()) {
            setIsPremium(false);
            await storage.setItem(STORAGE_KEYS.PREMIUM_STATUS, JSON.stringify(false));
            
            // Show expiration notification
            if (Platform.OS !== 'web') {
              Alert.alert(
                "Premium Expired",
                "Your premium subscription has expired. Upgrade now to continue enjoying unlimited transactions and premium features!",
                [
                  { text: "Later", style: "cancel" },
                  { text: "Upgrade Now", onPress: () => console.log('Navigate to subscription') }
                ]
              );
            }
          }
        }
        if (storedTransactionCount) setTransactionCount(parseInt(storedTransactionCount));
        if (storedAutoSavePreference) setAutoSavePreference(storedAutoSavePreference as 'phone' | 'email' | 'none');
        if (storedLastAutoSave) setLastAutoSave(parseInt(storedLastAutoSave));
      } catch (error) {
        console.error("Error loading exchange data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Persist buy rate
  const updateBuyRate = useCallback(async (rate: number) => {
    if (typeof rate !== 'number' || rate <= 0) return;
    setBuyRate(rate);
    await storage.setItem(STORAGE_KEYS.BUY_RATE, rate.toString());
  }, []);

  // Persist sell rate
  const updateSellRate = useCallback(async (rate: number) => {
    if (typeof rate !== 'number' || rate <= 0) return;
    setSellRate(rate);
    await storage.setItem(STORAGE_KEYS.SELL_RATE, rate.toString());
  }, []);

  // Load admin settings for transaction limit and exchange rates
  const [adminFreeLimit, setAdminFreeLimit] = useState(10); // Default fallback
  const [adminBuyRate, setAdminBuyRate] = useState<number | null>(null);
  const [adminSellRate, setAdminSellRate] = useState<number | null>(null);
  const [lastSettingsUpdate, setLastSettingsUpdate] = useState<number>(0);
  const [settingsChecksum, setSettingsChecksum] = useState<string>('');
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  
  // Force UI update when admin settings change
  const triggerUIUpdate = useCallback(() => {
    console.log('Triggering UI update...');
    setForceUpdate(prev => {
      const newValue = prev + 1;
      console.log('Force update value changed:', prev, '->', newValue);
      return newValue;
    });
  }, []);
  
  useEffect(() => {
    const loadAdminSettings = async () => {
      try {
        console.log('Loading admin settings...');
        const storedSettings = await storage.getItem('@admin_settings');
        
        if (storedSettings) {
          const settings = JSON.parse(storedSettings);
          console.log('Found admin settings:', settings);
          
          // Create a checksum to detect changes
          const newChecksum = JSON.stringify({
            freeTransactionLimit: settings.freeTransactionLimit,
            globalBuyRate: settings.globalBuyRate,
            globalSellRate: settings.globalSellRate
          });
          
          console.log('Current checksum:', settingsChecksum);
          console.log('New checksum:', newChecksum);
          
          // Process settings on first load or when they change
          if (!isSettingsLoaded || newChecksum !== settingsChecksum) {
            console.log('Admin settings changed or first load, updating UI...');
            setSettingsChecksum(newChecksum);
            setIsSettingsLoaded(true);
            
            let hasChanges = false;
            let changeMessage = '';
            
            // Always update free transaction limit
            if (settings.freeTransactionLimit && typeof settings.freeTransactionLimit === 'number') {
              const currentLimit = adminFreeLimit;
              console.log('Updating free transaction limit:', currentLimit, '->', settings.freeTransactionLimit);
              setAdminFreeLimit(settings.freeTransactionLimit);
              
              if (currentLimit !== settings.freeTransactionLimit && isSettingsLoaded) {
                changeMessage += `Transaction limit updated to ${settings.freeTransactionLimit}. `;
                hasChanges = true;
              }
            }
            
            // Always update buy rate if provided
            if (settings.globalBuyRate && typeof settings.globalBuyRate === 'number') {
              const currentRate = adminBuyRate;
              console.log('Updating buy rate:', currentRate, '->', settings.globalBuyRate);
              setAdminBuyRate(settings.globalBuyRate);
              setBuyRate(settings.globalBuyRate);
              await storage.setItem(STORAGE_KEYS.BUY_RATE, settings.globalBuyRate.toString());
              
              if (currentRate !== settings.globalBuyRate && isSettingsLoaded) {
                changeMessage += `Buy rate updated to ${settings.globalBuyRate.toLocaleString()}. `;
                hasChanges = true;
              }
            }
            
            // Always update sell rate if provided
            if (settings.globalSellRate && typeof settings.globalSellRate === 'number') {
              const currentRate = adminSellRate;
              console.log('Updating sell rate:', currentRate, '->', settings.globalSellRate);
              setAdminSellRate(settings.globalSellRate);
              setSellRate(settings.globalSellRate);
              await storage.setItem(STORAGE_KEYS.SELL_RATE, settings.globalSellRate.toString());
              
              if (currentRate !== settings.globalSellRate && isSettingsLoaded) {
                changeMessage += `Sell rate updated to ${settings.globalSellRate.toLocaleString()}. `;
                hasChanges = true;
              }
            }
            
            // Force UI update after any settings change
            console.log('Forcing UI update after settings change');
            setLastSettingsUpdate(Date.now());
            triggerUIUpdate();
            
            // Show notification only for actual changes (not initial load)
            if (hasChanges && isSettingsLoaded) {
              console.log('Admin settings applied successfully:', changeMessage);
              
              if (Platform.OS !== 'web') {
                Alert.alert(
                  "Settings Updated",
                  changeMessage.trim() + " Changes have been applied automatically.",
                  [{ text: "OK" }]
                );
              }
            }
          }
        } else {
          console.log('No admin settings found in storage');
          // Set default values if no settings found
          if (!isSettingsLoaded) {
            setAdminFreeLimit(10);
            setIsSettingsLoaded(true);
            console.log('Set default admin free limit to 10');
          }
        }
      } catch (error) {
        console.error('Error loading admin settings:', error);
        // Set defaults on error
        if (!isSettingsLoaded) {
          setAdminFreeLimit(10);
          setIsSettingsLoaded(true);
        }
      }
    };
    
    // Load settings immediately
    loadAdminSettings();
    
    // Set up a more frequent check for admin settings changes on Expo
    const checkInterval = Platform.OS === 'web' ? 3000 : 1500; // More frequent on mobile/Expo
    const interval = setInterval(loadAdminSettings, checkInterval);
    
    return () => clearInterval(interval);
  }, [storage, triggerUIUpdate]); // Removed dependencies that cause infinite loops

  // Add transaction and update balances
  const addTransaction = useCallback(async (transaction: Transaction) => {
    // Get the current admin free limit (force fresh read)
    const currentLimit = adminFreeLimit;
    console.log('Checking transaction limit - Current count:', transactionCount, 'Limit:', currentLimit, 'Premium:', isPremium);
    
    // Check transaction limit for free users using admin settings
    if (!isPremium && transactionCount >= currentLimit) {
      console.log('Transaction limit reached!');
      Alert.alert(
        "Upgrade to Premium",
        `Free users are limited to ${currentLimit} transactions. Upgrade to Premium for unlimited transactions and Excel export!`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Upgrade", onPress: () => upgradeToPremium() }
        ]
      );
      return false;
    }

    const updatedTransactions = [...transactions, transaction];
    const newTransactionCount = transactionCount + 1;
    
    setTransactions(updatedTransactions);
    setTransactionCount(newTransactionCount);
    
    await Promise.all([
      storage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions)),
      storage.setItem(STORAGE_KEYS.TRANSACTION_COUNT, newTransactionCount.toString())
    ]);

    // Update balances based on transaction rules
    let newMyBalance = myBalance;
    let newHisBalance = hisBalance;
    let newLbpBalance = lbpBalance;
    let newUsdBalance = usdBalance;

    // Convert everything to LBP for balance tracking
    let amountInLBP: number;
    
    if (transaction.inputCurrency === "usd") {
      // Scenario 2: Customer gives USD, gets LBP
      amountInLBP = transaction.result; // Result is in LBP
      // Update vault balances: receive USD, give LBP
      newUsdBalance += transaction.amount; // Receive USD from customer
      newLbpBalance -= transaction.result; // Give LBP to customer
    } else {
      // Scenario 1: Customer gives LBP, gets USD
      amountInLBP = transaction.amount; // Amount is in LBP
      // Update vault balances: receive LBP, give USD
      newLbpBalance += transaction.amount; // Receive LBP from customer
      newUsdBalance -= transaction.result; // Give USD to customer
    }

    if (transaction.toMyBox) {
      newMyBalance += amountInLBP;
    } else {
      newHisBalance += amountInLBP;
    }

    setMyBalance(newMyBalance);
    setHisBalance(newHisBalance);
    setLbpBalance(newLbpBalance);
    setUsdBalance(newUsdBalance);
    
    await Promise.all([
      storage.setItem(STORAGE_KEYS.MY_BALANCE, newMyBalance.toString()),
      storage.setItem(STORAGE_KEYS.HIS_BALANCE, newHisBalance.toString()),
      storage.setItem(STORAGE_KEYS.LBP_BALANCE, newLbpBalance.toString()),
      storage.setItem(STORAGE_KEYS.USD_BALANCE, newUsdBalance.toString()),
    ]);
    
    return true;
  }, [transactions, myBalance, hisBalance, lbpBalance, usdBalance, isPremium, transactionCount, adminFreeLimit]);

  // Calculate total profit
  const totalProfit = useMemo(() => {
    return transactions.reduce((total, transaction) => {
      // Each transaction already has the profit calculated
      return total + transaction.profit;
    }, 0);
  }, [transactions]);

  // Clear transaction history
  const clearHistory = useCallback(async () => {
    setTransactions([]);
    setTransactionCount(0);
    await Promise.all([
      storage.removeItem(STORAGE_KEYS.TRANSACTIONS),
      storage.removeItem(STORAGE_KEYS.TRANSACTION_COUNT)
    ]);
  }, []);

  // Reset exchange rates
  const resetRates = useCallback(async () => {
    setBuyRate(DEFAULT_BUY_RATE);
    setSellRate(DEFAULT_SELL_RATE);
    await Promise.all([
      storage.setItem(STORAGE_KEYS.BUY_RATE, DEFAULT_BUY_RATE.toString()),
      storage.setItem(STORAGE_KEYS.SELL_RATE, DEFAULT_SELL_RATE.toString()),
    ]);
  }, []);

  // Update LBP balance manually
  const updateLbpBalance = useCallback(async (balance: number) => {
    if (typeof balance !== 'number' || balance < 0) return;
    setLbpBalance(balance);
    await storage.setItem(STORAGE_KEYS.LBP_BALANCE, balance.toString());
  }, []);

  // Update USD balance manually
  const updateUsdBalance = useCallback(async (balance: number) => {
    if (typeof balance !== 'number' || balance < 0) return;
    setUsdBalance(balance);
    await storage.setItem(STORAGE_KEYS.USD_BALANCE, balance.toString());
  }, []);

  // Reset balances
  const resetBalances = useCallback(async () => {
    setMyBalance(0);
    setHisBalance(0);
    setLbpBalance(DEFAULT_LBP_BALANCE);
    setUsdBalance(DEFAULT_USD_BALANCE);
    await Promise.all([
      storage.removeItem(STORAGE_KEYS.MY_BALANCE),
      storage.removeItem(STORAGE_KEYS.HIS_BALANCE),
      storage.setItem(STORAGE_KEYS.LBP_BALANCE, DEFAULT_LBP_BALANCE.toString()),
      storage.setItem(STORAGE_KEYS.USD_BALANCE, DEFAULT_USD_BALANCE.toString()),
    ]);
  }, []);

  // Upgrade to premium (redirect to subscription page)
  const upgradeToPremium = useCallback(async () => {
    // Don't auto-activate premium - redirect to subscription page
    // This was causing the issue where premium was always active
    console.log('Redirecting to subscription page...');
  }, []);

  // Manually activate premium (for admin use)
  const activatePremium = useCallback(async (durationDays: number = 30) => {
    const expiryDate = Date.now() + (durationDays * 24 * 60 * 60 * 1000);
    setIsPremium(true);
    setPremiumExpiry(expiryDate);
    await Promise.all([
      storage.setItem(STORAGE_KEYS.PREMIUM_STATUS, JSON.stringify(true)),
      storage.setItem(STORAGE_KEYS.PREMIUM_EXPIRY, expiryDate.toString())
    ]);
    
    const expiryDateStr = new Date(expiryDate).toLocaleDateString();
    Alert.alert(
      "Premium Activated!",
      `Premium subscription activated successfully!\n\nExpires on: ${expiryDateStr}`
    );
  }, []);

  // Deactivate premium
  const deactivatePremium = useCallback(async () => {
    setIsPremium(false);
    setPremiumExpiry(null);
    await Promise.all([
      storage.setItem(STORAGE_KEYS.PREMIUM_STATUS, JSON.stringify(false)),
      storage.removeItem(STORAGE_KEYS.PREMIUM_EXPIRY)
    ]);
  }, []);

  // Set auto-save preference
  const setAutoSavePreferenceAsync = useCallback(async (preference: 'phone' | 'email' | 'none') => {
    setAutoSavePreference(preference);
    await storage.setItem(STORAGE_KEYS.AUTO_SAVE_PREFERENCE, preference);
  }, []);

  // Auto-save functionality
  const performAutoSave = useCallback(async () => {
    if (autoSavePreference === 'none' || transactions.length === 0) return;
    
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    // Check if we need to auto-save (once per day)
    if (lastAutoSave > oneDayAgo) return;
    
    try {
      // Prepare data for auto-save
      const backupData = {
        timestamp: now,
        transactions,
        totalProfit,
        myBalance,
        hisBalance,
        lbpBalance,
        usdBalance,
        buyRate,
        sellRate
      };
      
      const fileName = `Exchange_Backup_${new Date().toISOString().split('T')[0]}.json`;
      
      if (autoSavePreference === 'phone') {
        // Save to phone storage
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));
        console.log('Auto-backup saved to phone:', fileUri);
      } else if (autoSavePreference === 'email') {
        // Create email with backup data
        const emailBody = `Exchange App Daily Backup - ${new Date().toLocaleDateString()}\n\nBackup Data:\n${JSON.stringify(backupData, null, 2)}`;
        const emailUrl = `mailto:?subject=Exchange App Backup - ${new Date().toLocaleDateString()}&body=${encodeURIComponent(emailBody)}`;
        
        if (Platform.OS === 'web') {
          window.open(emailUrl);
        } else {
          await Linking.openURL(emailUrl);
        }
        console.log('Auto-backup email prepared');
      }
      
      // Update last auto-save timestamp
      setLastAutoSave(now);
      await storage.setItem(STORAGE_KEYS.LAST_AUTO_SAVE, now.toString());
      
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [autoSavePreference, transactions, totalProfit, myBalance, hisBalance, lbpBalance, usdBalance, buyRate, sellRate, lastAutoSave]);

  // Check for auto-save on app load and transaction changes
  useEffect(() => {
    if (!isLoading && isPremium) {
      performAutoSave();
    }
  }, [isLoading, isPremium, transactions.length, performAutoSave]);
  
  // Subscription expiration notification state
  const [lastExpirationWarning, setLastExpirationWarning] = useState<number>(0);
  const [hasShownExpirationAlert, setHasShownExpirationAlert] = useState<boolean>(false);
  
  // Check for premium expiration periodically
  useEffect(() => {
    if (!isPremium || !premiumExpiry) {
      setHasShownExpirationAlert(false);
      return;
    }
    
    const checkExpiration = () => {
      const now = Date.now();
      const daysLeft = Math.ceil((premiumExpiry - now) / (24 * 60 * 60 * 1000));
      const hoursLeft = Math.ceil((premiumExpiry - now) / (60 * 60 * 1000));
      
      // Show warning 3 days before expiration (but only once per day)
      if (daysLeft <= 3 && daysLeft > 0) {
        const oneDayAgo = now - (24 * 60 * 60 * 1000);
        if (lastExpirationWarning < oneDayAgo) {
          setLastExpirationWarning(now);
          if (Platform.OS !== 'web') {
            Alert.alert(
              "⚠️ Premium Expiring Soon",
              `Your premium subscription expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''} (${hoursLeft} hours).\n\nRenew now to avoid interruption of service and continue enjoying unlimited transactions!`,
              [
                { text: "Remind Later", style: "cancel" },
                { text: "Renew Now", onPress: () => console.log('Navigate to subscription') }
              ]
            );
          }
        }
      }
      
      // Check if expired
      if (now >= premiumExpiry && !hasShownExpirationAlert) {
        setIsPremium(false);
        setPremiumExpiry(null);
        setHasShownExpirationAlert(true);
        storage.setItem(STORAGE_KEYS.PREMIUM_STATUS, JSON.stringify(false));
        storage.removeItem(STORAGE_KEYS.PREMIUM_EXPIRY);
        
        if (Platform.OS !== 'web') {
          Alert.alert(
            "💔 Premium Expired",
            "Your premium subscription has expired!\n\n• Transaction limit is now active\n• Excel export is disabled\n• Auto-backup is disabled\n\nUpgrade now to restore all premium features!",
            [
              { text: "Later", style: "cancel" },
              { text: "Upgrade Now", onPress: () => console.log('Navigate to subscription') }
            ]
          );
        }
      }
    };
    
    // Check immediately
    checkExpiration();
    
    // Check every 30 minutes for more frequent expiration checks
    const interval = setInterval(checkExpiration, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isPremium, premiumExpiry, lastExpirationWarning, hasShownExpirationAlert]);

  // Reset boxes (My Box and His Box)
  const resetBoxes = useCallback(async () => {
    setMyBalance(0);
    setHisBalance(0);
    await Promise.all([
      storage.setItem(STORAGE_KEYS.MY_BALANCE, '0'),
      storage.setItem(STORAGE_KEYS.HIS_BALANCE, '0')
    ]);
    if (Platform.OS !== 'web') {
      Alert.alert("Boxes Reset", "My Box and His Box have been reset to 0.");
    }
  }, []);

  // Export to Excel with format choice
  const exportToExcel = useCallback(async (format: 'phone' | 'email' = 'phone') => {
    if (!isPremium) {
      Alert.alert(
        "Premium Feature",
        "Excel export is available for Premium users only. Upgrade now!",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Upgrade", onPress: () => upgradeToPremium() }
        ]
      );
      return;
    }

    if (transactions.length === 0) {
      Alert.alert("No Data", "No transactions to export.");
      return;
    }

    try {
      // Prepare data for Excel
      const excelData = transactions.map((transaction, index) => ({
        "#": index + 1,
        "Date": new Date(transaction.timestamp).toLocaleString(),
        "Type": transaction.inputCurrency === "usd" ? "Customer gave USD" : "Customer gave LBP",
        "Input Amount": transaction.amount,
        "Input Currency": transaction.fromCurrency,
        "Output Amount": transaction.result.toFixed(2),
        "Output Currency": transaction.toCurrency,
        "Exchange Rate": transaction.rate,
        "Profit (LBP)": transaction.profit.toFixed(2),
        "Box": transaction.toMyBox ? "My Box" : "His Box"
      }));

      // Add summary row
      const totalProfitSum = transactions.reduce((sum, t) => sum + t.profit, 0);
      excelData.push({
        "#": "" as any,
        "Date": "TOTAL",
        "Type": "" as any,
        "Input Amount": "" as any,
        "Input Currency": "" as any,
        "Output Amount": "" as any,
        "Output Currency": "" as any,
        "Exchange Rate": "" as any,
        "Profit (LBP)": totalProfitSum.toFixed(2),
        "Box": "" as any
      });

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");

      // Generate Excel file
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const fileName = `Exchange_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      if (format === 'email') {
        // Send via email
        const emailSubject = `Exchange Report - ${new Date().toLocaleDateString()}`;
        const emailBody = `Please find attached your exchange report for ${new Date().toLocaleDateString()}.\n\nTotal Transactions: ${transactions.length}\nTotal Profit: ${totalProfitSum.toFixed(2)} LBP`;
        
        // Create data URL for attachment
        const dataUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
        
        if (Platform.OS === 'web') {
          // For web, create download link and open email
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = fileName;
          link.click();
          
          // Open email client
          const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody + '\n\nNote: Excel file has been downloaded to your device.')}`;
          window.open(emailUrl);
        } else {
          // For mobile, save file and share via email
          const fileUri = FileSystem.documentDirectory + fileName;
          await FileSystem.writeAsStringAsync(fileUri, wbout, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
          await Linking.openURL(emailUrl);
          
          // Also share the file
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              dialogTitle: 'Share Exchange Report',
            });
          }
        }
        
        Alert.alert("Success", "Excel report prepared for email!");
      } else {
        // Save to phone
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, wbout, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (Platform.OS === 'web') {
          // For web, create download link
          const link = document.createElement('a');
          link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
          link.download = fileName;
          link.click();
          Alert.alert("Success", "Excel file downloaded successfully!");
        } else {
          // For mobile, use sharing
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              dialogTitle: 'Export Exchange Report',
            });
            Alert.alert("Success", "Excel file exported successfully!");
          } else {
            Alert.alert("Success", `Excel file saved to: ${fileUri}`);
          }
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert("Error", "Failed to export data. Please try again.");
    }
  }, [transactions, isPremium, upgradeToPremium]);

  return {
    buyRate,
    sellRate,
    setBuyRate: updateBuyRate,
    setSellRate: updateSellRate,
    transactions,
    addTransaction,
    clearHistory,
    resetRates,
    resetBalances,
    myBalance,
    hisBalance,
    lbpBalance,
    usdBalance,
    updateLbpBalance,
    updateUsdBalance,
    totalProfit,
    isLoading,
    isPremium,
    premiumExpiry,
    transactionCount,
    adminFreeLimit,
    lastSettingsUpdate,
    forceUpdate, // This will trigger re-renders when admin settings change
    isSettingsLoaded,
    lastExpirationWarning,
    hasShownExpirationAlert,
    upgradeToPremium,
    activatePremium,
    deactivatePremium,
    exportToExcel,
    autoSavePreference,
    setAutoSavePreference: setAutoSavePreferenceAsync,
    performAutoSave,
    resetBoxes,
  };
});