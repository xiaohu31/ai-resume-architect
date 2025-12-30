
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ResumeContent, Block, BlockType, BlockItem } from './types';
import { v4 as uuidv4 } from 'uuid';

interface ResumeState {
  resume: ResumeContent;
  activeBlockId: string | null;
  setActiveBlock: (id: string | null) => void;
  updateResumeTitle: (title: string) => void;
  updateBlockTitle: (blockId: string, title: string) => void;
  updateBlockItemField: (blockId: string, itemId: string, field: string, value: string) => void;
  addBlockItem: (blockId: string) => void;
  removeBlockItem: (blockId: string, itemId: string) => void;
  toggleBlockItemExpanded: (blockId: string, itemId: string) => void;
  addCustomBlock: (title: string) => void;
  removeBlock: (blockId: string) => void;
  reorderBlocks: (newBlocks: Block[]) => void;
  setResume: (resume: ResumeContent) => void;
}

const initialBlocks: Block[] = [
  {
    id: 'personal-block',
    type: 'personal',
    title: '个人信息',
    order: 0,
    visible: true,
    items: [{ id: uuidv4(), fields: { name: '', phone: '', email: '', target: '', city: '' }, isExpanded: true }]
  },
  {
    id: 'work-block',
    type: 'work',
    title: '工作经历',
    order: 1,
    visible: true,
    items: []
  },
  {
    id: 'project-block',
    type: 'project',
    title: '项目经历',
    order: 2,
    visible: true,
    items: []
  },
  {
    id: 'education-block',
    type: 'education',
    title: '教育经历',
    order: 3,
    visible: true,
    items: []
  },
  {
    id: 'skills-block',
    type: 'skills',
    title: '专业技能',
    order: 4,
    visible: true,
    items: [{ id: uuidv4(), fields: { content: '' }, isExpanded: true }]
  }
];

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      resume: {
        id: uuidv4(),
        title: '我的简历 2025',
        blocks: initialBlocks,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      activeBlockId: 'personal-block',
      setActiveBlock: (id) => set({ activeBlockId: id }),
      updateResumeTitle: (title) => set((state) => ({
        resume: { ...state.resume, title, updatedAt: Date.now() }
      })),
      updateBlockTitle: (blockId, title) => set((state) => ({
        resume: {
          ...state.resume,
          blocks: state.resume.blocks.map(b => b.id === blockId ? { ...b, title } : b),
          updatedAt: Date.now()
        }
      })),
      updateBlockItemField: (blockId, itemId, field, value) => set((state) => ({
        resume: {
          ...state.resume,
          blocks: state.resume.blocks.map(b => b.id === blockId ? {
            ...b,
            items: b.items.map(i => i.id === itemId ? { ...i, fields: { ...i.fields, [field]: value } } : i)
          } : b),
          updatedAt: Date.now()
        }
      })),
      addBlockItem: (blockId) => set((state) => ({
        resume: {
          ...state.resume,
          blocks: state.resume.blocks.map(b => b.id === blockId ? {
            ...b,
            items: [...b.items, { id: uuidv4(), fields: {}, isExpanded: true }]
          } : b),
          updatedAt: Date.now()
        }
      })),
      removeBlockItem: (blockId, itemId) => set((state) => ({
        resume: {
          ...state.resume,
          blocks: state.resume.blocks.map(b => b.id === blockId ? {
            ...b,
            items: b.items.filter(i => i.id !== itemId)
          } : b),
          updatedAt: Date.now()
        }
      })),
      toggleBlockItemExpanded: (blockId, itemId) => set((state) => ({
        resume: {
          ...state.resume,
          blocks: state.resume.blocks.map(b => b.id === blockId ? {
            ...b,
            items: b.items.map(i => i.id === itemId ? { ...i, isExpanded: !i.isExpanded } : i)
          } : b)
        }
      })),
      addCustomBlock: (title) => set((state) => ({
        resume: {
          ...state.resume,
          blocks: [...state.resume.blocks, {
            id: uuidv4(),
            type: 'custom',
            title,
            order: state.resume.blocks.length,
            visible: true,
            items: [{ id: uuidv4(), fields: { content: '' }, isExpanded: true }]
          }],
          updatedAt: Date.now()
        }
      })),
      removeBlock: (blockId) => set((state) => ({
        resume: {
          ...state.resume,
          blocks: state.resume.blocks.filter(b => b.id !== blockId),
          updatedAt: Date.now()
        }
      })),
      reorderBlocks: (newBlocks) => set((state) => ({
        resume: { ...state.resume, blocks: newBlocks, updatedAt: Date.now() }
      })),
      setResume: (resume) => set({ resume }),
    }),
    {
      name: 'resume-storage',
    }
  )
);
