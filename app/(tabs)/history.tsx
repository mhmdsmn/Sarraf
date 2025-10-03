import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TrendingUp, TrendingDown, Calendar, Download, Crown, Zap, Mail, Smartphone, X, Trash2 } from "lucide-react-native";
import { useExchange } from "@/hooks/exchange-store";
import type { Transaction } from "@/types/exchange";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, clearHistory, exportToExcel, isPremium, upgradeToPremium, premiumExpiry } = useExchange();
  const [showExportModal, setShowExportModal] = useState(false);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionColor = (transaction: Transaction) => {
    if (!transaction || typeof transaction.inputCurrency !== 'string') return "#6B7280";
    return transaction.inputCurrency === "usd" ? "#10B981" : "#EF4444";
  };

  const getBoxLabel = (transaction: Transaction) => {
    if (!transaction || typeof transaction.toMyBox !== 'boolean') return "Unknown";
    return transaction.toMyBox ? "My Box" : "His Box";
  };

  const handleExportPress = () => {
    if (!isPremium) {
      exportToExcel();
      return;
    }
    setShowExportModal(true);
  };

  const handleExportChoice = (format: 'phone' | 'email') => {
    setShowExportModal(false);
    exportToExcel(format);
  };

  const getPremiumStatusText = () => {
    if (!isPremium) return "Free";
    if (!premiumExpiry) return "Premium";
    
    const daysLeft = Math.ceil((premiumExpiry - Date.now()) / (24 * 60 * 60 * 1000));
    if (daysLeft <= 0) return "Expired";
    return `Premium (${daysLeft} days left)`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Transaction History</Text>
          <View style={styles.statusRow}>
            {isPremium ? (
              <View style={styles.premiumBadge}>
                <Crown size={14} color="#F59E0B" />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            ) : (
              <View style={styles.freeBadge}>
                <Zap size={14} color="#6B7280" />
                <Text style={styles.freeText}>{getPremiumStatusText()}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {!isPremium && (
        <TouchableOpacity style={styles.upgradeCard} onPress={upgradeToPremium}>
          <View style={styles.upgradeContent}>
            <Crown size={24} color="#F59E0B" />
            <View style={styles.upgradeText}>
              <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeDescription}>
                Get unlimited transactions + Excel export
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Calendar size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Transactions Yet</Text>
          <Text style={styles.emptyText}>
            Your exchange history will appear here
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {sortedTransactions.map((transaction) => (
            <View key={transaction.timestamp} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionIcon}>
                  {transaction.inputCurrency === "usd" ? (
                    <TrendingUp size={20} color="#10B981" />
                  ) : (
                    <TrendingDown size={20} color="#EF4444" />
                  )}
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionType}>
                    {transaction.inputCurrency === "usd" 
                      ? "Customer gave USD, got LBP" 
                      : "Customer gave LBP, got USD"
                    }
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.timestamp)}
                  </Text>
                </View>
                <View style={styles.transactionAmounts}>
                  <Text style={[styles.transactionResult, { color: getTransactionColor(transaction) }]}>
                    {transaction.result.toFixed(transaction.inputCurrency === "usd" ? 0 : 2)} {transaction.toCurrency}
                  </Text>
                  <Text style={styles.transactionOriginal}>
                    {transaction.amount.toFixed(transaction.inputCurrency === "usd" ? 2 : 0)} {transaction.fromCurrency}
                  </Text>
                </View>
              </View>
              <View style={styles.transactionFooter}>
                <View style={styles.rateInfo}>
                  <Text style={styles.rateLabel}>Rate: </Text>
                  <Text style={styles.rateValue}>{transaction.rate.toFixed(0)}</Text>
                  <Text style={styles.profitLabel}> • Profit: </Text>
                  <Text style={styles.profitValue}>{transaction.profit.toFixed(2)} LBP</Text>
                </View>
                <View style={[styles.boxBadge, transaction.toMyBox ? styles.myBoxBadge : styles.hisBoxBadge]}>
                  <Text style={styles.boxBadgeText}>{getBoxLabel(transaction)}</Text>
                </View>
              </View>
            </View>
          ))}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}

      {/* Action Buttons */}
      {transactions.length > 0 && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity onPress={handleExportPress} style={styles.bottomExportButton}>
            <Download size={20} color="#FFFFFF" />
            <Text style={styles.bottomButtonText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearHistory} style={styles.bottomClearButton}>
            <Trash2 size={20} color="#FFFFFF" />
            <Text style={styles.bottomButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Export Format Modal */}
      <Modal
        visible={showExportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Export Format</Text>
              <TouchableOpacity onPress={() => setShowExportModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              How would you like to export your transaction data?
            </Text>
            
            <TouchableOpacity 
              style={styles.exportOption}
              onPress={() => handleExportChoice('phone')}
            >
              <Smartphone size={24} color="#4F46E5" />
              <View style={styles.exportOptionText}>
                <Text style={styles.exportOptionTitle}>Save to Phone</Text>
                <Text style={styles.exportOptionDescription}>
                  Download Excel file to your device
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.exportOption}
              onPress={() => handleExportChoice('email')}
            >
              <Mail size={24} color="#10B981" />
              <View style={styles.exportOptionText}>
                <Text style={styles.exportOptionTitle}>Send via Email</Text>
                <Text style={styles.exportOptionDescription}>
                  Open email client with Excel attachment
                </Text>
              </View>
            </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#F59E0B",
  },
  freeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomExportButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomClearButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  upgradeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: "#F59E0B",
  },
  upgradeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 2,
  },
  upgradeDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1F2937",
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  transactionAmounts: {
    alignItems: "flex-end",
  },
  transactionResult: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 2,
  },
  transactionOriginal: {
    fontSize: 12,
    color: "#6B7280",
  },
  transactionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  rateInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  rateLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  rateValue: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  boxBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  myBoxBadge: {
    backgroundColor: "#DBEAFE",
  },
  hisBoxBadge: {
    backgroundColor: "#FEF3C7",
  },
  boxBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  bottomSpacing: {
    height: 20,
  },
  profitLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  profitValue: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#10B981",
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
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  modalDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center" as const,
  },
  exportOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  exportOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  exportOptionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 2,
  },
  exportOptionDescription: {
    fontSize: 12,
    color: "#6B7280",
  },
});