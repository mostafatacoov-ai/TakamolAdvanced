# تكامل المتقدمة — Takamol Advanced Website

The bilingual (Arabic / English) website of Takamol Advanced, built with
Next.js 14 (App Router), TypeScript, Tailwind CSS and next-intl. Page layouts,
copy and photos follow the company's design files.

## Run locally

Requires **Node.js 20.9 or newer**.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build (every page is pre-rendered)
npm start       # serve the production build
```

## Deploy on Hostinger

The site needs a running Node.js server (Arabic/English routing is handled by
Next.js middleware), so deploy it as a **Node.js app**, not as static files.
On Hostinger that means a plan with Node.js app support (Business or Cloud
web hosting) or a VPS.

| Setting | Value |
|---|---|
| Repository / branch | this repository, `main` |
| Framework | Next.js |
| Node.js version | 20.x or 22.x (18 is too old for the image library) |
| Install command | `npm ci` (or `npm install`) |
| Build command | `npm run build` |
| Start command | `npm start` (listens on the `PORT` the host provides) |
| Environment variable | `NEXT_PUBLIC_SITE_URL` = the live address, e.g. `https://takamoladvanced.sa` |

`NEXT_PUBLIC_SITE_URL` sets the address used in the sitemap, `robots.txt` and
link previews on social media. It defaults to `https://takamoladvanced.sa` and
is read at build time, so rebuild after changing it.

On a VPS, run the same install/build commands, then keep the server alive with
a process manager (for example `pm2 start npm --name takamol -- start`) behind
Nginx.

## Structure

| Path | Contents |
|---|---|
| `src/app/[locale]/` | Pages. Arabic is the default at `/`; English is under `/en` |
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
