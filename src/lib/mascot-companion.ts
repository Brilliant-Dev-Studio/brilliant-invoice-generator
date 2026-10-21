export type CompanionStats = {
  total: number;
  issued: number;
  paid: number;
  drafts: number;
};
export type CompanionWeather = { temperature: number; code: number };
export function companionMessages(
  stats: CompanionStats | null,
  hour: number,
  weather: CompanionWeather | null,
) {
  const messages: { text: string; values?: Record<string, string | number> }[] =
    [];
  if (stats?.issued)
    messages.push({
      text: "Your workspace has issued {count} invoices. You're doing a great job!",
      values: { count: stats.issued },
    });
  else if (stats?.drafts)
    messages.push({ text: "Your draft is a great start. One step at a time!" });
  else if (stats)
    messages.push({
      text: "Your first invoice is a fresh start. I'm cheering for you!",
    });
  if (stats?.paid)
    messages.push({
      text: "{count} invoices paid. Your hard work is paying off!",
      values: { count: stats.paid },
    });
  messages.push({
    text:
      hour >= 22 || hour < 5
        ? "A quiet night. Take it gently and remember to rest."
        : hour < 12
          ? "Good morning! A little progress makes a lovely start."
          : hour < 17
            ? "Keep going! Take a breath, a sip of water, and one small step."
            : "You've made it through the day. Be proud of your progress.",
  });
  if (weather) {
    const rainy =
      (weather.code >= 51 && weather.code <= 67) ||
      (weather.code >= 80 && weather.code <= 82) ||
      weather.code >= 95;
    messages.push({
      text: rainy
        ? "Rain outside, cozy work inside. You've got this!"
        : weather.temperature >= 32
          ? "A warm day! Keep some water nearby while we work."
          : weather.temperature < 18
            ? "A cool day. Get cozy and take things one step at a time."
            : weather.code <= 1
              ? "A little sunshine for your next great idea!"
              : "Whatever the weather, a little progress still counts.",
    });
  }
  messages.push({ text: "Fighting! I believe in your next small step." });
  return messages;
}
