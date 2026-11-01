declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ADMIN_PASSWORD?: string;
    TOSS_CLIENT_KEY?: string;
    TOSS_SECRET_KEY?: string;
    TOSS_TEST_CLIENT_KEY?: string;
    TOSS_TEST_SECRET_KEY?: string;
  }
}
