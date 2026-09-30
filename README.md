# تكامل المتقدمة — Takamol Advanced Website

Next.js (App Router) + TypeScript + Tailwind CSS implementation of the Takamol
Advanced website, reproduced from the Adobe Illustrator design package
(`website/home`, `website/about us`, `website/Join us`).

## Brand palette (extracted exactly from the .ai files)

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

GE SS Two / GE SS Unique (Arabic) and Exo 2 (Latin), served from `public/fonts`
(self-hosted, `@font-face` in `globals.css`). These files came with the design
package — make sure your license covers web embedding before deploying.

## Pages

- `/` — Home: hero, services (4), منصاتنا (ريل فرصة), مركز المعرفة (4 reports),
  شركاؤنا (14 logos), تعرف أكثر (social posts), footer
- `/about` — عن تكامل: hero, story, رؤيتنا/مهمتنا/قيمنا tabs, قيمنا (4), لماذا نحن مختلفون (3)
- `/join` — انضم الينا: hero, benefits (4), job cards, CV submission form

## Assets

All images in `public/assets` were extracted/rendered directly from the .ai
files (embedded images via PyMuPDF, vector art rendered to transparent PNG),
so they match the design 1:1 — logo, service icons, platform illustration,
report covers, partner logos, Instagram posts, job cards.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```
