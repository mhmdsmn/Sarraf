import React, { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DollarSign, TrendingUp, TrendingDown, ArrowRightLeft, Edit3 } from "lucide-react-native";
import { useExchange } from "@/hooks/exchange-store";

type InputCurrency = "usd" | "lbp";

export default function ExchangeScreen() {
  const insets = useSafeAreaInsets();
  const { 
    buyRate, 
    sellRate, 
    setBuyRate, 
    setSellRate, 
    addTransaction,
    myBalance,
    hisBalance,
    lbpBalance,
    usdBalance,
    updateLbpBalance,
    updateUsdBalance,
    totalProfit,
    isPremium,
    transactionCount,
    adminFreeLimit,
    forceUpdate,
    isSettingsLoaded
  } = useExchange();

  const [amount, setAmount] = useState("");
  const [inputCurrency, setInputCurrency] = useState<InputCurrency>("lbp");
  const [buyRateInput, setBuyRateInput] = useState(buyRate.toString());
  const [sellRateInput, setSellRateInput] = useState(sellRate.toString());
  const [lbpBalanceInput, setLbpBalanceInput] = useState(lbpBalance.toString());
  const [usdBalanceInput, setUsdBalanceInput] = useState(usdBalance.toString());
  const [isEditingBalances, setIsEditingBalances] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const animateButton = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  const calculations = useMemo(() => {
    const numAmount = parseFloat(amount) || 0;
    
    if (inputCurrency === "usd") {
      // Scenario 2: Customer wants LBP (gives me USD)
      // Customer pays USD, gets LBP at buy rate (lower rate)
      const customerGetsLBP = numAmount * buyRate;
      const myProfit = numAmount * (sellRate - buyRate);
      
      return {
        result: customerGetsLBP,
        profit: myProfit,
        description: `Customer gives ${numAmount} USD, gets ${customerGetsLBP.toFixed(0)} LBP`
      };
    } else {
      // Scenario 1: Customer wants USD (gives me LBP)
      // Customer pays LBP, gets USD at sell rate (higher rate)
      const customerGetsUSD = numAmount / sellRate;
      const myProfit = customerGetsUSD * (sellRate - buyRate);
      
      return {
        result: customerGetsUSD,
        profit: myProfit,
        description: `Customer gives ${numAmount} LBP, gets ${customerGetsUSD.toFixed(2)} USD`
      };
    }
  }, [amount, buyRate, sellRate, inputCurrency]);

  const handleTransaction = useCallback(async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    animateButton();

    let fromCurrency: string;
    let toCurrency: string;
    let rate: number;
    let result: number;
    let toMyBox: boolean;

    if (inputCurrency === "usd") {
      // Scenario 2: Customer wants LBP (gives me USD)
      fromCurrency = "USD";
      toCurrency = "LBP";
      rate = buyRate;
      result = calculations.result;
      toMyBox = true; // USD to LBP goes to my box
    } else {
      // Scenario 1: Customer wants USD (gives me LBP)
      fromCurrency = "LBP";
      toCurrency = "USD";
      rate = sellRate;
      result = calculations.result;
      toMyBox = false; // LBP to USD goes to his box
    }

    const success = await addTransaction({
      inputCurrency,
      amount: numAmount,
      result,
      rate,
      fromCurrency,
      toCurrency,
      toMyBox,
      profit: calculations.profit,
      timestamp: Date.now(),
    });

    if (success) {
      Alert.alert(
        "Transaction Complete",
        `${calculations.description}\n\nProfit: ${calculations.profit.toFixed(2)} LBP\nAdded to ${toMyBox ? "My Box" : "His Box"}`,
        [{ text: "OK", onPress: () => setAmount("") }]
      );
    }
  }, [amount, inputCurrency, calculations, buyRate, sellRate, addTransaction, animateButton]);

  React.useEffect(() => {
    setLbpBalanceInput(lbpBalance.toString());
    setUsdBalanceInput(usdBalance.toString());
  }, [lbpBalance, usdBalance]);

  // Update rate inputs when rates change from admin settings
  React.useEffect(() => {
    setBuyRateInput(buyRate.toString());
    setSellRateInput(sellRate.toString());
  }, [buyRate, sellRate]);

  // Force re-render when admin settings change
  React.useEffect(() => {
    console.log('Exchange screen: Admin settings updated, force update:', forceUpdate);
    console.log('Current admin free limit:', adminFreeLimit);
    console.log('Settings loaded:', isSettingsLoaded);
    // This effect will trigger a re-render when forceUpdate changes
  }, [forceUpdate, adminFreeLimit, isSettingsLoaded]);

  const updateRates = useCallback(() => {
    const newBuyRate = parseFloat(buyRateInput);
    const newSellRate = parseFloat(sellRateInput);
    
    if (isNaN(newBuyRate) || newBuyRate <= 0) {
      Alert.alert("Invalid Rate", "Please enter a valid buy rate");
      return;
    }
    
    if (isNaN(newSellRate) || newSellRate <= 0) {
      Alert.alert("Invalid Rate", "Please enter a valid sell rate");
      return;
    }
    
    setBuyRate(newBuyRate);
    setSellRate(newSellRate);
    Alert.alert("Rates Updated", "Exchange rates have been updated successfully");
  }, [buyRateInput, sellRateInput, setBuyRate, setSellRate]);

  const updateBalances = useCallback(() => {
    const newLbpBalance = parseFloat(lbpBalanceInput);
    const newUsdBalance = parseFloat(usdBalanceInput);
    
    if (isNaN(newLbpBalance) || newLbpBalance < 0) {
      Alert.alert("Invalid Balance", "Please enter a valid LBP balance");
      return;
    }
    
    if (isNaN(newUsdBalance) || newUsdBalance < 0) {
      Alert.alert("Invalid Balance", "Please enter a valid USD balance");
      return;
    }
    
    updateLbpBalance(newLbpBalance);
    updateUsdBalance(newUsdBalance);
    setIsEditingBalances(false);
    Alert.alert("Balances Updated", "Vault balances have been updated successfully");
  }, [lbpBalanceInput, usdBalanceInput, updateLbpBalance, updateUsdBalance]);

  const toggleEditBalances = useCallback(() => {
    if (isEditingBalances) {
      setLbpBalanceInput(lbpBalance.toString());
      setUsdBalanceInput(usdBalance.toString());
    }
    setIsEditingBalances(!isEditingBalances);
  }, [isEditingBalances, lbpBalance, usdBalance]);

  const toggleInputCurrency = useCallback(() => {
    setInputCurrency(prev => prev === "usd" ? "lbp" : "usd");
    setAmount("");
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Currency Exchange</Text>
            <Text style={styles.subtitle}>USD ↔ LBP</Text>
          </View>

          <View style={styles.profitCard}>
            <View style={styles.profitRow}>
              <View style={styles.profitSection}>
                <Text style={styles.profitLabel}>Total Profit</Text>
                <Text style={[styles.profitAmount, totalProfit >= 0 ? styles.profitPositive : styles.profitNegative]}>
                  {totalProfit >= 0 ? "+" : ""}{totalProfit.toFixed(2)} LBP
                </Text>
              </View>
              <View style={styles.transactionSection}>
                <Text style={styles.transactionLabel}>Transactions</Text>
                <Text style={styles.transactionCount}>
                  {isPremium ? `${transactionCount} (Unlimited)` : `${transactionCount}/${adminFreeLimit}`}
                </Text>
                {!isPremium && transactionCount >= adminFreeLimit * 0.8 && (
                  <Text style={styles.limitWarning}>
                    {transactionCount >= adminFreeLimit ? "Limit reached!" : "Near limit"}
                  </Text>
                )}
                {!isPremium && isSettingsLoaded && (
                  <Text style={styles.settingsInfo}>
                    Free limit: {adminFreeLimit} transactions
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.vaultContainer}>
            <View style={styles.vaultHeader}>
              <Text style={styles.sectionTitle}>Vault Balance</Text>
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={toggleEditBalances}
              >
                <Edit3 size={16} color="#4F46E5" />
                <Text style={styles.editButtonText}>
                  {isEditingBalances ? "Cancel" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>
            
            {isEditingBalances ? (
              <View>
                <View style={styles.vaultRow}>
                  <View style={styles.vaultCard}>
                    <Text style={styles.vaultLabel}>Lebanese Pounds</Text>
                    <TextInput
                      style={styles.vaultInput}
                      value={lbpBalanceInput}
                      onChangeText={setLbpBalanceInput}
                      keyboardType="numeric"
                      placeholder="500000000"
                      placeholderTextColor="#9CA3AF"
                    />
                    <Text style={styles.vaultCurrency}>LBP</Text>
                  </View>
                  <View style={[styles.vaultCard, styles.vaultCardUsd]}>
                    <Text style={styles.vaultLabel}>US Dollars</Text>
                    <TextInput
                      style={styles.vaultInput}
                      value={usdBalanceInput}
                      onChangeText={setUsdBalanceInput}
                      keyboardType="numeric"
                      placeholder="6500"
                      placeholderTextColor="#9CA3AF"
                    />
                    <Text style={styles.vaultCurrency}>USD</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.updateBalancesButton} onPress={updateBalances}>
                  <Text style={styles.updateBalancesButtonText}>Update Balances</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.vaultRow}>
                <View style={styles.vaultCard}>
                  <Text style={styles.vaultLabel}>Lebanese Pounds</Text>
                  <Text style={styles.vaultAmount}>{lbpBalance.toLocaleString()}</Text>
                  <Text style={styles.vaultCurrency}>LBP</Text>
                </View>
                <View style={[styles.vaultCard, styles.vaultCardUsd]}>
                  <Text style={styles.vaultLabel}>US Dollars</Text>
                  <Text style={styles.vaultAmount}>{usdBalance.toLocaleString()}</Text>
                  <Text style={styles.vaultCurrency}>USD</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.balanceContainer}>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>My Box</Text>
              <Text style={styles.balanceAmount}>{myBalance.toFixed(2)}</Text>
              <Text style={styles.balanceCurrency}>LBP</Text>
            </View>
            <View style={[styles.balanceCard, styles.balanceCardAlt]}>
              <Text style={styles.balanceLabel}>His Box</Text>
              <Text style={styles.balanceAmount}>{hisBalance.toFixed(2)}</Text>
              <Text style={styles.balanceCurrency}>LBP</Text>
            </View>
          </View>

          <View style={styles.ratesCard}>
            <Text style={styles.sectionTitle}>Exchange Rates</Text>
            
            <View style={styles.rateRow}>
              <View style={styles.rateItem}>
                <View style={styles.rateHeader}>
                  <TrendingDown size={16} color="#10B981" />
                  <Text style={styles.rateLabel}>Buy Rate (I buy USD)</Text>
                </View>
                <TextInput
                  style={styles.rateInput}
                  value={buyRateInput}
                  onChangeText={setBuyRateInput}
                  keyboardType="numeric"
                  placeholder="98000"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.rateDescription}>Lower rate - Customer gets LBP</Text>
              </View>
              
              <View style={styles.rateItem}>
                <View style={styles.rateHeader}>
                  <TrendingUp size={16} color="#EF4444" />
                  <Text style={styles.rateLabel}>Sell Rate (I sell USD)</Text>
                </View>
                <TextInput
                  style={styles.rateInput}
                  value={sellRateInput}
                  onChangeText={setSellRateInput}
                  keyboardType="numeric"
                  placeholder="100000"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.rateDescription}>Higher rate - Customer gets USD</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.updateButton} onPress={updateRates}>
              <Text style={styles.updateButtonText}>Update Rates</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.modeToggle} onPress={toggleInputCurrency}>
            <Text style={styles.modeText}>
              Input Currency: {inputCurrency === "usd" ? "USD" : "LBP"}
            </Text>
            <ArrowRightLeft size={20} color="#4F46E5" />
          </TouchableOpacity>

          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>
              Enter {inputCurrency === "usd" ? "USD" : "LBP"} Amount
            </Text>
            <Text style={styles.scenarioDescription}>
              {inputCurrency === "usd" 
                ? "Scenario 2: Customer wants LBP (gives you USD)"
                : "Scenario 1: Customer wants USD (gives you LBP)"
              }
            </Text>
            <View style={styles.amountInputContainer}>
              <DollarSign size={24} color="#9CA3AF" />
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder={inputCurrency === "usd" ? "500" : "50000000"}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {amount && parseFloat(amount) > 0 && (
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Exchange Result</Text>
              
              <View style={styles.calculationCard}>
                <Text style={styles.calculationDescription}>
                  {calculations.description}
                </Text>
                
                <View style={styles.profitRow}>
                  <Text style={styles.profitLabel}>Your Profit:</Text>
                  <Text style={styles.profitValue}>
                    {calculations.profit.toFixed(2)} LBP
                  </Text>
                </View>
                
                <View style={styles.destinationRow}>
                  <Text style={styles.destinationLabel}>Goes to:</Text>
                  <Text style={styles.destinationValue}>
                    {inputCurrency === "usd" ? "My Box" : "His Box"}
                  </Text>
                </View>
              </View>
              
              <Animated.View style={[styles.animatedButton, { transform: [{ scale: scaleAnim }] }]}>
                <TouchableOpacity 
                  style={styles.executeButton}
                  onPress={handleTransaction}
                >
                  <Text style={styles.executeButtonText}>Execute Transaction</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
  profitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profitLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  profitAmount: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  profitPositive: {
    color: "#10B981",
  },
  profitNegative: {
    color: "#EF4444",
  },
  balanceContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: "#4F46E5",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceCardAlt: {
    backgroundColor: "#7C3AED",
  },
  balanceLabel: {
    fontSize: 12,
    color: "#E0E7FF",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  balanceCurrency: {
    fontSize: 12,
    color: "#E0E7FF",
    marginTop: 2,
  },
  vaultContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vaultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  editButtonText: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "500" as const,
  },
  vaultInput: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    textAlign: "center" as const,
  },
  updateBalancesButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  updateBalancesButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  vaultRow: {
    flexDirection: "row",
    gap: 12,
  },
  vaultCard: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  vaultCardUsd: {
    borderColor: "#3B82F6",
  },
  vaultLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500" as const,
  },
  vaultAmount: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  vaultCurrency: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "600" as const,
  },
  ratesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  rateRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  rateItem: {
    flex: 1,
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
  },
  rateInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  updateButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  modeToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modeText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#4F46E5",
  },
  amountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  amountLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600" as const,
    color: "#1F2937",
    paddingVertical: 16,
    paddingLeft: 8,
  },
  resultsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  resultAmount: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  resultDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  animatedButton: {
    transform: [{ scale: 1 }],
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  buyButton: {
    backgroundColor: "#10B981",
  },
  sellButton: {
    backgroundColor: "#EF4444",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  rateDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  scenarioDescription: {
    fontSize: 12,
    color: "#4F46E5",
    marginBottom: 12,
    fontStyle: "italic" as const,
  },
  calculationCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  calculationDescription: {
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 12,
    fontWeight: "500" as const,
  },
  profitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  profitValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#10B981",
  },
  destinationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  destinationLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  destinationValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#4F46E5",
  },
  executeButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  executeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  profitSection: {
    flex: 1,
  },
  transactionSection: {
    flex: 1,
    alignItems: "flex-end",
  },
  transactionLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  transactionCount: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  limitWarning: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 2,
    fontWeight: "500" as const,
  },
  settingsInfo: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
    fontStyle: "italic" as const,
  },
});