# Resonant Web Design - Handoff

*Last updated: 2026-07-02 | agent: CODEX | project ID: `resonant-web-design`*
*Status: apex + `www` live on Vercel / local add-ons showcase ready for review*

## Purpose

Public marketing site for Resonant Web Design. The homepage portfolio section
showcases recent builds and links to demo/client sites.

## Canonical locations

- Local: `/Users/richardjamison/Documents/RESONANT WEb/resonant-web-design/`
- Repository: `https://github.com/RichardBJamiosn/resonant-web-design`
- Branch: `main`
- Production URL: `https://resonantwebdesign.com/`
- `www` URL: `https://www.resonantwebdesign.com/`
- Current verified Vercel URL: `https://resonant-web-design.vercel.app/`
- Nexus project ID: `resonant-web-design`

## Current state

- Source and GitHub remote `main` are at commit `1d8d6e7`, titled
  `Use site screenshots for portfolio cards`.
- GitHub Pages API reported latest Pages build `building` for commit
  `d3b0a19423b42834c15084753e8941f17005f4fe`, created
  `2026-07-02T14:51:47Z`. Vercel production is already verified live.
- Raw GitHub source for `main/index.html` contains Open Source Barware and
  Your Logo Here Roofing.
- Direct Vercel URL serves the current content with Open Source Barware and
  Your Logo Here Roofing.
- Public apex `https://resonantwebdesign.com/` serves the current Vercel build.
- Public `www` `https://www.resonantwebdesign.com/` now also serves the current
  Vercel build as of 2026-07-02 10:40 ET, after Cloudflare DNS was changed from
  the old `resonant-by-design.pages.dev` CNAME to proxied `A www 76.76.21.21`.
- Fresh check on 2026-07-02 11:03 ET verified apex and `www` both show Open
  Source Barware and Your Logo Here Roofing cards using full site screenshots.
  Neither host shows the old All County Exteriors card or the logo-only roofing
  preview.
- Fresh check on 2026-07-02 11:50 ET replaced the two homepage portfolio card
  screenshots with user-supplied final images:
  `assets/img/work-open-source-barware-finished.png` and
  `assets/img/work-roofing-demo-finished.png`. Commit `9e817dd` was pushed to
  GitHub `main` and deployed to Vercel production
  `dpl_D6sHUnTHEsJmf3bnxs1g8M6epcGw`.
- Tire demo `https://west-cleveland-tires-landing.vercel.app/` now uses the
  provided Cedar Tires logo image at `assets/client/west-cleveland-logo.png`,
  the provided Cedar storefront image at
  `assets/client/cedar-used-storefront.jpg`, and Cedar contact details:
  `7819 Cedar Ave, Cleveland, OH 44103`, `(216) 266-0427`.
  Production deploy `dpl_6yUU7jT1tzUFZZpMbnyaaWHcLbv1` was verified live on
  2026-07-02 11:34 ET.
- Short public tire demo URL `https://cleveland-tire.vercel.app/` was added to
  the same Vercel project/deployment and verified live on 2026-07-02 11:39 ET.
- Vercel project/domain changes made by Codex on 2026-07-01:
  - Added/bound `resonantwebdesign.com` to the linked Vercel project.
  - Set alias `resonantwebdesign.com` to deployment
    `resonant-web-design-d4avg719d-ovlp-s-projects.vercel.app`.
  - Added/bound `www.resonantwebdesign.com` to the linked Vercel project and
    alias list. Cloudflare DNS for `www` is now fixed.
- Local homepage now replaces the prior "Beyond The Website" systems panel with
  one full-width agency add-ons showcase under the portfolio grid. It uses the
  provided six images as a layered collage and sells mobile add-ons, AI
  follow-up, voice/Apple Watch integration, agency analytics, social campaigns,
  traffic reports, and ranking reports as one package.
- The existing Open Source Barware portfolio card now points to the available
  `assets/img/osbw-logo.png` asset instead of the missing
  `assets/img/work-open-source-barware.png` path discovered during preview.

## Architecture and key files

- `index.html` - static homepage and portfolio grid.
- `styles.css` - global styling and portfolio/add-on showcase styles.
- `assets/img/addons/` - user-provided add-ons imagery for the new showcase.
- `assets/img/work-open-source-barware.png` - Open Source Barware site screenshot.
- `assets/img/work-roofing-demo.png` - Your Logo Here Roofing demo site screenshot.
- `assets/img/work-open-source-barware-finished.png` - current live Open Source
  Barware portfolio screenshot, supplied by Richard on 2026-07-02.
- `assets/img/work-roofing-demo-finished.png` - current live Your Logo Here
  Roofing portfolio screenshot, supplied by Richard on 2026-07-02.
- `assets/img/brand/your-logo-here-roofing.png` - retained logo asset from the
  prior branding pass; the live portfolio card now uses the full site screenshot.
- `CNAME` - GitHub Pages custom domain set to `resonantwebdesign.com`.
- `.vercel/project.json` - Vercel project binding for `resonant-web-design`.

## Commands

```bash
# Inspect local state
git -C "/Users/richardjamison/Documents/RESONANT WEb/resonant-web-design" status --short --branch

# Verify current GitHub Pages build
gh api repos/RichardBJamiosn/resonant-web-design/pages/builds/latest

# Verify current source
curl --compressed --http1.1 -sL --max-time 20 \
  https://raw.githubusercontent.com/RichardBJamiosn/resonant-web-design/main/index.html \
  | rg -i "Your Logo Here|555-555-5555|Open Source Barware|Rolling Smoke|DJ Landscaping"

# Verify Vercel content
curl --compressed --http1.1 -sL --max-time 20 \
  https://resonant-web-design.vercel.app/ \
  | rg -i "Your Logo Here|555-555-5555|Open Source Barware|Rolling Smoke|DJ Landscaping"

# Verify apex public domain content
curl --compressed --http1.1 -sL --max-time 20 \
  https://resonantwebdesign.com/ \
  | rg -i "Your Logo Here|555-555-5555|Open Source Barware|Rolling Smoke|DJ Landscaping"

# Verify www public domain content
curl --compressed --http1.1 -sL --max-time 20 \
  https://www.resonantwebdesign.com/ \
  | rg -i "Your Logo Here|555-555-5555|Open Source Barware|Rolling Smoke|DJ Landscaping"

# Inspect Vercel domain config
npx vercel domains inspect resonantwebdesign.com
npx vercel domains inspect www.resonantwebdesign.com
```

## External services and credentials

- GitHub Pages hosts the legacy/custom-domain path for the repo.
- Vercel project exists under `ovlp-s-projects`; CLI is logged in locally.
- Cloudflare is authoritative DNS for `resonantwebdesign.com`
  (`colin.ns.cloudflare.com`, `stella.ns.cloudflare.com`).
- No Cloudflare credentials were found by the prior Claude session. Do not
  record secret values in this file or Nexus ledger.

## Safety constraints

- Do not overwrite unrelated local edits. As of this handoff there are
  uncommitted local changes in `index.html`, `styles.css`, `HANDOFF.md`,
  `.gitignore`, and `assets/img/addons/`. `.gitignore` was not changed during
  the add-ons showcase pass.
- The production roofing-card commits `d3b0a19` and `1d8d6e7` were pushed from clean worktree
  `/private/tmp/resonant-web-design-branding` to avoid deploying the unrelated
  add-ons changes. The canonical local folder may show `main` behind
  `origin/main` until the add-ons work is reconciled.
- Keep Cloudflare `www` pointed at Vercel (`A www 76.76.21.21`). Do not point it
  back to the old Pages origin.
- Do not remove the GitHub Pages `CNAME` until the intended production host is
  confirmed. Removing it can break the current domain path.

## Verification

Passed/partial on 2026-07-01:

- `origin/main` verified at `1529ba5abe3dbff51167b5303e2153699fb36d6e`.
- GitHub Pages API verified latest build at the same commit.
- Raw GitHub source verified new portfolio content.
- Direct Vercel URL verified new portfolio content.
- Vercel CLI verified `resonantwebdesign.com` and
  `www.resonantwebdesign.com` aliases point at the current deployment.
- Programmatic fetch verified apex `https://resonantwebdesign.com/` returns:
  `All County=true`, `Roofing=true`, `Open Source Barware=true`,
  `Rolling Smoke=false`, `DJ Landscaping=true` (expected one remaining
  landscaping portfolio card), and `sso-api=false`.
- Programmatic fetch verified `https://www.resonantwebdesign.com/` still
  returns old content: `All County=false`, `Roofing=false`,
  `Open Source Barware=false`, `Rolling Smoke=true`, `DJ Landscaping=true`.
- Fresh 2026-07-02 verification:
  - `git log` shows `1529ba5` on `main`/`origin/main`:
    `Replace duplicate DJ Landscaping card with All County Exteriors roofing demo`.
  - GitHub Pages API latest build is `built` for commit
    `1529ba5abe3dbff51167b5303e2153699fb36d6e`.
  - Raw GitHub `main/index.html`, direct Vercel, and
    `https://resonantwebdesign.com/` all contain All County Exteriors roofing
    and no Rolling Smoke/Landscaping Website System card.
  - At 10:20 ET, `https://www.resonantwebdesign.com/` still contained Rolling
    Smoke ATX BBQ and Landscaping Website System before the Cloudflare change.
  - At 10:40 ET, after Cloudflare `www` DNS was changed to Vercel,
    `https://www.resonantwebdesign.com/` returned Vercel headers and live HTML
    containing Open Source Barware plus All County Exteriors roofing, with no
    Rolling Smoke ATX BBQ or Landscaping Website System card.
  - `npx vercel domains inspect www.resonantwebdesign.com` no longer prints the
    previous DNS-not-configured warning.
- Fresh 2026-07-02 10:53 ET verification:
  - Commit `d3b0a19` pushed to GitHub `main`.
  - Production Vercel deploy `dpl_wzcMRgjk7aXjuFT7smckXSc9MEAd` aliased to
    `https://resonantwebdesign.com`.
  - `https://resonantwebdesign.com/` and
    `https://www.resonantwebdesign.com/` contain `Your Logo Here Roofing`,
    `555-555-5555`, and `assets/img/brand/your-logo-here-roofing.png`; no old
    All County card is present.
  - `https://cleveland-roofing-demo.vercel.app/` production deploy
    `dpl_GGPL6qdyNh9XxovZHk6zeJh8U8Pk` contains the supplied logo asset,
    `555-555-5555`, and nav label `We care`; old `All County Cares` is gone
    and the About image was removed.
- Fresh 2026-07-02 11:03 ET screenshot correction:
  - Commit `1d8d6e7` pushed to GitHub `main`.
  - Production Vercel deploy `dpl_E2L4HwjxgPZByUfMCkuRNzKJXqKR` aliased to
    `https://resonantwebdesign.com`.
  - `https://resonantwebdesign.com/` and
    `https://www.resonantwebdesign.com/` reference
    `assets/img/work-open-source-barware.png` and
    `assets/img/work-roofing-demo.png`.
  - Both screenshot assets return HTTP 200 from production. The old
    logo-only roofing preview markup (`portfolio-preview-phone`) is gone.
- Fresh 2026-07-02 11:50 ET final screenshot correction:
  - Commit `9e817dd` pushed to GitHub `main`.
  - Production Vercel deploy `dpl_D6sHUnTHEsJmf3bnxs1g8M6epcGw` aliased to
    `https://resonantwebdesign.com`.
  - `https://resonantwebdesign.com/` and
    `https://www.resonantwebdesign.com/` both reference
    `assets/img/work-open-source-barware-finished.png` and
    `assets/img/work-roofing-demo-finished.png`; neither references the prior
    `work-open-source-barware.png` or `work-roofing-demo.png` paths.
  - Both new image assets return HTTP 200 from production. Live SHA-256 hashes
    match the local user-supplied screenshots:
    `4f26fdee57e0e5b8a5dd69f79a47a92ce80170461fc7268cccdeefe815583302`
    for roofing and
    `5d66ba7261812a175450ba7d9b6c3a7e3194e111324032da878a5ee9baff506e`
    for Open Source Barware.
- Fresh 2026-07-02 11:34 ET tire demo Cedar location update:
  - Production Vercel deploy `dpl_6yUU7jT1tzUFZZpMbnyaaWHcLbv1` aliased to
    `https://west-cleveland-tires-landing.vercel.app`.
  - Live HTML contains `Cedar Tires`, `7819 Cedar Ave`, `Cleveland, OH 44103`,
    `(216) 266-0427`, `tel:2162660427`, and
    `assets/client/cedar-used-storefront.jpg`.
  - Live HTML no longer contains the old `2260`, `W 65th`, `44102`,
    `(216) 631-6312`, `tel:2166316312`, `West of Cleveland`, or old
    `west-cleveland-storefront.webp` storefront references.
  - The live `cedar-used-storefront.jpg` returns HTTP 200 image/jpeg and its
    SHA-256 hash matches the local file supplied from
    `/Users/richardjamison/Downloads/Cedar used.jpg`.
- Fresh 2026-07-02 11:39 ET tire demo short URL:
  - Added Vercel alias/domain `https://cleveland-tire.vercel.app/` to the
    current deployment
    `west-cleveland-tires-landing-tisdy6t52-ovlp-s-projects.vercel.app`.
  - Initial alias-only assignment routed through Vercel SSO; adding
    `cleveland-tire.vercel.app` to the project made it public.
  - `curl -I https://cleveland-tire.vercel.app` returns HTTP 200 from Vercel.
  - Live HTML at the new URL contains `Cedar Tires`, `7819 Cedar Ave`,
    `(216) 266-0427`, `tel:2162660427`, and
    `assets/client/cedar-used-storefront.jpg`, with no old West 65th contact
    strings in the verification sweep.
- Local static preview at `http://127.0.0.1:4173/#work` verified the new
  add-ons showcase at desktop width: 1200px wide, 539px tall versus the
  featured OVLP card at 1200px by 512px; all six images loaded, required
  add-on/traffic/ranking copy present, and no horizontal overflow.
- Browser viewport checks at mobile breakpoints verified no horizontal overflow
  and no out-of-viewport children in the add-ons showcase.
- `git diff --check` passed after the local add-ons showcase edit.
- Text sweep verified the missing `work-open-source-barware.png` reference is
  gone from `index.html`.

## Known issues and failed approaches

- Initial Cloudflare apex switch created a temporary `525 SSL Handshake Failed`
  because Vercel had not yet issued/attached the cert/alias.
- After Vercel aliasing, apex briefly redirected to Vercel SSO because the
  domain existed in the Vercel team but was not added to the project. Running
  `npx vercel domains add resonantwebdesign.com` fixed that.
- `www` previously served stale Pages content until Cloudflare DNS was changed
  to proxied `A www 76.76.21.21` on 2026-07-02.
- Cloudflare public DNS returns Cloudflare proxy IPs for proxied records, so
  use content checks plus Vercel CLI output to confirm behavior.

## Open work

1. Review, commit, and deploy the current add-ons showcase changes when ready.

## Pickup point

First safe command:

```bash
cd "/Users/richardjamison/Documents/RESONANT WEb/resonant-web-design" && git status --short --branch
```

Then inspect Vercel DNS state:

```bash
npx vercel domains inspect resonantwebdesign.com
```

## Last material change

- Date: 2026-07-01
- Agent: CODEX
- Ledger action: Added agency add-ons showcase box / fixed OSB card image path
- Files: `index.html`, `styles.css`, `assets/img/addons/`, `HANDOFF.md`
