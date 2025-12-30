
'use client';

import Dexie, { Table } from 'dexie';
import { ResumeVersion } from './types';

export class ResumeDatabase extends Dexie {
  versions!: Table<ResumeVersion>;

  constructor() {
    super('ResumeBuilderDB');
    (this as any).version(1).stores({
      versions: 'id, resumeId, name, createdAt'
    });
  }
}

// 确保仅在客户端实例化
export const db = typeof window !== 'undefined' ? new ResumeDatabase() : {} as ResumeDatabase;
