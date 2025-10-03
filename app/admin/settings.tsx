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
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Settings,
  Save,
  RefreshCw,
  Mail,
  Shield,
  Globe,
  Database,
  Bell,
  Lock,
  Info,
  X,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { useAdmin } from "@/hooks/admin-store";

export default function AdminSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, updateSettings, language, toggleLanguage, changeAdminPassword } = useAdmin();
  
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [appVersion, setAppVersion] = useState(settings.appVersion);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(settings.autoBackupEnabled);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSaveSettings = useCallback(async () => {
    if (!supportEmail.trim()) {
      Alert.alert("خطأ", "يرجى إدخال بريد الدعم الإلكتروني");
      return;
    }

    if (!appVersion.trim()) {
      Alert.alert("خطأ", "يرجى إدخال رقم إصدار التطبيق");
      return;
    }

    await updateSettings({
      supportEmail: supportEmail.trim(),
      appVersion: appVersion.trim(),
      autoBackupEnabled,
      maintenanceMode,
    });

    Alert.alert("تم الحفظ", "تم حفظ الإعدادات بنجاح");
  }, [supportEmail, appVersion, autoBackupEnabled, maintenanceMode, updateSettings]);

  const resetToDefaults = useCallback(() => {
    Alert.alert(
      "إعادة تعيين الإعدادات",
      "هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "إعادة تعيين",
          style: "destructive",
          onPress: () => {
            setSupportEmail("support@exchangeapp.com");
            setAppVersion("1.0.0");
            setAutoBackupEnabled(true);
            setMaintenanceMode(false);
          }
        }
      ]
    );
  }, []);

  const texts = {
    ar: {
      title: "إعدادات النظام",
      generalSettings: "الإعدادات العامة",
      supportEmail: "بريد الدعم الإلكتروني",
      appVersion: "إصدار التطبيق",
      language: "اللغة",
      currentLanguage: "العربية",
      switchLanguage: "تبديل إلى الإنجليزية",
      systemSettings: "إعدادات النظام",
      autoBackup: "النسخ الاحتياطي التلقائي",
      autoBackupDesc: "إنشاء نسخة احتياطية تلقائية يومياً",
      maintenanceMode: "وضع الصيانة",
      maintenanceModeDesc: "منع المستخدمين من الوصول للتطبيق",
      securitySettings: "إعدادات الأمان",
      changePassword: "تغيير كلمة المرور",
      twoFactorAuth: "المصادقة الثنائية",
      sessionTimeout: "انتهاء صلاحية الجلسة",
      aboutApp: "حول التطبيق",
      appInfo: "معلومات التطبيق",
      developer: "المطور",
      lastUpdate: "آخر تحديث",
      saveSettings: "حفظ الإعدادات",
      resetDefaults: "إعادة تعيين افتراضية",
      enabled: "مفعل",
      disabled: "معطل",
      minutes: "دقيقة",
    },
    en: {
      title: "System Settings",
      generalSettings: "General Settings",
      supportEmail: "Support Email",
      appVersion: "App Version",
      language: "Language",
      currentLanguage: "English",
      switchLanguage: "Switch to Arabic",
      systemSettings: "System Settings",
      autoBackup: "Auto Backup",
      autoBackupDesc: "Create automatic daily backups",
      maintenanceMode: "Maintenance Mode",
      maintenanceModeDesc: "Prevent users from accessing the app",
      securitySettings: "Security Settings",
      changePassword: "Change Password",
      twoFactorAuth: "Two-Factor Authentication",
      sessionTimeout: "Session Timeout",
      aboutApp: "About App",
      appInfo: "App Information",
      developer: "Developer",
      lastUpdate: "Last Update",
      saveSettings: "Save Settings",
      resetDefaults: "Reset to Defaults",
      enabled: "Enabled",
      disabled: "Disabled",
      minutes: "minutes",
    }
  };

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword.trim()) {
      Alert.alert("خطأ", "يرجى إدخال كلمة المرور الحالية");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("خطأ", "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("خطأ", "كلمات المرور غير متطابقة");
      return;
    }

    const success = await changeAdminPassword(currentPassword, newPassword);
    
    if (success) {
      Alert.alert(
        "تم التغيير",
        "تم تغيير كلمة المرور بنجاح",
        [{ text: "حسناً", onPress: () => {
          setShowPasswordModal(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
        }}]
      );
    } else {
      Alert.alert("خطأ", "كلمة المرور الحالية غير صحيحة");
    }
  }, [currentPassword, newPassword, confirmNewPassword, changeAdminPassword]);

  const t = texts[language];

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
        {/* General Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={24} color="#4F46E5" />
            <Text style={styles.sectionTitle}>{t.generalSettings}</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t.supportEmail}</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                value={supportEmail}
                onChangeText={setSupportEmail}
                placeholder="support@exchangeapp.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t.appVersion}</Text>
            <View style={styles.inputContainer}>
              <Info size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                value={appVersion}
                onChangeText={setAppVersion}
                placeholder="1.0.0"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Globe size={20} color="#6B7280" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t.language}</Text>
                <Text style={styles.settingDescription}>
                  {language === "ar" ? t.currentLanguage : t.currentLanguage}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
              <Text style={styles.languageButtonText}>
                {language === "ar" ? t.switchLanguage : t.switchLanguage}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* System Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={24} color="#10B981" />
            <Text style={styles.sectionTitle}>{t.systemSettings}</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Database size={20} color="#6B7280" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t.autoBackup}</Text>
                <Text style={styles.settingDescription}>{t.autoBackupDesc}</Text>
              </View>
            </View>
            <Switch
              value={autoBackupEnabled}
              onValueChange={setAutoBackupEnabled}
              trackColor={{ false: "#E5E7EB", true: "#4F46E5" }}
              thumbColor={autoBackupEnabled ? "#FFFFFF" : "#F3F4F6"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Shield size={20} color="#6B7280" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t.maintenanceMode}</Text>
                <Text style={styles.settingDescription}>{t.maintenanceModeDesc}</Text>
              </View>
            </View>
            <Switch
              value={maintenanceMode}
              onValueChange={setMaintenanceMode}
              trackColor={{ false: "#E5E7EB", true: "#EF4444" }}
              thumbColor={maintenanceMode ? "#FFFFFF" : "#F3F4F6"}
            />
          </View>
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={24} color="#EF4444" />
            <Text style={styles.sectionTitle}>{t.securitySettings}</Text>
          </View>

          <TouchableOpacity style={styles.settingButton} onPress={() => setShowPasswordModal(true)}>
            <View style={styles.settingInfo}>
              <Lock size={20} color="#6B7280" />
              <Text style={styles.settingLabel}>{t.changePassword}</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Shield size={20} color="#6B7280" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t.twoFactorAuth}</Text>
                <Text style={styles.settingDescription}>
                  {t.disabled}
                </Text>
              </View>
            </View>
            <Switch
              value={false}
              onValueChange={() => {}}
              trackColor={{ false: "#E5E7EB", true: "#4F46E5" }}
              thumbColor="#F3F4F6"
              disabled
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Bell size={20} color="#6B7280" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t.sessionTimeout}</Text>
                <Text style={styles.settingDescription}>30 {t.minutes}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* About App */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={24} color="#6B7280" />
            <Text style={styles.sectionTitle}>{t.aboutApp}</Text>
          </View>

          <View style={styles.aboutContainer}>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>{t.appInfo}</Text>
              <Text style={styles.aboutValue}>Exchange Admin Panel</Text>
            </View>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>{t.developer}</Text>
              <Text style={styles.aboutValue}>Rork AI Assistant</Text>
            </View>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>{t.lastUpdate}</Text>
              <Text style={styles.aboutValue}>{new Date().toLocaleDateString("ar-SA")}</Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>{t.saveSettings}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.changePassword}</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>كلمة المرور الحالية</Text>
              <View style={styles.passwordInputContainer}>
                <Lock size={20} color="#6B7280" />
                <TextInput
                  style={styles.modalInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="أدخل كلمة المرور الحالية"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>كلمة المرور الجديدة</Text>
              <View style={styles.passwordInputContainer}>
                <Lock size={20} color="#6B7280" />
                <TextInput
                  style={styles.modalInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="أدخل كلمة المرور الجديدة"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>تأكيد كلمة المرور</Text>
              <View style={styles.passwordInputContainer}>
                <Lock size={20} color="#6B7280" />
                <TextInput
                  style={styles.modalInput}
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  placeholder="أعد إدخال كلمة المرور"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleChangePassword}
              >
                <Text style={styles.confirmButtonText}>تغيير</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#1F2937",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flex: 1,
    marginLeft: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 12,
    paddingLeft: 8,
  },
  languageButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  languageButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500" as const,
  },
  settingButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingArrow: {
    fontSize: 20,
    color: "#9CA3AF",
    fontWeight: "300" as const,
  },
  aboutContainer: {
    gap: 16,
  },
  aboutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aboutLabel: {
    fontSize: 16,
    color: "#6B7280",
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#1F2937",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
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
    textAlign: "right" as const,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 12,
    textAlign: "right" as const,
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
  confirmButton: {
    backgroundColor: "#4F46E5",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});