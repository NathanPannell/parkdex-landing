# Landing provider retention inventory

Checked 2026-09-21 through read-only provider metadata requests. This covers only the separate landing project. No database rows, connection strings, credentials, or log contents were read.

| Provider | Observed setting | Meaning and limit |
| --- | --- | --- |
| Neon project `noisy-smoke-89213665` | `history_retention_seconds: 86400` (24 hours) | This is the configured project history window for point-in-time restore. It does not establish when every internal backup copy is deleted. [Neon project API](https://api-docs.neon.tech/reference/getproject), [Neon history explanation](https://neon.com/blog/point-in-time-recovery-in-postgres) |
| Neon project snapshots | Snapshot-list API returned zero snapshots | No project snapshot is currently listed. This does not prove Neon holds no internal backup or replica. [Neon snapshots API](https://api-docs.neon.tech/reference/listsnapshots) |
| Vercel project `prj_R7ccAjDhGmhiys542GFXJ67d1k8X` | Owning team `team_CJ0RWNsNJK6vDQy2raakV6cZ` reports billing plan `hobby` | Vercel's current plan documentation says Hobby runtime logs are available for one hour. The project API did not expose a project-specific log-retention override, so this is the documented plan limit rather than a measured deletion time. [Vercel runtime logs](https://vercel.com/docs/logs/runtime), [Vercel limits](https://vercel.com/docs/limits) |

Vercel [documents](https://vercel.com/docs/limits) build logs as retained for each deployment. This inventory did not verify deployment-specific build-log lifetime, any external log export, Vercel's internal backup retention, or Neon's internal backup deletion schedule. Do not promise that an opt-out address disappears from every provider backup or log within 24 hours. The 24-hour Neon value is a restore-history setting, not an erasure guarantee.
