# Adwiyati | أدويتي

**Your medicine speaks your language.**
Prescription labels in the language each Hajj or Umrah guest reads, checked by the pharmacist before printing.

MEDATHON 2026 · Team **MED-JK2FR6** · Track 2: Healthcare Digital Transformation
Live MVP: <https://adwiyati.com> · Contact: adwiyatii@gmail.com

> This repository is shared with the MEDATHON 2026 judging committee for evaluation. See [LICENSE](LICENSE).
>
> Software copyright registered with the Saudi Authority for Intellectual Property (SAIP), registration No. **26-12-101400831** (25 Aug 2026).

## What it does

| | Feature | Status |
|---|---|---|
| 1 | Label in the guest's language (15 languages, own scripts, RTL and LTR), with the same instruction in English and dose-time pictures | Built |
| 2 | Reviewed instruction catalogue: fixed phrases only, no free text, no machine translation at the counter | Built |
| 3 | Pharmacist safety gate: nothing prints until the pharmacist confirms against the prescription | Built |
| 4 | Doctor-to-pharmacist orders: prescriber sends, pharmacist queue (New / Contact Dr / Completed), query back to the doctor | Built |
| 5 | Label sizes for real thermal printers (100 × 50 mm side-panel, 90 × 60, 60 × 40, others, A4) | Built |
| 6 | Bag label with QR and a random code: the guest is identified by that code only, no ID number is asked for | Built |
| 7 | Guest medicine page: dose, missed dose, warnings, official leaflet link, ask the pharmacist, refill request, email reminders with consent | Built |
| 8 | How-to films: five films produced; the insulin-pen film is live with subtitles in 9 languages (Arabic, English, Urdu, Bengali, Hindi, Indonesian, Malay, Filipino, Turkish) and an Arabic sign-language edition | Built |
| 9 | Built-in research tools: reading check, concealed randomisation, questionnaire, automatic scoring | Built |
| 10 | Public website in 15 languages | Built |
| 11 | Mobile reminder app | In development, not in this repository |

"Built" means working in the MVP and functionally tested. **Comprehension by pilgrims has not been measured yet**; a pilot and a randomised trial are planned (see the Filter 2 presentation).

## Repository layout

```
site/                     the deployed web app (static files, no build step)
  home.html               public landing page
  pharmacies.html         public page for pharmacies
  languages.html          public page: the 15 languages
  about.html              public page: vision, mission, values
  login.html              sign-in chooser (staff / guest)
  index.html              staff workspace: prescriber form, pharmacist queue, label engine
  patient.html            guest medicine page (opened by QR / code)
  study.html              research module (questionnaire, randomisation)
  stop.html               one-tap "stop reminders" page
  i18n/                   public-site translations (i18n.js + one JSON per language)
  netlify.toml            security headers, noindex rules, redirects
tests/
  label-regression/       renders 16 reference labels and compares them with approved images
  public-pages/           opens 5 pages × 15 languages × 3 widths; fails on errors or overflow
docs/
  ARCHITECTURE.md         how the parts fit together
  SECURITY.md             privacy and access model
  TESTING.md              what was tested, results, and what was not
```

The how-to films are part of the live platform (served from `site/films/`). Only the video files themselves (about 125 MB) are left out of this repository because of their size; the player code is in `site/patient.html`.

## Run it locally

No build step. Serve the `site/` folder with any static server:

```bash
cd site
python3 -m http.server 8080
# open http://localhost:8080/home.html
```

The staff workspace and guest page talk to the project's Supabase back end and need an account or a prescription code. A demonstration can be arranged for the judges on request.

## Run the tests

```bash
npm i playwright && npx playwright install chromium
node tests/label-regression/run.js     # expected: 16 compared · 16 identical
node tests/public-pages/run.js         # expected: 225 page checks · 0 problems
```

## Technology

HTML, CSS and JavaScript (no framework, no build) · Supabase (PostgreSQL, row-level security, role-based access) · Netlify hosting · HTML canvas label renderer (PDF / PNG) · QR codes · Brevo transactional email · Playwright tests.

AI assistance (disclosed): Claude and translation apps supported coding and first-draft translation. No AI or machine translation runs when a label is dispensed.

## Team

Fayez Thayer Alharbi (team leader) · Majed Mohammed Aljohani · Faisal Mohammed Alsaedi · Abdulaziz Yahya Al-Hawsa
