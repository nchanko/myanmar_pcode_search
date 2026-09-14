'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppLanguage = 'en' | 'mm';

export interface Translations {
  appName: string;
  placesCount: string;
  online: string;
  offline: string;
  batchNav: string;
  offlineNav: string;
  apiDocsNav: string;
  guideNav: string;
  menu: string;
  menuSubtitle: string;
  townsTab: string;
  wardsTab: string;
  vtTab: string;
  villagesTab: string;
  pcodeTab: string;
  latlongTab: string;
  landmarkTab: string;
  placeholderTown: string;
  placeholderWard: string;
  placeholderVT: string;
  placeholderVillage: string;
  placeholderPcode: string;
  placeholderCoords: string;
  placeholderLandmark: string;
  coordinates: string;
  unavailable: string;
  stateRegion: string;
  district: string;
  township: string;
  town: string;
  villageTract: string;
  villagePcode: string;
  wardPcode: string;
  townPcode: string;
  vtPcode: string;
  pcodeLabel: string;
  postalCodeLabel: string;
  copyPcode: string;
  copyPostal: string;
  copyCoords: string;
  copied: string;
  kmAway: string;
  searchedLandmark: string;
  nearbyPlaces: string;
  nearbySubtitle: string;
  matchingPlaces: string;
  matchingSubtitle: string;
  showNearbyBtn: string;
  hideNearbyBtn: string;
  footerDataMimu: string;
  footerDataPost: string;
  footerDisclaimer: string;
}

const translations: Record<AppLanguage, Translations> = {
  en: {
    appName: 'Myanmar PCode Search',
    placesCount: 'MIMU 9.6 • 90,676 Places',
    online: 'Online',
    offline: 'Offline',
    batchNav: 'Batch CSV',
    offlineNav: 'Offline DB',
    apiDocsNav: 'API Docs',
    guideNav: 'Guide',
    menu: 'Menu',
    menuSubtitle: 'Tools & Pages',
    townsTab: 'Towns',
    wardsTab: 'Wards',
    vtTab: 'Village Tracts',
    villagesTab: 'Villages',
    pcodeTab: 'PCode',
    latlongTab: 'Lat/Long',
    landmarkTab: 'Landmark',
    placeholderTown: 'Search by town name... e.g. Yangon, Mandalay',
    placeholderWard: 'Search by ward name... e.g. Ward 1',
    placeholderVT: 'Search village tract... e.g. Taung Gyi',
    placeholderVillage: 'Search village name... e.g. Kan Gyi',
    placeholderPcode: 'Enter PCode... e.g. MMR013001, 150001',
    placeholderCoords: 'Paste coordinates or Google Maps link...',
    placeholderLandmark: 'Search landmark... e.g. Shwedagon Pagoda, Junction City',
    coordinates: 'Coordinates:',
    unavailable: 'Unavailable',
    stateRegion: 'State/Region:',
    district: 'District:',
    township: 'Township:',
    town: 'Town:',
    villageTract: 'Village Tract:',
    villagePcode: 'Village PCode:',
    wardPcode: 'Ward PCode:',
    townPcode: 'Town PCode:',
    vtPcode: 'VT PCode:',
    pcodeLabel: 'PCode:',
    postalCodeLabel: 'Postal Code:',
    copyPcode: 'Copy PCode',
    copyPostal: 'Copy Postal Code',
    copyCoords: 'Copy Coordinates',
    copied: 'Copied',
    kmAway: 'km away',
    searchedLandmark: 'Searched Landmark:',
    nearbyPlaces: 'Nearby Places',
    nearbySubtitle: 'Surrounding places within 15 km, ordered by nearest distance',
    matchingPlaces: 'Matching Places',
    matchingSubtitle: 'Places matching by name, township, or code',
    showNearbyBtn: 'View Nearby Places',
    hideNearbyBtn: 'Hide Nearby Places',
    footerDataMimu: 'MIMU Place Codes',
    footerDataPost: 'Myanmar Postal Code',
    footerDisclaimer: 'For humanitarian, development and reference purposes.'
  },
  mm: {
    appName: 'မြန်မာ PCode ရှာဖွေရေး',
    placesCount: 'MIMU 9.6 • နေရာပေါင်း ၉၀,၆၇၆',
    online: 'အွန်လိုင်း',
    offline: 'အော့ဖ်လိုင်း',
    batchNav: 'အစုလိုက် CSV',
    offlineNav: 'အော့ဖ်လိုင်း DB',
    apiDocsNav: 'API မှတ်တမ်း',
    guideNav: 'အသုံးပြုနည်း',
    menu: 'မီနူး',
    menuSubtitle: 'အခြားကဏ္ဍများနှင့် စာမျက်နှာများ',
    townsTab: 'မြို့',
    wardsTab: 'ရပ်ကွက်',
    vtTab: 'ကျေးရွာအုပ်စု',
    villagesTab: 'ကျေးရွာ',
    pcodeTab: 'PCode',
    latlongTab: 'ကိုဩဒိနိတ်',
    landmarkTab: 'ထင်ရှားသောနေရာ',
    placeholderTown: 'မြို့အမည် ရိုက်ထည့်ရှာဖွေပါ... ဥပမာ - ရန်ကုန်၊ မန္တလေး',
    placeholderWard: 'ရပ်ကွက်အမည် ရိုက်ထည့်ရှာဖွေပါ... ဥပမာ - ၁ ရပ်ကွက်',
    placeholderVT: 'ကျေးရွာအုပ်စု ရိုက်ထည့်ရှာဖွေပါ... ဥပမာ - တောင်ကြီး',
    placeholderVillage: 'ကျေးရွာအမည် ရိုက်ထည့်ရှာဖွေပါ... ဥပမာ - ကန်ကြီး',
    placeholderPcode: 'PCode ရိုက်ထည့်ပါ... ဥပမာ - MMR013001, 150001',
    placeholderCoords: 'ကိုဩဒိနိတ် သို့မဟုတ် Google Maps Link ထည့်ပါ...',
    placeholderLandmark: 'ထင်ရှားသောနေရာ ရိုက်ထည့်ပါ... ဥပမာ - ရွှေတိဂုံဘုရား',
    coordinates: 'ကိုဩဒိနိတ်:',
    unavailable: 'မရှိပါ',
    stateRegion: 'တိုင်း/ပြည်နယ်:',
    district: 'ခရိုင်:',
    township: 'မြို့နယ်:',
    town: 'မြို့:',
    villageTract: 'ကျေးရွာအုပ်စု:',
    villagePcode: 'ကျေးရွာ PCode:',
    wardPcode: 'ရပ်ကွက် PCode:',
    townPcode: 'မြို့ PCode:',
    vtPcode: 'ကျေးရွာအုပ်စု PCode:',
    pcodeLabel: 'PCode:',
    postalCodeLabel: 'စာတိုက်သင်္ကေတ:',
    copyPcode: 'PCode ကူးယူရန်',
    copyPostal: 'စာတိုက်သင်္ကေတ ကူးယူရန်',
    copyCoords: 'ကိုဩဒိနိတ် ကူးယူရန်',
    copied: 'ကူးယူပြီး',
    kmAway: 'km အကွာ',
    searchedLandmark: 'ရှာဖွေထားသောနေရာ:',
    nearbyPlaces: 'အနီးအနားရှိ နေရာများ',
    nearbySubtitle: '၁၅ ကီလိုမီတာအတွင်း အနီးဆုံးမှစ၍ စီစဉ်ထားပါသည်',
    matchingPlaces: 'ကိုက်ညီသည့် နေရာများ',
    matchingSubtitle: 'အမည်၊ မြို့နယ် သို့မဟုတ် ကုဒ်ဖြင့် ကိုက်ညီသည့် နေရာများ',
    showNearbyBtn: 'အနီးအနားရှိ နေရာများ ကြည့်မည်',
    hideNearbyBtn: 'အနီးအနားရှိ နေရာများ ပိတ်မည်',
    footerDataMimu: 'MIMU နေရာကုဒ်များ',
    footerDataPost: 'မြန်မာစာတိုက်သင်္ကေတ',
    footerDisclaimer: 'လူသားချင်းစာနာမှု၊ ဖွံ့ဖြိုးတိုးတက်ရေးနှင့် ရည်ညွှန်းကိုးကားရန်အတွက် ဖြစ်ပါသည်။'
  }
};

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'mm',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations.mm
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('mm');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('app_language') as AppLanguage | null;
    if (saved === 'en' || saved === 'mm') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_language', lang);
    }
  };

  const toggleLanguage = () => {
    const next = language === 'mm' ? 'en' : 'mm';
    setLanguage(next);
  };

  const activeLang = mounted ? language : 'mm';

  return (
    <LanguageContext.Provider
      value={{
        language: activeLang,
        setLanguage,
        toggleLanguage,
        t: translations[activeLang]
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
