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
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react-native";
import { useAdmin } from "@/hooks/admin-store";

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { registerUser, isInitialized } = useAdmin();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    if (!name.trim()) {
      Alert.alert("خطأ", "يرجى إدخال الاسم الكامل");
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      Alert.alert("خطأ", "يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    if (password.length < 6) {
      Alert.alert("خطأ", "كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("خطأ", "كلمات المرور غير متطابقة");
      return;
    }

    if (!isInitialized || !registerUser) {
      Alert.alert("خطأ", "النظام لم يتم تحميله بعد. يرجى المحاولة مرة أخرى.");
      return;
    }

    setIsLoading(true);
    
    try {
      await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });

      Alert.alert(
        "تم التسجيل بنجاح",
        "مرحباً بك في تطبيق صرافة العملات",
        [
          {
            text: "متابعة",
            onPress: () => router.replace("/exchange"),
          },
        ]
      );
    } catch (error) {
      Alert.alert("خطأ", "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.");
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
            <Text style={styles.title}>إنشاء حساب جديد</Text>
            <Text style={styles.subtitle}>Create New Account</Text>
            <Text style={styles.description}>
              أدخل بياناتك لإنشاء حساب جديد
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>الاسم الكامل</Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="أدخل اسمك الكامل"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                />
              </View>
            </View>

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
              <Text style={styles.label}>رقم الهاتف (اختياري)</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+961 70 123456"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>تأكيد كلمة المرور</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
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

            <TouchableOpacity 
              style={[styles.signUpButton, (isLoading || !isInitialized) && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading || !isInitialized}
            >
              <Text style={styles.signUpButtonText}>
                {!isInitialized ? "جاري التحميل..." : isLoading ? "جاري التسجيل..." : "إنشاء الحساب"}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>لديك حساب بالفعل؟</Text>
              <TouchableOpacity onPress={() => router.push("/signin")}>
                <Text style={styles.footerLink}>تسجيل الدخول</Text>
              </TouchableOpacity>
            </View>
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
  signUpButton: {
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
  signUpButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0.1,
  },
  signUpButtonText: {
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
});
