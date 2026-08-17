# Start here

Hi — this is Lorenz's portfolio website. It was built and tested (desktop,
tablet, mobile, all working) but **it is not online yet and not yet in a
GitHub repository**. That's the state you're picking up: a finished folder
of files that needs to be put online.

It's a plain website — no build tools, no server, nothing to install to
work on it. `index.html` is the homepage; open any `.html` file in a
browser and it works. The steps below get it onto the internet and set up
a simple editor ("CMS") so text/images can be changed without touching
code.

Do the steps in order. Step 5 (the CMS) is optional — skip it if nobody
needs to edit content through a web form; the site works fine without it.

## 1. Get the code onto GitHub

**If you're comfortable with no command line at all (recommended for a
first time):**

1. Install [GitHub Desktop](https://desktop.github.com/) (free) and sign
   in / create a GitHub account if you don't have one.
2. In GitHub Desktop: **File → Add local repository**, and point it at
   this folder (the one this file is in).
3. It'll say the folder isn't a Git repository yet — click **create a
   repository** when it offers.
4. Click **Publish repository** (top bar). Give it a name, e.g.
   `lorenz-eckl-portfolio`. Untick "Keep this code private" only if you
   want it public — private is fine either way for what follows.
5. Done — the code is now on GitHub.

**If you're OK with the command line instead:**
```
cd /path/to/this/folder
git init
git add -A
git commit -m "Initial site"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```
(Create the empty repo on GitHub first via "New repository" — no README,
no .gitignore — then use the URL it gives you above.)

## 2. Deploy it on Netlify

1. Create a free account at netlify.com — "Sign up with GitHub" is easiest.
2. **Add a new site → Import an existing project → GitHub**, and pick the
   repo from step 1.
3. Netlify detects `netlify.toml` in this folder and needs no other
   settings — leave the build command empty and click **Deploy**.
4. After a minute you get a live URL like `random-name-123.netlify.app`.
   Open it and check the site looks right.

## 3. (Optional, later) Point a real domain at it

Once there's a domain to use: add it in Netlify's **Domain management**,
then update 1-2 DNS records at wherever the domain was bought. Ask if you
get to this point and want a hand.

## 4. (Optional) Turn on the content editor (CMS)

Only needed if someone who isn't comfortable editing code should be able
to change text/images/video through a web form at `/admin`.

1. In the Netlify dashboard for this site: **Site configuration → Identity
   → Enable Identity**.
2. Identity → **Registration** → set to **Invite only**.
3. Identity → **Services → Git Gateway** → **Enable Git Gateway**.
4. Identity → **Invite users** → enter the editor's email. They get an
   email to set a password.
5. They log in at `https://<your-site>.netlify.app/admin/`, edit fields,
   click **Publish** — the live site updates in about 30 seconds.
   Images upload directly in the editor; for a video, paste a
   YouTube/Vimeo link into a gallery block's "Video URL" field.

## What's in this folder

- `index.html`, `projects/*.html` — the four pages (landing + 3 case
  studies; Temporary Cargo has real content, Super Commuter and Terra are
  placeholder text/grey images ready to be filled in)
- `assets/css`, `assets/js` — styling and the small scripts that load
  content from JSON and run the mobile menu / hover effects
- `content/*.json` — all the editable text/images (what the CMS in step 4
  edits — can also just be hand-edited in any text editor)
- `admin/` — the CMS itself (Decap CMS), configured by `admin/config.yml`
- `design-handoff/` — the original design mockup export (Figma-adjacent
  HTML, chat history, source images/fonts) kept for reference only; not
  part of the live site, safe to ignore
