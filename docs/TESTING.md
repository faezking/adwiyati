# Testing

## Functional tests (actual results)

| Test | Method | Result | Date |
|---|---|---|---|
| Label catalogue | 380 instruction cases rendered in each of 15 languages | 0 defects; core directions never cut on any label size | 26 Oct 2026 |
| Label regression | `tests/label-regression`: 16 reference labels re-rendered and compared with approved images | 16 of 16 identical | 11 Nov 2026 |
| Public website | `tests/public-pages`: 5 pages × 15 languages × 3 widths | 225 checks, 0 problems | 11 Nov 2026 |
| Website layout | 15 languages × 5 pages × 7 screen widths, compared with the Arabic layout | no element changes side; no overflow, no clipped text | 8 Nov 2026 |
| Wording against official references | 32 label phrases compared with regulator wording (SFDA, EMA QRD, others) | 7 identical, 24 same meaning, 1 grammar error corrected | 8 Nov 2026 |
| Database integrity | every dictionary change compared entry by entry; backup before each change | only intended entries changed | 8 Nov 2026 |
| Access rules | row-level security and grants audited | RLS on 30/30 tables; 0 anonymous table grants | 11 Nov 2026 |
| Random-code identity | dispensing screen checked after removing the ID field (ph8.2); labels re-run | no ID requested; 16 of 16 labels identical | 11 Nov 2026 |
| Bag QR after a study patient | ordinary order printed after the study label switched the bag option off (ph8.3 fix) | bag sticker with QR and code prints again | 12 Nov 2026 |
| Real printing | 100 × 50 mm label on a thermal label printer | printed at true size, readable | 10 Nov 2026 |
| Default label size (ph8.4) | size menu opened on a fresh device | 100 × 50 mm selected first | 13 Nov 2026 |
| 5-digit bag code (ph8.4) | new code generator checked; guest page fed 5 digits, Arabic-Indic digits, an old 8-character code and 4 digits | 5 digits and old codes accepted; 4 digits rejected with a clear message; bag sticker prints the 5-digit code with QR | 13 Nov 2026 |
| Dead code removal (ph8.4) | 7 unused functions and 3 duplicate size tables removed; all scripts re-checked; labels re-run | 0 syntax errors; 16 of 16 labels identical | 13 Nov 2026 |
| Test data before judging | personal fields in test records cleared (private backup kept, no public access) | 0 personal values remain; record counts unchanged | 13 Nov 2026 |
| Code hygiene | syntax check of every inline script; duplicate ids; missing local files; unused CSS and dead scripts on public pages | 0 syntax errors; dead film-player script and unused style rules removed from 5 public pages, layout verified unchanged | 11 Nov 2026 |

## Not yet tested

- Comprehension by pilgrims (primary outcome): planned pilot of about 20 guests, then a randomised trial of 400. No participant enrolled yet.
- Formal sign-off of each language by native-speaker health professionals: in progress.
- Time at a busy counter: "a label in under a minute" is a design target, not a measured result.
- Real-world use of the doctor-to-pharmacist flow, guest page, films and reminders.
- Mobile app: not built.
