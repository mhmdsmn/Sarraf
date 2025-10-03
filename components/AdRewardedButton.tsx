import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Gift } from 'lucide-react-native';
import { useAdsManager } from '@/hooks/ads-manager';

interface AdRewardedButtonProps {
  onRewardEarned?: () => void;
  rewardText?: string;
}

export default function AdRewardedButton({ 
  onRewardEarned, 
  rewardText = 'Watch ad for reward' 
}: AdRewardedButtonProps) {
  const { showRewardedAd, config } = useAdsManager();
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (!config.adFrequency.rewarded) {
      Alert.alert('Not Available', 'Rewarded ads are currently disabled.');
      return;
    }

    setIsLoading(true);
    
    try {
      showRewardedAd();
      
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert(
          'Reward Earned!',
          'Thank you for watching the ad. Your reward has been added.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onRewardEarned) {
                  onRewardEarned();
                }
              }
            }
          ]
        );
      }, 2000);
    } catch {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to load rewarded ad. Please try again.');
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, isLoading && styles.buttonDisabled]} 
      onPress={handlePress}
      disabled={isLoading}
    >
      <Gift size={20} color="#FFFFFF" />
      <Text style={styles.buttonText}>
        {isLoading ? 'Loading...' : rewardText}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
