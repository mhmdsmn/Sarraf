import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { useAdmin } from "@/hooks/admin-store";

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { loginUser, isInitialized } = useAdmin();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    if (!email.trim() || !validateEmail(email)) {
      Alert.alert("خطأ", "يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    if (!password.trim()) {
      Alert.alert("خطأ", "يرجى إدخال كلمة المرور");
      return;
    }

    if (!isInitialized || !loginUser) {
      Alert.alert("خطأ", "النظام لم يتم تحميله بعد. يرجى المحاولة مرة أخرى.");
      return;
    }

    setIsLoading(true);
    
    try {
      const user = await loginUser(email.trim().toLowerCase(), password);
      
      if (user) {
        Alert.alert(
          "تم تسجيل الدخول بنجاح",
          `مرحباً ${user.name}`,
          [
            {
              text: "متابعة",
              onPress: () => router.replace("/exchange"),
            },
          ]
        );
      } else {
        Alert.alert("خطأ", "البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
    } catch {
      Alert.alert("خطأ", "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#4F46E5" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>تسجيل الدخول</Text>
            <Text style={styles.subtitle}>Sign In</Text>
            <Text style={styles.description}>
              أدخل بياناتك للوصول إلى حسابك
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="example@email.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>كلمة المرور</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="أدخل كلمة المرور"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onSubmitEditing={handleSignIn}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.signInButton, (isLoading || !isInitialized) && styles.signInButtonDisabled]}
              onPress={handleSignIn}
              disabled={isLoading || !isInitialized}
            >
              <Text style={styles.signInButtonText}>
                {!isInitialized ? "جاري التحميل..." : isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>ليس لديك حساب؟</Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text style={styles.footerLink}>إنشاء حساب جديد</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.demoInfo}>
            <Text style={styles.demoTitle}>للتجربة:</Text>
            <Text style={styles.demoText}>
              يمكنك إنشاء حساب جديد أو المتابعة كضيف
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "right" as const,
  },
  subtitle: {
    fontSize: 18,
    color: "#4F46E5",
    marginBottom: 8,
    fontWeight: "600" as const,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    textAlign: "right" as const,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    textAlign: "right" as const,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 12,
    textAlign: "right" as const,
  },
  signInButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  signInButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0.1,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700" as const,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  footerLink: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "600" as const,
  },
  demoInfo: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginTop: 32,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#92400E",
    marginBottom: 4,
    textAlign: "right" as const,
  },
  demoText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
    textAlign: "right" as const,
  },
});
