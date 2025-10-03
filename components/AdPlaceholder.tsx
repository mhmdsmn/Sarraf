import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAdsManager } from '@/hooks/ads-manager';

interface AdPlaceholderProps {
  type: 'banner' | 'interstitial' | 'rewarded';
  size?: string;
}

export default function AdPlaceholder({ type, size }: AdPlaceholderProps) {
  const { shouldShowAds } = useAdsManager();

  if (!shouldShowAds) {
    return null;
  }

  const getAdInfo = () => {
    switch (type) {
      case 'banner':
        return {
          title: 'Banner Ad',
          size: size || '320x50',
          color: '#10B981',
        };
      case 'interstitial':
        return {
          title: 'Interstitial Ad',
          size: size || 'Full Screen',
          color: '#4F46E5',
        };
      case 'rewarded':
        return {
          title: 'Rewarded Ad',
          size: size || 'Full Screen',
          color: '#F59E0B',
        };
    }
  };

  const adInfo = getAdInfo();

  return (
    <View style={[styles.container, { borderColor: adInfo.color }]}>
      <Text style={[styles.title, { color: adInfo.color }]}>{adInfo.title}</Text>
      <Text style={styles.size}>{adInfo.size}</Text>
      <Text style={styles.note}>AdSense Ready</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  size: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  note: {
    fontSize: 10,
    color: '#10B981',
    fontStyle: 'italic' as const,
  },
});
