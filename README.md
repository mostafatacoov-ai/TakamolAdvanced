# تكامل المتقدمة — Takamol Advanced Website

The bilingual (Arabic / English) website of Takamol Advanced, built with
Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS and next-intl,
with a built-in admin area for managing its content, careers and users.

## Run locally

Requires **Node.js 22.13 or newer** (the admin area uses Node's built-in SQLite).

```bash
npm install
npm run dev     # http://localhost:3000   admin: http://localhost:3000/admin
npm run build   # production build
npm start       # serve the production build
```

Locally, the database and uploads are kept in `.data/` (not committed).

## Admin area

Open `/admin`. The first time, it offers to create the first administrator.

- **Texts**: every text on the site, in Arabic and English, with search.
- **Images**: replace any photo on the site; upload new images for pages, jobs and partners.
- **Pages**: build new pages from the site's design sections and publish them at `/{address}`.
- **Menu tabs**: choose, rename, reorder or hide the top menu tabs, or add new ones.
- **Partners**: the logos in the partners strip.
- **Jobs**: positions on the Join page (add, edit, close, reorder, delete).
- **Applications & CVs**: everything sent through the Join page form, with CV download, status and notes.
- **Users / Roles & permissions**: add people and choose what each role can do.
  Built in: *Administrator* (everything), *Site manager* (everything except users and roles),
  *Content manager* (texts, images, pages). Roles other than Administrator can be edited,
  and new roles created.
- **Site settings**: contact emails, phone, WhatsApp, map link, working hours, social links.
- **Activity log**: who changed what and when.

Changes appear on the live site as soon as they're saved.

## Deploy on Hostinger

The site needs a running Node.js server, so deploy it as a **Node.js app**, not
as static files. On Hostinger that means a plan with Node.js app support
(Business or Cloud web hosting) or a VPS.

| Setting | Value |
|---|---|
| Repository / branch | this repository, `main` |
| Framework | Next.js |
| Node.js version | 22.x or 24.x |
| Install command | `npm ci` (or `npm install`) |
| Build command | `npm run build` |
| Start command | `npm start` (listens on the `PORT` the host provides) |

Environment variables:

| Variable | Needed | Purpose |
|---|---|---|
| `ADMIN_SETUP_TOKEN` | to create the first admin | Any long secret phrase. `/admin/setup` asks for it in production; once the first administrator exists, setup is closed for good. |
| `NEXT_PUBLIC_SITE_URL` | optional | The live address (default `https://takamoladvanced.sa`), used in the sitemap, `robots.txt` and link previews. Read at build time. |
| `DATA_DIR` | optional | Where the database and uploaded files live. Defaults to `takamol-data` in the hosting account's home folder, outside the app, so redeploying from Git never touches it. |
| `SERVER_ACTIONS_ORIGINS` | only if saving fails behind a proxy | Comma-separated host names allowed to submit admin forms, e.g. `takamoladvanced.sa,www.takamoladvanced.sa`. |

**Back up the data folder** (`~/takamol-data` by default): it holds the
database (texts edits, pages, jobs, users, applications) and all uploads,
including applicants' CVs. Hostinger's account backups include it.

On a VPS, run the same install/build commands, then keep the server alive with
a process manager (for example `pm2 start npm --name takamol -- start`) behind
Nginx.

## Structure

| Path | Contents |
|---|---|
| `src/app/[locale]/` | Pages. Arabic is the default at `/`; English is under `/en` |
| `src/app/admin/` | The admin area |
| `src/server/` | Database, uploads, sign-in and permissions (server only) |
| `messages/ar.json`, `messages/en.json` | All site text; both files have the same keys |
| `src/components/` | Page sections: `home/`, `about/`, `services/`, `products/`, `join/` |
| `public/assets/` | Images, grouped by page (`about/`, `services/`, `products/`, `partners/`) |
| `public/fonts/` | Brand fonts |

## Pages

| URL | Page |
|---|---|
| `/` | Home |
| `/about` | About Takamol |
| `/services` | Services overview |
| `/services/investment-portfolio`, `/engineering-design`, `/consulting`, `/digital-marketing`, `/real-estate-brokerage` | The five service pages |
| `/services/financing`, `/highest-and-best-use`, `/real-estate-valuation` | Additional service pages |
| `/platforms` | Products overview |
| `/platforms/real-fursa`, `/platforms/real-invest` | Real Forsa platform, Real Invest engine |
| `/knowledge` and its four reports | Knowledge center |
| `/partners` | Partners |
| `/join` | Careers |
| `/{address}` | Pages created in the admin area |

Every URL also exists in English with the `/en` prefix, e.g. `/en/about`.

## Brand palette

| Token | Hex | Usage |
|---|---|---|
| `navy` | `#00304D` | Main page background |
| `navy-deep` | `#00243A` | Deep section bands |
| `navy-dark` | `#001522` | Footer |
| `navy-mid` | `#00506E` | Secondary / dividers |
| `teal` | `#00B4AC` | Brand accent (buttons, links, icons) |
| `teal-cyan` | `#44C5CF` | Hover / gradient accent |
| `iceblue` | `#B4D4E5` | Sub-headings on navy |
| `steel` | `#94AFBD` | Body text on navy |

## Fonts

GE SS Two / GE SS Unique (Arabic) and Exo 2 (Latin), self-hosted from
`public/fonts` (`@font-face` in `src/app/globals.css`). These files came with
the design package; make sure the license covers web use before going live.
