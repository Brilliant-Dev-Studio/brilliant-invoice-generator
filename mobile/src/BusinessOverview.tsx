import React, { useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import type { Currency, Invoice } from "../../src/lib/types";
import { dashboardInsights } from "../../src/lib/dashboard-insights";
import { money, statusOf } from "../../src/lib/money";
import type { Workspace } from "./api";
import { Button, Card, Chips, colors, Copy, s } from "./ui";
import { Icon } from "./Icons";

export function BusinessOverview({
  workspace,
  currency,
  onCurrency,
  onCreate,
  onInvoice,
  busy,
}: {
  workspace: Workspace;
  currency: Currency;
  onCurrency(value: Currency): void;
  onCreate(): void;
  onInvoice(id: string): void;
  busy: boolean;
}) {
  const wide = useWindowDimensions().width >= 900;
  const [period, setPeriod] = useState("6 months");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const data = dashboardInsights(workspace.invoices, currency, workspace.today);
  const overview = workspace.overview?.[currency];
  const series = period === "3 months" ? data.series.slice(-3) : data.series;
  const selected =
    series.find((point) => point.key === selectedMonth) || series.at(-1)!;
  const maximum = Math.max(...series.map((point) => point.total), 1);
  const current = data.series.at(-1)?.total || 0;
  const previous = data.series.at(-2)?.total || 0;
  const delta = previous
    ? Math.round(((current - previous) / previous) * 100)
    : null;
  const stats = [
    {
      label: "Monthly revenue",
      value: money(overview?.revenue ?? current, currency),
      note: overview?.manualRevenue
        ? "Manual total"
        : `${workspace.today.slice(0, 7)} · Paid invoices`,
      icon: "chart.line.uptrend.xyaxis",
    },
    {
      label: "Outstanding balance",
      value: money(overview?.outstanding ?? data.outstanding, currency),
      note: overview?.manualOutstanding
        ? "Manual total"
        : `${data.overdue.length} overdue invoices`,
      icon: "clock",
    },
    {
      label: "Invoices generated",
      value: String(overview?.count ?? workspace.invoices.length).padStart(
        2,
        "0",
      ),
      note: overview?.manualCount
        ? "Manual total"
        : "All currencies · Includes drafts",
      icon: "doc.text",
    },
  ];
  function row(invoice: Invoice) {
    return (
      <Pressable
        key={invoice.id}
        accessibilityRole="button"
        accessibilityLabel={`Open ${invoice.number}`}
        onPress={() => onInvoice(invoice.id)}
        style={({ pressed }) => ({
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderColor: colors.line,
          gap: 7,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <View style={s.row}>
          <Text style={[s.title, { flex: 1 }]} numberOfLines={1}>
            {invoice.client.name}
          </Text>
          <Text style={{ color: colors.ink, fontWeight: "700", fontSize: 15 }}>
            {money(invoice.totals.total, invoice.currency)}
          </Text>
        </View>
        <View style={s.row}>
          <Copy>{invoice.number}</Copy>
          <Text
            style={[
              s.badge,
              {
                color:
                  statusOf(invoice, workspace.today) === "OVERDUE"
                    ? colors.danger
                    : colors.muted,
              },
            ]}
          >
            {statusOf(invoice, workspace.today)}
          </Text>
        </View>
      </Pressable>
    );
  }
  return (
    <>
      <View
        style={{
          flexDirection: wide ? "row" : "column",
          justifyContent: "space-between",
          gap: 20,
          alignItems: wide ? "center" : "stretch",
        }}
      >
        <View style={{ gap: 8 }}>
          <Text style={s.badge}>YOUR BUSINESS, IN FOCUS</Text>
          <Text
            style={[
              s.heading,
              { fontSize: wide ? 40 : 32, lineHeight: wide ? 48 : 39 },
            ]}
          >
            Welcome back,{"\n"}
            {workspace.user.name.split(" ")[0]}.
          </Text>
          <Copy>
            {workspace.company.name} · {workspace.today}
          </Copy>
        </View>
        <Button title="Create invoice" onPress={onCreate} disabled={busy} />
      </View>
      <View style={[s.row, { flexWrap: "wrap" }]}>
        <Text style={s.title}>Financial overview</Text>
        <Chips<Currency>
          values={["MMK", "USD", "THB"]}
          value={currency}
          onChange={(value) => {
            onCurrency(value);
            setSelectedMonth(null);
          }}
        />
      </View>
      <View style={{ flexDirection: wide ? "row" : "column", gap: 14 }}>
        {stats.map((stat, index) => (
          <View
            key={stat.label}
            style={{
              flex: wide ? 1 : undefined,
              padding: 22,
              borderRadius: 22,
              backgroundColor: index === 0 ? colors.green : colors.surface,
              borderWidth: 1,
              borderColor: index === 0 ? colors.green : colors.line,
              gap: 14,
              overflow: "hidden",
            }}
          >
            <View style={s.row}>
              <Text
                style={{
                  fontSize: 14,
                  flex: 1,
                  fontWeight: "600",
                  color: index === 0 ? "#FAEADD" : colors.muted,
                }}
              >
                {stat.label}
              </Text>
              <View
                style={{
                  backgroundColor: "#FAF5EA",
                  borderRadius: 12,
                  padding: 8,
                }}
              >
                <Icon name={stat.icon} />
              </View>
            </View>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              numberOfLines={1}
              style={[
                s.amount,
                {
                  fontSize: wide ? 27 : 32,
                  color: index === 0 ? colors.white : colors.ink,
                },
              ]}
            >
              {stat.value}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: index === 0 ? "#FAEADD" : colors.muted,
              }}
            >
              {stat.note}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: wide ? "row" : "column", gap: 16 }}>
        <View style={{ flex: wide ? 1.65 : undefined }}>
          <Card>
            <View style={[s.row, { flexWrap: "wrap" }]}>
              <View style={{ gap: 5 }}>
                <Text style={s.title}>Revenue rhythm</Text>
                <Copy>Actual payments · {currency}</Copy>
              </View>
              <Chips
                values={["3 months", "6 months"]}
                value={period}
                onChange={(value) => {
                  setPeriod(value);
                  setSelectedMonth(null);
                }}
              />
            </View>
            <View style={{ gap: 4, paddingTop: 8 }}>
              <Text style={s.amount}>{money(selected.total, currency)}</Text>
              <Copy>
                {selected.key}
                {selected.key === data.series.at(-1)?.key && delta !== null
                  ? ` · ${delta >= 0 ? "+" : ""}${delta}% vs last month`
                  : ""}
              </Copy>
            </View>
            <View style={{ height: 220, marginTop: 12 }}>
              {[0, 0.5, 1].map((ratio) => (
                <View
                  key={ratio}
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: ratio * 170,
                    borderTopWidth: 1,
                    borderStyle: "dashed",
                    borderColor: colors.line,
                  }}
                />
              ))}
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  height: 220,
                  paddingHorizontal: 8,
                }}
              >
                {series.map((point) => (
                  <Pressable
                    key={point.key}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: selected.key === point.key,
                    }}
                    accessibilityLabel={`${point.label}, ${money(point.total, currency)}`}
                    onPress={() => setSelectedMonth(point.key)}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        maxWidth: 48,
                        height: 180,
                        justifyContent: "flex-end",
                        paddingBottom: 4,
                      }}
                    >
                      <View
                        style={{
                          height: point.total
                            ? Math.max(8, (point.total / maximum) * 170)
                            : 3,
                          backgroundColor:
                            selected.key === point.key
                              ? colors.green
                              : "#D7B5A4",
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8,
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        height: 26,
                        fontSize: 12,
                        color:
                          selected.key === point.key
                            ? colors.green
                            : colors.muted,
                        fontWeight: selected.key === point.key ? "700" : "400",
                      }}
                    >
                      {point.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <Copy>
              {data.collected === 0
                ? "Your first recorded payment will start this chart."
                : "Tap a month to inspect its revenue. Manual dashboard totals do not change this chart."}
            </Copy>
          </Card>
        </View>
        <View style={{ flex: wide ? 1 : undefined, gap: 16 }}>
          <Card>
            <Text style={s.title}>Payment health</Text>
            <Text style={[s.amount, { fontSize: 48 }]}>
              {data.percentage}
              <Text style={{ fontSize: 24 }}>%</Text>
            </Text>
            <Copy>of issued value collected</Copy>
            <View
              accessibilityLabel={`${data.percentage} percent collected`}
              style={{
                height: 14,
                borderRadius: 8,
                backgroundColor: colors.soft,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${data.percentage}%`,
                  height: 14,
                  borderRadius: 8,
                  backgroundColor: "#55785E",
                }}
              />
            </View>
            <View style={s.row}>
              <Copy>Collected</Copy>
              <Text style={s.label}>{money(data.paid, currency)}</Text>
            </View>
            <View style={s.row}>
              <Copy>Awaiting payment</Copy>
              <Text style={s.label}>{money(data.outstanding, currency)}</Text>
            </View>
          </Card>
          <View
            style={{
              padding: 20,
              backgroundColor: colors.soft,
              borderRadius: 20,
              gap: 8,
            }}
          >
            <Text style={s.badge}>NEXT GOOD MOVE</Text>
            <Text style={s.title}>
              {data.overdue.length
                ? `${data.overdue.length} overdue invoices`
                : data.drafts.length
                  ? `${data.drafts.length} drafts to finish`
                  : "You're all caught up."}
            </Text>
            <Copy>
              {data.overdue.length
                ? "Open an overdue invoice to review the amount and contact details."
                : "Keep your next project moving with a clear, professional invoice."}
            </Copy>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: wide ? "row" : "column", gap: 16 }}>
        <View style={{ flex: 1 }}>
          <Card>
            <View style={s.row}>
              <Text style={s.title}>Recent invoices</Text>
              <Copy>{workspace.invoices.length} total</Copy>
            </View>
            {workspace.invoices.slice(0, 5).map(row)}
            {!workspace.invoices.length && (
              <Copy>
                No invoices yet. Create your first invoice to start your story.
              </Copy>
            )}
          </Card>
        </View>
        {data.priorities.length > 0 && (
          <View style={{ flex: 1 }}>
            <Card>
              <Text style={s.title}>Needs attention</Text>
              <Copy>Overdue invoices first, then drafts.</Copy>
              {data.priorities.map(row)}
            </Card>
          </View>
        )}
      </View>
    </>
  );
}
