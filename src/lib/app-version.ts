import packageJson from "../../package.json";

/** Client-visible release — bump `version` in package.json when you ship updates. */
export const APP_VERSION = packageJson.version;

export const APP_DISPLAY_VERSION = `v${APP_VERSION}`;
