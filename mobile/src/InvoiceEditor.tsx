import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  useWindowDimensions,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { Invoice, InvoiceInput, LineItem } from "../../src/lib/types";
import { calculate, money } from "../../src/lib/money";
import { api, device, type Session, type Workspace } from "./api";
import { Button, Card, Chips, Copy, Field, Heading, colors, s } from "./ui";
import { invoiceStepError } from "./invoice-flow";
import { Icon } from "./Icons";
import { DesignPicker } from "./DesignPicker";

export type Draft = { id: string; input: InvoiceInput; revision?: number };
export async function newDraft(workspace: Workspace): Promise<Draft> {
  return {
    id: await device.uuid(),
    input: {
      clientId: "",
      title: "Invoice",
      currency: "MMK",
      issueDate: workspace.today,
      dueDate: workspace.today,
      terms: "",
      payment: "",
      discountType: "PERCENT",
      discount: "0",
      tax: "0",
      design: workspace.company.invoiceDesign,
      items: [
        { id: await device.uuid(), description: "", quantity: "1", price: "0" },
      ],
    },
  };
}
export function editDraft(invoice: Invoice): Draft {
  return { id: invoice.id, input: invoice, revision: invoice.revision };
}
const steps = ["Client", "Details", "Items", "Review"];
export function InvoiceEditor({
  draft,
  createdClientId,
  workspace,
  session,
  onClose,
  onSaved,
  onClient,
  onError,
}: {
  draft: Draft;
  createdClientId?: string | null;
  workspace: Workspace;
  session: Session;
  onClose(): void;
  onSaved(id: string): void;
  onClient(): void;
  onError(error: unknown): void;
}) {
  const [input, setInput] = useState(draft.input);
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (createdClientId) {
      setInput((current) => ({ ...current, clientId: createdClientId }));
      setSearch("");
      setError("");
      setStep(1);
    }
  }, [createdClientId]);
  const wide = useWindowDimensions().width >= 900;
  const scroll = useRef<ScrollView>(null);
  const chosenClient = workspace.clients.find((c) => c.id === input.clientId);
  const totals = useMemo(() => {
    try {
      return { value: calculate(input), error: "" };
    } catch (e) {
      return { value: null, error: (e as Error).message };
    }
  }, [input]);
  const update = <K extends keyof InvoiceInput>(
    key: K,
    value: InvoiceInput[K],
  ) => setInput((prev) => ({ ...prev, [key]: value }));
  const item = (id: string, key: keyof LineItem, value: string) =>
    setInput((prev) => ({
      ...prev,
      items: prev.items.map((line) =>
        line.id === id ? { ...line, [key]: value } : line,
      ),
    }));
  function go(next: number) {
    const message = next > step ? invoiceStepError(input, step) : "";
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep(next);
    scroll.current?.scrollTo({ y: 0, animated: true });
  }
  async function addItem(product?: { name: string; price: string }) {
    if (busy || input.items.length >= 100) return;
    setBusy(true);
    try {
      const id = await device.uuid();
      setInput((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            id,
            description: product?.name || "",
            quantity: "1",
            price: product?.price || "0",
          },
        ],
      }));
    } catch (e) {
      setError((e as Error).message);
      onError(e);
    } finally {
      setBusy(false);
    }
  }
  async function save(issue: boolean) {
    if (busy) return;
    const message = invoiceStepError(input, 2);
    if (message) {
      setError(message);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await api<{ id: string }>(session, "invoices", {
        input,
        requestId: draft.id,
        issue,
        revision: draft.revision,
      });
      onSaved(result.id);
    } catch (e) {
      setError((e as Error).message);
      onError(e);
    } finally {
      setBusy(false);
    }
  }
  function close() {
    if (JSON.stringify(input) === JSON.stringify(draft.input)) {
      onClose();
      return;
    }
    Alert.alert(
      "Leave invoice editor?",
      "Your unsaved edits will be discarded. Previously saved drafts are kept.",
      [
        { text: "Keep editing", style: "cancel" },
        { text: "Discard edits", style: "destructive", onPress: onClose },
      ],
    );
  }
  const summary = (
    <Card>
      <Text style={s.badge}>INVOICE SUMMARY</Text>
      <Text style={s.title}>{chosenClient?.name || "Choose your client"}</Text>
      <Copy>
        {input.title} · {input.currency}
        {"\n"}Due {input.dueDate}
      </Copy>
      {totals.value ? (
        <>
          {(
            [
              ["Subtotal", totals.value.subtotal],
              ["Discount", -totals.value.discount],
              ["Tax", totals.value.tax],
            ] as const
          ).map(([label, value]) => (
            <View key={label} style={s.row}>
              <Copy>{label}</Copy>
              <Text style={s.label}>{money(value, input.currency)}</Text>
            </View>
          ))}
          <View style={s.rule} />
          <Text style={s.amount}>
            {money(totals.value.total, input.currency)}
          </Text>
        </>
      ) : (
        <Text style={s.error}>{totals.error}</Text>
      )}
      <Copy>
        {input.items.length} line items ·{" "}
        {draft.revision ? "Editing a draft" : "Not saved yet"}
      </Copy>
    </Card>
  );
  return (
    <KeyboardAvoidingView style={s.root} behavior="padding">
      <View
        style={{
          paddingHorizontal: wide ? 32 : 22,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.surface,
          gap: 18,
        }}
      >
        <View style={s.row}>
          <View style={{ gap: 4 }}>
            <Text style={s.badge}>
              {draft.revision ? "EDIT DRAFT" : "NEW INVOICE"}
            </Text>
            <Text style={s.title}>A little clarity. A better invoice.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close editor"
            disabled={busy}
            onPress={close}
            style={{ padding: 10 }}
          >
            <Icon name="xmark" />
          </Pressable>
        </View>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {steps.map((name, index) => (
            <Pressable
              key={name}
              accessibilityRole="button"
              accessibilityState={{
                selected: step === index,
                disabled: index > step || busy,
              }}
              disabled={index > step || busy}
              onPress={() => go(index)}
              style={{ flex: 1, gap: 7 }}
            >
              <View
                style={{
                  height: 4,
                  borderRadius: 4,
                  backgroundColor: index <= step ? colors.green : colors.line,
                }}
              />
              <Text
                style={{
                  color: index === step ? colors.green : colors.muted,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {index + 1}. {name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <ScrollView
        ref={scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[s.page, { paddingTop: 26 }]}
      >
        <View style={{ flexDirection: wide ? "row" : "column", gap: 24 }}>
          <View style={{ flex: 1, gap: 18 }}>
            {step === 0 && (
              <>
                <Heading>Who are we billing?</Heading>
                <Copy>
                  Choose a client, or add someone new without leaving your
                  invoice.
                </Copy>
                {chosenClient && (
                  <View
                    style={{
                      backgroundColor: colors.soft,
                      padding: 18,
                      borderRadius: 16,
                      gap: 6,
                    }}
                  >
                    <Text style={s.badge}>SELECTED CLIENT</Text>
                    <Text style={s.title}>{chosenClient.name}</Text>
                    <Copy>{chosenClient.email || chosenClient.phone}</Copy>
                  </View>
                )}
                <Field
                  label="Find a client"
                  placeholder="Search name, email or phone"
                  value={search}
                  onChangeText={setSearch}
                />
                <Button
                  title="Add new client"
                  secondary
                  disabled={busy}
                  onPress={onClient}
                />
                {workspace.clients
                  .filter((c) =>
                    `${c.name} ${c.email} ${c.phone}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((c) => (
                    <Pressable
                      key={c.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: c.id === input.clientId }}
                      onPress={() => {
                        update("clientId", c.id);
                        setError("");
                      }}
                      style={{
                        borderWidth: c.id === input.clientId ? 2 : 1,
                        borderColor:
                          c.id === input.clientId ? colors.green : colors.line,
                        backgroundColor: colors.surface,
                        padding: 18,
                        borderRadius: 16,
                        gap: 6,
                      }}
                    >
                      <View style={s.row}>
                        <Text style={[s.title, { flex: 1 }]}>{c.name}</Text>
                        <Icon
                          name={
                            c.id === input.clientId
                              ? "checkmark.circle.fill"
                              : "circle"
                          }
                          selected={c.id === input.clientId}
                        />
                      </View>
                      <Copy>{c.email || c.phone || "No contact details"}</Copy>
                    </Pressable>
                  ))}
                {!workspace.clients.length && (
                  <Copy>
                    Your first client is the start of something good. Tap Add
                    new client to begin.
                  </Copy>
                )}
              </>
            )}
            {step === 1 && (
              <>
                <Heading>Set the details.</Heading>
                <Copy>Make the project and payment deadline clear.</Copy>
                <Card>
                  <Field
                    label="Invoice title"
                    placeholder="e.g. Website design - October"
                    value={input.title}
                    onChangeText={(v) => update("title", v)}
                  />
                  <Text style={s.label}>Currency</Text>
                  <Chips<InvoiceInput["currency"]>
                    values={["MMK", "USD", "THB"]}
                    value={input.currency}
                    onChange={(v) => update("currency", v)}
                  />
                  <Copy>Changing currency does not convert prices.</Copy>
                </Card>
                <Card>
                  <Field
                    label="Issue date (YYYY-MM-DD)"
                    placeholder="2026-10-25"
                    value={input.issueDate}
                    maxLength={10}
                    onChangeText={(v) => update("issueDate", v)}
                  />
                  <Field
                    label="Due date (YYYY-MM-DD)"
                    value={input.dueDate}
                    maxLength={10}
                    onChangeText={(v) => update("dueDate", v)}
                  />
                  <View style={s.wrap}>
                    {[0, 7, 14, 30].map((days) => (
                      <Pressable
                        key={days}
                        accessibilityRole="button"
                        onPress={() => {
                          const date = new Date(`${input.issueDate}T00:00:00Z`);
                          if (!Number.isNaN(date.valueOf())) {
                            date.setUTCDate(date.getUTCDate() + days);
                            update("dueDate", date.toISOString().slice(0, 10));
                          }
                        }}
                        style={s.chip}
                      >
                        <Text style={s.label}>
                          {days ? `Net ${days}` : "Due on receipt"}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </Card>
              </>
            )}
            {step === 2 && (
              <>
                <Heading>What did you create?</Heading>
                <Copy>
                  Add the work or products. Your total updates as you go.
                </Copy>
                {input.items.map((line, index) => (
                  <Card key={line.id}>
                    <View style={s.row}>
                      <Text style={s.badge}>
                        ITEM {String(index + 1).padStart(2, "0")}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remove item ${index + 1}`}
                        disabled={input.items.length === 1 || busy}
                        onPress={() =>
                          update(
                            "items",
                            input.items.filter((v) => v.id !== line.id),
                          )
                        }
                        style={{
                          padding: 8,
                          opacity: input.items.length === 1 ? 0.3 : 1,
                        }}
                      >
                        <Icon name="trash" />
                      </Pressable>
                    </View>
                    <Field
                      label="Description"
                      placeholder="e.g. Brand identity design"
                      value={line.description}
                      multiline
                      onChangeText={(v) => item(line.id, "description", v)}
                    />
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Field
                          label="Quantity"
                          keyboardType="decimal-pad"
                          value={line.quantity}
                          onChangeText={(v) => item(line.id, "quantity", v)}
                        />
                      </View>
                      <View style={{ flex: 2 }}>
                        <Field
                          label={`Unit price (${input.currency})`}
                          keyboardType="decimal-pad"
                          value={line.price}
                          onChangeText={(v) => item(line.id, "price", v)}
                        />
                      </View>
                    </View>
                    {totals.value && (
                      <View style={s.row}>
                        <Copy>Line total</Copy>
                        <Text style={s.title}>
                          {money(totals.value.lines[index], input.currency)}
                        </Text>
                      </View>
                    )}
                  </Card>
                ))}
                <Button
                  title="Add another item"
                  secondary
                  disabled={busy || input.items.length >= 100}
                  onPress={() => void addItem()}
                />
                {!!workspace.company.products?.length && (
                  <Card>
                    <Text style={s.title}>From your product catalog</Text>
                    {workspace.company.products
                      .filter((p) => p.currency === input.currency)
                      .map((p) => (
                        <Button
                          key={p.id}
                          title={`${p.name} / ${p.price} ${p.currency}`}
                          secondary
                          disabled={busy || input.items.length >= 100}
                          onPress={() => void addItem(p)}
                        />
                      ))}
                  </Card>
                )}
                <Button
                  title={
                    advanced
                      ? "Hide discount, tax & notes"
                      : "Add discount, tax or notes"
                  }
                  secondary
                  onPress={() => setAdvanced(!advanced)}
                />
                {advanced && (
                  <Card>
                    <Text style={s.title}>Adjustments & notes</Text>
                    <Chips<InvoiceInput["discountType"]>
                      values={["PERCENT", "FIXED"]}
                      value={input.discountType}
                      onChange={(v) => update("discountType", v)}
                    />
                    <Field
                      label={
                        input.discountType === "PERCENT"
                          ? "Discount (%)"
                          : `Discount (${input.currency})`
                      }
                      value={input.discount}
                      keyboardType="decimal-pad"
                      onChangeText={(v) => update("discount", v)}
                    />
                    <Field
                      label="Tax (%) after discount"
                      value={input.tax}
                      keyboardType="decimal-pad"
                      onChangeText={(v) => update("tax", v)}
                    />
                    <Field
                      label="Terms and notes"
                      placeholder="Payment instructions, project notes or a thank you"
                      value={input.terms}
                      multiline
                      onChangeText={(v) => update("terms", v)}
                    />
                  </Card>
                )}
              </>
            )}
            {step === 3 && (
              <>
                <Heading>Ready to send?</Heading>
                <Copy>
                  Review the details. You can save a draft now or issue the
                  invoice when everything looks right.
                </Copy>
                <Card>
                  <View style={s.row}>
                    <Text style={s.title}>Bill to</Text>
                    <Button title="Edit" secondary onPress={() => go(0)} />
                  </View>
                  <Text style={s.title}>{chosenClient?.name}</Text>
                  <Copy>
                    {[
                      chosenClient?.email,
                      chosenClient?.phone,
                      chosenClient?.address,
                    ]
                      .filter(Boolean)
                      .join("\n")}
                  </Copy>
                  <View style={s.rule} />
                  <Text style={s.title}>{input.title}</Text>
                  <Copy>
                    Issued {input.issueDate}
                    {"\n"}Due {input.dueDate}
                  </Copy>
                  <Button
                    title="Edit details"
                    secondary
                    onPress={() => go(1)}
                  />
                </Card>
                <Card>
                  <Text style={s.title}>Your work</Text>
                  {input.items.map((line, i) => (
                    <View key={line.id} style={{ gap: 6, paddingVertical: 8 }}>
                      <Text style={s.title}>{line.description}</Text>
                      <Copy>
                        {line.quantity} × {line.price} {input.currency}
                      </Copy>
                      {totals.value && (
                        <Text style={s.label}>
                          {money(totals.value.lines[i], input.currency)}
                        </Text>
                      )}
                    </View>
                  ))}
                  <Button title="Edit items" secondary onPress={() => go(2)} />
                  {!!input.terms && <Copy>{input.terms}</Copy>}
                </Card>
                <Card>
                  <Text style={s.title}>Payment QR</Text>
                  <Button
                    title="No payment QR"
                    secondary={input.payment !== ""}
                    onPress={() => update("payment", "")}
                  />
                  {(["kpay", "wavepay", "bank"] as const)
                    .filter((key) => workspace.company[key])
                    .map((key) => (
                      <Button
                        key={key}
                        title={key.toUpperCase()}
                        secondary={input.payment !== key}
                        onPress={() => update("payment", key)}
                      />
                    ))}
                  <Copy>
                    Set up payment QR images in Account → Company profile.
                  </Copy>
                </Card>
                <DesignPicker
                  value={input.design}
                  onChange={(design) => update("design", design)}
                />
                {!wide && summary}
                <Copy>
                  Issued invoices are locked to protect the billing record. Save
                  a draft first if you want to preview the full PDF before
                  issuing.
                </Copy>
              </>
            )}
          </View>
          {wide && (
            <View style={{ width: 300, gap: 16 }}>
              {summary}
              <Copy>
                Your company branding and selected template are applied
                automatically.
              </Copy>
              <View
                style={{
                  padding: 20,
                  backgroundColor: colors.soft,
                  borderRadius: 18,
                  gap: 8,
                }}
              >
                <Text style={s.badge}>GOOD TO KNOW</Text>
                <Copy>
                  You can save a draft once the required details are complete.
                  Your team sees saved changes in the same workspace.
                </Copy>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      <View
        style={{
          padding: 18,
          borderTopWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.surface,
          gap: 10,
        }}
      >
        {!!error && (
          <Text accessibilityRole="alert" style={s.error}>
            {error}
          </Text>
        )}
        <View style={[s.row, { flexWrap: "wrap" }]}>
          <View>
            <Text style={s.badge}>TOTAL · {input.currency}</Text>
            <Text style={s.title}>
              {totals.value
                ? money(totals.value.total, input.currency)
                : "Check amounts"}
            </Text>
          </View>
          <Text style={s.label}>Step {step + 1} of 4</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {step > 0 && (
            <View style={{ flex: 1 }}>
              <Button
                title="Back"
                secondary
                disabled={busy}
                onPress={() => go(step - 1)}
              />
            </View>
          )}
          {step === 3 && (
            <View style={{ flex: 1 }}>
              <Button
                title="Save draft"
                secondary
                disabled={busy}
                onPress={() => void save(false)}
              />
            </View>
          )}
          <View style={{ flex: 1.3 }}>
            <Button
              title={
                busy ? "Saving..." : step === 3 ? "Issue invoice" : "Continue"
              }
              disabled={busy}
              onPress={() =>
                step < 3
                  ? go(step + 1)
                  : Alert.alert(
                      "Issue this invoice?",
                      `Confirm ${chosenClient?.name} and ${totals.value ? money(totals.value.total, input.currency) : "the total"}. Issued invoices cannot be edited.`,
                      [
                        { text: "Review", style: "cancel" },
                        {
                          text: "Issue invoice",
                          onPress: () => void save(true),
                        },
                      ],
                    )
              }
            />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
