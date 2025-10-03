import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useAdsManager } from '@/hooks/ads-manager';

interface AdBannerProps {
  position?: 'top' | 'bottom';
}

export default function AdBanner({ position = 'bottom' }: AdBannerProps) {
  const { shouldShowAds, isBannerVisible } = useAdsManager();

  if (!shouldShowAds || !isBannerVisible) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      position === 'top' ? styles.topPosition : styles.bottomPosition
    ]}>
      <View style={styles.adPlaceholder}>
        <Text style={styles.adText}>Ad Space</Text>
        <Text style={styles.adSubtext}>
          {Platform.OS === 'web' ? '728x90' : '320x50'} Banner
        </Text>
        <Text style={styles.adNote}>
          AdSense integration ready
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  topPosition: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  bottomPosition: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  adPlaceholder: {
    height: Platform.OS === 'web' ? 90 : 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  adText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  adSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  adNote: {
    fontSize: 10,
    color: '#10B981',
    marginTop: 4,
    fontStyle: 'italic' as const,
  },
});
