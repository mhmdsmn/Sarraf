import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock,
  AlertTriangle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAdmin } from "@/hooks/admin-store";

export default function SecretAdminPortalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { loginAdmin, isAuthenticated } = useAdmin();
  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!password.trim()) {
      if (Platform.OS === 'web') {
        alert("يرجى إدخال كلمة المرور");
      } else {
        Alert.alert("خطأ", "يرجى إدخال كلمة المرور");
      }
      return;
    }

    setIsLoading(true);
    
    setTimeout(async () => {
      const success = await loginAdmin(password);
      if (success) {
        router.replace("/admin/dashboard");
      } else {
        if (Platform.OS === 'web') {
          alert("كلمة المرور غير صحيحة");
        } else {
          Alert.alert("خطأ في المصادقة", "كلمة المرور غير صحيحة");
        }
      }
      setIsLoading(false);
      setPassword("");
    }, 1000);
  }, [password, loginAdmin, router]);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, router]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Shield size={60} color="#DC2626" />
          </View>
          <Text style={styles.title}>🔒 Admin Portal</Text>
          <Text style={styles.subtitle}>Restricted Access</Text>
        </View>

        <View style={styles.warningCard}>
          <AlertTriangle size={24} color="#DC2626" />
          <Text style={styles.warningTitle}>⚠️ Authorized Personnel Only</Text>
          <Text style={styles.warningText}>
            This is a restricted area. Unauthorized access is prohibited and will be logged.
          </Text>
        </View>

        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Administrator Authentication</Text>
          
          <View style={styles.inputContainer}>
            <Lock size={20} color="#6B7280" />
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Admin Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              {showPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Shield size={20} color="#FFFFFF" />
            <Text style={styles.loginButtonText}>
              {isLoading ? "Authenticating..." : "Access Control Panel"}
            </Text>
          </TouchableOpacity>

          <View style={styles.demoInfo}>
            <Text style={styles.demoText}>Default Password: admin123456</Text>
            <Text style={styles.demoTextSmall}>Change password after first login</Text>
          </View>
        </View>

        <View style={styles.securityInfo}>
          <Text style={styles.securityTitle}>🔐 Security Notice</Text>
          <Text style={styles.securityText}>
            • All login attempts are monitored{"\n"}
            • Use strong passwords{"\n"}
            • Never share admin credentials{"\n"}
            • Change default password immediately{"\n"}
            • Enable 2FA when available
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#DC2626",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: 16,
    color: "#DC2626",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 2,
  },
  warningCard: {
    backgroundColor: "#7F1D1D",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#DC2626",
    alignItems: "center",
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FEE2E2",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center" as const,
  },
  warningText: {
    fontSize: 14,
    color: "#FCA5A5",
    textAlign: "center" as const,
    lineHeight: 20,
  },
  loginCard: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#F1F5F9",
    marginBottom: 20,
    textAlign: "center" as const,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: "#334155",
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#F1F5F9",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: "#64748B",
    shadowOpacity: 0.2,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  demoInfo: {
    backgroundColor: "#422006",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#78350F",
  },
  demoText: {
    color: "#FDE68A",
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  demoTextSmall: {
    color: "#FCD34D",
    fontSize: 12,
  },
  securityInfo: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#F1F5F9",
    marginBottom: 12,
    textAlign: "center" as const,
  },
  securityText: {
    fontSize: 14,
    color: "#94A3B8",
    lineHeight: 24,
  },
});
