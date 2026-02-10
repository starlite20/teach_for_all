import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";
type Translations = Record<string, Record<Language, string>>;

const translations: Translations = {
  // Navigation
  "nav.dashboard": { en: "Dashboard", ar: "لوحة التحكم" },
  "nav.students": { en: "Students", ar: "الطلاب" },
  "nav.generator": { en: "Generator", ar: "توليد المحتوى" },
  "nav.library": { en: "Library", ar: "المكتبة" },
  "nav.logout": { en: "Logout", ar: "تسجيل الخروج" },
  
  // Dashboard
  "dash.welcome": { en: "Welcome back,", ar: "أهلاً بك،" },
  "dash.subtitle": { en: "Ready to create accessible learning resources?", ar: "هل أنت مستعد لإنشاء موارد تعليمية سهلة الوصول؟" },
  "dash.quick_actions": { en: "Quick Actions", ar: "إجراءات سريعة" },
  "dash.new_student": { en: "Add New Student", ar: "إضافة طالب جديد" },
  "dash.create_resource": { en: "Create Resource", ar: "إنشاء مورد" },
  "dash.recent_resources": { en: "Recent Resources", ar: "الموارد الحديثة" },
  
  // Students
  "students.title": { en: "My Students", ar: "طلابـي" },
  "students.add": { en: "Add Student", ar: "إضافة طالب" },
  "students.empty": { en: "No students added yet. Start by creating a profile.", ar: "لم يتم إضافة طلاب بعد. ابدأ بإنشاء ملف تعريف." },
  "students.age": { en: "Age", ar: "العمر" },
  "students.aet": { en: "AET Level", ar: "مستوى AET" },
  "students.comm": { en: "Communication", ar: "التواصل" },
  
  // Generator
  "gen.title": { en: "Resource Generator", ar: "مولد الموارد" },
  "gen.subtitle": { en: "AI-powered tools for personalized learning", ar: "أدوات مدعومة بالذكاء الاصطناعي للتعلم الشخصي" },
  "gen.select_student": { en: "Select Student", ar: "اختر الطالب" },
  "gen.resource_type": { en: "Resource Type", ar: "نوع المورد" },
  "gen.topic": { en: "Topic / Scenario (Optional)", ar: "الموضوع / السيناريو (اختياري)" },
  "gen.topic_placeholder": { en: "e.g., Taking turns on the slide", ar: "مثال: تبادل الأدوار على الزحلوقة" },
  "gen.generate": { en: "Generate Resource", ar: "توليد المورد" },
  "gen.generating": { en: "Creating magic...", ar: "جاري الإنشاء..." },
  "gen.save": { en: "Save to Library", ar: "حفظ في المكتبة" },
  "gen.print": { en: "Print / PDF", ar: "طباعة / PDF" },
  
  // Resource Types
  "type.story": { en: "Social Story", ar: "قصة اجتماعية" },
  "type.worksheet": { en: "Visual Worksheet", ar: "ورقة عمل بصرية" },
  "type.pecs": { en: "PECS Cards", ar: "بطاقات بيكس" },
  
  // Common
  "common.loading": { en: "Loading...", ar: "جاري التحميل..." },
  "common.error": { en: "Something went wrong", ar: "حدث خطأ ما" },
  "common.save_success": { en: "Saved successfully!", ar: "تم الحفظ بنجاح!" },
  "common.delete": { en: "Delete", ar: "حذف" },
  "common.cancel": { en: "Cancel", ar: "إلغاء" },
  "common.create": { en: "Create", ar: "إنشاء" },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
