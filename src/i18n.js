import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      nav: {
        home: "Home",
        documentation: "Documentation",
        marketHub: "Market Hub",
        newsInsights: "News Insights",
        portfolio: "Portfolio",
        aiAnalyzer: "AI Analyzer",
        account: "Account",
      },
      common: {
        login: "Login",
        logout: "Logout",
        signup: "Sign Up",
        loading: "Loading...",
        error: "Error occurred",
        success: "Success",
      },
      home: {
        welcome: "Welcome to MoneyMitra",
        subtitle: "Your Complete Financial Education Platform",
        getStarted: "Get Started",
      },
      disclaimer: "MoneyMitra provides educational content only. Not investment advice.",
    },
  },
  hi: {
    translation: {
      nav: {
        home: "होम",
        documentation: "दस्तावेज़ीकरण",
        marketHub: "मार्केट हब",
        newsInsights: "समाचार इनसाइट्स",
        portfolio: "पोर्टफोलियो",
        aiAnalyzer: "एआई विश्लेषक",
        account: "खाता",
      },
      common: {
        login: "लॉगिन",
        logout: "लॉगआउट",
        loading: "लोड हो रहा है...",
        error: "त्रुटि हुई",
        success: "सफल",
      },
      home: {
        welcome: "MoneyMitra में आपका स्वागत है",
        subtitle: "आपका संपूर्ण वित्तीय शिक्षा मंच",
      },
      disclaimer: "MoneyMitra केवल शैक्षणिक सामग्री प्रदान करता है। निवेश सलाह नहीं।",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
