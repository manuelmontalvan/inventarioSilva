import { Page } from "./page";

export interface Role {
  id: string;
  name: string;
  pages?: Page[];
}