import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import { platformTranslate } from "../../src/lib/platform-language";
import { device } from "./api";

type Preferences = { locale: "en" | "my"; theme: "light" | "dark" | "system" };
const Context = createContext<{
  value: Preferences;
  update(value: Preferences): void;
}>({ value: { locale: "en", theme: "light" }, update: () => {} });
export function PreferencesProvider({ children }: React.PropsWithChildren) {
  const [value, setValue] = useState<Preferences>({
    locale: "en",
    theme: "light",
  });
  useEffect(() => {
    if (!device.loadPreferences) return;
    void device
      .loadPreferences()
      .then((saved) => {
        const next: Preferences = {
          locale: saved.locale === "my" ? "my" : "en",
          theme:
            saved.theme === "dark" || saved.theme === "system"
              ? saved.theme
              : "light",
        };
        setValue(next);
        Appearance.setColorScheme(
          next.theme === "system" ? "unspecified" : next.theme,
        );
      })
      .catch(() => {});
  }, []);
  function update(next: Preferences) {
    setValue(next);
    Appearance.setColorScheme(
      next.theme === "system" ? "unspecified" : next.theme,
    );
    if (device.savePreferences)
      void device.savePreferences(next.locale, next.theme).catch(() => {});
  }
  return (
    <Context.Provider value={{ value, update }}>{children}</Context.Provider>
  );
}
export function usePreferences() {
  return useContext(Context);
}
export function useTranslate() {
  const { value } = usePreferences();
  return (text: string) => platformTranslate(value.locale, text);
}
