'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CoordSource, PlaceType } from '@/types/pcode';

export type AppLanguage = 'en' | 'mm';

export interface Translations {
  appName: string;
  /** Template: the Navbar fills in {version} and {count}. */
  placesCount: string;
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
  postalTab: string;
  latlongTab: string;
  landmarkTab: string;
  placeholderTown: string;
  placeholderWard: string;
  placeholderVT: string;
  placeholderVillage: string;
  placeholderPcode: string;
  placeholderPostal: string;
  placeholderCoords: string;
  placeholderLandmark: string;
  suggestionsHeader: string;
  placeType: Record<PlaceType, string>;
  typePcode: Record<PlaceType, string>;
  coordinates: string;
  unavailable: string;
  approxCoords: string;
  coordSource: Record<Exclude<CoordSource, 'mimu'>, string>;
  stateRegion: string;
  district: string;
  township: string;
  town: string;
  villageTract: string;
  postalCodeLabel: string;
  copyPcode: string;
  copyPostal: string;
  copyCoords: string;
  kmAway: string;
  searchedLandmark: string;
  nearbyPlaces: string;
  matchingPlaces: string;
  showList: string;
  hideList: string;
  footerSource: string;
  footerDataMimu: string;
  footerDataPost: string;
  footerDataBoundaries: string;
  footerMadeBy: string;
}

const translations: Record<AppLanguage, Translations> = {
  en: {
    appName: 'Myanmar PCode Search',
    placesCount: 'MIMU {version} • {count} Places',
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
    postalTab: 'Postal Code',
    latlongTab: 'Lat/Long',
    landmarkTab: 'Landmark',
    placeholderTown: 'Search by town name... e.g. Yangon, Mandalay',
    placeholderWard: 'Search by ward name... e.g. Ward 1',
    placeholderVT: 'Search village tract... e.g. Taung Gyi',
    placeholderVillage: 'Search village name... e.g. Kan Gyi',
    placeholderPcode: 'Enter PCode... e.g. MMR013001, 150001',
    placeholderPostal: 'Enter postal code... e.g. 1118001, or 1118 for a township',
    placeholderCoords: 'Paste coordinates or Google Maps link...',
    placeholderLandmark: 'Search landmark... e.g. Shwedagon Pagoda, Junction City',
    suggestionsHeader: 'Search Suggestions',
    placeType: { town: 'TOWN', ward: 'WARD', village_tract: 'VILLAGE TRACT', village: 'VILLAGE' },
    typePcode: { town: 'Town PCode:', ward: 'Ward PCode:', village_tract: 'VT PCode:', village: 'Village PCode:' },
    coordinates: 'Coordinates:',
    unavailable: 'Unavailable',
    approxCoords: 'Approximate',
    coordSource: {
      boundary: 'centre of the boundary area',
      villages: 'middle of its villages',
      town: "the town's location"
    },
    stateRegion: 'State/Region:',
    district: 'District:',
    township: 'Township:',
    town: 'Town:',
    villageTract: 'Village Tract:',
    postalCodeLabel: 'Postal Code:',
    copyPcode: 'Copy PCode',
    copyPostal: 'Copy Postal Code',
    copyCoords: 'Copy Coordinates',
    kmAway: 'km away',
    searchedLandmark: 'Searched Landmark:',
    nearbyPlaces: 'Nearby Places',
    matchingPlaces: 'Matching Places',
    showList: 'View ▼',
    hideList: 'Hide ▲',
    footerSource: 'Source:',
    footerDataMimu: 'MIMU Place Codes',
    footerDataPost: 'Myanmar Postal Code',
    footerDataBoundaries: 'OCHA Boundaries',
    footerMadeBy: 'Made by'
  },
  mm: {
    appName: 'မြန်မာ PCode ရှာဖွေရေး',
    placesCount: 'MIMU {version} • နေရာပေါင်း {count}',
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
    postalTab: 'စာတိုက်သင်္ကေတ',
    latlongTab: 'ကိုဩဒိနိတ်',
    landmarkTab: 'ထင်ရှားသောနေရာ',
    placeholderTown: 'မြို့အမည် ရိုက်ထည့်ရှာဖွေပါ... ဥပမာ - ရန်ကုန်၊ မန္တလေး',
    placeholderWard: 'ရပ်ကွက်အမည် ရိုက်ထည့်ရှာဖွေပါ... ဥပမာ - ၁ ရပ်ကွက်',
    placeholderVT: 'ကျေးရွာအုပ်စု ရိုက်ထည့်ရှာဖွေပါ... ဥပမာ - တောင်ကြီး',
    placeholderVillage: 'ကျေးရွာအမည် ရိုက်ထည့်ရှာဖွေပါ... ဥပမာ - ကန်ကြီး',
    placeholderPcode: 'PCode ရိုက်ထည့်ပါ... ဥပမာ - MMR013001, 150001',
    placeholderPostal: 'စာတိုက်သင်္ကေတ ရိုက်ထည့်ပါ... ဥပမာ - 1118001',
    placeholderCoords: 'ကိုဩဒိနိတ် သို့မဟုတ် Google Maps Link ထည့်ပါ...',
    placeholderLandmark: 'ထင်ရှားသောနေရာ ရိုက်ထည့်ပါ... ဥပမာ - ရွှေတိဂုံဘုရား',
    suggestionsHeader: 'အကြံပြုချက်များ',
    placeType: { town: 'မြို့', ward: 'ရပ်ကွက်', village_tract: 'ကျေးရွာအုပ်စု', village: 'ကျေးရွာ' },
    typePcode: {
      town: 'မြို့ PCode:',
      ward: 'ရပ်ကွက် PCode:',
      village_tract: 'ကျေးရွာအုပ်စု PCode:',
      village: 'ကျေးရွာ PCode:'
    },
    coordinates: 'ကိုဩဒိနိတ်:',
    unavailable: 'မရှိပါ',
    approxCoords: 'ခန့်မှန်းတည်နေရာ',
    coordSource: {
      boundary: 'နယ်နိမိတ်ဧရိယာ၏ အလယ်ဗဟို',
      villages: 'ကျေးရွာများ၏ အလယ်',
      town: 'မြို့၏ တည်နေရာ'
    },
    stateRegion: 'တိုင်း/ပြည်နယ်:',
    district: 'ခရိုင်:',
    township: 'မြို့နယ်:',
    town: 'မြို့:',
    villageTract: 'ကျေးရွာအုပ်စု:',
    postalCodeLabel: 'စာတိုက်သင်္ကေတ:',
    copyPcode: 'PCode ကူးယူရန်',
    copyPostal: 'စာတိုက်သင်္ကေတ ကူးယူရန်',
    copyCoords: 'ကိုဩဒိနိတ် ကူးယူရန်',
    kmAway: 'km အကွာ',
    searchedLandmark: 'ရှာဖွေထားသောနေရာ:',
    nearbyPlaces: 'အနီးအနားရှိ နေရာများ',
    matchingPlaces: 'ကိုက်ညီသည့် နေရာများ',
    showList: 'ကြည့်မည် ▼',
    hideList: 'ဝှက်မည် ▲',
    footerSource: 'ရင်းမြစ်:',
    footerDataMimu: 'MIMU နေရာကုဒ်များ',
    footerDataPost: 'မြန်မာစာတိုက်သင်္ကေတ',
    footerDataBoundaries: 'OCHA နယ်နိမိတ်',
    footerMadeBy: 'ဖန်တီးသူ -'
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
