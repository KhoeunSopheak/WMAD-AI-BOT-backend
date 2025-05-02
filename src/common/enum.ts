import { tuple } from "./types/tuple";


export const RoleEnum = tuple(
  "user",
  "admin",
);
export type RoleType = (typeof RoleEnum)[number];