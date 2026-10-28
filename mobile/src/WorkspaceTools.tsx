import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import type {
  Client,
  Company,
  Currency,
  Invoice,
  User,
} from "../../src/lib/types";
import {
  PLAN_IDS,
  PLANS,
  companyPlan,
  mmk,
  planTerm,
  platformSummary,
  subscriptionStatus,
  type PlanId,
  type Subscription,
  type PlatformClient,
} from "../../src/lib/plans";
import { platformHistory } from "../../src/lib/platform-charts";
import { money, statusOf } from "../../src/lib/money";
import { api, device, type Session, type Workspace } from "./api";
import { Button, Card, Chips, Copy, Field, Heading, s } from "./ui";
import { DEFAULT_INVOICE_DESIGN } from "../../src/lib/invoice-design";
import { DesignPicker } from "./DesignPicker";

type Management = {
  users: User[];
  companies: { id: string; name: string; status?: string }[];
  subscriptions: Subscription[];
  platformClients: (PlatformClient & { status: string })[];
  storageReady: boolean;
};
type CompanyDetail = {
  company: Company;
  status: "ACTIVE" | "SUSPENDED";
  clients: Client[];
  invoices: Invoice[];
};
type Activity = {
  id: string;
  actor: string;
  company: string;
  action: string;
  targetId: string;
  createdAt: string;
};
type Mutate = (path: string, data: unknown) => Promise<void>;
const profileFields = ["name", "email", "phone", "taxId", "address"] as const;
const labels = {
  name: "Company name",
  email: "Email address",
  phone: "Phone number",
  taxId: "Tax ID",
  address: "Business address",
};
function ProfileFields({
  value,
  onChange,
}: {
  value: Company;
  onChange(value: Company): void;
}) {
  return (
    <>
      {profileFields.map((key) => (
        <Field
          key={key}
          label={labels[key]}
          placeholder={labels[key]}
          value={value[key]}
          multiline={key === "address"}
          autoCapitalize={key === "email" ? "none" : "sentences"}
          onChangeText={(text) => onChange({ ...value, [key]: text })}
        />
      ))}
    </>
  );
}
function CompanySettings({
  workspace,
  session,
  mutate,
  busy,
  storageReady,
}: {
  workspace: Workspace;
  session: Session;
  mutate: Mutate;
  busy: boolean;
  storageReady: boolean;
}) {
  const [value, setValue] = useState(workspace.company);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  async function upload(
    purpose: "logo" | "signature" | "kpay" | "wavepay" | "bank",
    draw = false,
  ) {
    if (uploading) return;
    setUploading(true);
    setError("");
    try {
      const base64 = await (draw ? device.drawSignature() : device.pickImage());
      if (!base64) return;
      const id = await api<string>(session, "settings/upload", {
        purpose,
        base64,
      });
      setValue((current) => ({ ...current, [purpose]: id }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  return (
    <>
      <Heading>Company profile</Heading>
      <Card>
        <ProfileFields value={value} onChange={setValue} />
      </Card>
      <Copy>
        Save the profile after changing images or payment details. Existing
        issued invoices keep their original branding.
      </Copy>
      {!storageReady && (
        <Copy>
          Image storage is not configured on the server. Company details can
          still be saved.
        </Copy>
      )}
      {(["logo", "signature", "kpay", "wavepay", "bank"] as const).map(
        (purpose) => (
          <Card key={purpose}>
            <Text style={s.title}>
              {
                {
                  logo: "Company logo",
                  signature: "Signature",
                  kpay: "KPay",
                  wavepay: "WavePay",
                  bank: "Bank",
                }[purpose]
              }
            </Text>
            {!!value[purpose] && (
              <Image
                accessibilityLabel={purpose}
                source={{
                  uri: `${session.origin}/api/mobile/assets/${value[purpose]}`,
                  headers: { Authorization: `Bearer ${session.token}` },
                }}
                style={{ height: 140, width: "100%" }}
                resizeMode="contain"
              />
            )}
            <Button
              title={uploading ? "Uploading..." : "Choose image from Files"}
              secondary
              disabled={
                uploading || busy || !storageReady || workspace.user.isDemo
              }
              onPress={() => void upload(purpose)}
            />
            {purpose === "signature" && (
              <Button
                title="Draw signature"
                secondary
                disabled={
                  uploading || busy || !storageReady || workspace.user.isDemo
                }
                onPress={() => void upload(purpose, true)}
              />
            )}
            {!!value[purpose] && (
              <Button
                title="Remove image"
                secondary
                disabled={busy || uploading}
                onPress={() => setValue({ ...value, [purpose]: "" })}
              />
            )}
            {(purpose === "kpay" ||
              purpose === "wavepay" ||
              purpose === "bank") && (
              <>
                {(["name", "number"] as const).map((key) => (
                  <Field
                    key={key}
                    label={key === "name" ? "Account holder" : "Account number"}
                    value={value.paymentAccounts?.[purpose]?.[key] || ""}
                    onChangeText={(text) =>
                      setValue({
                        ...value,
                        paymentAccounts: {
                          ...value.paymentAccounts,
                          [purpose]: {
                            name: "",
                            number: "",
                            ...value.paymentAccounts?.[purpose],
                            [key]: text,
                          },
                        },
                      })
                    }
                  />
                ))}
              </>
            )}
          </Card>
        ),
      )}
      <Copy>
        PNG, JPEG or WebP up to 2.8 MB per mobile upload. In Photos, save an
        image to Files to select it here.
      </Copy>
      {!!error && <Text style={s.error}>{error}</Text>}
      <Button
        title="Save company profile"
        disabled={busy || uploading}
        onPress={() => void mutate("settings/company", value)}
      />
    </>
  );
}
function FinancialSettings({
  workspace,
  mutate,
  busy,
}: {
  workspace: Workspace;
  mutate: Mutate;
  busy: boolean;
}) {
  const [currency, setCurrency] = useState<Currency>("MMK");
  const [values, setValues] = useState<
    Record<Currency, { revenue: string; outstanding: string }>
  >(
    () =>
      Object.fromEntries(
        (["MMK", "USD", "THB"] as const).map((key) => {
          const saved = workspace.company.financialOverview?.currencies?.[key];
          return [
            key,
            {
              revenue:
                saved?.month === workspace.today.slice(0, 7) &&
                saved.revenue !== undefined
                  ? String(saved.revenue / 100)
                  : "",
              outstanding:
                saved?.outstanding === undefined
                  ? ""
                  : String(saved.outstanding / 100),
            },
          ];
        }),
      ) as Record<Currency, { revenue: string; outstanding: string }>,
  );
  const [count, setCount] = useState(
    String(workspace.company.financialOverview?.count ?? ""),
  );
  return (
    <>
      <Heading>Financial overview</Heading>
      <Copy>
        Blank values use invoice totals. Monthly revenue overrides apply only to
        the current Yangon month. Invoice count applies to all currencies.
      </Copy>
      <Chips<Currency>
        values={["MMK", "USD", "THB"] as const}
        value={currency}
        onChange={setCurrency}
      />
      <Card>
        {(["revenue", "outstanding"] as const).map((key) => (
          <Field
            key={key}
            label={
              key === "revenue" ? "Monthly revenue" : "Outstanding balance"
            }
            placeholder="Use calculated total"
            keyboardType="decimal-pad"
            value={values[currency][key]}
            onChangeText={(text) =>
              setValues({
                ...values,
                [currency]: { ...values[currency], [key]: text },
              })
            }
          />
        ))}
        <Field
          label="Invoice count"
          keyboardType="number-pad"
          placeholder="Use actual invoice count"
          value={count}
          onChangeText={setCount}
        />
      </Card>
      <Button
        title={`Save ${currency} overview`}
        disabled={busy}
        onPress={() =>
          void mutate("settings/financial", {
            currency,
            ...values[currency],
            count,
          })
        }
      />
      <Button
        title="Reset all currencies to invoice totals"
        secondary
        disabled={busy}
        onPress={() =>
          Alert.alert(
            "Reset financial overview?",
            "All manual totals will be removed.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Reset",
                style: "destructive",
                onPress: () =>
                  void mutate("settings/financial/reset", {})
                    .then(() => {
                      setValues({
                        MMK: { revenue: "", outstanding: "" },
                        USD: { revenue: "", outstanding: "" },
                        THB: { revenue: "", outstanding: "" },
                      });
                      setCount("");
                    })
                    .catch(() => {}),
              },
            ],
          )
        }
      />
    </>
  );
}
function Accounts({
  management,
  workspace,
  mutate,
  busy,
  companyId,
}: {
  management: Management;
  workspace: Workspace;
  mutate: Mutate;
  busy: boolean;
  companyId?: string;
}) {
  const owner = workspace.user.role === "SUPERADMIN";
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const initial = {
    name: "",
    email: "",
    phone: "",
    password: "",
    role: owner ? "COMPANY_ADMIN" : "STAFF",
    companyId: companyId || (owner ? "new" : workspace.user.companyId),
    companyName: "",
    planId: "MONTHLY",
    startsOn: workspace.today,
  };
  const [form, setForm] = useState(initial);
  const [resetId, setResetId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const users = management.users.filter(
    (user) =>
      (!companyId || user.companyId === companyId) &&
      `${user.name} ${user.email} ${user.phone || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <Heading>{owner ? "Accounts & access" : "Your team"}</Heading>
      {!owner && (
        <Copy>
          Create up to 3 staff accounts. Suspended accounts still count toward
          this limit.
        </Copy>
      )}
      <Button
        title={creating ? "Cancel new account" : "+ Create account"}
        secondary
        onPress={() => setCreating(!creating)}
      />
      {creating && (
        <Card>
          {(["name", "email", "phone", "password"] as const).map((key) => (
            <Field
              key={key}
              label={
                key === "password" ? "Password (at least 12 characters)" : key
              }
              placeholder={`Enter ${key}`}
              secureTextEntry={key === "password"}
              autoCapitalize="none"
              value={form[key]}
              onChangeText={(text) => setForm({ ...form, [key]: text })}
            />
          ))}
          {owner && (
            <>
              <Chips
                values={["COMPANY_ADMIN", "STAFF", "SUPERADMIN"] as const}
                value={form.role}
                onChange={(role) => setForm({ ...form, role })}
              />
              <Text style={s.label}>Company</Text>
              <Button
                title="New company"
                secondary={form.companyId !== "new"}
                onPress={() => setForm({ ...form, companyId: "new" })}
              />
              {management.companies.map((c) => (
                <Button
                  key={c.id}
                  title={c.name}
                  secondary={form.companyId !== c.id}
                  onPress={() => setForm({ ...form, companyId: c.id })}
                />
              ))}
              {form.companyId === "new" && (
                <>
                  <Field
                    label="New company name"
                    value={form.companyName}
                    onChangeText={(companyName) =>
                      setForm({ ...form, companyName })
                    }
                  />
                  {form.role !== "SUPERADMIN" && (
                    <>
                      <Chips
                        values={PLAN_IDS}
                        value={form.planId}
                        onChange={(planId) => setForm({ ...form, planId })}
                      />
                      <Field
                        label="Plan starts on (YYYY-MM-DD)"
                        value={form.startsOn}
                        onChangeText={(startsOn) =>
                          setForm({ ...form, startsOn })
                        }
                      />
                    </>
                  )}
                </>
              )}
            </>
          )}
          <Button
            title="Create account"
            disabled={busy}
            onPress={() =>
              void mutate("management/accounts", form)
                .then(() => {
                  setForm(initial);
                  setCreating(false);
                })
                .catch(() => {})
            }
          />
        </Card>
      )}
      <Field
        label="Search accounts"
        placeholder="Name, email or phone"
        value={search}
        onChangeText={setSearch}
      />
      {users.map((user) => (
        <Card key={user.id}>
          <Text style={s.title}>{user.name}</Text>
          <Copy>
            {user.email}
            {"\n"}
            {user.phone}
            {"\n"}
            {user.role} / {user.status}
            {"\n"}
            {management.companies.find((c) => c.id === user.companyId)?.name}
          </Copy>
          {user.id !== workspace.user.id && (
            <Button
              title={
                user.status === "ACTIVE"
                  ? "Suspend account"
                  : "Activate account"
              }
              secondary
              disabled={busy}
              onPress={() =>
                Alert.alert(
                  "Change account access?",
                  "Existing sessions will be revoked.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Confirm",
                      onPress: () =>
                        void mutate("management/status", {
                          id: user.id,
                          status:
                            user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                        }),
                    },
                  ],
                )
              }
            />
          )}
          {owner && (
            <Button
              title="Reset password"
              secondary
              disabled={busy}
              onPress={() => {
                setResetId(user.id);
                setPassword("");
              }}
            />
          )}
          {resetId === user.id && (
            <>
              <Field
                label="New password (at least 12 characters)"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
              <Button
                title="Confirm password reset"
                disabled={busy}
                onPress={() =>
                  void mutate("platform/password", { id: user.id, password })
                    .then(() => {
                      setPassword("");
                      setResetId(null);
                    })
                    .catch(() => {})
                }
              />
            </>
          )}
        </Card>
      ))}
      {!users.length && <Copy>No accounts match.</Copy>}
    </>
  );
}
function SubscriptionEditor({
  id,
  terms,
  date,
  mutate,
  busy,
}: {
  id: string;
  terms: Subscription[];
  date: string;
  mutate: Mutate;
  busy: boolean;
}) {
  const [planId, setPlanId] = useState<PlanId>("MONTHLY");
  const latest = terms
    .map((t) => t.expiresOn)
    .sort()
    .at(-1);
  const [startsOn, setStartsOn] = useState(
    latest && latest > date ? latest : date,
  );
  let expiry = "Enter a valid start date";
  try {
    expiry = planTerm(planId, startsOn).expiresOn;
  } catch {}
  return (
    <Card>
      <Text style={s.title}>Subscriptions</Text>
      {terms.map((t) => (
        <Copy key={t.id}>
          {PLANS[t.planId].name} / {subscriptionStatus(t, date)}
          {"\n"}
          {t.startsOn} to {t.expiresOn} / {mmk(t.priceMMK)}
        </Copy>
      ))}
      {!terms.length && <Copy>No plan assigned.</Copy>}
      <Chips<PlanId> values={PLAN_IDS} value={planId} onChange={setPlanId} />
      <Field
        label="Start date (YYYY-MM-DD)"
        value={startsOn}
        onChangeText={setStartsOn}
      />
      <Copy>
        {mmk(PLANS[planId].priceMMK)} / {PLANS[planId].bonus}
        {"\n"}Expires: {expiry}
      </Copy>
      <Button
        title="Assign / renew plan"
        disabled={busy}
        onPress={() =>
          Alert.alert(
            "Assign subscription?",
            `${PLANS[planId].name}, ${startsOn} to ${expiry}. ${mmk(PLANS[planId].priceMMK)}.`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Confirm",
                onPress: () =>
                  void mutate("platform/plan", {
                    companyId: id,
                    planId,
                    startsOn,
                  }),
              },
            ],
          )
        }
      />
    </Card>
  );
}
function Platform({
  management,
  workspace,
  session,
  mutate,
  busy,
}: {
  management: Management;
  workspace: Workspace;
  session: Session;
  mutate: Mutate;
  busy: boolean;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [detail, setDetail] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const summary = platformSummary(
    management.platformClients,
    management.subscriptions,
    workspace.today,
  );
  const [months, setMonths] = useState("6");
  const history = platformHistory(
    management.platformClients,
    management.subscriptions,
    workspace.today,
    Number(months),
  );
  async function open(id: string) {
    setLoading(true);
    setError("");
    try {
      setDetail(await api<CompanyDetail>(session, `platform/companies/${id}`));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  if (detail)
    return (
      <>
        <Button
          title="Back to companies"
          secondary
          onPress={() =>
            Alert.alert(
              "Close company?",
              "Unsaved profile edits will be discarded.",
              [
                { text: "Keep editing", style: "cancel" },
                { text: "Close", onPress: () => setDetail(null) },
              ],
            )
          }
        />
        <Heading>{detail.company.name}</Heading>
        <Card>
          <ProfileFields
            value={detail.company}
            onChange={(company) => setDetail({ ...detail, company })}
          />
          <Button
            title="Save company"
            disabled={busy}
            onPress={() =>
              void mutate(
                "platform/company",
                Object.fromEntries(
                  ["id", ...profileFields].map((key) => [
                    key,
                    detail.company[key as keyof Company],
                  ]),
                ),
              )
            }
          />
          <Copy>{detail.status}</Copy>
          <Button
            title={
              detail.status === "ACTIVE"
                ? "Suspend company"
                : "Activate company"
            }
            secondary
            disabled={busy}
            onPress={() =>
              Alert.alert(
                "Change company access?",
                "Suspending a company revokes its customer sessions.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Confirm",
                    onPress: () =>
                      void mutate("platform/status", {
                        id: detail.company.id,
                        status:
                          detail.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                      })
                        .then(() => open(detail.company.id))
                        .catch(() => {}),
                  },
                ],
              )
            }
          />
        </Card>
        <SubscriptionEditor
          key={detail.company.id}
          id={detail.company.id}
          terms={management.subscriptions.filter(
            (t) => t.companyId === detail.company.id,
          )}
          date={workspace.today}
          mutate={mutate}
          busy={busy}
        />
        <Accounts
          management={management}
          workspace={workspace}
          companyId={detail.company.id}
          mutate={mutate}
          busy={busy}
        />
        <Text style={s.title}>Customer directory</Text>
        {detail.clients.map((c) => (
          <Card key={c.id}>
            <Text style={s.title}>{c.name}</Text>
            <Copy>
              {[c.email, c.phone, c.address].filter(Boolean).join("\n")}
            </Copy>
          </Card>
        ))}
        <Text style={s.title}>Invoice tracking</Text>
        {detail.invoices.map((i) => (
          <Card key={i.id}>
            <Text style={s.title}>
              {i.number} / {i.client.name}
            </Text>
            <Copy>
              {statusOf(i, workspace.today)} /{" "}
              {money(i.totals.total, i.currency)}
              {"\n"}Issued {i.issueDate} / Due {i.dueDate}
            </Copy>
          </Card>
        ))}
      </>
    );
  return (
    <>
      <Heading>Platform control</Heading>
      <Card>
        <Text style={s.amount}>{summary.clients} companies</Text>
        <Copy>
          {summary.active} active / {summary.scheduled} scheduled /{" "}
          {summary.expired} expired / {summary.unassigned} without plan{"\n"}
          Plan sales: {mmk(summary.totalMMK)}
          {"\n"}
          {management.users.length} accounts /{" "}
          {management.users.filter((u) => u.status === "ACTIVE").length} active
        </Copy>
      </Card>
      <Card>
        <Text style={s.title}>Subscription history</Text>
        <Chips values={["6", "12", "24"]} value={months} onChange={setMonths} />
        {history.map((p) => (
          <View key={p.key} style={{ gap: 4 }}>
            <Copy>
              {p.label}: {mmk(p.valueMMK)} / {p.clients} clients
            </Copy>
            <View
              style={{
                height: 6,
                backgroundColor: "#A45138",
                width: `${Math.max(1, (p.valueMMK / Math.max(1, ...history.map((v) => v.valueMMK))) * 100)}%`,
              }}
            />
          </View>
        ))}
      </Card>
      <Field
        label="Search companies"
        placeholder="Company name"
        value={search}
        onChangeText={setSearch}
      />
      <Chips
        values={["ALL", "ACTIVE", "SCHEDULED", "EXPIRED", "NO_PLAN"]}
        value={filter}
        onChange={setFilter}
      />
      {!!error && <Text style={s.error}>{error}</Text>}
      {management.platformClients
        .filter((c) => {
          const term = companyPlan(
            management.subscriptions.filter((t) => t.companyId === c.id),
            workspace.today,
          );
          return (
            c.name.toLowerCase().includes(search.toLowerCase()) &&
            (filter === "ALL" ||
              filter ===
                (term ? subscriptionStatus(term, workspace.today) : "NO_PLAN"))
          );
        })
        .map((c) => {
          const term = companyPlan(
            management.subscriptions.filter((t) => t.companyId === c.id),
            workspace.today,
          );
          return (
            <Card key={c.id}>
              <Text style={s.title}>{c.name}</Text>
              <Copy>
                {c.status} / {c.accountCount} accounts{"\n"}
                {term
                  ? `${PLANS[term.planId].name} / ${subscriptionStatus(term, workspace.today)} / expires ${term.expiresOn}`
                  : "No subscription"}
              </Copy>
              <Button
                title="Manage company"
                secondary
                disabled={loading}
                onPress={() => void open(c.id)}
              />
            </Card>
          );
        })}
    </>
  );
}
function ActivityHistory({ session }: { session: Session }) {
  const [q, setQ] = useState("");
  const [events, setEvents] = useState<Activity[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function load(before?: string) {
    setBusy(true);
    setError("");
    try {
      const result = await api<{ events: Activity[]; next: string | null }>(
        session,
        `platform/activity?q=${encodeURIComponent(q)}${before ? `&before=${before}` : ""}`,
      );
      setEvents(result.events);
      setNext(result.next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  return (
    <>
      <Heading>Activity history</Heading>
      <Field
        label="Search activity"
        placeholder="Actor, company, action or target ID"
        value={q}
        onChangeText={setQ}
      />
      <Button
        title="Search / latest activity"
        disabled={busy}
        onPress={() => void load()}
      />
      {!!error && <Text style={s.error}>{error}</Text>}
      {events.map((e) => (
        <Card key={e.id}>
          <Text style={s.title}>{e.action}</Text>
          <Copy>
            {e.actor || "Unknown actor"} / {e.company}
            {"\n"}
            {new Intl.DateTimeFormat("en-GB", {
              timeZone: "Asia/Yangon",
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(e.createdAt))}
            {"\n"}
            {e.targetId}
          </Copy>
        </Card>
      ))}
      {!busy && !events.length && <Copy>No matching activity.</Copy>}
      {next && (
        <Button
          title="Older activity"
          secondary
          disabled={busy}
          onPress={() => void load(next)}
        />
      )}
    </>
  );
}
export function WorkspaceTools({
  workspace,
  session,
  onRefresh,
  onError,
  initialPage = "Menu",
}: {
  initialPage?: string;
  workspace: Workspace;
  session: Session;
  onRefresh(): Promise<unknown>;
  onError(error: unknown): void;
}) {
  const [page, setPage] = useState(initialPage);
  const mutationLock = useRef(false);
  const refreshVersion = useRef(0);
  const [management, setManagement] = useState<Management | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [design, setDesign] = useState(
    workspace.company.invoiceDesign ?? DEFAULT_INVOICE_DESIGN,
  );
  const refresh = useCallback(async () => {
    const version = ++refreshVersion.current;
    const next = await api<Management>(session, "management");
    if (version === refreshVersion.current) setManagement(next);
  }, [session]);
  useEffect(() => {
    void refresh().catch((e) => {
      setError(e.message);
      onError(e);
    });
  }, [refresh, onError, workspace]);
  const mutate: Mutate = async (path, data) => {
    if (mutationLock.current) throw new Error("An action is in progress.");
    mutationLock.current = true;
    setBusy(true);
    setError("");
    try {
      await api(session, path, data);
      const updates = await Promise.allSettled([refresh(), onRefresh()]);
      if (updates.some((result) => result.status === "rejected")) {
        setError("Changes were saved. Refresh to load the latest data.");
        Alert.alert(
          "Saved",
          "Changes were saved, but updated data could not be loaded. Refresh before making another change.",
        );
      } else {
        Alert.alert("Saved", "Your changes are saved to the shared workspace.");
      }
    } catch (e) {
      setError((e as Error).message);
      onError(e);
      throw e;
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  };
  // Event handlers may ignore the returned promise; errors are displayed here while chained handlers can detect failure.
  const safeMutate: Mutate = (path, data) => {
    const result = mutate(path, data);
    void result.catch(() => {});
    return result;
  };
  return (
    <>
      {!!error && <Text style={s.error}>{error}</Text>}
      {!management ? (
        <Button
          title="Load management tools"
          disabled={busy}
          onPress={() =>
            void refresh().catch((e) => {
              setError(e.message);
              onError(e);
            })
          }
        />
      ) : (
        <>
          {page !== "Menu" && (
            <Button
              title="Back to account menu"
              secondary
              disabled={busy}
              onPress={() =>
                Alert.alert(
                  "Leave this screen?",
                  "Any unsaved edits will be discarded.",
                  [
                    { text: "Keep editing", style: "cancel" },
                    { text: "Leave", onPress: () => setPage("Menu") },
                  ],
                )
              }
            />
          )}
          {page === "Menu" && (
            <Card>
              <Text style={s.title}>Workspace management</Text>
              {[
                "Company profile",
                "Invoice design",
                "Financial overview",
                workspace.user.role === "SUPERADMIN" ? "Accounts" : "Team",
                ...(workspace.user.role === "SUPERADMIN"
                  ? ["Platform", "Activity"]
                  : []),
              ].map((title) => (
                <Button
                  key={title}
                  title={title}
                  secondary
                  onPress={() => {
                    setDesign(
                      workspace.company.invoiceDesign ?? DEFAULT_INVOICE_DESIGN,
                    );
                    setPage(title);
                    void refresh().catch((e) => setError(e.message));
                  }}
                />
              ))}
            </Card>
          )}
          {page === "Company profile" && (
            <CompanySettings
              workspace={workspace}
              session={session}
              mutate={safeMutate}
              busy={busy}
              storageReady={management.storageReady}
            />
          )}
          {page === "Invoice design" && (
            <>
              <DesignPicker value={design} onChange={setDesign} />
              <Button
                title="Save default invoice design"
                disabled={busy}
                onPress={() => void safeMutate("settings/appearance", design)}
              />
            </>
          )}
          {page === "Financial overview" && (
            <FinancialSettings
              workspace={workspace}
              mutate={safeMutate}
              busy={busy}
            />
          )}
          {(page === "Team" || page === "Accounts") && (
            <Accounts
              management={management}
              workspace={workspace}
              mutate={safeMutate}
              busy={busy}
            />
          )}
          {page === "Platform" && (
            <Platform
              management={management}
              workspace={workspace}
              session={session}
              mutate={safeMutate}
              busy={busy}
            />
          )}
          {page === "Activity" && <ActivityHistory session={session} />}
        </>
      )}
    </>
  );
}
