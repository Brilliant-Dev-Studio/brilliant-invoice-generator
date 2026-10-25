#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const apkOut = join(
  root,
  "android/app/build/outputs/apk/debug/app-debug.apk",
);
const publicApk = join(root, "public/downloads/san-pya.apk");

const javaHomeCandidates = [
  process.env.JAVA_HOME,
  "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home",
  "/usr/lib/jvm/java-21-openjdk",
].filter(Boolean);

const env = { ...process.env };
for (const home of javaHomeCandidates) {
  if (home && existsSync(home)) {
    env.JAVA_HOME = home;
    break;
  }
}

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, {
    cwd,
    env,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("npm", ["run", "cap:sync"], root);
run("./gradlew", ["assembleDebug"], join(root, "android"));

if (!existsSync(apkOut)) {
  console.error("APK not found at", apkOut);
  process.exit(1);
}

mkdirSync(dirname(publicApk), { recursive: true });
copyFileSync(apkOut, publicApk);
console.log("Copied to", publicApk);
