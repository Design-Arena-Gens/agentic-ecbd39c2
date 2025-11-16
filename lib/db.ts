import Dexie, { Table } from "dexie";

export type SourceItem = {
  id?: number;
  name: string;
  type: string; // mime-type
  size: number;
  createdAt: string; // ISO
  data: Blob; // file data
};

class SourcesDatabase extends Dexie {
  sources!: Table<SourceItem, number>;

  constructor() {
    super("agentic-sources-db");
    this.version(1).stores({
      sources: "++id, name, type, createdAt, size"
    });
  }
}

export const db = new SourcesDatabase();
