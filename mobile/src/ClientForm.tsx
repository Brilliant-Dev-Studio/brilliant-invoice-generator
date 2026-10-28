import React, { useState } from "react";
import { KeyboardAvoidingView, ScrollView, Text } from "react-native";
import { api, type Session } from "./api";
import type { Client } from "../../src/lib/types";
import { Button, Copy, Field, Heading, s } from "./ui";
export function ClientForm({
  session,
  onClose,
  onSaved,
  onError,
}: {
  session: Session;
  onClose(): void;
  onSaved(client: Client): void;
  onError(error: unknown): void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      onSaved(await api<Client>(session, "clients", form));
    } catch (e) {
      setError((e as Error).message);
      onError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <KeyboardAvoidingView style={s.root} behavior="padding">
      <ScrollView
        contentContainerStyle={[s.page, { maxWidth: 640 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Button title="Cancel" secondary disabled={busy} onPress={onClose} />
        <Heading>A new connection.</Heading>
        <Copy>Client details are saved to your company workspace.</Copy>
        <Field
          label="Client name"
          value={form.name}
          onChangeText={(name) => setForm({ ...form, name })}
        />
        <Field
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(email) => setForm({ ...form, email })}
        />
        <Field
          label="Phone"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(phone) => setForm({ ...form, phone })}
        />
        <Field
          label="Address"
          multiline
          value={form.address}
          onChangeText={(address) => setForm({ ...form, address })}
        />
        {!!error && (
          <Text style={s.error} accessibilityRole="alert">
            {error}
          </Text>
        )}
        <Button
          title={busy ? "Saving..." : "Save client"}
          disabled={busy || !form.name.trim()}
          onPress={() => void save()}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
