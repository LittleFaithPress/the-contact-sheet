/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Baseline security headers, added after a security review.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Stops the browser from guessing a file's type and running it as
          // something it's not (e.g. treating an uploaded/linked file as
          // executable script).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Stops this site from being loaded inside a frame/iframe on
          // another site -- the standard defense against clickjacking.
          { key: "X-Frame-Options", value: "DENY" },
          // Don't leak the full URL a visitor came from (which can contain
          // thread titles, etc.) to a third-party site they click out to.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // This site doesn't use the camera, microphone, or location --
          // explicitly say so, so an embedded/compromised third-party
          // script couldn't request them either.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Tell browsers to only ever reach this site over HTTPS, for a
          // year, including subdomains. Vercel serves everything over HTTPS
          // already; this makes that a browser-enforced guarantee.
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Content-Security-Policy: tells the browser which sources of
          // scripts/styles/images/etc. are allowed to load on this site at
          // all -- the strongest available browser-side defense against
          // injected-script (XSS) attacks, because even if malicious HTML
          // ever did get onto a page, the browser would refuse to run or
          // load anything outside this list.
          //
          // 'unsafe-inline' is kept for script-src/style-src deliberately,
          // not as an oversight: Next.js's own hydration data is an inline
          // <script> tag on every page, so blocking all inline scripts would
          // break the site itself. The stronger version of this header uses
          // a per-request random "nonce" instead of 'unsafe-inline' -- but
          // that requires a Next.js version newer than this project can
          // safely move to right now (see the audit report: the nonce-based
          // approach has its own unpatched vulnerability on every current
          // Next.js 13-15 release as of this review). 'unsafe-inline' is the
          // correct, safer choice until that's fixed upstream.
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
