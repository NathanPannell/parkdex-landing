# Landing delivery

The landing page uses one Vercel project, `parkdex-landing` (`prj_R7ccAjDhGmhiys542GFXJ67d1k8X`), and one Neon project, `noisy-smoke-89213665`. Staging and production are separated by Git branch, Neon branch and Vercel target, not by separate projects. It does not own a Railway service. The Parkdex web app and API use their own Neon project and are separate releases. Landing links and rewrites point to their matching staging or production environments.

| Target | Git branch | Neon branch | Vercel target in `parkdex-landing` | Stable landing domains | Web app |
| --- | --- | --- | --- | --- | --- |
| Staging | `staging` | `staging` (`br-royal-mode-arzi4hg3`) | Preview deployment, `vercel.staging.json` | `staging.parkdex.app` | `staging.web.parkdex.app` |
| Production | `main` | `main` (`br-young-shape-ar1qojbp`) | Production | `parkdex.app`, `www.parkdex.app` | `web.parkdex.app` |

## One-time provider configuration

Keep Vercel Git deployment disabled because the GitHub push workflows own persistent deployment requests. Configure these GitHub Actions values in `NathanPannell/parkdex-landing`:

- Separate team-scoped deployment secrets: `VERCEL_STAGING_TOKEN` for the staging caller and `VERCEL_PRODUCTION_TOKEN` for the production caller. Give each an expiration and rotation owner. The current Vercel CLI calls `/v2/user` before deployment, which returns 404 for a project-scoped token. Each token is passed to the reusable workflow as `VERCEL_DEPLOY_TOKEN`; the staging job never receives the production token.
- Repository secret `STAGING_DATABASE_URL`: the pooled URL of the Neon `staging` branch. Only the staging caller passes it; the reusable workflow sends it to Vercel with `--env` on that one deployment.
- Repository variables: `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`.
- The reusable workflow exports `VERCEL_PROJECT_ID` before invoking Vercel CLI, which requires it when `VERCEL_ORG_ID` is set.
- GitHub environments: `staging` and `production`, with any desired protection rules.

The Vercel project's **Production** environment holds the production `DATABASE_URL` (Neon `main`). Its **Preview** environment must hold no persistent variables: staging deployments receive the staging URL per deployment from the workflow, and PR previews receive one isolated Neon branch URL per deployment from the preview script. The preview script refuses to deploy if Preview has any variables. Deployment protection stays at "all except custom domains", so `staging.parkdex.app` is public while PR preview URLs require a Vercel session.

Both persistent Neon branches have database `app` and owner role `app_owner`. The staging branch was created from the production branch's schema only, so production waitlist addresses were not copied. Supply `NEON_PROJECT_ID=noisy-smoke-89213665` and `VERCEL_PREVIEW_PROJECT_ID=prj_R7ccAjDhGmhiys542GFXJ67d1k8X` when creating previews. The preview script defaults to `NEON_PARENT_BRANCH=staging`, `NEON_DATABASE_NAME=app`, `NEON_ROLE_NAME=app_owner` and project name `parkdex-landing`. Apply `schema.sql` (one additive statement) to `staging` before a merge that needs it, and to `main` before promoting it.

The project firewall rule limits `POST /api/waitlist` to five requests per 60 seconds per client IP for every host, including staging.

## Draft PR to staging

1. Start a new same-repository branch from the current `staging` branch. For the first staging release, create `staging` at the current `main` commit, then branch from that same commit and bring the reviewed landing work onto it. Create a draft PR targeting `staging`. Review the diff and check that Vercel Git deployment is still disabled. A branch push or PR event must not create a provider preview.
2. In a clean checkout at the exact current `origin/staging` revision, set `NEON_API_KEY`, `NEON_PROJECT_ID`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PREVIEW_PROJECT_ID` in the process environment. `VERCEL_PREVIEW_PROJECT_ID` must be the `parkdex-landing` project. For the first PR that introduces this script, run the reviewed script from its feature checkout with `PREVIEW_HARNESS_ROOT` set to the clean staging checkout path. The script will operate on that staging checkout and validate its exact SHA.
3. Run `node scripts/preview-pr.mjs create <PR_NUMBER>`. It builds and tests the exact synthetic merge candidate, creates an annotated schema-only Neon branch from the canonical project's `staging` branch, runs `schema.sql`, and manually deploys to a Vercel Preview URL. The durable journal is outside the checkout at `%LOCALAPPDATA%/Parkdex/landing-preview-pr/journals/pr-<PR_NUMBER>.json` on Windows.
4. Test the exact preview URL in a real browser. Exercise signup, deletion, and the changed journey. Check function responses and the preview Neon branch. Add cropped before and after screenshots to the PR thread for UI changes. Keep the preview and its journal through merge and staging verification.
5. Mark the PR ready, merge into `staging`, and observe the `Deploy landing staging` push workflow. It guards the exact branch SHA and queues a Preview-target deployment in `parkdex-landing` with the staging config and staging database URL. It returns after Vercel accepts the request. It does not wait for provider build completion.
6. Confirm the queued deployment reaches READY, verify its source commit and release ID, assign only `staging.parkdex.app`, then browser-test the stable staging URL and its waitlist API. Record the staging commit and evidence before calling it ready in staging.
7. After staging passes, set `STAGING_VERIFIED=1` in the process environment and run `node scripts/preview-pr.mjs teardown <PR_NUMBER>`. The script requires the PR to be merged and the staging site to respond successfully, then removes the owned Vercel deployment and Neon branch and checks absence. If an unmerged PR is closed, set `PREVIEW_ABANDONED=1` for its teardown instead. For a failed partial preview on a still-open draft PR, set `PREVIEW_ABORTED=1`. If the draft PR head changes after preview creation, set `PREVIEW_SUPERSEDED=1` to clean the old preview, then create and test a fresh preview for the new head before marking ready. The preview owner performs teardown before reporting completion.

The preview script does not auto-clean a failed partial deployment. Its journal records the resources and creation intent so the owner can recover and retry exact teardown. Never delete a provider resource based on a PR number alone.

## Production promotion

Create a PR from `staging` to `main` after staging acceptance. Review and merge it. The `Deploy landing production` push workflow queues the exact main commit as a Production deployment of `parkdex-landing` with domain assignment skipped. Once READY, verify the commit and release ID, assign `www.parkdex.app` and `parkdex.app`, then browser-test both domains, redirects, the absence of promotional web-app links, and the waitlist function. Confirm staging still points to its prior deployment.

The reusable `deploy-release.yml` follows Parkdex's thin caller and SHA-guarded, push-only pattern. The landing app has one owned deployable service, so the workflow queues its Vercel upload without waiting for provider readiness. If another independent service is added later, queue its request in parallel and wait only for each provider CLI to accept the request. Keep readiness, aliases, and browser acceptance in the agent-controlled release step.
