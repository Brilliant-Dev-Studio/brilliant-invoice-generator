import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { platformTranslate } from "../src/lib/platform-language.ts";
import { landingLocale } from "../src/lib/landing-language.ts";

test("language cookie accepts supported locales and defaults safely", () => {
  assert.equal(landingLocale("my"), "my");
  assert.equal(landingLocale("en"), "en");
  assert.equal(landingLocale("unknown"), "en");
  assert.equal(landingLocale(), "en");
});

test("platform translations reuse the public site's dictionary", () => {
  assert.equal(platformTranslate("en", "Invoices"), "Invoices");
  assert.equal(platformTranslate("my", "Invoices"), "ပြေစာများ");
  assert.notEqual(platformTranslate("my", "1 MONTH PLAN"), "1 MONTH PLAN");
  assert.equal(
    platformTranslate("my", "Unknown future message"),
    "Unknown future message",
  );
});

test("translated sentences interpolate values without translating or reinterpreting user content", () => {
  const name = "Clients {percentage} <Studio>";
  assert.equal(
    platformTranslate("en", "Plan for {name}", { name }),
    `Plan for ${name}`,
  );
  assert.equal(
    platformTranslate("my", "Plan for {name}", { name }),
    `${name} အတွက် အစီအစဉ်`,
  );
  assert.match(
    platformTranslate("my", "{percentage}% of issued value collected", {
      percentage: 0,
    }),
    /0%/,
  );
  assert.equal(platformTranslate("en", "Missing {value}"), "Missing {value}");
});

test("static platform translation keys have Myanmar coverage", () => {
  const exceptions = new Set([
    "Brilliant home",
    "Brilliant Invoice Generator",
    "you@company.com",
    "+959123456789",
    "email",
    "1",
    "USD",
    "MMK",
    "THB",
  ]);
  const missing = new Set<string>();
  function scan(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        scan(path);
        continue;
      }
      if (!path.endsWith(".tsx")) continue;
      const source = ts.createSourceFile(
        path,
        readFileSync(path, "utf8"),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      function visit(node: ts.Node) {
        let key: string | undefined;
        if (
          ts.isJsxAttribute(node) &&
          node.name.getText(source) === "text" &&
          node.initializer &&
          ts.isStringLiteral(node.initializer)
        )
          key = node.initializer.text;
        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === "t" &&
          node.arguments[0] &&
          ts.isStringLiteral(node.arguments[0])
        )
          key = node.arguments[0].text;
        if (key && !exceptions.has(key) && platformTranslate("my", key) === key)
          missing.add(key);
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
  }
  for (const directory of [
    "src/components",
    "src/app/dashboard",
    "src/app/superadmin",
    "src/app/login",
  ])
    scan(directory);
  assert.deepEqual([...missing].sort(), []);
});
