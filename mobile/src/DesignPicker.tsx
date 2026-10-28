import React from "react";
import { Text, View } from "react-native";
import {
  DEFAULT_INVOICE_DESIGN,
  INVOICE_TEMPLATES,
  INVOICE_THEMES,
  invoiceDesignColors,
  type InvoiceDesign,
} from "../../src/lib/invoice-design";
import { Card, Chips, Copy, Field, s } from "./ui";
export function DesignPicker({
  value = DEFAULT_INVOICE_DESIGN,
  onChange,
}: {
  value?: InvoiceDesign;
  onChange(value: InvoiceDesign): void;
}) {
  const palette = invoiceDesignColors(value);
  return (
    <Card>
      <Text style={s.title}>Invoice design</Text>
      <Chips
        values={INVOICE_TEMPLATES}
        value={value.template}
        onChange={(template) => onChange({ ...value, template })}
      />
      <Chips
        values={INVOICE_THEMES}
        value={value.theme}
        onChange={(theme) => onChange({ ...value, theme })}
      />
      <Field
        label="Accent color"
        placeholder="#416f59"
        value={value.accent}
        autoCapitalize="none"
        maxLength={7}
        onChangeText={(accent) => onChange({ ...value, accent })}
      />
      <View
        style={{
          backgroundColor: palette.background,
          padding: 18,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: palette.line,
          gap: 8,
        }}
      >
        <Text
          style={{ color: palette.ink, fontSize: 24, fontFamily: "Georgia" }}
        >
          INVOICE
        </Text>
        <Text style={{ color: palette.text }}>
          {value.template} / {value.theme}
        </Text>
        <View
          style={{
            height: 8,
            backgroundColor: palette.accent,
            borderRadius: 3,
          }}
        />
        <Text style={{ color: palette.muted }}>Brand color preview</Text>
      </View>
      <Copy>
        The exported PDF uses the same complete template as the website.
      </Copy>
    </Card>
  );
}
