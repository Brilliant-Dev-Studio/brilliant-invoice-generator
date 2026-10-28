import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
  useWindowDimensions,
  useColorScheme,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import type { Currency, Invoice, Status } from "../../src/lib/types";
import { money, statusOf } from "../../src/lib/money";
import {
  api,
  ApiError,
  device,
  serverOrigin,
  type Session,
  type Workspace,
} from "./api";
import {
  Button,
  Card,
  Chips,
  colors,
  Copy,
  Field,
  Heading,
  Loading,
  s,
} from "./ui";
import {
  editDraft,
  InvoiceEditor,
  newDraft,
  type Draft,
} from "./InvoiceEditor";
import { ClientForm } from "./ClientForm";
import { apiOrigin } from "./config";
import { Icon } from "./Icons";
import { WorkspaceTools } from "./WorkspaceTools";
import {
  PreferencesProvider,
  usePreferences,
  useTranslate,
} from "./Preferences";
import { BusinessOverview } from "./BusinessOverview";

type Tab = "Overview" | "Invoices" | "Clients" | "Platform" | "Account";
const tabs: Tab[] = ["Overview", "Invoices", "Clients", "Account"];
const tabIcons: Record<Tab, string> = {
  Platform: "building.2",
  Overview: "chart.bar",
  Invoices: "doc.text",
  Clients: "person.2",
  Account: "gearshape",
};
function Login({ onLogin }: { onLogin(session: Session): Promise<void> }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function login() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const base = serverOrigin(apiOrigin);
      const result = await api<{ token: string }>(
        { origin: base, token: "" },
        "login",
        { identifier, password },
      );
      const next = { origin: base, token: result.token };
      await device.saveSession(JSON.stringify(next));
      setPassword("");
      await onLogin(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <KeyboardAvoidingView style={s.root} behavior="padding">
      <ScrollView
        contentContainerStyle={[s.page, { paddingTop: 52, maxWidth: 560 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.badge}>SAN PYA / INVOICE</Text>
        <View style={{ height: 18 }} />
        <Heading>Good work.{"\n"}Beautifully billed.</Heading>
        <Copy>
          Your clients, invoices and payments. One calm place to keep business
          moving.
        </Copy>
        <Card>
          <Text style={s.title}>Welcome back</Text>
          <Field
            label="Email or phone"
            placeholder="Enter your email or phone number"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            textContentType="username"
          />
          <Field
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />
          {!!error && (
            <Text accessibilityRole="alert" style={s.error}>
              {error}
            </Text>
          )}
          <Button
            title={busy ? "Signing in..." : "Sign in to workspace"}
            disabled={busy || !identifier || !password}
            onPress={() => void login()}
          />
        </Card>
        <Copy>
          Use the account provided by your company administrator. Sessions
          expire after eight hours.
        </Copy>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
function InvoiceRow({
  invoice,
  date,
  onPress,
}: {
  invoice: Invoice;
  date: string;
  onPress(): void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${invoice.number}, ${invoice.client.name}, ${statusOf(invoice, date)}`}
      onPress={onPress}
    >
      <Card>
        <View style={s.row}>
          <Text style={s.badge}>{invoice.number}</Text>
          <Text style={s.badge}>{statusOf(invoice, date)}</Text>
        </View>
        <Text style={s.title}>{invoice.client.name}</Text>
        <View style={s.row}>
          <Copy>Due {invoice.dueDate}</Copy>
          <Text style={s.title}>
            {money(invoice.totals.total, invoice.currency)}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
function WorkspaceApp() {
  const preferences = usePreferences();
  const t = useTranslate();
  const tablet = useWindowDimensions().width >= 900;
  const [session, setSession] = useState<Session | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const refreshVersion = useRef(0);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [booting, setBooting] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("Overview");
  const [currency, setCurrency] = useState<Currency>("MMK");
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [invoicePage, setInvoicePage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [createdClientId, setCreatedClientId] = useState<string | null>(null);
  const [clientOpen, setClientOpen] = useState(false);
  const changeSession = useCallback((value: Session | null) => {
    sessionRef.current = value;
    setSession(value);
  }, []);
  const clear = useCallback(async () => {
    changeSession(null);
    setWorkspace(null);
    setDraft(null);
    setClientOpen(false);
    setSelectedId(null);
    setSearch("");
    setTab("Overview");
    await device.clearSession();
  }, [changeSession]);
  const handleError = useCallback(
    (e: unknown) => {
      const message = e instanceof Error ? e.message : "Please try again.";
      setError(message);
      if (e instanceof ApiError && e.status === 401) {
        void clear().catch(() =>
          Alert.alert(
            "Secure storage",
            "Could not remove the expired session.",
          ),
        );
        Alert.alert(
          "Please sign in again",
          "Your session expired or your account access changed.",
        );
      }
    },
    [clear],
  );
  const refresh = useCallback(
    async (current: Session, silent = false) => {
      const version = ++refreshVersion.current;
      if (!silent) setRefreshing(true);
      try {
        const next = await api<Workspace>(current, "workspace");
        if (
          sessionRef.current === current &&
          version === refreshVersion.current
        ) {
          setWorkspace(next);
          setError("");
          return next;
        }
      } catch (e) {
        if (
          sessionRef.current === current &&
          version === refreshVersion.current
        )
          handleError(e);
      } finally {
        if (version === refreshVersion.current) setRefreshing(false);
      }
    },
    [handleError],
  );
  useEffect(() => {
    let active = true;
    device
      .loadSession()
      .then(async (raw) => {
        if (!raw || !active) return;
        const stored = JSON.parse(raw) as Session;
        if (stored.origin !== serverOrigin(apiOrigin)) {
          await device.clearSession();
          return;
        }
        if (typeof stored.token !== "string" || !stored.token)
          throw new Error("Stored session is invalid.");
        const current = {
          origin: serverOrigin(stored.origin),
          token: stored.token,
        };
        changeSession(current);
        const restored = await refresh(current);
        if (restored?.user.role === "SUPERADMIN") setTab("Platform");
      })
      .catch((e) => {
        if (active) handleError(e);
      })
      .finally(() => {
        if (active) setBooting(false);
      });
    return () => {
      active = false;
    };
  }, [changeSession, handleError, refresh]);
  useEffect(() => {
    if (!session) return;
    const check = () => {
      if (AppState.currentState === "active") void refresh(session, true);
    };
    const timer = setInterval(check, 15000);
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh(session);
    });
    return () => {
      clearInterval(timer);
      listener.remove();
    };
  }, [session, handleError, refresh]);
  async function perform(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } catch (e) {
      handleError(e);
      Alert.alert("Could not complete action", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (!session) return;
    // Keep the session until server revocation succeeds, so failures can be retried.
    await api(session, "logout", {});
    await clear();
  }
  if (booting) return <Loading />;
  if (!session)
    return (
      <Login
        onLogin={async (next) => {
          changeSession(next);
          const loaded = await refresh(next);
          if (loaded?.user.role === "SUPERADMIN") setTab("Platform");
        }}
      />
    );
  if (!workspace)
    return (
      <View style={s.center}>
        <Heading>Let's reconnect.</Heading>
        <Copy>{error || "Loading your workspace..."}</Copy>
        <Button
          title="Retry"
          disabled={refreshing}
          onPress={() => void refresh(session)}
        />
        <Button
          title="Sign out"
          secondary
          disabled={busy}
          onPress={() => void perform(logout)}
        />
      </View>
    );
  const navigation =
    workspace.user.role === "SUPERADMIN"
      ? [...tabs.slice(0, 3), "Platform" as Tab, "Account" as Tab]
      : tabs;
  const selected = workspace.invoices.find((value) => value.id === selectedId);
  const visible = workspace.invoices.filter(
    (value) =>
      (filter === "ALL" || statusOf(value, workspace.today) === filter) &&
      `${value.number} ${value.client.name} ${value.title}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const invoicePages = Math.max(1, Math.ceil(visible.length / 20));
  const currentInvoicePage = Math.min(invoicePage, invoicePages);
  const startDraft = () =>
    void perform(async () => {
      setCreatedClientId(null);
      setDraft(await newDraft(workspace));
    });
  return (
    <View style={[s.root, { flexDirection: tablet ? "row" : "column" }]}>
      {tablet && (
        <View
          style={{
            width: 190,
            backgroundColor: colors.surface,
            borderRightWidth: 1,
            borderColor: colors.line,
            padding: 20,
            gap: 12,
          }}
        >
          <Text style={[s.heading, { fontSize: 28 }]}>San Pya.</Text>
          <Copy>{workspace.company.name}</Copy>
          <View style={{ height: 24 }} />
          {navigation.map((value) => (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityLabel={value}
              accessibilityState={{ selected: tab === value }}
              onPress={() => {
                setTab(value);
                setSearch("");
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 16,
                paddingHorizontal: 12,
                borderRadius: 12,
                backgroundColor: tab === value ? colors.soft : "transparent",
              }}
            >
              <Icon name={tabIcons[value]} selected={tab === value} />
              <Text
                style={[
                  s.label,
                  { color: tab === value ? colors.green : colors.muted },
                ]}
              >
                {t(value)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.page, tab === "Account" && { maxWidth: 820 }]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh(session)}
            tintColor={colors.green}
          />
        }
      >
        <View style={s.row}>
          <Text style={s.badge}>SAN PYA / WORKSPACE</Text>
          <Text style={s.badge}>
            {workspace.user.isDemo ? "DEMO" : "CONNECTED"}
          </Text>
        </View>
        {!!error && (
          <Card>
            <Text style={s.error} accessibilityRole="alert">
              {error}
            </Text>
            <Button
              title="Refresh workspace"
              secondary
              onPress={() => void refresh(session)}
            />
          </Card>
        )}
        {tab === "Overview" && (
          <BusinessOverview
            workspace={workspace}
            currency={currency}
            onCurrency={setCurrency}
            onCreate={startDraft}
            onInvoice={setSelectedId}
            busy={busy}
          />
        )}
        {tab === "Invoices" && (
          <>
            <Heading>Your work, on record.</Heading>
            <Button
              title="+ Create invoice"
              disabled={busy}
              onPress={startDraft}
            />
            <Field
              label="Search invoices"
              value={search}
              onChangeText={(value) => {
                setSearch(value);
                setInvoicePage(1);
              }}
              placeholder="Invoice number or client"
            />
            <Chips<Status | "ALL">
              values={["ALL", "DRAFT", "UNPAID", "OVERDUE", "PAID"]}
              value={filter}
              onChange={(value) => {
                setFilter(value);
                setInvoicePage(1);
              }}
            />
            {visible
              .slice((currentInvoicePage - 1) * 20, currentInvoicePage * 20)
              .map((value) => (
                <InvoiceRow
                  key={value.id}
                  invoice={value}
                  date={workspace.today}
                  onPress={() => setSelectedId(value.id)}
                />
              ))}
            {!visible.length && <Copy>No invoices match this view.</Copy>}
            {visible.length > 20 && (
              <Card>
                <Copy>
                  Page {currentInvoicePage} of {invoicePages} · {visible.length}{" "}
                  invoices
                </Copy>
                <View style={s.row}>
                  <Button
                    title="Previous"
                    secondary
                    disabled={currentInvoicePage <= 1}
                    onPress={() => setInvoicePage(currentInvoicePage - 1)}
                  />
                  <Button
                    title="Next"
                    secondary
                    disabled={currentInvoicePage >= invoicePages}
                    onPress={() => setInvoicePage(currentInvoicePage + 1)}
                  />
                </View>
              </Card>
            )}
          </>
        )}
        {tab === "Clients" && (
          <>
            <Heading>People you work with.</Heading>
            <Button title="+ Add client" onPress={() => setClientOpen(true)} />
            <Field
              label="Search clients"
              value={search}
              onChangeText={setSearch}
              placeholder="Name, email or phone"
            />
            {workspace.clients
              .filter((value) =>
                `${value.name} ${value.email} ${value.phone}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((client) => (
                <Card key={client.id}>
                  <Text style={s.title}>{client.name}</Text>
                  <Copy>
                    {[client.email, client.phone, client.address]
                      .filter(Boolean)
                      .join("\n") || "No contact details added."}
                  </Copy>
                </Card>
              ))}
            {!workspace.clients.length && (
              <Copy>
                No clients yet. Add your first client to start billing.
              </Copy>
            )}
          </>
        )}
        {tab === "Platform" && workspace.user.role === "SUPERADMIN" && (
          <WorkspaceTools
            key="platform"
            initialPage="Platform"
            workspace={workspace}
            session={session}
            onRefresh={() => refresh(session)}
            onError={handleError}
          />
        )}
        {tab === "Account" && (
          <>
            <Heading>At your service.</Heading>
            <Card>
              <Text style={s.title}>{t("Appearance")}</Text>
              <Chips<"light" | "dark" | "system">
                values={["light", "dark", "system"]}
                labels={{ light: "Light", dark: "Dark", system: "System" }}
                value={preferences.value.theme}
                onChange={(theme) =>
                  preferences.update({ ...preferences.value, theme })
                }
              />
              <Text style={s.title}>{t("Language")}</Text>
              <Chips<"en" | "my">
                values={["en", "my"]}
                labels={{ en: "English", my: "Myanmar" }}
                value={preferences.value.locale}
                onChange={(locale) =>
                  preferences.update({ ...preferences.value, locale })
                }
              />
            </Card>
            <Card>
              <Text style={s.title}>{workspace.user.name}</Text>
              <Copy>
                {workspace.user.email}
                {"\n"}
                {workspace.user.role.replace("_", " ")}
              </Copy>
            </Card>
            <Card>
              <Text style={s.title}>{workspace.company.name}</Text>
              <Copy>
                {[
                  workspace.company.address,
                  workspace.company.email,
                  workspace.company.phone,
                ]
                  .filter(Boolean)
                  .join("\n")}
              </Copy>
            </Card>
            {workspace.user.role !== "STAFF" && (
              <WorkspaceTools
                workspace={workspace}
                session={session}
                onRefresh={() => refresh(session)}
                onError={handleError}
              />
            )}
            <Copy>
              Workspace: {session.origin}
              {"\n"}Business dates follow Asia/Yangon.
            </Copy>
            <Button
              title="Sign out"
              secondary
              disabled={busy}
              onPress={() => void perform(logout)}
            />
          </>
        )}
      </ScrollView>
      {!tablet && (
        <View
          style={{
            flexDirection: "row",
            borderTopWidth: 1,
            borderColor: colors.line,
            backgroundColor: colors.surface,
            paddingVertical: 8,
          }}
        >
          {navigation.map((value) => (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityLabel={value}
              accessibilityState={{ selected: value === tab }}
              onPress={() => {
                setTab(value);
                setSearch("");
              }}
              style={{
                flex: 1,
                paddingVertical: 8,
                gap: 5,
                alignItems: "center",
                minHeight: 60,
              }}
            >
              <Icon name={tabIcons[value]} selected={value === tab} />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: value === tab ? colors.accent : colors.muted,
                }}
              >
                {t(value)}
              </Text>
              <View
                style={{
                  height: 3,
                  width: 20,
                  borderRadius: 2,
                  marginTop: 6,
                  backgroundColor: value === tab ? colors.green : "transparent",
                }}
              />
            </Pressable>
          ))}
        </View>
      )}
      <Modal
        visible={!!selected || !!draft}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedId(null)}
      >
        <SafeAreaView style={s.root}>
          {selected && !draft && (
            <ScrollView contentContainerStyle={s.page}>
              <Button
                title="Back to workspace"
                secondary
                disabled={busy}
                onPress={() => setSelectedId(null)}
              />
              <Text style={s.badge}>
                {selected.number} / {statusOf(selected, workspace.today)}
              </Text>
              <Heading>{selected.title}</Heading>
              <Card>
                <Text style={s.title}>{selected.client.name}</Text>
                <Copy>
                  {[
                    selected.client.email,
                    selected.client.phone,
                    selected.client.address,
                  ]
                    .filter(Boolean)
                    .join("\n")}
                </Copy>
                <Copy>
                  Issued {selected.issueDate}
                  {"\n"}Due {selected.dueDate}
                </Copy>
              </Card>
              {selected.items.map((item, index) => (
                <Card key={item.id}>
                  <Text style={s.title}>{item.description}</Text>
                  <Copy>
                    {item.quantity} x{" "}
                    {money(
                      Math.round(Number(item.price) * 100),
                      selected.currency,
                    )}
                  </Copy>
                  <Text style={s.title}>
                    {money(selected.totals.lines[index], selected.currency)}
                  </Text>
                </Card>
              ))}
              <Card>
                <Copy>
                  Subtotal {money(selected.totals.subtotal, selected.currency)}
                  {"\n"}Discount{" "}
                  {money(selected.totals.discount, selected.currency)}
                  {"\n"}Tax {money(selected.totals.tax, selected.currency)}
                </Copy>
                <Text style={s.amount}>
                  {money(selected.totals.total, selected.currency)}
                </Text>
                {!!selected.terms && <Copy>{selected.terms}</Copy>}
              </Card>
              {workspace.user.isDemo && (
                <Copy>
                  DEMO: exported invoices contain the required demo watermark.
                </Copy>
              )}
              {selected.status === "DRAFT" && (
                <Button
                  title="Edit draft"
                  disabled={busy}
                  onPress={() => {
                    setCreatedClientId(null);
                    setDraft(editDraft(selected));
                  }}
                />
              )}
              <Button
                title="Preview invoice"
                secondary
                disabled={busy}
                onPress={() =>
                  void perform(async () => {
                    await device.sharePdf(
                      session.origin,
                      session.token,
                      selected.id,
                      true,
                    );
                  })
                }
              />
              <Button
                title={busy ? "Please wait..." : "Share / save / print PDF"}
                disabled={busy}
                onPress={() =>
                  void perform(async () => {
                    await device.sharePdf(
                      session.origin,
                      session.token,
                      selected.id,
                      false,
                    );
                  })
                }
              />
              <Button
                title={busy ? "Please wait..." : "Save to gallery (PNG)"}
                secondary
                disabled={busy}
                onPress={() =>
                  void perform(async () => {
                    const saved = await device.savePngToGallery(
                      session.origin,
                      session.token,
                      selected.id,
                    );
                    if (saved)
                      Alert.alert(
                        "Saved",
                        "Invoice image saved to your photo library.",
                      );
                  })
                }
              />
              {selected.status === "UNPAID" &&
                workspace.user.role !== "STAFF" && (
                  <Button
                    title="Mark as paid"
                    secondary
                    disabled={busy}
                    onPress={() =>
                      Alert.alert(
                        "Record payment?",
                        `Confirm that ${money(selected.totals.total, selected.currency)} has been received.`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Mark paid",
                            onPress: () =>
                              void perform(async () => {
                                await api(
                                  session,
                                  `invoices/${selected.id}/paid`,
                                  {},
                                );
                                await refresh(session);
                              }),
                          },
                        ],
                      )
                    }
                  />
                )}
            </ScrollView>
          )}
          {draft && (
            <InvoiceEditor
              draft={draft}
              createdClientId={createdClientId}
              workspace={workspace}
              session={session}
              onClose={() => setDraft(null)}
              onClient={() => setClientOpen(true)}
              onError={handleError}
              onSaved={(id) => {
                setDraft(null);
                setSelectedId(null);
                setTab("Invoices");
                void refresh(session).then((next) => {
                  if (next && sessionRef.current === session) setSelectedId(id);
                });
              }}
            />
          )}
        </SafeAreaView>
        <Modal
          visible={clientOpen && !!draft}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setClientOpen(false)}
        >
          <SafeAreaView style={s.root}>
            <ClientForm
              session={session}
              onClose={() => setClientOpen(false)}
              onError={handleError}
              onSaved={(client) => {
                setCreatedClientId(client.id);
                void refresh(session);
                setWorkspace(
                  (current) =>
                    current && {
                      ...current,
                      clients: [
                        ...current.clients.filter(
                          (value) => value.id !== client.id,
                        ),
                        client,
                      ],
                    },
                );
                setClientOpen(false);
              }}
            />
          </SafeAreaView>
        </Modal>
      </Modal>
      <Modal
        visible={clientOpen && !draft}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setClientOpen(false)}
      >
        <SafeAreaView style={s.root}>
          <ClientForm
            session={session}
            onClose={() => setClientOpen(false)}
            onError={handleError}
            onSaved={(client) => {
              void refresh(session);
              setWorkspace(
                (current) =>
                  current && {
                    ...current,
                    clients: [
                      ...current.clients.filter(
                        (value) => value.id !== client.id,
                      ),
                      client,
                    ],
                  },
              );
              setClientOpen(false);
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
function AppContent() {
  const dark = useColorScheme() === "dark";
  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.root}>
        <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
        <WorkspaceApp />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <PreferencesProvider>
      <AppContent />
    </PreferencesProvider>
  );
}
