#!/usr/bin/env node
// Agent-run, same-repository draft PR preview. No GitHub trigger creates previews.
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { closeSync, existsSync, mkdirSync, mkdtempSync, openSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = process.env.PREVIEW_HARNESS_ROOT ? resolve(process.env.PREVIEW_HARNESS_ROOT) : scriptRoot;
const repository = "NathanPannell/parkdex-landing";
const baseUrl = "https://console.neon.tech/api/v2";
const stateRoot = join(process.env.LOCALAPPDATA || tmpdir(), "Parkdex", "landing-preview-pr");

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function toolEnv() {
  const allowed = /^(?:PATH|SystemRoot|WINDIR|TEMP|TMP|TMPDIR|HOME|USERPROFILE|APPDATA|LOCALAPPDATA|ProgramFiles|ComSpec|CI|TERM)$/i;
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => allowed.test(key)));
  env.CI = "1";
  env.NO_COLOR = "1";
  return env;
}

function command(executable, args, { cwd = root, env = process.env, input, includeStderr = false } = {}) {
  // Windows npm and Vercel shims are shell scripts. Invoke their JS entry points
  // directly so the database URI never enters a shell command string.
  if (process.platform === "win32" && executable === "vercel") {
    executable = process.execPath;
    args = [join(required("APPDATA"), "npm", "node_modules", "vercel", "dist", "vc.js"), ...args];
  } else if (process.platform === "win32" && executable === "npm") {
    executable = process.execPath;
    args = [join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js"), ...args];
  }
  const result = spawnSync(executable, args, { cwd, env, input, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (result.error || result.status !== 0) {
    const diagnostic = `${result.stderr || ""}\n${result.stdout || ""}`
      .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "postgres://[redacted]")
      .replace(/[A-Za-z0-9_-]{48,}/g, "[redacted]")
      .trim().slice(-1000);
    throw new Error(`${executable} failed: ${result.error?.message || diagnostic || `exit ${result.status}`}`);
  }
  return (includeStderr ? `${result.stdout}\n${result.stderr}` : result.stdout).trim();
}

function git(...args) { return command("git", args, { env: { ...toolEnv(), SSH_AUTH_SOCK: process.env.SSH_AUTH_SOCK } }); }
function gh(...args) { return command("gh", args, { env: { ...toolEnv(), GH_TOKEN: process.env.GH_TOKEN, GITHUB_TOKEN: process.env.GITHUB_TOKEN } }); }
function vercelEnv() { return { ...toolEnv(), VERCEL_PROJECT_ID: required("VERCEL_PREVIEW_PROJECT_ID") }; }
function vercel(...args) { return command("vercel", [...args, "--token", required("VERCEL_TOKEN"), "--scope", required("VERCEL_ORG_ID")], { env: vercelEnv() }); }
function vercelWithStderr(...args) { return command("vercel", [...args, "--token", required("VERCEL_TOKEN"), "--scope", required("VERCEL_ORG_ID")], { env: vercelEnv(), includeStderr: true }); }

async function neonApi(path, { method = "GET", body, query } = {}) {
  const url = new URL(`${baseUrl}${path}`);
  for (const [key, value] of Object.entries(query || {})) if (value !== undefined) url.searchParams.set(key, String(value));
  const response = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${required("NEON_API_KEY")}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Neon ${method} ${path} failed with HTTP ${response.status}`);
  return payload;
}

async function listNeonBranches(project, search) {
  const branches = [];
  const seenCursors = new Set();
  let cursor;
  do {
    const payload = await neonApi(`/projects/${project}/branches`, { query: { limit: 1000, search, ...(cursor ? { cursor } : {}) } });
    if (!Array.isArray(payload.branches)) throw new Error("Neon branch inventory was incomplete");
    branches.push(...payload.branches);
    cursor = payload.pagination?.next;
    if (cursor) {
      if (seenCursors.has(cursor)) throw new Error("Neon branch pagination repeated a cursor");
      seenCursors.add(cursor);
    }
  } while (cursor);
  return branches;
}

function journalPath(pr) { return join(stateRoot, "journals", `pr-${pr}.json`); }
function save(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  const temp = `${path}.${process.pid}.tmp`;
  writeFileSync(temp, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
  // replace is atomic on the local filesystem
  renameSync(temp, path);
}

function lock(pr) {
  mkdirSync(stateRoot, { recursive: true });
  const path = join(stateRoot, `pr-${pr}.lock`);
  try {
    const fd = openSync(path, "wx", 0o600);
    return () => { closeSync(fd); rmSync(path, { force: true }); };
  } catch { throw new Error(`PR #${pr} already has a preview operation in progress. Recover ${path} only after checking its owner.`); }
}

function assertSetup() {
  for (const key of ["NEON_API_KEY", "NEON_PROJECT_ID", "VERCEL_TOKEN", "VERCEL_ORG_ID", "VERCEL_PREVIEW_PROJECT_ID"]) required(key);
  if (!/^prj_[A-Za-z0-9]+$/.test(process.env.VERCEL_PREVIEW_PROJECT_ID)) throw new Error("Invalid VERCEL_PREVIEW_PROJECT_ID");
  if (!/^team_[A-Za-z0-9]+$/.test(process.env.VERCEL_ORG_ID)) throw new Error("Invalid VERCEL_ORG_ID");
  const origin = git("remote", "get-url", "origin");
  if (!/^(https:\/\/github\.com\/|git@github\.com:)NathanPannell\/parkdex-landing(?:\.git)?$/.test(origin)) throw new Error("Git origin is not NathanPannell/parkdex-landing");
}

function makeCandidate(headSha, baseSha) {
  const tree = git("merge-tree", "--write-tree", baseSha, headSha);
  if (!/^[0-9a-f]{40}$/.test(tree)) throw new Error("Merge candidate has conflicts");
  const env = { ...toolEnv(), GIT_AUTHOR_NAME: "Parkdex Preview", GIT_AUTHOR_EMAIL: "preview@parkdex.app", GIT_COMMITTER_NAME: "Parkdex Preview", GIT_COMMITTER_EMAIL: "preview@parkdex.app" };
  const candidate = command("git", ["commit-tree", tree, "-p", baseSha, "-p", headSha, "-m", "Preview merge candidate"], { env });
  if (!/^[0-9a-f]{40}$/.test(candidate)) throw new Error("Invalid synthetic merge candidate");
  const directory = mkdtempSync(join(tmpdir(), "parkdex-landing-pr-"));
  git("worktree", "add", "--detach", directory, candidate);
  return { candidate, directory };
}

function bindVercel(directory) {
  const project = join(directory, ".vercel");
  mkdirSync(project, { recursive: true });
  writeFileSync(join(project, "project.json"), `${JSON.stringify({ orgId: required("VERCEL_ORG_ID"), projectId: required("VERCEL_PREVIEW_PROJECT_ID"), projectName: process.env.VERCEL_PREVIEW_PROJECT_NAME || "parkdex-landing-staging" })}\n`, { mode: 0o600 });
}

function verifyVercelProject() {
  const name = process.env.VERCEL_PREVIEW_PROJECT_NAME || "parkdex-landing-staging";
  const id = required("VERCEL_PREVIEW_PROJECT_ID");
  const listing = JSON.parse(vercel("project", "ls", "--json"));
  const matches = (listing.projects || []).filter((project) => project.id === id && project.name === name);
  if (matches.length !== 1) throw new Error("Vercel preview project ID and name were not verified together");
  return name;
}

function neonAnnotations(payload) {
  return payload?.annotation?.value || payload?.branch?.annotation_value || payload?.branch?.annotations || payload?.annotation_value || payload?.annotations || {};
}

function ownedVercelDeployments(state) {
  const output = vercel("list", process.env.VERCEL_PREVIEW_PROJECT_NAME || "parkdex-landing-staging", "--meta", `sourceCommit=${state.headSha}`, "--meta", `landingReleaseId=${state.releaseId}`, "--meta", `landingPr=${state.pullRequest}`, "--yes", "--no-color");
  const hosts = [...new Set(output.match(/[A-Za-z0-9][A-Za-z0-9-]*\.vercel\.app/g) || [])];
  return hosts.map((host) => JSON.parse(vercel("inspect", host, "--json")))
    .filter((item) => item.name === (process.env.VERCEL_PREVIEW_PROJECT_NAME || "parkdex-landing-staging") && item.target === "preview");
}

async function create(pr) {
  assertSetup();
  verifyVercelProject();
  if (existsSync(journalPath(pr))) {
    const previous = JSON.parse(readFileSync(journalPath(pr), "utf8"));
    if (previous.schema !== "parkdex-landing.preview/v1" || previous.repository !== repository || previous.pullRequest !== pr || previous.status !== "cleaned" || !previous.absenceVerifiedAt || !/^[0-9a-f-]{36}$/.test(previous.releaseId || "")) {
      throw new Error(`PR #${pr} has an active or unverified preview journal. Tear it down or recover it before creating another.`);
    }
    const archive = join(stateRoot, "history", `pr-${pr}`, `${previous.releaseId}.json`);
    mkdirSync(dirname(archive), { recursive: true });
    if (existsSync(archive)) throw new Error(`Preview archive already exists: ${archive}`);
    renameSync(journalPath(pr), archive);
  }
  if (git("status", "--porcelain")) throw new Error("Run preview creation from a clean staging checkout");
  const pull = JSON.parse(gh("pr", "view", String(pr), "--repo", repository, "--json", "number,state,isDraft,isCrossRepository,baseRefName,headRefName,headRefOid"));
  if (pull.number !== pr || pull.state !== "OPEN" || !pull.isDraft || pull.isCrossRepository || pull.baseRefName !== "staging") throw new Error("Preview requires an open same-repository draft PR targeting staging");
  if (!/^[0-9a-f]{40}$/.test(pull.headRefOid) || !/^[A-Za-z0-9._/-]+$/.test(pull.headRefName) || pull.headRefName.includes("..")) throw new Error("Unsafe PR head identity");
  git("fetch", "--no-tags", "origin", "+refs/heads/staging:refs/remotes/origin/staging", `+refs/heads/${pull.headRefName}:refs/remotes/origin/${pull.headRefName}`);
  const baseSha = git("rev-parse", "refs/remotes/origin/staging");
  if (git("rev-parse", "HEAD") !== baseSha) throw new Error("Checkout must be at the current origin/staging SHA");
  if (git("rev-parse", `refs/remotes/origin/${pull.headRefName}`) !== pull.headRefOid) throw new Error("PR head changed during fetch");
  const releaseId = randomUUID();
  const branchName = `preview/landing-pr-${pr}-${pull.headRefOid.slice(0, 8)}-${releaseId.slice(0, 8)}`;
  const state = { schema: "parkdex-landing.preview/v1", repository, pullRequest: pr, releaseId, headSha: pull.headRefOid, baseSha, branchName, status: "validating", owner: `${process.env.USERNAME || process.env.USER || "agent"}@${process.env.COMPUTERNAME || process.env.HOSTNAME || "host"}`, taskId: process.env.CODEX_THREAD_ID || null, createdAt: new Date().toISOString(), resources: {}, intent: {} };
  const path = journalPath(pr);
  save(path, state);
  let candidateDir;
  try {
    const { candidate, directory } = makeCandidate(pull.headRefOid, baseSha);
    candidateDir = directory;
    state.candidateSha = candidate;
    save(path, state);
    command("npm", ["ci"], { cwd: directory, env: toolEnv() });
    command("npm", ["test"], { cwd: directory, env: toolEnv() });
    command("npm", ["run", "build"], { cwd: directory, env: toolEnv() });
    const project = required("NEON_PROJECT_ID");
    const [parentMatches, existing] = await Promise.all([
      listNeonBranches(project, process.env.NEON_PARENT_BRANCH || "staging"),
      listNeonBranches(project, branchName),
    ]);
    const parent = parentMatches.filter((item) => item.name === (process.env.NEON_PARENT_BRANCH || "staging"));
    if (parent.length !== 1 || existing.some((item) => item.name === branchName)) throw new Error("Neon staging parent is missing or preview branch already exists");
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    state.intent.neon = { projectId: project, branchName, parentId: parent[0].id };
    state.status = "neon-creating";
    save(path, state);
    const created = await neonApi(`/projects/${project}/branches`, { method: "POST", body: { branch: { name: branchName, parent_id: parent[0].id, init_source: "parent-schema", expires_at: expiresAt }, endpoints: [{ type: "read_write" }], annotation_value: { "landing-release-id": releaseId, "landing-commit": pull.headRefOid, "landing-pr": String(pr) } } });
    const branch = created.branch;
    if (!branch?.id || branch.name !== branchName) throw new Error("Neon did not return the owned branch identity");
    const branchDetail = await neonApi(`/projects/${project}/branches/${branch.id}`);
    const annotations = neonAnnotations(branchDetail);
    if (annotations["landing-release-id"] !== releaseId || annotations["landing-commit"] !== pull.headRefOid || annotations["landing-pr"] !== String(pr)) throw new Error("Neon branch provenance was not verified");
    state.resources.neonBranchId = branch.id;
    state.status = "neon-created";
    save(path, state);
    const database = process.env.NEON_DATABASE_NAME || "app";
    const role = process.env.NEON_ROLE_NAME || "app_owner";
    const connection = await neonApi(`/projects/${project}/connection_uri`, { query: { branch_id: branch.id, database_name: database, role_name: role, pooled: true } });
    const uri = new URL(connection.uri);
    if (!/\.neon\.tech$/.test(uri.hostname) || uri.pathname !== `/${database}`) throw new Error("Neon preview database URI did not match the owned branch");
    const sql = neon(connection.uri);
    await sql.query(readFileSync(join(directory, "schema.sql"), "utf8"));
    bindVercel(directory);
    const previewEnv = vercelWithStderr("env", "ls", "preview", "--cwd", directory, "--no-color");
    if (!/No Environment Variables found/i.test(previewEnv)) throw new Error("The Vercel Preview environment must contain no persistent variables");
    state.intent.vercel = { projectId: required("VERCEL_PREVIEW_PROJECT_ID"), headSha: pull.headRefOid, releaseId };
    state.status = "vercel-creating";
    save(path, state);
    const output = vercel("deploy", "--yes", "--target", "preview", "--skip-domain", "--no-color", "--cwd", directory, "--local-config", join(directory, "vercel.staging.json"), "--env", `DATABASE_URL=${connection.uri}`, "--build-env", "VITE_APP_URL=https://staging.web.parkdex.app", "--meta", `sourceCommit=${pull.headRefOid}`, "--meta", `landingReleaseId=${releaseId}`, "--meta", `landingPr=${pr}`);
    const url = output.split(/\r?\n/).findLast((line) => /^https:\/\/[A-Za-z0-9.-]+\.vercel\.app\/?$/.test(line.trim()))?.trim();
    if (!url) throw new Error("Vercel did not return a preview URL");
    const inspection = JSON.parse(vercel("inspect", url, "--json"));
    if (!/^dpl_[A-Za-z0-9]+$/.test(inspection.id || "") || inspection.target !== "preview" || inspection.readyState !== "READY") throw new Error("Vercel preview did not reach READY with an owned deployment ID");
    state.resources.vercelDeploymentId = inspection.id;
    state.url = url;
    state.status = "ready-for-browser-verification";
    state.readyAt = new Date().toISOString();
    save(path, state);
    console.log(`preview-url=${url}`);
    console.log(`journal=${path}`);
    console.log("Browser-test signup and removal on this exact preview URL before marking the PR ready.");
  } catch (error) {
    if (!Object.keys(state.intent).length && !Object.keys(state.resources).length) {
      rmSync(path, { force: true });
    } else {
      state.status = "failed-needs-teardown";
      state.failure = error.message;
      save(path, state);
    }
    throw error;
  } finally {
    if (candidateDir) {
      try { git("worktree", "remove", "--force", candidateDir); } finally { rmSync(candidateDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 }); git("worktree", "prune"); }
    }
  }
}

async function teardown(pr) {
  assertSetup();
  verifyVercelProject();
  const path = journalPath(pr);
  if (!existsSync(path)) throw new Error(`No owned preview journal exists for PR #${pr}`);
  const state = JSON.parse(readFileSync(path, "utf8"));
  if (state.schema !== "parkdex-landing.preview/v1" || state.repository !== repository || state.pullRequest !== pr || !/^[0-9a-f]{40}$/.test(state.headSha || "")) throw new Error("Preview journal identity is invalid");
  if (state.status === "cleaned") { console.log(`preview already cleaned: ${path}`); return; }
  const pull = JSON.parse(gh("pr", "view", String(pr), "--repo", repository, "--json", "state,mergedAt,headRefOid"));
  const headChanged = pull.headRefOid !== state.headSha;
  if (pull.state === "MERGED" && pull.mergedAt) {
    if (process.env.STAGING_VERIFIED !== "1") throw new Error("Set STAGING_VERIFIED=1 only after the staging deployment and browser journey pass");
    const stable = await fetch("https://staging.parkdex.app", { signal: AbortSignal.timeout(15000) });
    if (!stable.ok) throw new Error(`Staging landing is not serving HTTP 2xx: ${stable.status}`);
  } else if (pull.state === "OPEN" && state.status === "failed-needs-teardown" && process.env.PREVIEW_ABORTED === "1") {
    // Partial failed previews can be cleaned while their draft PR remains open.
  } else if (pull.state === "OPEN" && headChanged && process.env.PREVIEW_SUPERSEDED === "1") {
    // An updated PR must clean its old preview before creating one for the new head.
  } else if (pull.state !== "CLOSED" || process.env.PREVIEW_ABANDONED !== "1") {
    throw new Error("Teardown requires verified staging, PREVIEW_ABANDONED=1 for a closed PR, PREVIEW_ABORTED=1 for a failed draft preview, or PREVIEW_SUPERSEDED=1 after the PR head changes");
  }
  const project = required("NEON_PROJECT_ID");
  if (state.intent.neon && state.intent.neon.projectId !== project) throw new Error("NEON_PROJECT_ID does not match the preview journal project");
  if (!state.resources.vercelDeploymentId && state.intent.vercel) {
    const matches = ownedVercelDeployments(state);
    if (matches.length > 1) throw new Error("Multiple Vercel deployments match preview metadata");
    if (matches.length === 1) { state.resources.vercelDeploymentId = matches[0].id; save(path, state); }
  }
  if (!state.resources.neonBranchId && state.intent.neon) {
    const branches = await listNeonBranches(project, state.branchName);
    const matches = branches.filter((item) => item.name === state.branchName);
    if (matches.length > 1) throw new Error("Multiple Neon branches match preview name");
    if (matches.length === 1) {
      const detail = await neonApi(`/projects/${project}/branches/${matches[0].id}`);
      const annotations = neonAnnotations(detail);
      if (annotations["landing-release-id"] !== state.releaseId || annotations["landing-commit"] !== state.headSha || annotations["landing-pr"] !== String(pr)) throw new Error("Recovered Neon branch provenance mismatch");
      state.resources.neonBranchId = matches[0].id; save(path, state);
    }
  }
  if (state.resources.vercelDeploymentId) {
    const matches = ownedVercelDeployments(state).filter((item) => item.id === state.resources.vercelDeploymentId);
    if (matches.length > 1) throw new Error("Vercel deployment ownership mismatch");
    if (matches.length === 1) {
      state.status = "vercel-removing"; save(path, state);
      vercel("remove", state.resources.vercelDeploymentId, "--safe", "--yes");
    }
  }
  if (state.resources.neonBranchId) {
    const branches = await listNeonBranches(project, state.branchName);
    const matches = branches.filter((item) => item.id === state.resources.neonBranchId && item.name === state.branchName);
    if (matches.length > 1) throw new Error("Neon branch ownership mismatch");
    if (matches.length === 1) {
      const detail = await neonApi(`/projects/${project}/branches/${state.resources.neonBranchId}`);
      const annotations = neonAnnotations(detail);
      if (annotations["landing-release-id"] !== state.releaseId || annotations["landing-commit"] !== state.headSha || annotations["landing-pr"] !== String(pr)) throw new Error("Neon branch provenance mismatch");
      state.status = "neon-removing"; save(path, state);
      await neonApi(`/projects/${project}/branches/${state.resources.neonBranchId}`, { method: "DELETE" });
    }
  }
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const branches = await listNeonBranches(project, state.branchName);
    if (branches.some((item) => item.id === state.resources.neonBranchId || item.name === state.branchName)) throw new Error("Owned Neon preview branch is still present");
    if (ownedVercelDeployments(state).length) throw new Error("Owned Vercel preview deployment is still present");
    if (attempt < 2) await new Promise((resolveWait) => setTimeout(resolveWait, 2000));
  }
  state.status = "cleaned";
  state.prHeadChangedAfterPreview = headChanged;
  state.absenceVerifiedAt = new Date().toISOString();
  save(path, state);
  console.log(`preview-cleaned=pr-${pr}`);
  if (headChanged && pull.state === "MERGED") console.log("warning=The merged PR head differed from this preview. Do not claim that the merged revision was preview-verified.");
  console.log(`journal=${path}`);
}

const [mode, number] = process.argv.slice(2);
const pr = Number(number);
if (!["create", "teardown"].includes(mode) || !Number.isInteger(pr) || pr < 1 || pr > 999999) {
  console.error("Usage: node scripts/preview-pr.mjs create|teardown PR_NUMBER");
  process.exitCode = 2;
} else {
  const unlock = lock(pr);
  try { await (mode === "create" ? create(pr) : teardown(pr)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { unlock(); }
}
