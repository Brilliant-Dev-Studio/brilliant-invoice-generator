import React, { useState } from "react";
import {
  ActivityIndicator,
  DynamicColorIOS,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { TextInputProps } from "react-native";
import { useTranslate } from "./Preferences";
export const colors = {
  bg: DynamicColorIOS({ light: "#FAF5EA", dark: "#1E2422" }),
  ink: DynamicColorIOS({ light: "#30261E", dark: "#F6EFE2" }),
  muted: DynamicColorIOS({ light: "#796B5F", dark: "#C1B7A8" }),
  line: DynamicColorIOS({ light: "#E7DDCD", dark: "#45504B" }),
  green: "#A45138",
  accent: DynamicColorIOS({ light: "#A45138", dark: "#E4A183" }),
  lime: "#F1CC7A",
  white: "#FFFFFF",
  surface: DynamicColorIOS({ light: "#FFFFFF", dark: "#29312D" }),
  soft: DynamicColorIOS({ light: "#F0E7D9", dark: "#3A443E" }),
  danger: DynamicColorIOS({ light: "#A43628", dark: "#FFA490" }),
};
export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
}: {
  title: string;
  onPress(): void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  const t = useTranslate();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        { opacity: disabled ? 0.45 : pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[s.buttonText, secondary && { color: colors.ink }]}>
        {t(title)}
      </Text>
    </Pressable>
  );
}
export function Field({
  label,
  secureTextEntry,
  style,
  ...props
}: TextInputProps & { label: string }) {
  const t = useTranslate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <View style={s.field}>
      <Text style={s.label}>{t(label)}</Text>
      <View>
        <TextInput
          accessibilityLabel={t(label)}
          placeholderTextColor={colors.muted}
          autoCorrect={false}
          {...props}
          placeholder={props.placeholder ? t(props.placeholder) : undefined}
          contextMenuHidden={false}
          secureTextEntry={secureTextEntry && !passwordVisible}
          style={[
            s.input,
            props.multiline && { minHeight: 90 },
            style,
            secureTextEntry && { paddingRight: 54 },
          ]}
        />
        {secureTextEntry && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible ? "Hide password" : "Show password"
            }
            onPress={() => setPasswordVisible((visible) => !visible)}
            style={({ pressed }) => [
              s.passwordToggle,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <View accessible={false} pointerEvents="none" style={s.eye}>
              <View style={s.eyePupil} />
              {!passwordVisible && <View style={s.eyeSlash} />}
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}
export function Card({ children }: React.PropsWithChildren) {
  return <View style={s.card}>{children}</View>;
}
export function Heading({ children }: React.PropsWithChildren) {
  const t = useTranslate();
  return (
    <Text style={s.heading}>
      {typeof children === "string" ? t(children) : children}
    </Text>
  );
}
export function Copy({ children }: React.PropsWithChildren) {
  const t = useTranslate();
  return (
    <Text style={s.copy}>
      {typeof children === "string" ? t(children) : children}
    </Text>
  );
}
export function Loading() {
  return (
    <View style={s.center}>
      <ActivityIndicator color={colors.green} />
      <Copy>Opening your workspace...</Copy>
    </View>
  );
}
export function Chips<T extends string>({
  values,
  value,
  onChange,
  labels,
}: {
  values: readonly T[];
  value: T;
  onChange(value: T): void;
  labels?: Partial<Record<T, string>>;
}) {
  const t = useTranslate();
  return (
    <View style={s.wrap}>
      {values.map((item) => (
        <Pressable
          key={item}
          accessibilityRole="button"
          accessibilityState={{ selected: item === value }}
          onPress={() => onChange(item)}
          style={[s.chip, item === value && s.selected]}
        >
          <Text
            style={{
              color: item === value ? colors.white : colors.ink,
              fontWeight: "600",
            }}
          >
            {t(labels?.[item] ?? item)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  page: {
    padding: 22,
    gap: 18,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
  },
  heading: {
    fontFamily: "Georgia",
    fontSize: 32,
    color: colors.ink,
    lineHeight: 39,
  },
  copy: { fontSize: 15, lineHeight: 22, color: colors.muted },
  label: { fontSize: 13, fontWeight: "600", color: colors.ink },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.ink,
  },
  field: { gap: 7 },
  passwordToggle: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  eye: {
    width: 23,
    height: 15,
    borderWidth: 1.8,
    borderColor: colors.muted,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  eyePupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.muted,
  },
  eyeSlash: {
    position: "absolute",
    width: 28,
    height: 2,
    backgroundColor: colors.muted,
    transform: [{ rotate: "45deg" }],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 20,
    gap: 12,
  },
  button: {
    backgroundColor: colors.green,
    borderRadius: 14,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
  },
  buttonText: { color: colors.white, fontWeight: "700", fontSize: 15 },
  secondary: { backgroundColor: colors.soft },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: colors.soft,
  },
  selected: { backgroundColor: colors.green },
  title: { fontSize: 17, color: colors.ink, fontWeight: "700" },
  amount: {
    fontSize: 28,
    color: colors.ink,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  error: { color: colors.danger, fontSize: 14, lineHeight: 21 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
  },
  rule: { height: 1, backgroundColor: colors.line },
  badge: {
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: "700",
    color: colors.accent,
  },
});
