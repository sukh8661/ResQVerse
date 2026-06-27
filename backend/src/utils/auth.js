import crypto from "node:crypto";
import { env } from "../config/env.js";

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key));
  });
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password, passwordHash) {
  if (!passwordHash || !passwordHash.includes(":")) return false;
  const [salt, hash] = passwordHash.split(":");
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key));
  });
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), derivedKey);
}

function base64url(input) {
  return Buffer.from(JSON.stringify(input)).toString("base64url");
}

export function createToken(payload) {
  const body = { ...payload, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 };
  const encoded = base64url(body);
  const signature = crypto.createHmac("sha256", env.tokenSecret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifyToken(token) {
  if (!token || !token.includes(".")) return null;
  const [encoded, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", env.tokenSecret).update(encoded).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  if (payload.exp && payload.exp < Date.now()) return null;
  return payload;
}

export function randomPassword() {
  return crypto.randomBytes(5).toString("base64url");
}
