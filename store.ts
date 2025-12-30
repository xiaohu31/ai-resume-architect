'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { ResumeContent, Block, ResumeSettings, BlockItem } from './types';
import { v4 as uuidv4 } from 'uuid';
import { arrayMove } from '@dnd-kit/sortable';

// Define the store state and actions
interface ResumeState {
  resume: ResumeContent;
  activeBlockId: string | null;
  isSettingsOpen: boolean;
  
  // Basic Actions
  setActiveBlock: (id: string | null) => void;
  setSettingsOpen: (isOpen: boolean) => void;
  setResume: (resume: ResumeContent) => void;
  updateResumeTitle: (title: string) => void;
  updateSettings: (settings: Partial<ResumeSettings>) => void;
  
  // Block Actions
  addCustomBlock: (title: string) => void;
  removeBlock: (id: string) => void;
  updateBlockTitle: (id: string, title: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  
  // Item Actions
  addBlockItem: (blockId: string) => void;
  removeBlockItem: (blockId: string, itemId: string) => void;
  updateBlockItemField: (blockId: string, itemId: string, field: string, value: string) => void;
  toggleBlockItemExpanded: (blockId: string, itemId: string) => void;
  reorderItems: (blockId: string, activeId: string, overId: string) => void;
}

const initialResume: ResumeContent = {
  id: uuidv4(),
  title: '我的简历',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  settings: {
    fontSize: 12,
    lineHeight: 1.5,
    modelName: 'gemini-3-flash-preview',
    baseUrl: 'https://generativelanguage.googleapis.com',
  },
  blocks: [
    {
      id: 'personal',
      type: 'personal',
      title: '个人信息',
      order: 0,
      visible: true,
      items: [
        {
          id: uuidv4(),
          fields: {
            name: '姓名',
            avatar: '',
            summary: '个人简述',
            gender: '男',
            age: '25岁',
            phone: '13800138000',
            email: 'example@mail.com',
            wechat: 'wechat_id',
            github: 'github.com/user'
          },
          isExpanded: true
        }
      ]
    },
    {
      id: 'education',
      type: 'education',
      title: '教育背景',
      order: 1,
      visible: true,
      items: []
    },
    {
      id: 'work',
      type: 'work',
      title: '工作经验',
      order: 2,
      visible: true,
      items: []
    },
    {
      id: 'project',
      type: 'project',
      title: '项目经验',
      order: 3,
      visible: true,
      items: []
    },
    {
      id: 'skills',
      type: 'skills',
      title: '专业技能',
      order: 4,
      visible: true,
      items: []
    }
  ]
};

// Fixed: Exporting useResumeStore as required by other components
export const useResumeStore = create<ResumeState>()(
  temporal(
    persist(
      (set) => ({
        resume: initialResume,
        activeBlockId: 'personal',
        isSettingsOpen: false,

        setActiveBlock: (id) => set({ activeBlockId: id }),
        setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
        setResume: (resume) => set({ resume }),
        updateResumeTitle: (title) => set((state) => ({ 
          resume: { ...state.resume, title, updatedAt: Date.now() } 
        })),
        updateSettings: (settings) => set((state) => ({
          resume: { ...state.resume, settings: { ...state.resume.settings, ...settings }, updatedAt: Date.now() }
        })),

        addCustomBlock: (title) => set((state) => {
          const newBlock: Block = {
            id: uuidv4(),
            type: 'custom',
            title,
            order: state.resume.blocks.length,
            visible: true,
            items: []
          };
          return {
            resume: {
              ...state.resume,
              blocks: [...state.resume.blocks, newBlock],
              updatedAt: Date.now()
            },
            activeBlockId: newBlock.id
          };
        }),

        removeBlock: (id) => set((state) => ({
          resume: {
            ...state.resume,
            blocks: state.resume.blocks.filter(b => b.id !== id),
            updatedAt: Date.now()
          },
          activeBlockId: state.activeBlockId === id ? null : state.activeBlockId
        })),

        updateBlockTitle: (id, title) => set((state) => ({
          resume: {
            ...state.resume,
            blocks: state.resume.blocks.map(b => b.id === id ? { ...b, title } : b),
            updatedAt: Date.now()
          }
        })),

        reorderBlocks: (activeId, overId) => set((state) => {
          const oldIndex = state.resume.blocks.findIndex(b => b.id === activeId);
          const newIndex = state.resume.blocks.findIndex(b => b.id === overId);
          return {
            resume: {
              ...state.resume,
              blocks: arrayMove(state.resume.blocks, oldIndex, newIndex).map((b, i) => ({ ...b, order: i })),
              updatedAt: Date.now()
            }
          };
        }),

        addBlockItem: (blockId) => set((state) => ({
          resume: {
            ...state.resume,
            blocks: state.resume.blocks.map(b => {
              if (b.id !== blockId) return b;
              const newItem: BlockItem = {
                id: uuidv4(),
                fields: {},
                isExpanded: true
              };
              return { ...b, items: [...b.items, newItem] };
            }),
            updatedAt: Date.now()
          }
        })),

        removeBlockItem: (blockId, itemId) => set((state) => ({
          resume: {
            ...state.resume,
            blocks: state.resume.blocks.map(b => {
              if (b.id !== blockId) return b;
              return { ...b, items: b.items.filter(i => i.id !== itemId) };
            }),
            updatedAt: Date.now()
          }
        })),

        updateBlockItemField: (blockId, itemId, field, value) => set((state) => ({
          resume: {
            ...state.resume,
            blocks: state.resume.blocks.map(b => {
              if (b.id !== blockId) return b;
              return {
                ...b,
                items: b.items.map(i => {
                  if (i.id !== itemId) return i;
                  return { ...i, fields: { ...i.fields, [field]: value } };
                })
              };
            }),
            updatedAt: Date.now()
          }
        })),

        toggleBlockItemExpanded: (blockId, itemId) => set((state) => ({
          resume: {
            ...state.resume,
            blocks: state.resume.blocks.map(b => {
              if (b.id !== blockId) return b;
              return {
                ...b,
                items: b.items.map(i => {
                  if (i.id !== itemId) return i;
                  return { ...i, isExpanded: !i.isExpanded };
                })
              };
            }),
            updatedAt: Date.now()
          }
        })),

        reorderItems: (blockId, activeId, overId) => set((state) => ({
          resume: {
            ...state.resume,
            blocks: state.resume.blocks.map(b => {
              if (b.id !== blockId) return b;
              const oldIndex = b.items.findIndex(i => i.id === activeId);
              const newIndex = b.items.findIndex(i => i.id === overId);
              return { ...b, items: arrayMove(b.items, oldIndex, newIndex) };
            }),
            updatedAt: Date.now()
          }
        })),
      }),
      {
        name: 'resume-storage',
      }
    )
  )
);