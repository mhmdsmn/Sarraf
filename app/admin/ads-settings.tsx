import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Settings, Eye, EyeOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAdsManager } from '@/hooks/ads-manager';

export default function AdsSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { config, updateConfig, enableAds, disableAds, adsEnabled } = useAdsManager();

  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = () => {
    updateConfig(localConfig);
    Alert.alert('Success', 'Ads settings updated successfully!');
  };

  const handleToggleAds = (value: boolean) => {
    if (value) {
      enableAds();
    } else {
      disableAds();
    }
    setLocalConfig(prev => ({ ...prev, adsEnabled: value }));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Ads Settings</Text>
          <Text style={styles.subtitle}>Configure advertising system</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color="#4F46E5" />
            <Text style={styles.sectionTitle}>General Settings</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Ads System</Text>
              <Text style={styles.settingDescription}>
                Turn on/off the entire advertising system
              </Text>
            </View>
            <Switch
              value={adsEnabled}
              onValueChange={handleToggleAds}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Banner Ads</Text>
              <Text style={styles.settingDescription}>
                Display banner ads at top/bottom of screens
              </Text>
            </View>
            <Switch
              value={localConfig.adFrequency.banner}
              onValueChange={(value) =>
                setLocalConfig(prev => ({
                  ...prev,
                  adFrequency: { ...prev.adFrequency, banner: value }
                }))
              }
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Interstitial Frequency</Text>
              <Text style={styles.settingDescription}>
                Show interstitial ad every X transactions
              </Text>
            </View>
            <TextInput
              style={styles.numberInput}
              value={localConfig.adFrequency.interstitial.toString()}
              onChangeText={(text) => {
                const num = parseInt(text) || 1;
                setLocalConfig(prev => ({
                  ...prev,
                  adFrequency: { ...prev.adFrequency, interstitial: num }
                }));
              }}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Rewarded Ads</Text>
              <Text style={styles.settingDescription}>
                Allow users to watch ads for rewards
              </Text>
            </View>
            <Switch
              value={localConfig.adFrequency.rewarded}
              onValueChange={(value) =>
                setLocalConfig(prev => ({
                  ...prev,
                  adFrequency: { ...prev.adFrequency, rewarded: value }
                }))
              }
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {adsEnabled ? (
              <Eye size={20} color="#10B981" />
            ) : (
              <EyeOff size={20} color="#EF4444" />
            )}
            <Text style={styles.sectionTitle}>Ad Unit IDs</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>AdSense Integration Ready</Text>
            <Text style={styles.infoText}>
              When you&apos;re ready to integrate Google AdSense:
              {'\n\n'}
              1. Get your Ad Unit IDs from AdSense dashboard
              {'\n'}
              2. Replace the test IDs below with your real IDs
              {'\n'}
              3. Enable the ads system
              {'\n'}
              4. Test on your device
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Banner Ad ID</Text>
            <TextInput
              style={styles.textInput}
              value={localConfig.bannerAdId}
              onChangeText={(text) =>
                setLocalConfig(prev => ({ ...prev, bannerAdId: text }))
              }
              placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Interstitial Ad ID</Text>
            <TextInput
              style={styles.textInput}
              value={localConfig.interstitialAdId}
              onChangeText={(text) =>
                setLocalConfig(prev => ({ ...prev, interstitialAdId: text }))
              }
              placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Rewarded Ad ID</Text>
            <TextInput
              style={styles.textInput}
              value={localConfig.rewardedAdId}
              onChangeText={(text) =>
                setLocalConfig(prev => ({ ...prev, rewardedAdId: text }))
              }
              placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Important Notes</Text>
            <Text style={styles.warningText}>
              • Premium users will never see ads
              {'\n'}
              • Ads are automatically hidden when users subscribe
              {'\n'}
              • Test ads are shown by default (safe for testing)
              {'\n'}
              • Replace with real Ad IDs before production
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  numberInput: {
    width: 60,
    height: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlign: 'center' as const,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  infoCard: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0369A1',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0369A1',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  warningCard: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#92400E',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  bottomSpacing: {
    height: 40,
  },
});
