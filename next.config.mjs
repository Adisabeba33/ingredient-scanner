import { execSync } from "node:child_process";

/**
 * A version string shown in the footer so, after a redeploy, you can confirm
 * the new code is live. It's the short commit SHA:
 *   - On Vercel, VERCEL_GIT_COMMIT_SHA is injected for each deployment.
 *   - Locally, fall back to the current git commit.
 *   - If neither is available, "dev".
 */
function resolveVersion() {
  const fromVercel = process.env.VERCEL_GIT_COMMIT_SHA;
  if (fromVercel) return fromVercel.slice(0, 7);
  try {
    return execSync("git rev-parse --short=7 HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "dev";
  }
}

/** UTC build date (YYYY-MM-DD), inlined alongside the version. */
function buildDate() {
  return new Date().toISOString().slice(0, 10);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: resolveVersion(),
    NEXT_PUBLIC_BUILD_DATE: buildDate(),
  },
};

export default nextConfig;
