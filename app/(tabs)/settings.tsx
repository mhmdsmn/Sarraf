import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Trash2, RefreshCw, Info, DollarSign, Vault, X, Crown, Download, Star, Gift, Zap, RotateCcw, Settings, Mail, Smartphone, Calendar, MessageCircle } from "lucide-react-native";
import { useExchange } from "@/hooks/exchange-store";
import { useRouter } from "expo-router";


export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { 
    resetRates, 
    clearHistory, 
    resetBalances,
    resetBoxes,
    buyRate,
    sellRate,
    transactions,
    myBalance,
    hisBalance,
    lbpBalance,
    usdBalance,
    totalProfit,
    isPremium,
    premiumExpiry,
    transactionCount,
    adminFreeLimit,
    upgradeToPremium,
    exportToExcel,
    autoSavePreference,
    setAutoSavePreference
  } = useExchange();

  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showAutoSaveModal, setShowAutoSaveModal] = useState(false);
  const [newLbpBalance, setNewLbpBalance] = useState(lbpBalance.toString());
  const [newUsdBalance, setNewUsdBalance] = useState(usdBalance.toString());

  const handleResetRates = () => {
    Alert.alert(
      "Reset Exchange Rates",
      "This will reset rates to default values (Buy: 98,000, Sell: 100,000). Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", onPress: resetRates, style: "destructive" }
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear Transaction History",
      "This will permanently delete all transaction records. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", onPress: clearHistory, style: "destructive" }
      ]
    );
  };

  const handleResetBalances = () => {
    Alert.alert(
      "Reset All Balances",
      "This will reset My Box, His Box, and Vault balances to default values. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", onPress: resetBalances, style: "destructive" }
      ]
    );
  };

  const handleResetBoxes = () => {
    Alert.alert(
      "Reset Boxes",
      "This will reset My Box and His Box balances to 0. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", onPress: resetBoxes, style: "destructive" }
      ]
    );
  };

  const handleAutoSaveChange = (preference: 'phone' | 'email' | 'none') => {
    setAutoSavePreference(preference);
    setShowAutoSaveModal(false);
    
    const messages = {
      phone: "Auto-save enabled! Daily backups will be saved to your device.",
      email: "Auto-save enabled! Daily backups will be sent via email.",
      none: "Auto-save disabled."
    };
    
    Alert.alert("Auto-Save Updated", messages[preference]);
  };

  const getPremiumStatusText = () => {
    if (!isPremium) return "Free Account";
    if (!premiumExpiry) return "Premium Account";
    
    const daysLeft = Math.ceil((premiumExpiry - Date.now()) / (24 * 60 * 60 * 1000));
    if (daysLeft <= 0) return "Premium Expired";
    return `Premium Account (${daysLeft} days left)`;
  };

  const getAutoSaveText = () => {
    switch (autoSavePreference) {
      case 'phone': return 'Save to Phone';
      case 'email': return 'Send via Email';
      case 'none': return 'Disabled';
      default: return 'Disabled';
    }
  };

  const handleUpdateVault = () => {
    const lbpAmount = parseFloat(newLbpBalance);
    const usdAmount = parseFloat(newUsdBalance);
    
    if (isNaN(lbpAmount) || lbpAmount < 0) {
      Alert.alert("Invalid Amount", "Please enter a valid LBP amount");
      return;
    }
    
    if (isNaN(usdAmount) || usdAmount < 0) {
      Alert.alert("Invalid Amount", "Please enter a valid USD amount");
      return;
    }
    
    // Update vault balances directly in AsyncStorage
    import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
      Promise.all([
        AsyncStorage.setItem('@exchange_lbp_balance', lbpAmount.toString()),
        AsyncStorage.setItem('@exchange_usd_balance', usdAmount.toString()),
      ]).then(() => {
        Alert.alert(
          "Vault Updated",
          `LBP: ${lbpAmount.toLocaleString()}\nUSD: ${usdAmount.toLocaleString()}\n\nPlease restart the app to see changes.`,
          [{ text: "OK", onPress: () => setShowVaultModal(false) }]
        );
      }).catch((error) => {
        console.error('Error updating vault:', error);
        Alert.alert("Error", "Failed to update vault balance");
      });
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your exchange app</Text>
        </View>

        {/* Premium Status Card */}
        <View style={styles.section}>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              {isPremium ? (
                <>
                  <Crown size={24} color="#F59E0B" />
                  <Text style={styles.statusTitle}>{getPremiumStatusText()}</Text>
                </>
              ) : (
                <>
                  <Zap size={24} color="#6B7280" />
                  <Text style={styles.statusTitle}>{getPremiumStatusText()}</Text>
                </>
              )}
            </View>
            <View style={styles.statusStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Transactions</Text>
                <Text style={styles.statValue}>
                  {isPremium ? `${transactionCount} (Unlimited)` : `${transactionCount}/${adminFreeLimit}`}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Profit</Text>
                <Text style={[styles.statValue, { color: "#10B981" }]}>
                  {totalProfit.toFixed(2)} LBP
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Premium Upgrade Card */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.upgradeCard} onPress={() => router.push('/subscription')}>
            <View style={styles.upgradeHeader}>
              <Crown size={32} color="#F59E0B" />
              <View style={styles.upgradeText}>
                <Text style={styles.upgradeTitle}>
                  {isPremium ? "Manage Subscription" : "Upgrade to Premium"}
                </Text>
                <Text style={styles.upgradeSubtitle}>
                  {isPremium ? "View plans and extend" : "Choose your plan"}
                </Text>
              </View>
            </View>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Star size={16} color="#F59E0B" />
                <Text style={styles.featureText}>Unlimited transactions</Text>
              </View>
              <View style={styles.featureItem}>
                <Download size={16} color="#F59E0B" />
                <Text style={styles.featureText}>Excel export functionality</Text>
              </View>
              <View style={styles.featureItem}>
                <Calendar size={16} color="#F59E0B" />
                <Text style={styles.featureText}>Daily auto-backup</Text>
              </View>
              <View style={styles.featureItem}>
                <Gift size={16} color="#F59E0B" />
                <Text style={styles.featureText}>Priority support</Text>
              </View>
            </View>
            <View style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>
                {isPremium ? "View Subscription Plans" : "Choose Your Plan"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          
          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Current Buy Rate</Text>
              <Text style={styles.statValue}>{buyRate.toFixed(0)} LBP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Current Sell Rate</Text>
              <Text style={styles.statValue}>{sellRate.toFixed(0)} LBP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Transactions</Text>
              <Text style={styles.statValue}>{transactions.length}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>My Box Balance</Text>
              <Text style={styles.statValue}>{myBalance.toFixed(2)} LBP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>His Box Balance</Text>
              <Text style={styles.statValue}>{hisBalance.toFixed(2)} LBP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>LBP Vault Balance</Text>
              <Text style={styles.statValue}>{lbpBalance.toLocaleString()} LBP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>USD Vault Balance</Text>
              <Text style={styles.statValue}>{usdBalance.toLocaleString()} USD</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Profit</Text>
              <Text style={[styles.statValue, totalProfit >= 0 ? styles.profitPositive : styles.profitNegative]}>
                {totalProfit >= 0 ? "+" : ""}{totalProfit.toFixed(2)} LBP
              </Text>
            </View>
          </View>
        </View>



        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => exportToExcel('phone')}>
            <Download size={20} color="#4F46E5" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Export to Excel</Text>
              <Text style={styles.actionDescription}>
                Download transaction history as Excel file
              </Text>
            </View>
            {!isPremium && <Text style={styles.premiumLabel}>Premium</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setShowAutoSaveModal(true)}>
            <Settings size={20} color="#8B5CF6" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Auto-Save Settings</Text>
              <Text style={styles.actionDescription}>
                Current: {getAutoSaveText()} • Daily backup of your data
              </Text>
            </View>
            {!isPremium && <Text style={styles.premiumLabel}>Premium</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleResetRates}>
            <RefreshCw size={20} color="#4F46E5" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Reset Exchange Rates</Text>
              <Text style={styles.actionDescription}>
                Reset to default rates (98,000 / 100,000)
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setShowVaultModal(true)}>
            <Vault size={20} color="#10B981" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Update Vault Balance</Text>
              <Text style={styles.actionDescription}>
                Set LBP and USD vault amounts
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleResetBoxes}>
            <RotateCcw size={20} color="#F59E0B" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Reset Boxes</Text>
              <Text style={styles.actionDescription}>
                Clear My Box and His Box balances only
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleResetBalances}>
            <DollarSign size={20} color="#F59E0B" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Reset All Balances</Text>
              <Text style={styles.actionDescription}>
                Reset boxes and vault to default values
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleClearHistory}>
            <Trash2 size={20} color="#EF4444" />
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, styles.dangerText]}>Clear History</Text>
              <Text style={styles.actionDescription}>
                Delete all transaction records
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Support & Help */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Help</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <Info size={20} color="#4F46E5" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>User Guide</Text>
              <Text style={styles.actionDescription}>
                Complete guide on how to use the app
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <MessageCircle size={20} color="#10B981" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Technical Support</Text>
              <Text style={styles.actionDescription}>
                Get help from our support team
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutCard}>
            <Info size={20} color="#6B7280" />
            <View style={styles.aboutContent}>
              <Text style={styles.aboutTitle}>Exchange Rules</Text>
              <Text style={styles.aboutText}>
                • Buy USD→LBP: Added to My Box{"\n"}
                • Sell USD→LBP: Added to His Box{"\n"}
                • Buy LBP→USD: Added to My Box{"\n"}
                • Sell LBP→USD: Added to His Box
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Vault Update Modal */}
      <Modal
        visible={showVaultModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVaultModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Vault Balance</Text>
              <TouchableOpacity onPress={() => setShowVaultModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Lebanese Pounds (LBP)</Text>
              <TextInput
                style={styles.modalInput}
                value={newLbpBalance}
                onChangeText={setNewLbpBalance}
                keyboardType="numeric"
                placeholder="500000000"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>US Dollars (USD)</Text>
              <TextInput
                style={styles.modalInput}
                value={newUsdBalance}
                onChangeText={setNewUsdBalance}
                keyboardType="numeric"
                placeholder="6500"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowVaultModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleUpdateVault}
              >
                <Text style={styles.saveButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Auto-Save Settings Modal */}
      <Modal
        visible={showAutoSaveModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAutoSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Auto-Save Settings</Text>
              <TouchableOpacity onPress={() => setShowAutoSaveModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Choose how you want your data to be automatically backed up daily:
            </Text>

            <TouchableOpacity 
              style={[styles.autoSaveOption, autoSavePreference === 'phone' && styles.autoSaveOptionSelected]}
              onPress={() => handleAutoSaveChange('phone')}
            >
              <Smartphone size={20} color={autoSavePreference === 'phone' ? '#4F46E5' : '#6B7280'} />
              <View style={styles.autoSaveOptionText}>
                <Text style={[styles.autoSaveOptionTitle, autoSavePreference === 'phone' && styles.autoSaveOptionTitleSelected]}>
                  Save to Phone
                </Text>
                <Text style={styles.autoSaveOptionDescription}>
                  Daily backup saved to device storage
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.autoSaveOption, autoSavePreference === 'email' && styles.autoSaveOptionSelected]}
              onPress={() => handleAutoSaveChange('email')}
            >
              <Mail size={20} color={autoSavePreference === 'email' ? '#10B981' : '#6B7280'} />
              <View style={styles.autoSaveOptionText}>
                <Text style={[styles.autoSaveOptionTitle, autoSavePreference === 'email' && styles.autoSaveOptionTitleSelected]}>
                  Send via Email
                </Text>
                <Text style={styles.autoSaveOptionDescription}>
                  Daily backup sent to your email
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.autoSaveOption, autoSavePreference === 'none' && styles.autoSaveOptionSelected]}
              onPress={() => handleAutoSaveChange('none')}
            >
              <X size={20} color={autoSavePreference === 'none' ? '#EF4444' : '#6B7280'} />
              <View style={styles.autoSaveOptionText}>
                <Text style={[styles.autoSaveOptionTitle, autoSavePreference === 'none' && styles.autoSaveOptionTitleSelected]}>
                  Disabled
                </Text>
                <Text style={styles.autoSaveOptionDescription}>
                  No automatic backups
                </Text>
              </View>
            </TouchableOpacity>

            {!isPremium && (
              <View style={styles.premiumNotice}>
                <Crown size={16} color="#F59E0B" />
                <Text style={styles.premiumNoticeText}>
                  Auto-save is a Premium feature. Upgrade to enable daily backups.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  statusStats: {
    flexDirection: "row",
    gap: 24,
  },
  statItem: {
    flex: 1,
  },
  upgradeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: "#F59E0B",
  },
  upgradeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  upgradeSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  featuresList: {
    gap: 8,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
  },
  upgradeButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  premiumLabel: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "600" as const,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  statDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  profitPositive: {
    color: "#10B981",
  },
  profitNegative: {
    color: "#EF4444",
  },
  actionButton: {
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
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dangerButton: {
    backgroundColor: "#FEF2F2",
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: "#6B7280",
  },
  dangerText: {
    color: "#EF4444",
  },
  aboutCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aboutContent: {
    flex: 1,
    marginLeft: 12,
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  saveButton: {
    backgroundColor: "#10B981",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  modalDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center" as const,
  },
  autoSaveOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  autoSaveOptionSelected: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  autoSaveOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  autoSaveOptionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6B7280",
    marginBottom: 2,
  },
  autoSaveOptionTitleSelected: {
    color: "#1F2937",
  },
  autoSaveOptionDescription: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  premiumNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  premiumNoticeText: {
    fontSize: 12,
    color: "#92400E",
    flex: 1,
  },
});