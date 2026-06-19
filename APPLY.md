# Apply this redesign

Unzip this archive at the root of your local `ryoari.com` clone. It overwrites
five files and adds `.nvmrc`, in their correct paths:

    src/app/SiteShell.tsx     (new)
    src/app/layout.tsx        (replaced)
    src/app/page.tsx          (replaced)
    src/styles/globals.css    (replaced)
    src/data/identity.json    (replaced)
    .nvmrc                    (new, pins Node 20)

A zip cannot delete files, so remove the two dead files yourself:

    git rm src/app/globals.css src/app/page.module.css

Note: the new stylesheet is `src/styles/globals.css`. The file you delete,
`src/app/globals.css`, is a different, unused one. Do not confuse them.

Before pushing, open `src/data/identity.json` and replace the `epigraph`
value with your own line. It is currently a placeholder.

Then follow DEPLOY.md.

You can delete APPLY.md once you are done.
