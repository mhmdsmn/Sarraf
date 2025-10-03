# 📱 نظام الإعلانات المتكامل - دليل الاستخدام

## 🎯 نظرة عامة

تم تجهيز التطبيق بنظام إعلانات متكامل وجاهز للربط مع **Google AdSense** في المستقبل. النظام مصمم بطريقة احترافية تضمن:

- ✅ **التكامل التلقائي** مع نظام الاشتراكات المميزة
- ✅ **إخفاء تلقائي** للإعلانات عند الاشتراك Premium
- ✅ **سهولة التفعيل** - تغيير متغير واحد فقط
- ✅ **جاهز للإنتاج** - بنية تحتية كاملة

---

## 📂 هيكل النظام

### 1. **مدير الإعلانات (AdsManager)**
📁 `hooks/ads-manager.tsx`

```typescript
// نظام مركزي لإدارة جميع الإعلانات
const { 
  shouldShowAds,      // هل يجب عرض الإعلانات؟
  showBannerAd,       // عرض إعلان البانر
  showInterstitialAd, // عرض إعلان متقطع
  enableAds,          // تفعيل النظام
  disableAds          // تعطيل النظام
} = useAdsManager();
```

**الميزات:**
- كشف تلقائي لحالة Premium
- إخفاء تلقائي للإعلانات للمشتركين
- تحكم كامل في تكرار الإعلانات
- دعم 3 أنواع من الإعلانات

---

### 2. **مكونات الإعلانات**

#### 🎨 **AdBanner** - إعلان البانر
📁 `components/AdBanner.tsx`

```typescript
import AdBanner from '@/components/AdBanner';

// في أي صفحة
<AdBanner position="bottom" />
```

**المواصفات:**
- حجم: 320x50 (موبايل) / 728x90 (ويب)
- موقع: أعلى أو أسفل الشاشة
- يختفي تلقائياً للمشتركين

---

#### 🎬 **AdInterstitial** - إعلان متقطع
📁 `components/AdInterstitial.tsx`

```typescript
import AdInterstitial from '@/components/AdInterstitial';

const [showAd, setShowAd] = useState(false);

<AdInterstitial 
  visible={showAd} 
  onClose={() => setShowAd(false)} 
/>
```

**المواصفات:**
- يظهر كل X معاملة (قابل للتخصيص)
- شاشة كاملة
- إغلاق تلقائي بعد 5 ثواني

---

#### 🎁 **AdRewardedButton** - إعلان بمكافأة
📁 `components/AdRewardedButton.tsx`

```typescript
import AdRewardedButton from '@/components/AdRewardedButton';

<AdRewardedButton 
  rewardText="شاهد إعلان واحصل على مكافأة"
  onRewardEarned={() => {
    // منح المكافأة للمستخدم
    console.log('User earned reward!');
  }}
/>
```

---

### 3. **صفحة إعدادات الإعلانات**
📁 `app/admin/ads-settings.tsx`

لوحة تحكم كاملة للمدير:
- ✅ تفعيل/تعطيل النظام
- ✅ تحديد تكرار الإعلانات
- ✅ إدخال Ad Unit IDs
- ✅ تخصيص أنواع الإعلانات

---

## 🚀 كيفية التفعيل

### المرحلة 1: التجهيز الحالي ✅

النظام **جاهز ومُفعّل** حالياً في وضع التطوير:

```typescript
// في hooks/ads-manager.tsx
const DEFAULT_CONFIG = {
  adsEnabled: false,  // ⚠️ معطل حالياً
  // ...
};
```

---

### المرحلة 2: التفعيل للإنتاج 🔄

عندما تكون جاهزاً لربط AdSense:

#### **الخطوة 1: الحصول على Ad Unit IDs**
1. سجل دخول إلى [Google AdSense](https://www.google.com/adsense/)
2. انتقل إلى **Ads** → **Ad units**
3. أنشئ 3 وحدات إعلانية:
   - Banner Ad (320x50)
   - Interstitial Ad
   - Rewarded Ad
4. انسخ الـ Ad Unit IDs

#### **الخطوة 2: تحديث الإعدادات**
افتح صفحة **Admin → Ads Settings** وأدخل:
- Banner Ad ID
- Interstitial Ad ID  
- Rewarded Ad ID

#### **الخطوة 3: التفعيل**
```typescript
// في Admin Panel → Ads Settings
// فعّل المفتاح: "Enable Ads System"
```

**أو برمجياً:**
```typescript
// في hooks/ads-manager.tsx
const DEFAULT_CONFIG = {
  adsEnabled: true,  // ✅ مُفعّل
  // ...
};
```

---

## 🔗 التكامل مع الاشتراكات

### التكامل التلقائي ✨

النظام **مربوط تلقائياً** مع نظام Premium:

```typescript
// في hooks/ads-manager.tsx
const shouldShowAds = config.adsEnabled && !isPremium;

useEffect(() => {
  if (isPremium) {
    hideAllAds(); // ✅ إخفاء تلقائي
  }
}, [isPremium]);
```

### عند الاشتراك في Premium:
1. ✅ جميع الإعلانات تختفي **فوراً**
2. ✅ لا حاجة لأي كود إضافي
3. ✅ يعمل على جميع الصفحات

### عند إلغاء الاشتراك:
1. ✅ الإعلانات تظهر **تلقائياً**
2. ✅ استعادة كاملة للنظام

---

## 📊 أمثلة الاستخدام

### مثال 1: إضافة بانر في صفحة
```typescript
import AdBanner from '@/components/AdBanner';

export default function MyScreen() {
  return (
    <View style={styles.container}>
      <AdBanner position="top" />
      
      {/* محتوى الصفحة */}
      
      <AdBanner position="bottom" />
    </View>
  );
}
```

---

### مثال 2: إعلان متقطع بعد معاملة
```typescript
import { useAdsManager } from '@/hooks/ads-manager';

export default function TransactionScreen() {
  const { showInterstitialAd } = useAdsManager();
  
  const handleTransaction = async () => {
    // تنفيذ المعاملة
    await executeTransaction();
    
    // عرض إعلان متقطع
    showInterstitialAd();
  };
}
```

---

### مثال 3: مكافأة مقابل مشاهدة إعلان
```typescript
import AdRewardedButton from '@/components/AdRewardedButton';

export default function RewardsScreen() {
  const handleReward = () => {
    // منح المستخدم معاملة مجانية إضافية
    grantFreeTransaction();
  };
  
  return (
    <AdRewardedButton 
      rewardText="شاهد إعلان واحصل على معاملة مجانية"
      onRewardEarned={handleReward}
    />
  );
}
```

---

## ⚙️ التخصيص المتقدم

### تغيير تكرار الإعلانات
```typescript
// في Admin Panel → Ads Settings
{
  adFrequency: {
    banner: true,        // عرض البانر دائماً
    interstitial: 3,     // كل 3 معاملات
    rewarded: true       // متاح دائماً
  }
}
```

---

### تخصيص أماكن الإعلانات
```typescript
// في أي صفحة
<View style={styles.container}>
  {/* إعلان في الأعلى */}
  <AdBanner position="top" />
  
  {/* محتوى الصفحة */}
  <ScrollView>
    {/* ... */}
  </ScrollView>
  
  {/* إعلان في الأسفل */}
  <AdBanner position="bottom" />
</View>
```

---

## 🎨 التصميم والواجهة

### الإعلانات الحالية (وضع التطوير)
- 🎨 تصميم placeholder احترافي
- 📏 أحجام صحيحة (320x50 / 728x90)
- ✅ جاهز للاستبدال بإعلانات حقيقية

### عند ربط AdSense
- استبدل `<AdPlaceholder />` بمكون AdSense الحقيقي
- احتفظ بنفس الأحجام والمواقع
- النظام سيعمل تلقائياً

---

## 📱 الاختبار

### اختبار النظام الحالي
```typescript
// 1. افتح Admin Panel → Ads Settings
// 2. فعّل "Enable Ads System"
// 3. تصفح التطبيق - سترى placeholders الإعلانات
// 4. اشترك في Premium - ستختفي الإعلانات
// 5. ألغِ Premium - ستظهر الإعلانات مجدداً
```

---

## 🔒 الأمان والخصوصية

### حماية المشتركين
```typescript
// ✅ المشتركون لن يروا أي إعلانات أبداً
if (isPremium) {
  return null; // لا إعلانات
}
```

### التحقق من الصلاحيات
```typescript
// ✅ فقط المدير يمكنه تغيير إعدادات الإعلانات
// من خلال Admin Panel المحمي
```

---

## 📈 الإحصائيات والتحليلات

### تتبع الإعلانات
```typescript
// النظام يسجل تلقائياً:
console.log('Banner ad shown');
console.log('Interstitial ad shown');
console.log('Rewarded ad completed');
```

### يمكن إضافة تحليلات متقدمة:
- عدد مرات عرض الإعلانات
- معدل النقر (CTR)
- الأرباح المتوقعة

---

## 🚨 ملاحظات مهمة

### ⚠️ قبل النشر
1. ✅ استبدل Test Ad IDs بـ Real Ad IDs
2. ✅ اختبر على أجهزة حقيقية
3. ✅ تأكد من سياسة AdSense
4. ✅ راجع معدلات الإعلانات

### ⚠️ أثناء التطوير
1. ✅ استخدم Test Ad IDs فقط
2. ✅ لا تنقر على إعلاناتك الخاصة
3. ✅ اختبر وضع Premium جيداً

---

## 🎯 الخلاصة

### ما تم إنجازه ✅
- ✅ نظام إعلانات كامل ومتكامل
- ✅ تكامل تلقائي مع Premium
- ✅ 3 أنواع من الإعلانات
- ✅ لوحة تحكم للمدير
- ✅ جاهز للإنتاج

### ما تحتاج فعله 🔄
1. الحصول على Ad Unit IDs من AdSense
2. إدخال الـ IDs في Admin Panel
3. تفعيل النظام
4. الاختبار والنشر

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع هذا الدليل
2. تحقق من console logs
3. تأكد من إعدادات Admin Panel
4. اختبر وضع Premium

---

**🎉 نظام الإعلانات جاهز تماماً للاستخدام!**

عند الحاجة، فقط:
1. أدخل Ad Unit IDs
2. فعّل النظام
3. استمتع بالأرباح! 💰
