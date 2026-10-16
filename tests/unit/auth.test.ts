import { describe, it, expect } from "vitest";
import { rateLimit, generateToken } from "@/lib/auth";

describe("rateLimit", () => {

  it("allows requests under the limit", () => {
    const id = "user:auth-rate-1";
    const r1 = rateLimit(id, { limit: 3, windowMs: 60000 });
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);
    expect(r1.resetAt).toBeGreaterThan(Date.now());

    const r2 = rateLimit(id, { limit: 3, windowMs: 60000 });
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = rateLimit(id, { limit: 3, windowMs: 60000 });
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("denies requests over the limit", () => {
    const id = "user:auth-rate-2";
    rateLimit(id, { limit: 2, windowMs: 60000 });
    rateLimit(id, { limit: 2, windowMs: 60000 });
    const r = rateLimit(id, { limit: 2, windowMs: 60000 });
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
    expect(r.resetAt).toBeGreaterThan(Date.now());
  });

  it("tracks separate identifiers independently", () => {
    rateLimit("user:a", { limit: 1, windowMs: 60000 });
    rateLimit("user:a", { limit: 1, windowMs: 60000 });
    const denied = rateLimit("user:a", { limit: 1, windowMs: 60000 });
    expect(denied.allowed).toBe(false);

    const allowed = rateLimit("user:b", { limit: 1, windowMs: 60000 });
    expect(allowed.allowed).toBe(true);
  });

  it("uses sensible defaults", () => {
    const id = "user:auth-rate-3";
    const r = rateLimit(id);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(4);
    expect(r.resetAt).toBeGreaterThan(Date.now());
  });
});

describe("generateToken", () => {
  it("returns a 64-character hex string", () => {
    const token = generateToken();
    expect(typeof token).toBe("string");
    expect(token.length).toBe(64);
    expect(/^[0-9a-f]+$/.test(token)).toBe(true);
  });

  it("produces unique tokens", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).not.toBe(b);
  });
});
