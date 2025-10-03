import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { X } from 'lucide-react-native';

interface AdInterstitialProps {
  visible: boolean;
  onClose: () => void;
}

export default function AdInterstitial({ visible, onClose }: AdInterstitialProps) {
  useEffect(() => {
    if (visible) {
      console.log('Interstitial ad displayed');
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          
          <View style={styles.adContent}>
            <Text style={styles.adTitle}>Interstitial Ad</Text>
            <Text style={styles.adSize}>
              {Platform.OS === 'web' ? '300x250' : 'Full Screen'}
            </Text>
            <Text style={styles.adNote}>
              AdSense integration ready
            </Text>
            <Text style={styles.adTimer}>
              Closing in 5 seconds...
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 10,
  },
  adContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
  },
  adTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  adSize: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  adNote: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 8,
    fontStyle: 'italic' as const,
  },
  adTimer: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 16,
  },
});
