import type { Leak, User } from "./models.js";

export const users: User[] = [
  {
    id: "u1",
    username: "Eduardo1",
    password: "Eduardo1",
    clearance: "ULTIMATE_FINALE",
    categories: ["SPACE_OPERA", "MYSTERY_TOWN", "COOKING_ARENA"]
  },
  {
    id: "u2",
    username: "Eduardo2",
    password: "Eduardo2",
    clearance: "SPOILER",
    categories: ["SPACE_OPERA"]
  },
  {
    id: "u3",
    username: "Eduardo3",
    password: "Eduardo3",
    clearance: "BACKSTAGE",
    categories: ["COOKING_ARENA"]
  }
];

export const leaks: Leak[] = [
  {
    id: "l1",
    title: "Teaser Oficial da Temporada",
    content: "Data de estreia e poster publico.",
    spoilerLevel: "PUBLIC_FEED",
    categories: [],
    ownerId: "u1"
  },
  {
    id: "l2",
    title: "Reviravolta Episodio 7",
    content: "Personagem principal troca de lado no final.",
    spoilerLevel: "SPOILER",
    categories: ["SPACE_OPERA"],
    ownerId: "u2"
  },
  {
    id: "l3",
    title: "Eliminacao surpresa no reality",
    content: "Participante favorito e eliminado antes da final.",
    spoilerLevel: "BACKSTAGE",
    categories: ["COOKING_ARENA"],
    ownerId: "u3"
  }
];

export function findUserByUsername(username: string) {
  return users.find((u) => u.username === username);
}

export function findUserById(id: string) {
  return users.find((u) => u.id === id);
}

export function findLeakById(id: string) {
  return leaks.find((d) => d.id === id);
}
