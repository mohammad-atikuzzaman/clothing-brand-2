/**
 * Production-grade In-Memory Rate Limiting & Graduated IP Blocking Engine.
 * Designed to protect MongoDB and Serverless compute from Denial-of-Service,
 * scraping bots, and brute-force attacks while remaining strictly memory-bounded.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
  strikes: number;
}

interface BanRecord {
  bannedAt: number;
  expiresAt: number;
  reason: string;
}

// Bounded in-memory registries (Max 5,000 entries each to prevent memory leaks/heap exhaustion)
const MAX_REGISTRY_SIZE = 5000;
const rateLimitMap = new Map<string, RateLimitRecord>();
const ipBanMap = new Map<string, BanRecord>();

// Periodic garbage collection every 3 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();

    // Clean up expired rate limits
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetAt && record.strikes === 0) {
        rateLimitMap.delete(key);
      }
    }

    // Clean up expired IP bans
    for (const [ip, ban] of ipBanMap.entries()) {
      if (now > ban.expiresAt) {
        ipBanMap.delete(ip);
      }
    }

    // Hard ceiling safety: if still overflowing, evict oldest 20%
    if (rateLimitMap.size > MAX_REGISTRY_SIZE) {
      const keysToDelete = Array.from(rateLimitMap.keys()).slice(
        0,
        Math.floor(MAX_REGISTRY_SIZE * 0.2)
      );
      for (const k of keysToDelete) rateLimitMap.delete(k);
    }

    if (ipBanMap.size > MAX_REGISTRY_SIZE) {
      const keysToDelete = Array.from(ipBanMap.keys()).slice(
        0,
        Math.floor(MAX_REGISTRY_SIZE * 0.2)
      );
      for (const k of keysToDelete) ipBanMap.delete(k);
    }
  }, 3 * 60 * 1000);
}

/**
 * Checks whether an IP is currently banned
 */
export function isIpBanned(ip: string): {
  banned: boolean;
  reason?: string;
  remainingMinutes?: number;
} {
  const ban = ipBanMap.get(ip);
  if (!ban) return { banned: false };

  const now = Date.now();
  if (now > ban.expiresAt) {
    ipBanMap.delete(ip);
    return { banned: false };
  }

  const remainingMinutes = Math.max(
    1,
    Math.ceil((ban.expiresAt - now) / (60 * 1000))
  );
  return {
    banned: true,
    reason: ban.reason,
    remainingMinutes,
  };
}

/**
 * Manually or automatically bans an abusive IP address
 */
export function banIp(
  ip: string,
  reason: string,
  durationMs: number = 30 * 60 * 1000 // default 30 minutes
): void {
  const now = Date.now();
  ipBanMap.set(ip, {
    bannedAt: now,
    expiresAt: now + durationMs,
    reason,
  });
  console.warn(
    `🚨 [SECURITY] IP ${ip} has been BANNED for ${Math.round(
      durationMs / 60000
    )} minutes. Reason: ${reason}`
  );
}

/**
 * Instant penalty ban for malicious payload attacks (1 hour ban)
 */
export function penalizeMaliciousIp(ip: string, reason: string): void {
  banIp(ip, `Malicious Activity: ${reason}`, 60 * 60 * 1000);
}

/**
 * Checks rate limit with graduated strikes. If an IP repeatedly triggers limits,
 * it is automatically banned without touching the database.
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60 * 1000,
  maxStrikesBeforeBan: number = 3,
  banDurationMs: number = 20 * 60 * 1000
): {
  success: boolean;
  banned?: boolean;
  message?: string;
  remaining: number;
  resetAt: number;
} {
  // 1. Fast check if IP is already banned
  const banStatus = isIpBanned(identifier);
  if (banStatus.banned) {
    return {
      success: false,
      banned: true,
      message: `Access temporarily restricted due to excessive requests. Please try again in ${banStatus.remainingMinutes} minute(s).`,
      remaining: 0,
      resetAt: Date.now() + (banStatus.remainingMinutes || 1) * 60 * 1000,
    };
  }

  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // First request or window expired
  if (!record || now > record.resetAt) {
    const strikes = record?.strikes || 0;
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
      strikes,
    };
    rateLimitMap.set(identifier, newRecord);
    return {
      success: true,
      remaining: limit - 1,
      resetAt: newRecord.resetAt,
    };
  }

  // Under limit
  if (record.count < limit) {
    record.count += 1;
    return {
      success: true,
      remaining: limit - record.count,
      resetAt: record.resetAt,
    };
  }

  // Limit exceeded -> increment strike count
  record.strikes += 1;

  if (record.strikes >= maxStrikesBeforeBan) {
    banIp(
      identifier,
      `Exceeded rate limits ${record.strikes} times in succession`,
      banDurationMs
    );
    rateLimitMap.delete(identifier);
    return {
      success: false,
      banned: true,
      message: `Your network has been temporarily locked for ${Math.round(
        banDurationMs / 60000
      )} minutes due to suspicious traffic spikes.`,
      remaining: 0,
      resetAt: now + banDurationMs,
    };
  }

  const waitSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
  return {
    success: false,
    message: `Too many requests. Please wait ${waitSeconds} seconds before trying again.`,
    remaining: 0,
    resetAt: record.resetAt,
  };
}
