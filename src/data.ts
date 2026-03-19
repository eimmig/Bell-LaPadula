import type { Document, User } from "./models.js";

export const users: User[] = [
  {
    id: "u1",
    username: "Eduardo1",
    password: "Eduardo1",
    clearance: "TOP_SECRET",
    categories: ["NUCLEAR", "NATO", "FINANCE"]
  },
  {
    id: "u2",
    username: "Eduardo2",
    password: "Eduardo2",
    clearance: "SECRET",
    categories: ["NATO"]
  },
  {
    id: "u3",
    username: "Eduardo3",
    password: "Eduardo3",
    clearance: "CONFIDENTIAL",
    categories: ["FINANCE"]
  }
];

export const documents: Document[] = [
  {
    id: "d1",
    title: "Relatorio Publico",
    content: "Dados abertos para todos os usuarios.",
    classification: "PUBLIC",
    categories: [],
    ownerId: "u1"
  },
  {
    id: "d2",
    title: "Plano NATO",
    content: "Plano de operacao restrito a categoria NATO.",
    classification: "SECRET",
    categories: ["NATO"],
    ownerId: "u2"
  },
  {
    id: "d3",
    title: "Orcamento Critico",
    content: "Projecoes financeiras sensiveis.",
    classification: "CONFIDENTIAL",
    categories: ["FINANCE"],
    ownerId: "u3"
  }
];

export function findUserByUsername(username: string) {
  return users.find((u) => u.username === username);
}

export function findUserById(id: string) {
  return users.find((u) => u.id === id);
}

export function findDocumentById(id: string) {
  return documents.find((d) => d.id === id);
}
