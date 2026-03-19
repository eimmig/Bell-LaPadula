import type { Leak, SecurityLevel, User } from "./models.js";

const levelRank: Record<SecurityLevel, number> = {
  PUBLIC_FEED: 0,
  BACKSTAGE: 1,
  SPOILER: 2,
  ULTIMATE_FINALE: 3
};

function hasCategorySuperset(subjectCategories: string[], objectCategories: string[]) {
  const subjectSet = new Set(subjectCategories);
  return objectCategories.every((category) => subjectSet.has(category));
}

function dominatesForRead(user: User, leak: Leak) {
  const levelOk = levelRank[user.clearance] >= levelRank[leak.spoilerLevel];
  const categoryOk = hasCategorySuperset(user.categories, leak.categories);
  return levelOk && categoryOk;
}

function dominatesForWrite(leak: Leak, user: User) {
  const levelOk = levelRank[leak.spoilerLevel] >= levelRank[user.clearance];
  const categoryOk = hasCategorySuperset(leak.categories, user.categories);
  return levelOk && categoryOk;
}

export function canRead(user: User, leak: Leak) {
  return dominatesForRead(user, leak);
}

export function canWrite(user: User, leak: Leak) {
  return dominatesForWrite(leak, user);
}

export function levelFromString(level: string): SecurityLevel | null {
  if (level === "PUBLIC_FEED" || level === "BACKSTAGE" || level === "SPOILER" || level === "ULTIMATE_FINALE") {
    return level;
  }
  return null;
}
