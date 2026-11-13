# Security and privacy

- **The key in the pages is the public (anon) key.** Supabase is designed for this key to be visible in the browser. It grants nothing by itself: every table has row-level security and the anonymous role has no table privileges. No service-role key, mail key or other secret is in this repository.
- **Secrets** (mail provider key and similar) live only on the server (`app_secrets`, not readable from the browser) and in local `.env` files that are git-ignored.
- **The guest is a random code.** The bag carries a QR (long random access code) and a short 5-digit random code; either is all the guest page asks for. Codes expire 7 days after the course ends; failed attempts are rate-limited and slowed. Older 8-character codes are still accepted. No passport or ID number is asked for, printed or encoded (the ID field was removed from the dispensing screen in ph8.2). An email address is stored only when the guest consents to reminders, and is never printed.
- **Role-based access.** Prescriber, pharmacist, translator and blinded assessor accounts see only what their role needs; the rules are enforced by database policies, not by the page.
- **Audit.** Staff actions on guest records are written to an audit log.
- **Hardening.** Security headers (HSTS, nosniff, frame options, referrer policy) are set in `netlify.toml`; staff, guest and study pages are excluded from search engines.
- **No patient data in this repository.** Test cases and screenshots use sample prescriptions only.

Checked on 11 Nov 2026: row-level security enabled on 30 of 30 tables; anonymous table grants: 0.

To report a problem: adwiyatii@gmail.com
