import { createContext, useState } from "react";

export const LanguageContext = createContext();

const langs = ["en", "ro", "fr", "it", "es", "de"];

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("en");
  return (
    <LanguageContext.Provider value={{ lang, setLang, langs }}>
      {children}
    </LanguageContext.Provider>
  );
};
