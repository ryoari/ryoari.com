# Deploying ryoari.com

A static Next.js export, moving from Vercel to Cloudflare Pages.

## 1. Apply the changes

See APPLY.md. Place the files, delete the two dead files, set your epigraph.

## 2. Build and test locally

Confirm it compiles with the exact command Cloudflare will run.

    npm install
    npm run dev      # http://localhost:3000, toggle theme, reload to see both header modes
    npm run build    # must succeed and produce an out/ folder

If `out/index.html` exists, you are good. `out/` and `node_modules/` are
gitignored and will not be committed.

## 3. Commit and push

    git add -A
    git commit -m "Redesign: editorial layout, self-organizing header, dark mode"
    git push origin main

If you work on a branch, open a pull request and merge into main.

## 4. Create the Cloudflare Pages project

Cloudflare has put Pages into maintenance mode and nudges new projects toward
Workers, but Pages still works and is the simplest route for a static export.
Both sit under the same dashboard menu.

1. Sign in at dash.cloudflare.com and open Workers & Pages, then Create, then
   the Pages tab, then Connect to Git.
2. Authorize GitHub and select the ryoari/ryoari.com repo, then Begin setup.
3. In Build settings, choose the framework preset Next.js (Static HTML Export),
   and confirm:
       Build command:           npm run build
       Build output directory:  out
       Production branch:        main
4. Save and Deploy. Cloudflare installs dependencies, builds, and gives you a
   your-project.pages.dev URL. Every push to main redeploys automatically, and
   every pull request gets a preview URL.

Visit the pages.dev URL and confirm the site and the header work. If a build
fails, the log names the cause. The usual suspects are Node version (pinned by
.nvmrc here) and the output directory.

## 5. Point ryoari.com at it

The apex domain currently resolves through Vercel. Let Cloudflare run DNS,
because the apex record benefits from Cloudflare's CNAME flattening.

1. In Cloudflare, Add a site, enter ryoari.com, let it import existing records.
2. Cloudflare gives two nameservers. At your registrar, replace the current
   nameservers with Cloudflare's. Propagation takes minutes to a few hours.
3. When the site is Active, open the Pages project, go to Custom domains, and
   add both ryoari.com and www.ryoari.com. Cloudflare creates the records and
   provisions HTTPS automatically.

## 6. Decommission Vercel

After Cloudflare is serving the domain:

1. In the Vercel project, remove ryoari.com and www.ryoari.com from Domains.
2. Delete any leftover A or CNAME records pointing at Vercel.
3. Optionally pause or delete the Vercel project.

## 7. Verify

    curl -I https://ryoari.com           # expect HTTP 200 from Cloudflare
    curl https://ryoari.com/me.json      # machine-readable identity should return

Load the site, toggle dark mode and reload to confirm it persists, and refresh
a few times to see the header land on both the soup and the flock.

## Ongoing

Edit, run npm run build to check locally, then git push. Cloudflare rebuilds on
every push to main. Edits to identity.json flow through automatically, including
the /me.json endpoint.
