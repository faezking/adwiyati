# Architecture

```
 Doctor (prescriber account)            Pharmacist (pharmacist account)
        │  order: medicine, directions,          │  queue: New / Contact Dr / Completed
        │  guest's reading language              │  check against prescription → print
        ▼                                        ▼
   ┌───────────────────────── site/index.html ─────────────────────────┐
   │  directions form (searchable lists) · label engine (canvas → PDF) │
   └───────────────────────────────┬───────────────────────────────────┘
                                   │ HTTPS (Supabase REST + RPC)
                     ┌─────────────▼──────────────┐
                     │  Supabase · PostgreSQL     │
                     │  row-level security on     │
                     │  every table               │
                     └─────────────┬──────────────┘
                                   │ RPC with the code printed on the bag
                     ┌─────────────▼──────────────┐
                     │  site/patient.html         │  dose · missed dose · warnings ·
                     │  guest medicine page       │  films · ask · refill · reminders
                     └────────────────────────────┘
```

## Front end

Static files, no framework and no build step. Each page is self-contained so a pharmacy can open it on any computer or tablet.

- **Label engine** (`index.html`, `renderLabelCanvas`, `renderBagCanvas`): draws the label on an HTML canvas at the exact size of the roll, with a fixed type size. Labels of 95 mm or wider get a ruled side panel for advice. Output is PDF or PNG.
- **Instruction catalogue**: every sentence on a label is assembled from a reviewed phrase dictionary (`phrases` table, one versioned JSON document; a copy ships inside the page so printing does not depend on a second request). Nothing typed by staff is printed untranslated. An instruction that is not in the catalogue prints only "use as directed by your doctor".
- **Safety gate**: the print button stays locked until the pharmacist ticks "checked against the prescription".
- **Roles**: `prescriber`, `pharmacist`, `both`, `translator`, `assessor` (blinded study outcome assessor). The page hides what a role may not use; the database enforces it.
- **Public site i18n** (`i18n/i18n.js`): 15 languages. The page keeps its Arabic layout in every language; only the text direction of each element changes, so nothing moves when the language is switched.

## Back end (Supabase)

30 tables, all with row-level security enabled and no table privileges for the anonymous role. Guests never read tables directly: the guest page calls security-definer functions that take the code printed on the bag.

| Area | Tables |
|---|---|
| Dispensing | `orders`, `patients`, `profiles`, `active_sessions`, `audit_log` |
| Catalogue | `phrases`, `phrases_backup`, `drug_leaflets`, `sfda_products`, `refill_class` |
| Guest services | `patient_questions`, `refill_requests`, `reminders`, `reminder_optins`, `reminder_policy`, `reminder_times`, `outbox`, `patient_otp`, `access_attempts` |
| Research module | `study_sessions`, `study_sessions_v5`, `study_alloc`, `study_kiosks`, `study_kiosk_codes`, `study_page_opens`, `comprehension`, `comprehension_record` |
| Translation review | `review_links`, `review_answers` |
| Server-side secrets | `app_secrets` (never readable from the browser) |

Main functions called from the pages: `get_prescription`, `ask_pharmacist`, `request_refill`, `my_reminders`, `set_my_reminders`, `email_my_page` (guest page); `study_get`, `study_answer`, `study_randomise`, `study_export` (research module); `audit` (staff actions).

Schema changes are applied only as named migrations.

## Order life cycle

`new` (sent by the prescriber) → `flagged` (pharmacist asks the doctor, with a reason; the doctor replies or corrects) → `done` (label printed; who created and who completed are recorded). The queue refreshes every 15 seconds so several devices stay in step.
