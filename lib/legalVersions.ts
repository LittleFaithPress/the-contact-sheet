// Single source of truth for each legal page's version string. Both the
// pages themselves (app/legal/*/page.tsx) and the signup consent record
// (app/actions.ts) import from here, so the version a member is shown and
// the version recorded as what they agreed to can never drift apart by
// someone updating one and forgetting the other.
//
// Bump the relevant constant any time that page's substance changes.

export const TERMS_VERSION = "terms-2026-08-28-v4";
export const PRIVACY_VERSION = "privacy-2026-08-28-v2";
export const RULES_VERSION = "rules-2026-08-28-v1";
export const SECURITY_VERSION = "security-2026-08-28-v2";

// What actually gets recorded when someone checks "I agree" at signup --
// all four versions in one string, so the exact wording they agreed to can
// always be reconstructed later even after the pages themselves change.
export const LEGAL_DOCS_VERSION = [
  TERMS_VERSION,
  PRIVACY_VERSION,
  RULES_VERSION,
  SECURITY_VERSION,
].join("+");

