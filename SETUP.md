# Getting the site live

This repo is a plain static website — no build step, no server to run.
`index.html` at the root is the homepage; `projects/*.html` are the project
pages. All the editable text/images live as JSON files in `content/`, and
`admin/` is a small content-editor ("CMS") your friend can use without
touching code.

Follow these steps once, in order. Nothing here touches your domain — that's
a separate step for later, and I'll walk you through it when you're ready.

## 1. Put the code on GitHub

1. Create a free account at github.com if you don't have one.
2. Create a new **empty** repository (no README, no .gitignore — just an
   empty repo), e.g. `lorenz-eckl-portfolio`. Keep it private or public,
   your choice — either works with everything below.
3. From this project's folder, push it:
   ```
   git remote add origin https://github.com/<your-username>/lorenz-eckl-portfolio.git
   git push -u origin main
   ```

## 2. Deploy it on Netlify

Netlify hosts the site for free and rebuilds it automatically every time
the content changes (whether you edit a file directly or your friend edits
through the CMS).

1. Create a free account at netlify.com — "Sign up with GitHub" is easiest.
2. **Add a new site → Import an existing project → GitHub**, and pick the
   repo you just pushed.
3. Netlify will detect `netlify.toml` and needs no other settings — leave
   the build command empty and click **Deploy**.
4. After a minute you'll get a live URL like `random-name-123.netlify.app`.
   Open it and confirm the site looks right.

## 3. Turn on the CMS (Identity + Git Gateway)

This is what lets your friend log in at `/admin` and edit content through a
form instead of editing files.

1. In the Netlify dashboard for this site: **Site configuration → Identity
   → Enable Identity**.
2. Still under Identity → **Registration**: set it to **Invite only** (so
   random people can't sign up).
3. Under Identity → **Services → Git Gateway**: click **Enable Git Gateway**.
   This lets logged-in Identity users save changes to the GitHub repo
   without needing their own GitHub account or token.
4. Under Identity → **Invite users**, enter your friend's email address.
   They'll get an email with a link to set a password.

## 4. Using the CMS

- Go to `https://<your-site>.netlify.app/admin/`.
- Log in (or finish setting a password from the invite email).
- Three sections: **Site Settings** (name/email/footer links), **Landing
  Page** (hero text, project teasers, about, skills), and **Project Pages**
  (one entry per project — Temporary Cargo, Super Commuter, Terra).
- Edit a field, click **Publish** — Netlify rebuilds and the live site
  updates within about 30 seconds.
- Images/photos upload directly in the editor (drag & drop or browse).
  For videos: paste a YouTube or Vimeo link into the "Video URL" field on a
  gallery block of type "Video" — no file upload needed.

A few fields (like which project page a landing teaser links to) use a
dropdown instead of free text, specifically so a typo can't accidentally
break a link.

## 5. Your domain — later

Once you've bought a domain, come back and I'll walk you through pointing
it at this Netlify site (it's a short step: add the domain in Netlify's
**Domain management**, then update 1-2 DNS records at your registrar).

## What's in this repo

- `index.html`, `projects/*.html` — the pages
- `assets/css`, `assets/js` — styling and the small scripts that render
  content from JSON and handle the mobile menu
- `content/*.json` — all editable text/images (what the CMS edits)
- `admin/` — the CMS (Decap CMS), configured in `admin/config.yml`
- `design-handoff/` — the original Claude Design export (mockups, chat
  history, source fonts/images) kept for reference; not part of the live
  site
