# Resonant Web Design - Handoff

*Last updated: 2026-07-02 | agent: CODEX | project ID: `resonant-web-design`*

This is the current handoff record for clean pickup. Keep it aligned with the
live site when the landing hero, primary nav, or service routes change.

## Production

- Site: `https://resonantwebdesign.com/`
- WWW: `https://www.resonantwebdesign.com/`
- Repository: `https://github.com/RichardBJamiosn/resonant-web-design`
- Vercel project: `ovlp-s-projects/resonant-web-design`
- Current verified production commit: `a06a2cc` (`Add system integrations service page`)
- Current verified production deploy: `dpl_6wQJ8qGgoyEtSC3uRYsjY5xszWzS`

## Current Site State

- Homepage hero is the dark neon reference composition with:
  - `Find your pulse.`
  - Three capability tiles
  - Tilted glass/device art on the right
  - Launch-stack proof card
  - Cyan service ticker under the hero
- Primary nav now uses:
  - Web Design
  - SEO
  - System Integrations
  - Work
  - Process
  - Start a Project
- `Landscapers` has been removed from the primary nav and mobile menu.
- The homepage service card and page map now point to `/services/system-integrations/`.
- The new `System Integrations` page covers API connections, business automation, AI phone/chat, CRM handoffs, analytics, dashboards, and custom workflows.
- The landscaping industry page still exists, but it is no longer part of the main navigation.

## Analytics

- GA4 tag is installed in `index.html`: `G-K7RCVL5RFQ`.
- The tag uses the standard Google `gtag.js` snippet in the `<head>`.
- Verified live on the homepage during the latest deploy.

## Verification

- Local browser checks confirmed:
  - No loader overlay remains
  - No accidental add-on imagery is on the site
  - No horizontal overflow on desktop or mobile
  - `System Integrations` nav links render correctly on desktop and mobile
  - `/services/system-integrations/` renders correctly on desktop and mobile
- The homepage and new service page were both verified live after deployment.

## Safe Pickup

```bash
cd "/Users/richardjamison/Documents/RESONANT WEb/resonant-web-design" && git status --short --branch
```
