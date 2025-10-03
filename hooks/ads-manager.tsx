import { useState, useEffect, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { useExchange } from './exchange-store';

interface AdsConfig {
  adsEnabled: boolean;
  bannerAdId: string;
  interstitialAdId: string;
  rewardedAdId: string;
  adFrequency: {
    banner: boolean;
    interstitial: number;
    rewarded: boolean;
  };
}

interface AdsManagerContextType {
  adsEnabled: boolean;
  shouldShowAds: boolean;
  showBannerAd: () => void;
  hideBannerAd: () => void;
  showInterstitialAd: () => void;
  showRewardedAd: () => void;
  isBannerVisible: boolean;
  interstitialCount: number;
  enableAds: () => void;
  disableAds: () => void;
  config: AdsConfig;
  updateConfig: (config: Partial<AdsConfig>) => void;
}

const DEFAULT_CONFIG: AdsConfig = {
  adsEnabled: false,
  bannerAdId: 'ca-app-pub-3940256099942544/6300978111',
  interstitialAdId: 'ca-app-pub-3940256099942544/1033173712',
  rewardedAdId: 'ca-app-pub-3940256099942544/5224354917',
  adFrequency: {
    banner: true,
    interstitial: 3,
    rewarded: true,
  },
};

export const [AdsManagerProvider, useAdsManager] = createContextHook(() => {
  const { isPremium } = useExchange();
  const [config, setConfig] = useState<AdsConfig>(DEFAULT_CONFIG);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [interstitialCount, setInterstitialCount] = useState(0);

  const shouldShowAds = config.adsEnabled && !isPremium;

  const showBannerAd = useCallback(() => {
    if (!shouldShowAds || !config.adFrequency.banner) {
      console.log('Banner ads disabled or user is premium');
      return;
    }

    console.log('Showing banner ad...');
    setIsBannerVisible(true);
  }, [shouldShowAds, config.adFrequency.banner]);

  const hideBannerAd = useCallback(() => {
    console.log('Hiding banner ad...');
    setIsBannerVisible(false);
  }, []);

  const showInterstitialAd = useCallback(() => {
    if (!shouldShowAds) {
      console.log('Interstitial ads disabled or user is premium');
      return;
    }

    const newCount = interstitialCount + 1;
    setInterstitialCount(newCount);

    if (newCount % config.adFrequency.interstitial === 0) {
      console.log('Showing interstitial ad...');
    } else {
      console.log(`Interstitial ad skipped (${newCount}/${config.adFrequency.interstitial})`);
    }
  }, [shouldShowAds, interstitialCount, config.adFrequency.interstitial]);

  const showRewardedAd = useCallback(() => {
    if (!config.adFrequency.rewarded) {
      console.log('Rewarded ads disabled');
      return;
    }

    console.log('Showing rewarded ad...');
  }, [config.adFrequency.rewarded]);

  const hideAllAds = useCallback(() => {
    console.log('Hiding all ads (Premium user)');
    setIsBannerVisible(false);
    setInterstitialCount(0);
  }, []);

  const enableAds = useCallback(() => {
    console.log('Enabling ads system');
    setConfig(prev => ({ ...prev, adsEnabled: true }));
  }, []);

  const disableAds = useCallback(() => {
    console.log('Disabling ads system');
    setConfig(prev => ({ ...prev, adsEnabled: false }));
    hideAllAds();
  }, [hideAllAds]);

  const updateConfig = useCallback((newConfig: Partial<AdsConfig>) => {
    console.log('Updating ads config:', newConfig);
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  useEffect(() => {
    if (isPremium) {
      console.log('User is premium - hiding all ads');
      hideAllAds();
    } else if (config.adsEnabled) {
      console.log('User is not premium - showing ads');
      if (config.adFrequency.banner) {
        showBannerAd();
      }
    }
  }, [isPremium, config.adsEnabled, config.adFrequency.banner, hideAllAds, showBannerAd]);

  return {
    adsEnabled: config.adsEnabled,
    shouldShowAds,
    showBannerAd,
    hideBannerAd,
    showInterstitialAd,
    showRewardedAd,
    isBannerVisible,
    interstitialCount,
    enableAds,
    disableAds,
    config,
    updateConfig,
  };
});
