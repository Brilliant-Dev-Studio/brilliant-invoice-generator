// Set this to the deployed Next.js origin before distributing a release build.
const productionApiOrigin: string = "";

export const apiOrigin = __DEV__
  ? "http://localhost:3000"
  : productionApiOrigin;
