# Personal site — Harshadeva Priyankara

Plain HTML, CSS and JS. No build step. Upload the folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, or shared hosting).

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole site, plus JSON-LD structured data (Person, ProfessionalService, FAQ) |
| `assets/css/site.css` | Theme: "Paper" (light) and "Blueprint" (dark) |
| `assets/js/site.js` | Interactions only. The page works and reads fully without it |
| `llms.txt`, `llms-full.txt` | Plain-text profile for AI agents and LLM crawlers |
| `robots.txt` | Allows search engines and AI crawlers, points to the sitemap |
| `sitemap.xml` | For Google Search Console / Bing Webmaster Tools |
| `404.html` | Not-found page (most static hosts pick it up automatically) |

`assets/img/source-portrait.webp` is the original photo; the site uses the resized copies.

## Run locally

```bash
npx serve -l 4321 .
```

## Changing the domain

The site uses `https://devmind.online/` as its canonical address. If the domain changes, find and replace it in:
`index.html`, `llms.txt`, `llms-full.txt`, `robots.txt`, `sitemap.xml`.

## Adding LinkedIn / GitHub / Stack Overflow

1. In `index.html`, uncomment the `social` paragraph at the end of the Contact section and fill in the URLs.
2. Add the same URLs to the Person JSON-LD as `"sameAs": ["https://…", "https://…"]`. This is how search engines and AI agents connect those profiles to you.
3. Add them under "Contact" in `llms.txt` and `llms-full.txt`.

## After going live

- Submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- Check the structured data with Google's Rich Results Test.
- Put the site URL on LinkedIn, GitHub and Upwork so all your profiles point at each other.
