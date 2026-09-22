# Provider retention metadata

Checked read-only at `2026-09-22T05:14Z`. Scope was the Parkdex app providers only. No SQL, user rows, object listings or object content, application logs, wakeups, or provider mutations were performed. Provider credentials were read only in memory to request the staging bucket lifecycle metadata and are not recorded here.

## Observed provider metadata

### Neon

- Project: `parkdex` / `damp-hat-81652631`.
- Project `history_retention_seconds`: `21600` seconds (6 hours).
- `main` and `staging` branches were present and ready when checked.
- Project snapshot list: empty (`[]`). Snapshot schedules for both `main` and `staging`: empty (`[]`).
- The six-hour history value is a provider history window, not a deletion guarantee or a user-record erasure SLA. Provider-internal backup and erase schedules remain unknown.

### Railway

- Project: `parkdex` / `0999e6e0-d2ae-4b48-b516-55d53dba7cb5`.
- GraphQL project metadata reported `subscriptionType=hobby`; workspace plan was `HOBBY`.
- The plan metadata reported `observability.logRetentionDays=7` and `auditLogs.retentionDays=2`. These are plan limits/default metadata, not evidence of an exact per-record purge time or a legal deletion guarantee.
- Staging allowlisted variables: `EMAIL_PROVIDER=resend`, `PHOTO_STORAGE_BACKEND=r2`, `R2_BUCKET=parkdex-staging`, `R2_REGION=auto`; `R2_ENDPOINT` was present. Secret values were not recorded.
- Production allowlisted variables: `EMAIL_PROVIDER=resend`; `PHOTO_STORAGE_BACKEND`, `R2_BUCKET`, `R2_BUCKET_NAME`, `R2_REGION`, `R2_ENDPOINT`, and `R2_S3_ENDPOINT` were absent from the service variable response. Source defaults `PHOTO_STORAGE_BACKEND` to `auto` and fails closed outside local/test when the R2 configuration quartet is incomplete, so production photo storage cannot be positively claimed from this metadata read.
- Deployment metadata showed Railway `logsV2=true`. No Railway log content was fetched. An exact platform log access/deletion schedule beyond the plan metadata above is unknown.

### Cloudflare R2

- Staging bucket identity from Railway metadata: `parkdex-staging`.
- A read-only S3 `GetBucketLifecycleConfiguration` request returned `AccessDenied` for the existing Railway R2 credential. The bucket lifecycle rule set is therefore unknown; no object listing or object read was attempted.
- Production R2 bucket identity and lifecycle metadata were unavailable because the production Railway service response contained no allowlisted R2 bucket/endpoint settings.

## Documented plan defaults and app deletion behavior

- `docs/photo-storage.md:46` documents a planned R2 lifecycle rule to remove abandoned quarantine objects after 24 hours once direct uploads are introduced. This is a design default, not observed bucket configuration.
- `docs/photo-storage.md:19`, `ARCHITECTURE.md:50`, and `docs/deployments.md:24` specify that a canonical photo delete is attempted immediately after the database tombstone commits. Failed deletes remain in a durable outbox for manual `python -m backend.app.photo_cleanup` retry; there is no recurring cleanup service.
- `docs/deployments.md:83` describes Neon expiry as a backstop for previews and says Railway/Vercel have no automatic cleanup backstop. That preview lifecycle does not establish persistent-environment retention.

## Unknowns and privacy conclusion

The exact provider internal erasure schedules for Neon history/backups, Railway application/audit logs, and R2 objects are unknown from the accessible metadata. Do not present `6 hours`, `7 days`, `2 days`, or the documented `24 hours` as a guaranteed deletion time. For source photos, the documented control remains an immediate delete attempt after the database tombstone with a durable manual retry outbox; provider-side completion time is not guaranteed.

## Scope correction
The production variable read above covered allowlisted service variables, not an exhaustive merged view of inherited/effective configuration. Missing fields in that response are not proof that production R2 is unconfigured. Production photo-storage readiness remains unverified; staging R2 is confirmed. No provider configuration was changed.
