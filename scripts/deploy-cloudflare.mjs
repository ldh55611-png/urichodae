// Cloudflare 배포: `npm run build` 다음에 실행합니다.
// D1 데이터베이스와 R2 버킷이 없으면 만들고, DB 마이그레이션을 적용한 뒤 워커를 배포합니다.
// Cloudflare Workers Builds(저장소 연결)에서는 로그인 정보가 자동으로 주어지고,
// 내 컴퓨터에서는 `npx wrangler login` 후 실행하면 됩니다.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const config = path.join(root, "dist/server/wrangler.json");
const wrangler = path.join(root, "node_modules/wrangler/bin/wrangler.js");
if (!existsSync(config)) throw new Error("dist/server/wrangler.json이 없습니다. 먼저 npm run build를 실행하세요.");

function run(args, { capture = false, allowFail = false } = {}) {
  console.log(`$ wrangler ${args.join(" ")}`);
  const result = spawnSync(process.execPath, [wrangler, ...args], {
    cwd: root,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    env: { ...process.env, CI: "true" },
  });
  if (result.status !== 0 && !allowFail) {
    if (capture) console.error(result.stdout, result.stderr);
    throw new Error(`wrangler ${args[0]} ${args[1] ?? ""} 실패`);
  }
  return result;
}

const settings = JSON.parse(readFileSync(config, "utf8"));
const d1 = settings.d1_databases[0];
const r2 = settings.r2_buckets[0];

function findDatabase() {
  const out = run(["d1", "list", "--json"], { capture: true }).stdout;
  return JSON.parse(out.slice(out.indexOf("["))).find((db) => db.name === d1.database_name);
}

let database = findDatabase();
if (!database) {
  run(["d1", "create", d1.database_name]);
  database = findDatabase();
}
if (!database?.uuid) throw new Error(`D1 데이터베이스 ${d1.database_name}를 찾지 못했습니다.`);
d1.database_id = database.uuid;
d1.migrations_dir = path.relative(path.dirname(config), path.join(root, "drizzle"));

const bucket = run(["r2", "bucket", "create", r2.bucket_name], { capture: true, allowFail: true });
const bucketLog = `${bucket.stdout}${bucket.stderr}`;
if (bucket.status !== 0 && !/already exists|10004/i.test(bucketLog)) {
  console.error(bucketLog);
  throw new Error(`R2 버킷 ${r2.bucket_name}을 만들지 못했습니다.`);
}

writeFileSync(config, JSON.stringify(settings));
run(["d1", "migrations", "apply", d1.binding, "--remote", "--config", config]);
run(["deploy", "--config", config]);
