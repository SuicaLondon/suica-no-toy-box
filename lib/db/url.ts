const DEFAULT_PG_PORT = 5432;

export function sanitizeDatabaseUrl(raw: string): string {
  try {
    const url = new URL(raw);
    // Remove problematic parameters that Node pg may not support
    url.searchParams.delete("channel_binding");
    url.searchParams.delete("sslrootcert");

    // Ensure SSL is enabled for Neon and similar cloud providers
    url.searchParams.set("sslmode", "require");

    return url.toString();
  } catch {
    return raw;
  }
}

export function toPgCredentials(connectionString: string) {
  const url = new URL(connectionString);

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : DEFAULT_PG_PORT,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    // Enhanced SSL configuration for Neon and similar cloud providers
    ssl: {
      rejectUnauthorized: false,
      // Add connection timeout to prevent hanging
      requestCert: true,
    },
    // Add connection timeout and keepalive settings
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  };
}
