Server that serves the static site and can inject GA/AdSense server-side based on a consent cookie.

Usage:

1. Install dependencies:

   npm ci

2. Start server:

   npm run start-server

3. The server listens on port 4173 by default.

How it decides to inject trackers:

- The server reads the cookie `fap_user_consent_v1` if present.
- The cookie should contain a JSON string like: {"analytics":true,"ads":true,"backend":true}
- If `analytics` is true, the server injects GA (gtag) scripts into the delivered HTML.
- If `ads` is true, the server injects the AdSense script.

Notes:
- This is a minimal server for development or for simple Hostinger VPS deployment. For production consider using proper templating, CSP, and secure cookie handling (HttpOnly, Secure, SameSite).
- The client still has placeholders. The server-side injection is an additional option for environments that require server-rendered trackers.
