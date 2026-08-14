# CGV10 Public Portal UX Refactor Plan

## Status and scope

**Current pass:** Pass 1 — audit only. No production public UI is changed by this plan.

This is a staged UI/UX refactor of the public resident experience. It is not a rebuild. It must preserve existing Next.js App Router routes, Supabase integrations, authentication, RLS/RPC behavior, private attachment handling, resident gates, and all `/admin/*` and `/admin-preview/*` functionality.

### Authoritative references reviewed

1. `references/cgv10-public-hybrid-reference.png` — visual language and public desktop/mobile composition.
2. `references/cgv10-mobile-ux-template-v1.html` — task order, mobile screen hierarchy, semantic color roles, and navigation model.
3. `ChatGPT Image Aug 12, 2026, 04_01_10 PM.png` — duplicate visual reference of the approved public hybrid direction.
4. `ChatGPT Image Aug 12, 2026, 03_42_42 PM.png` — system-level reference for public/app hierarchy and downstream mobile flows.

## Product and design conclusion

CGV10 should be a **civic/community utility**, with premium editorial restraint. The system is approximately **70% serious/corporate and 30% warm/community-charming**.

The visual references agree on these principles:

- A resident must understand the page title/context, the most important current item, and the primary action in the first viewport.
- Forest green is structural: navigation, primary actions, high-trust information blocks.
- Warm cream is the page field; ivory/white surfaces organize information without turning every section into a heavy card.
- Muted gold is selective emphasis, never a default fill or repeated decorative badge.
- Status colors carry meaning: mint = verified/lunas/success; amber = waiting/review; red = urgent/error/overdue; blue-gray = neutral information.
- Public desktop is a conventional, calm website. It must not look like an operational sidebar dashboard.
- Mobile is deliberately task-first: compact header, clear page context, persistent five-item bottom navigation, and one visually-emphasized Layanan action.

## UX standard for every public screen

Within approximately five seconds, the resident should know:

1. **Where am I?** Page title and a concise contextual label.
2. **What matters now?** One timely announcement, payment state, service state, or catalog context.
3. **What can I do?** One primary contextual action and no more than 2–3 secondary actions.
4. **Who handles it?** A responsible role/bidang when an action requires follow-up.
5. **What happens next?** A short status path, confirmation, or expected result.

## Audit findings

### Current reusable presentation foundation

| Existing file | Role today | Pass 2 decision |
|---|---|---|
| `app/globals.css` | Existing CSS variables and motion/accessibility baseline | Extend into semantic public tokens; keep the reduced-motion baseline. |
| `app/components/portal.tsx` | Shared SVG icons, `PageShell`, header, footer, page/section primitives | Split/refactor into shared public shell, desktop header, mobile header/bottom nav, and smaller primitives without changing route contracts. |
| `app/components/active-nav-link.tsx` | Route-aware navigation state | Reuse for redesigned desktop and bottom navigation states. |
| `app/components/auth-aware-action.tsx` | Auth-aware public CTA labels/targets | Preserve behavior; only pass redesigned presentation classes/labels. |
| `app/components/file-capture-field.tsx` | Attachment capture/optimization | Preserve unchanged; only surround it with new layout and labels. |
| `app/components/hero-image-rotator.tsx` | Home visual rotation | Retain only if a compact hero needs it; prevent it from causing a tall/competing homepage hero. |
| `lib/portal-data.ts` | Public static content, finance totals, activities, categories, listings | Preserve data models; derive presentational subsets close to the route where useful. |

### Public routes and current risks

| Route | Current implementation | UX opportunity | Functional boundary |
|---|---|---|---|
| `/` | Long visual hero plus repeated discovery blocks | Reorder into compact hero, current notice, access, civic/news/agenda/PALUGADA/finance sequence; substantially reduce vertical repetition | Static public data and existing links remain intact. |
| `/layanan` | Large marketing hero plus authenticated gate/form | Begin with category selection and progressive disclosure; visibly show responsible PIC and `Dikirim → Ditinjau → Diproses` | Do not alter `ServiceRequestGate`, `submit_service_request`, storage upload, or attachment metadata writes. |
| `/keuangan` | Public report is encountered before the resident’s payment action | Put tagihan/status then confirmation then history before public transparency | Do not alter `DuesConfirmationGate`, `submit_dues_confirmation`, proof upload, or attachment metadata writes. |
| `/palugada` | Catalog already has live listing and attachment behavior | Keep search/category/listings immediately visible; avoid duplicated search/hero controls and make card metadata scan-first | Do not alter listing query, signed URLs, gates, moderation, registration, or submission security. |
| `/kabar-warga` | Multiple publishing/list components | Consolidate around one lead story, compact recent list, compact documentation and clear metadata | Keep article routing/filter/live data behavior intact. |
| `/portal` and `/portal/profil-rumah` | Current “portal” language includes technical/prototype wording and an admin shortcut | Rename resident-facing language toward “Akun Saya” / “Rumah Saya”; make authenticated status/action information clear | Keep `get_my_dues_recap`, auth checks, and access separation. Remove no protected/admin functionality without explicit approval. |
| `/masuk` | Public wrapper around resident login/registration | Condense explanatory marketing material and use natural resident language | Do not change session, sign-in, sign-up, role check, or `submit_resident_registration_request`. |

### Functionality explicitly protected

The following files/functions must be treated as behavior-preserving implementation boundaries:

| Area | Protected implementation |
|---|---|
| Service submission | `app/layanan/service-request-gate.tsx`, `app/layanan/service-request-form.tsx`, RPC `submit_service_request`, service attachment bucket and `attachments` write. |
| Dues confirmation | `app/keuangan/dues-confirmation-gate.tsx`, `app/keuangan/dues-confirmation-form.tsx`, RPC `submit_dues_confirmation`, proof bucket and `attachments` write. |
| PALUGADA submission/moderation | `app/palugada/daftar/*`, RPC `submit_palugada_listing`, private upload flow, `attachments`, `/admin/palugada/*`. |
| PALUGADA public data | `app/palugada/palugada-catalog.tsx`, `app/palugada/[slug]/live-palugada-detail.tsx`, listing queries and signed URLs. |
| Resident access | `app/masuk/masuk-warga-client.tsx`, role lookup, session checks, RPC `submit_resident_registration_request`. |
| Resident dues | `app/portal/profil-rumah/personal-dues-recap.tsx`, RPC `get_my_dues_recap`. |
| Administrative surfaces | All `/admin/*` and `/admin-preview/*` routes and their components. |

## Design foundation proposed for Pass 2

### Semantic tokens

| Token family | Intended role | Candidate value |
|---|---|---|
| `--cgv-forest` | Primary structure, primary CTA, active navigation | `#084C3D` |
| `--cgv-forest-hover` | Pressed/hover primary state | `#063D31` |
| `--cgv-cream` | Page background | `#F6F1E7` |
| `--cgv-ivory` | Primary surface | `#FFFDF8` |
| `--cgv-line` | Quiet but visible divider/border | `#DFD7C8` |
| `--cgv-ink` | High-contrast text | `#173129` |
| `--cgv-muted` | Supporting text | `#68776F` |
| `--cgv-gold` | Active/important restrained accent | `#D3A62E` |
| `--cgv-mint` | Success, verified, lunas | `#DDF3E9` |
| `--cgv-amber` | Pending/review | `#FFF0C7` |
| `--cgv-danger` | Error/overdue/urgent only | `#FBE3DF` |
| `--cgv-info` | Neutral informational state | blue-gray token chosen to meet contrast requirements |

Implementation rule: use semantic tokens, never scattered raw colors in route components. Existing brand values will be mapped deliberately during Pass 2 rather than replaced blindly.

### Type, spacing, and components

- Sans-serif remains default for UI, forms, status, tables/numbers, buttons, and navigation.
- A serif display face may be introduced only for public/editorial headlines after checking local/font-loading implications; it must not be used in operational UI.
- Use a 4/8px rhythm with intentional density: compact 8/12/16px component spacing, 24/32px section spacing on mobile, and 32/48px on desktop where needed.
- Standardize button hierarchy: primary forest fill, secondary ivory with visible forest/line border, tertiary text/link. Minimum touch target 44px.
- Standardize status badge variants using semantic state tokens, not decorative pills.
- Standardize cards into only three roles: utility tile, content card, and data/status row. Not every section receives a card background.

### Responsive navigation

**Mobile (under 768px):** compact header with CGV10 identity + page context + only necessary utility controls. Persistent bottom navigation: Beranda, Kabar, emphasized Layanan, PALUGADA, Akun. It must reserve safe content padding so it never obscures forms or lists.

**Desktop (768px and above):** standard top navigation: Beranda, Layanan, Kabar, PALUGADA, Iuran & Keuangan, Pengurus, and Masuk Warga/Akun. No public homepage sidebar. Account destination changes based on auth state without exposing internal terminology.

## Route-by-route implementation plan

### Pass 2 — design foundation (before route refactors)

1. Extend `app/globals.css` with semantic tokens, spacing/shadow/radius conventions, and public utility styles.
2. Refactor `app/components/portal.tsx` into reusable public primitives while preserving existing exports or updating imports atomically:
   - `PublicShell`
   - `PublicHeader`
   - `MobileBottomNav`
   - `PageContext`
   - `PrimaryButton` / `SecondaryButton` presentation wrappers where practical
   - `StatusBadge`
   - `QuickActionGrid`
3. Keep `AuthAwareAction` and form/gate logic behavior unchanged; only restyle inputs at callers.
4. Verify navigation at 375, 390, 768, 1024, and 1440px before starting route work.

### Pass 3.1 — homepage (`/`)

Target information order:

1. Compact premium identity hero with neighborhood imagery; CTA `Akses Layanan`, secondary `Lihat Kabar`.
2. Compact resident/civic overview (not large KPI dashboard cards).
3. One current important announcement.
4. Akses Cepat: Layanan, Iuran & Keuangan, PALUGADA, Kabar; only useful secondaries.
5. Kabar Warga: one featured item + compact recent content.
6. Agenda Mendatang: chronological compact list.
7. One PALUGADA visual feature that links to catalog.
8. Public-safe finance summary.
9. Community trust cue/Pengurus when data is meaningful.
10. Compact footer.

Acceptance: no repeated newsroom, no tall hero, no equal-weight decorative cards, maximum two above-the-fold hero actions.

### Pass 3.2 — Layanan (`/layanan`)

1. Start with `Apa yang ingin Anda laporkan?`.
2. Present category selection: Keamanan, Kebersihan, Fasilitas, Sosial, Lainnya.
3. After selection, reveal responsible bidang/PIC and only the fields relevant to that category where safely mappable to current request types.
4. Keep attachment field and one primary submit action.
5. Persist a visible flow explanation: `Dikirim → Ditinjau → Diproses`.

Compatibility check before editing: map the new five visual categories to the existing request type/category submission values. Do not change submitted data values or RPC parameters unless separately approved.

### Pass 3.3 — Iuran & Keuangan (`/keuangan`)

1. First viewport is resident task state: payment status, amount, one `Konfirmasi Pembayaran` primary action, one `Riwayat` secondary action.
2. Then public transparency and detailed reporting.
3. Use a clear public/private boundary: personal payment evidence/history stays behind the existing gate; public finance stays public-safe.

### Pass 3.4 — PALUGADA (`/palugada`)

1. Search first, then horizontally scannable categories.
2. Keep approved listings visible without an extra click.
3. Each listing exposes image, name, start price, category, cluster/location, and direct detail route.
4. Keep one quieter path to `Daftar lapak`; do not duplicate search controls.

### Pass 3.5 — Kabar Warga (`/kabar-warga`)

1. One Kabar Utama with category/date metadata.
2. Compact newest list and documentation stream.
3. Keep current filter and article navigation behavior while removing repeated page sections and decorative statistics.

### Pass 3.6 — Akun/resident entry (`/portal`, `/portal/profil-rumah`, `/masuk`)

1. Adopt resident language: `Akun Saya`, `Rumah Saya`, `Masuk Warga`, `Iuran & Keuangan`.
2. Make signed-in/signed-out status and the next useful action explicit.
3. Do not present developer/implementation terms to residents.
4. Preserve admin shortcut behavior until its intended audience and access gate are separately confirmed; move it out of the resident’s primary visual path if necessary.

## Verification protocol after each route

1. Confirm all existing links, client components, gates, form names, inputs, upload fields, and submit handlers remain present and callable.
2. Manually inspect 375px, 390px, 768px, 1024px, and 1440px. Check no horizontal scrolling and no content hidden behind the mobile bottom nav.
3. Check keyboard focus, color contrast, textual status alongside semantic color, and 44px touch targets.
4. Run `npm.cmd run lint` after each route.
5. Run `npm.cmd run build` after the critical public-path set is complete.
6. Start localhost only for manual inspection; do not deploy and do not push.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| A visual category changes a service payload accidentally | Keep a data mapping layer in the presentational component and regression-test current payload values. |
| New mobile shell obscures form submit actions | Add bottom safe-area padding at every public route and form. |
| Public data is confused with private resident data | Keep current gates/queries in place; mark public vs. personal sections in the design. |
| Reusable shell changes affect admin pages | Scope new shell to public routes; do not alter `app/admin/layout.tsx`. |
| Image-rich reference creates slow mobile pages | Use existing optimized assets and `next/image`; reserve dimensions. |
| Serif choice causes font-loading failure | Prefer existing/system font fallback first; introduce only after build/runtime validation. |

## Pass 1 completion checklist

- [x] Project structure and public route components inspected.
- [x] Auth, RPC, storage, and private-data boundaries identified.
- [x] Authoritative image and HTML references reviewed.
- [x] Reusable component candidates and duplication risks identified.
- [x] No production UI changed during this pass.
- [x] No Git push and no deployment triggered.

