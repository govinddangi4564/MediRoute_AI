"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Lang = 'en' | 'hi';

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // Header
  'nav.home': { en: 'Home', hi: 'होम' },
  'nav.symptoms': { en: 'Symptoms', hi: 'लक्षण' },
  'nav.reports': { en: 'Reports', hi: 'रिपोर्ट' },
  'nav.analysis': { en: 'Analysis', hi: 'विश्लेषण' },
  'nav.hospitals': { en: 'Hospitals', hi: 'अस्पताल' },
  'nav.live': { en: 'Live', hi: 'लाइव' },
  'header.emergency': { en: '🚨 Call 112', hi: '🚨 112 कॉल करें' },
  'header.tagline': { en: 'Emergency Health Assistant', hi: 'आपातकालीन स्वास्थ्य सहायक' },

  // Landing Page
  'home.badge': { en: 'AI-Powered Emergency Triage', hi: 'AI आधारित आपातकालीन जाँच' },
  'home.title1': { en: 'Your health is our', hi: 'आपकी सेहत हमारी' },
  'home.title2': { en: 'first priority', hi: 'पहली जिम्मेदारी' },
  'home.subtitle': { en: 'Describe your symptoms in Hindi or English. Get instant AI guidance and find the nearest right hospital — fast, free, and simple.', hi: 'हिंदी या अंग्रेज़ी में अपने लक्षण बताएं। तुरंत AI मार्गदर्शन पाएं और सबसे नज़दीकी सही अस्पताल खोजें — तेज़, मुफ़्त और आसान।' },
  'home.btn.triage': { en: 'Check My Symptoms', hi: 'लक्षण जाँचें' },
  'home.btn.upload': { en: 'Upload Report', hi: 'रिपोर्ट अपलोड करें' },
  'home.btn.voice': { en: 'Tap & Speak', hi: 'दबाएं और बोलें' },
  'home.voice.title': { en: 'Can\'t type? Just speak!', hi: 'टाइप नहीं कर सकते? बस बोलिए!' },
  'home.voice.sub': { en: 'Works in Hindi and English both', hi: 'हिंदी और अंग्रेज़ी दोनों में काम करता है' },
  'home.stat1': { en: '2 min', hi: '2 मिनट' },
  'home.stat1.label': { en: 'Avg Response', hi: 'औसत जवाब' },
  'home.stat2': { en: '500+', hi: '500+' },
  'home.stat2.label': { en: 'Hospitals Linked', hi: 'अस्पताल जुड़े हैं' },
  'home.stat3': { en: 'Free', hi: 'बिल्कुल मुफ़्त' },
  'home.stat3.label': { en: 'Always Free', hi: 'हमेशा मुफ़्त' },
  'home.features.title': { en: 'Why MediRoute AI?', hi: 'MediRoute AI क्यों?' },
  'home.f1.title': { en: 'AI Symptom Check', hi: 'AI लक्षण जाँच' },
  'home.f1.copy': { en: 'Simple plain-language understanding of your health problem', hi: 'आपकी तकलीफ को आसान भाषा में समझाता है' },
  'home.f2.title': { en: 'Hindi + English', hi: 'हिंदी + अंग्रेज़ी' },
  'home.f2.copy': { en: 'Speak or type in any language — mixed language too!', hi: 'किसी भी भाषा में बोलें या लिखें — मिश्रित भाषा भी!' },
  'home.f3.title': { en: 'Nearest Hospital', hi: 'नज़दीकी अस्पताल' },
  'home.f3.copy': { en: 'Instantly routed to the right hospital for your condition', hi: 'आपकी बीमारी के लिए सही अस्पताल तुरंत मिलता है' },
  'home.f4.title': { en: 'Emergency First Aid', hi: 'आपातकालीन प्राथमिक उपचार' },
  'home.f4.copy': { en: 'Immediate guidance while you reach the hospital', hi: 'अस्पताल पहुँचने तक तुरंत मदद' },
  'home.steps.title': { en: '3 Simple Steps', hi: '3 आसान कदम' },
  'home.step1.title': { en: 'Tell Your Problem', hi: 'अपनी तकलीफ बताएं' },
  'home.step1.sub': { en: 'Speak or type in Hindi or English', hi: 'हिंदी या अंग्रेज़ी में बोलें या लिखें' },
  'home.step2.title': { en: 'Get AI Advice', hi: 'AI से सलाह लें' },
  'home.step2.sub': { en: 'Instant severity and first aid guidance', hi: 'तुरंत गंभीरता और प्राथमिक उपचार' },
  'home.step3.title': { en: 'Reach Hospital', hi: 'अस्पताल पहुँचें' },
  'home.step3.sub': { en: 'Navigate to the best nearby hospital', hi: 'सबसे नज़दीकी सही अस्पताल तक पहुँचें' },
  'home.trust': { en: 'Trusted by ASHA workers, ANMs & village health volunteers across rural India', hi: 'पूरे ग्रामीण भारत में ASHA कार्यकर्ताओं, ANMs और स्वास्थ्य सेवकों द्वारा भरोसेमंद' },

  // Symptoms Page
  'symptoms.eyebrow': { en: 'Step 1 of 3', hi: 'कदम 1 / 3' },
  'symptoms.title': { en: 'What is your problem?', hi: 'आपकी क्या तकलीफ है?' },
  'symptoms.subtitle': { en: 'Speak or type. Simple words are fine. Hindi + English both work.', hi: 'बोलें या लिखें। सरल शब्द काफी हैं। हिंदी + अंग्रेज़ी दोनों चलते हैं।' },
  'symptoms.instructions': { en: 'How to use: Choose language → Tap mic and speak (or type) → Tap Continue', hi: 'कैसे इस्तेमाल करें: भाषा चुनें → माइक दबाएं और बोलें (या टाइप करें) → जारी रखें' },
  'symptoms.mic.active': { en: 'Listening... Speak now', hi: 'सुन रहा हूँ... अभी बोलिए' },
  'symptoms.mic.idle': { en: 'Tap to Speak', hi: 'बोलने के लिए दबाएं' },
  'symptoms.mic.sub': { en: 'Tap the mic and describe your problem', hi: 'माइक दबाएं और अपनी तकलीफ बताएं' },
  'symptoms.type.title': { en: 'Type Instead', hi: 'यहाँ लिखें' },
  'symptoms.type.sub': { en: 'Write your symptoms below', hi: 'नीचे लक्षण लिखें' },
  'symptoms.placeholder': { en: 'Example: Chest pain since yesterday, difficulty breathing... / कल से सीने में दर्द, सांस लेने में तकलीफ...', hi: 'उदाहरण: कल से सीने में दर्द, सांस लेने में तकलीफ...' },
  'symptoms.quick': { en: 'Quick select your problem:', hi: 'अपनी तकलीफ जल्दी चुनें:' },
  'symptoms.call': { en: 'Emergency Call 112', hi: 'आपातकालीन कॉल 112' },
  'symptoms.continue': { en: 'Continue to AI Analysis', hi: 'AI विश्लेषण जारी रखें' },
  'symptoms.analyzing': { en: 'Analyzing symptoms...', hi: 'लक्षण विश्लेषण हो रहा है...' },
  'symptoms.disclaimer': { en: 'This tool is for guidance only. In life-threatening situations, call 112 immediately.', hi: 'यह सेवा केवल मार्गदर्शन के लिए है। जानलेवा स्थिति में तुरंत 112 कॉल करें।' },
  'symptoms.error.empty': { en: 'Please describe your symptoms first.', hi: 'पहले अपने लक्षण बताएं।' },
  'symptoms.error.voice': { en: 'Voice input not supported. Please type instead.', hi: 'वॉइस इनपुट समर्थित नहीं है। कृपया टाइप करें।' },
  'symptoms.error.analyze': { en: 'Analysis failed. Please try again.', hi: 'विश्लेषण विफल। कृपया पुनः प्रयास करें।' },
  'symptoms.mode': { en: 'Easy Patient Mode', hi: 'आसान मरीज़ मोड' },

  // Upload Page
  'upload.eyebrow': { en: 'Step 2 of 3', hi: 'कदम 2 / 3' },
  'upload.title': { en: 'Upload Your Medical Reports', hi: 'अपनी मेडिकल रिपोर्ट अपलोड करें' },
  'upload.subtitle': { en: 'Drag or tap to upload prescriptions, blood tests, or scan reports. We explain them in simple language.', hi: 'पर्चे, खून की जाँच या स्कैन रिपोर्ट अपलोड करें। हम उन्हें आसान भाषा में समझाएंगे।' },
  'upload.drop.title': { en: 'Tap to choose or drag files here', hi: 'यहाँ फ़ाइल चुनें या खींचें' },
  'upload.drop.sub': { en: 'PDF, JPG, PNG accepted — up to 6 files', hi: 'PDF, JPG, PNG स्वीकार — अधिकतम 6 फ़ाइलें' },
  'upload.back': { en: 'Back to Symptoms', hi: 'लक्षण पर वापस' },
  'upload.continue': { en: 'Analyze Reports', hi: 'रिपोर्ट विश्लेषण करें' },
  'upload.analyzing': { en: 'Analyzing reports...', hi: 'रिपोर्ट विश्लेषण हो रहा है...' },
  'upload.error.nofile': { en: 'Please upload at least one file.', hi: 'कृपया कम से कम एक फ़ाइल अपलोड करें।' },
  'upload.error.fail': { en: 'Report analysis failed. Please retry.', hi: 'रिपोर्ट विश्लेषण विफल। पुनः प्रयास करें।' },

  // Analysis Page
  'analysis.eyebrow': { en: 'Step 3 of 3', hi: 'कदम 3 / 3' },
  'analysis.title': { en: 'Your Health Analysis', hi: 'आपका स्वास्थ्य विश्लेषण' },
  'analysis.subtitle': { en: 'This is AI guidance, not a medical diagnosis. Please consult a doctor.', hi: 'यह AI मार्गदर्शन है, अंतिम चिकित्सा निदान नहीं। कृपया डॉक्टर से मिलें।' },
  'analysis.condition': { en: 'Possible Condition', hi: 'संभावित स्थिति' },
  'analysis.confidence': { en: 'AI Confidence', hi: 'AI विश्वास' },
  'analysis.department': { en: 'Go to Department', hi: 'इस विभाग में जाएं' },
  'analysis.firstaid': { en: '🩹 First Aid Steps', hi: '🩹 प्राथमिक उपचार' },
  'analysis.guidance': { en: '📋 What to Do Next', hi: '📋 आगे क्या करें' },
  'analysis.danger': { en: '⚠️ Serious symptoms! Go to hospital immediately. Do not wait.', hi: '⚠️ गंभीर लक्षण! तुरंत अस्पताल जाएं। देर मत करें।' },
  'analysis.btn.hospital': { en: 'Find Nearest Hospital', hi: 'नज़दीकी अस्पताल खोजें' },
  'analysis.btn.dashboard': { en: 'Live Dashboard', hi: 'लाइव डैशबोर्ड' },
  'analysis.empty': { en: 'No analysis yet. Please check symptoms first.', hi: 'अभी तक कोई विश्लेषण नहीं। पहले लक्षण जाँचें।' },
  'analysis.goto.symptoms': { en: 'Go to Symptom Input', hi: 'लक्षण इनपुट पर जाएं' },
  'analysis.report.title': { en: 'Report Explained Simply', hi: 'रिपोर्ट आसान भाषा में' },
  'analysis.report.specialist': { en: 'Suggested Specialist', hi: 'सुझाया गया विशेषज्ञ' },

  // Hospitals Page
  'hospitals.eyebrow': { en: 'Hospital Routing', hi: 'अस्पताल मार्गदर्शन' },
  'hospitals.title': { en: 'Best Hospital For You', hi: 'आपके लिए सबसे अच्छा अस्पताल' },
  'hospitals.subtitle': { en: 'Ranked by distance, emergency fit, and travel time', hi: 'दूरी, आपातकाल उपयुक्तता और यात्रा समय के अनुसार' },
  'hospitals.best': { en: '⭐ Best Match for You', hi: '⭐ आपके लिए सबसे अच्छा' },
  'hospitals.eta': { en: 'min away', hi: 'मिनट की दूरी' },
  'hospitals.call': { en: '📞 Call Hospital', hi: '📞 अस्पताल को कॉल करें' },
  'hospitals.navigate': { en: '🗺️ Start Navigation', hi: '🗺️ रास्ता दिखाएं' },
  'hospitals.loading': { en: 'Finding nearby hospitals...', hi: 'नज़दीकी अस्पताल खोज रहे हैं...' },
  'hospitals.error.no_analysis': { en: 'Please run symptom analysis first.', hi: 'पहले लक्षण विश्लेषण करें।' },
  'hospitals.error.location': { en: 'Please allow location access to find hospitals.', hi: 'अस्पताल खोजने के लिए लोकेशन की अनुमति दें।' },
  'hospitals.error.fetch': { en: 'Could not fetch hospital recommendations.', hi: 'अस्पताल सुझाव नहीं मिल सके।' },
  'hospitals.bestmatch': { en: 'Best Match', hi: 'सबसे अच्छा' },

  // Dashboard Page
  'dashboard.eyebrow': { en: 'Live Monitoring', hi: 'लाइव निगरानी' },
  'dashboard.title': { en: 'Real-Time Dashboard', hi: 'रियल-टाइम डैशबोर्ड' },
  'dashboard.subtitle': { en: 'Auto-refreshes every 30 seconds', hi: 'हर 30 सेकंड में स्वचालित अपडेट' },
  'dashboard.severity': { en: 'Severity', hi: 'गंभीरता' },
  'dashboard.emergency': { en: 'Emergency Level', hi: 'आपातकाल स्तर' },
  'dashboard.dept': { en: 'Department', hi: 'विभाग' },
  'dashboard.confidence': { en: 'Confidence', hi: 'विश्वास' },
  'dashboard.live.hospitals': { en: 'Live Nearby Hospitals', hi: 'नज़दीकी अस्पताल (लाइव)' },
  'dashboard.routing': { en: 'Quick Navigation', hi: 'त्वरित मार्गदर्शन' },
  'dashboard.navigate.to': { en: 'Navigate to', hi: 'रास्ता दिखाएं' },
  'dashboard.loading': { en: 'Loading live dashboard...', hi: 'लाइव डैशबोर्ड लोड हो रहा है...' },
  'dashboard.refresh.note': { en: 'Keep this page open. Data refreshes every 30 seconds.', hi: 'यह पेज खुला रखें। डेटा हर 30 सेकंड में अपडेट होता है।' },
  'dashboard.updated': { en: 'Last updated', hi: 'अंतिम अपडेट' },
  'dashboard.updating': { en: 'Updating...', hi: 'अपडेट हो रहा है...' },
  'dashboard.bestmatch': { en: 'Best Match', hi: 'सबसे अच्छा' },
  'dashboard.no.hospitals': { en: 'No hospitals found in live refresh.', hi: 'लाइव रिफ्रेश में कोई अस्पताल नहीं मिला।' },
  'dashboard.no.triage': { en: 'No active triage. Please analyze symptoms first.', hi: 'कोई सक्रिय ट्राइज नहीं। पहले लक्षण विश्लेषण करें।' },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('mediRouteLang') as Lang | null;
    if (stored === 'en' || stored === 'hi') setLang(stored);
  }, []);

  const toggleLang = () => {
    setLang((prev) => {
      const next: Lang = prev === 'en' ? 'hi' : 'en';
      localStorage.setItem('mediRouteLang', next);
      return next;
    });
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
