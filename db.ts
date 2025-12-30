
import Dexie, { Table } from 'dexie';
import { ResumeVersion } from './types';

export class ResumeDatabase extends Dexie {
  versions!: Table<ResumeVersion>;

  constructor() {
    super('ResumeBuilderDB');
    // Fix: Access Dexie's version method using type assertion to avoid ambiguity with 'versions' table property
    (this as any).version(1).stores({
      versions: 'id, resumeId, name, createdAt'
    });
  }
}

export const db = new ResumeDatabase();
