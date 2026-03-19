import type { Document, SecurityLevel, User } from "./models.js";

const levelRank: Record<SecurityLevel, number> = {
  PUBLIC: 0,
  CONFIDENTIAL: 1,
  SECRET: 2,
  TOP_SECRET: 3
};

function hasCategorySuperset(subjectCategories: string[], objectCategories: string[]) {
  const subjectSet = new Set(subjectCategories);
  return objectCategories.every((category) => subjectSet.has(category));
}

function dominatesForRead(user: User, doc: Document) {
  const levelOk = levelRank[user.clearance] >= levelRank[doc.classification];
  const categoryOk = hasCategorySuperset(user.categories, doc.categories);
  return levelOk && categoryOk;
}

function dominatesForWrite(doc: Document, user: User) {
  const levelOk = levelRank[doc.classification] >= levelRank[user.clearance];
  const categoryOk = hasCategorySuperset(doc.categories, user.categories);
  return levelOk && categoryOk;
}

export function canRead(user: User, doc: Document) {
  return dominatesForRead(user, doc);
}

export function canWrite(user: User, doc: Document) {
  return dominatesForWrite(doc, user);
}

export function levelFromString(level: string): SecurityLevel | null {
  if (level === "PUBLIC" || level === "CONFIDENTIAL" || level === "SECRET" || level === "TOP_SECRET") {
    return level;
  }
  return null;
}
