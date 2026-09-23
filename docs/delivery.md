# Landing delivery

The landing page has two persistent Vercel projects and a Neon waitlist database. It does not own a Railway service. The Parkdex web app and API are separate releases. Landing links and rewrites point to their matching staging or production environments.

| Target | Git branch | Vercel project | Stable landing domains | Web app |
| --- | --- | --- | --- | --- |
| Staging | `staging` | `parkdex-landing-staging` | `staging.parkdex.app` | `staging.web.parkdex.app` |
| Production | `main` | `parkdex-landing` | `parkdex.app`, `www.parkdex.app` | `web.parkdex.app` |

## One-time provider configuration

Keep Vercel Git deployment disabled in both projects because the GitHub push workflows own persistent deployment requests. Configure these GitHub Actions values in `NathanPannell/parkdex-landing`:

- Separate team-scoped deployment secrets: `VERCEL_STAGING_TOKEN` for the staging caller and `VERCEL_PRODUCTION_TOKEN` for the production caller. Scope each token to the Vercel team and give it an expiration and rotation owner. The current Vercel CLI calls `/v2/user` before deployment, which returns 404 for a project-scoped token even when that token can read its project. Each token is passed to the reusable workflow as `VERCEL_DEPLOY_TOKEN`; the staging job never receives the production token. Keep `VERCEL_STAGING_PROJECT_ID` and `VERCEL_PRODUCTION_PROJECT_ID` distinct, and confirm those IDs before each release.
- Repository variables: `VERCEL_ORG_ID`, `VERCEL_STAGING_PROJECT_ID`, and `VERCEL_PRODUCTION_PROJECT_ID`.
- The reusable workflow exports the selected project as `VERCEL_PROJECT_ID` before invoking Vercel CLI. The CLI requires this variable when `VERCEL_ORG_ID` is set, even with a matching `.vercel/project.json`.
- GitHub environments: `staging` and `production`, with any desired protection rules.

The staging and production Vercel projects must each have their own persistent `DATABASE_URL` for the waitlist serverless function. The projects must have matching `WAITLIST_ALLOWED_ORIGIN` values if this optional variable is set. The staging project's **Preview** environment must have no persistent variables. The preview script injects one isolated Neon branch database URL per deployment. Keep production and staging database credentials out of Preview.

The separate landing staging Neon project (`twilight-heart-20114456`) has `main` as its parent branch, database `parkdex_landing_staging`, and owner role `parkdex_landing_staging_owner`. Supply its exact project ID with `NEON_PROJECT_ID` when creating previews. Set `NEON_PARENT_BRANCH`, `NEON_DATABASE_NAME`, or `NEON_ROLE_NAME` only if that project changes.

## Draft PR to staging

1. Start a new same-repository branch from the current `staging` branch. For the first staging release, create `staging` at the current `main` commit, then branch from that same commit and bring the reviewed landing work onto it. Create a draft PR targeting `staging`. Review the diff and check that Vercel Git deployment is still disabled. A branch push or PR event must not create a provider preview.
2. In a clean checkout at the exact current `origin/staging` revision, set `NEON_API_KEY`, `NEON_PROJECT_ID`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PREVIEW_PROJECT_ID` in the process environment. `VERCEL_PREVIEW_PROJECT_ID` must be the staging Vercel project. Set `VERCEL_PREVIEW_PROJECT_NAME=parkdex-landing-staging` if needed. For the first PR that introduces this script, run the reviewed script from its feature checkout with `PREVIEW_HARNESS_ROOT` set to the clean staging checkout path. The script will operate on that staging checkout and validate its exact SHA.
3. Run `node scripts/preview-pr.mjs create <PR_NUMBER>`. It builds and tests the exact synthetic merge candidate, creates an annotated Neon branch from the landing staging project, runs `schema.sql`, and manually deploys to a Vercel Preview URL. The durable journal is outside the checkout at `%LOCALAPPDATA%/Parkdex/landing-preview-pr/journals/pr-<PR_NUMBER>.json` on Windows.
4. Test the exact preview URL in a real browser. Exercise signup, deletion, and the changed journey. Check function responses and the preview Neon branch. Add cropped before and after screenshots to the PR thread for UI changes. Keep the preview and its journal through merge and staging verification.
5. Mark the PR ready, merge into `staging`, and observe the `Deploy landing staging` push workflow. It guards the exact branch SHA and queues a Vercel Production deployment with domain assignment skipped. It returns after Vercel accepts the request. It does not wait for provider build completion.
6. Confirm the queued deployment reaches READY, verify its source commit and release ID, assign only `staging.parkdex.app`, then browser-test the stable staging URL and its waitlist API. Record the staging commit and evidence before calling it ready in staging.
7. After staging passes, set `STAGING_VERIFIED=1` in the process environment and run `node scripts/preview-pr.mjs teardown <PR_NUMBER>`. The script requires the PR to be merged and the staging site to respond successfully, then removes the owned Vercel deployment and Neon branch and checks absence. If an unmerged PR is closed, set `PREVIEW_ABANDONED=1` for its teardown instead. For a failed partial preview on a still-open draft PR, set `PREVIEW_ABORTED=1`. If the draft PR head changes after preview creation, set `PREVIEW_SUPERSEDED=1` to clean the old preview, then create and test a fresh preview for the new head before marking ready. The preview owner performs teardown before reporting completion.

The preview script does not auto-clean a failed partial deployment. Its journal records the resources and creation intent so the owner can recover and retry exact teardown. Never delete a provider resource based on a PR number alone.

## Production promotion

Create a PR from `staging` to `main` after staging acceptance. Review and merge it. The `Deploy landing production` push workflow queues the exact main commit on the production Vercel project with domain assignment skipped. Once READY, verify the commit and release ID, assign `www.parkdex.app` and `parkdex.app`, then browser-test both domains, redirects, the web app link, and the waitlist function. Confirm staging still points to its prior deployment.

The reusable `deploy-release.yml` follows Parkdex's thin caller and SHA-guarded, push-only pattern. The landing app has one owned deployable service, so the workflow queues its Vercel upload without waiting for provider readiness. If another independent service is added later, queue its request in parallel and wait only for each provider CLI to accept the request. Keep readiness, aliases, and browser acceptance in the agent-controlled release step.
