
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { ResumeContent, Block, ResumeSettings } from './types';
import { v4 as uuidv4 } from 'uuid';
import { arrayMove } from '@dnd-kit/sortable';

interface ResumeState {
  resume: ResumeContent;
  activeBlockId: string | null;
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  setActiveBlock: (id: string | null) => void;
  updateResumeTitle: (title: string) => void;
  updateSettings: (settings: Partial<ResumeSettings>) => void;
  updateBlockTitle: (blockId: string, title: string) => void;
  updateBlockItemField: (blockId: string, itemId: string, field: string, value: string) => void;
  addBlockItem: (blockId: string) => void;
  removeBlockItem: (blockId: string, itemId: string) => void;
  toggleBlockItemExpanded: (blockId: string, itemId: string) => void;
  addCustomBlock: (title: string) => void;
  removeBlock: (blockId: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  reorderItems: (blockId: string, activeId: string, overId: string) => void;
  setResume: (resume: ResumeContent) => void;
}

const initialBlocks: Block[] = [
  {
    id: 'personal-block',
    type: 'personal',
    title: '个人信息',
    order: 0,
    visible: true,
    items: [{ 
      id: uuidv4(), 
      fields: { 
        name: '张小喵', 
        gender: '男',
        age: '27岁',
        phone: '131xxxx8888', 
        email: 'admin@google.com', 
        wechat: '0123456789',
        github: 'wzdnzd',
        summary: '工作经验：5年 | 求职意向：Java高级开发工程师 | 期望城市：北京',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
      }, 
      isExpanded: true 
    }]
  },
  {
    id: 'education-block',
    type: 'education',
    title: '教育背景',
    order: 1,
    visible: true,
    items: [
      { id: uuidv4(), fields: { school: '清华大学', major: '计算机科学与技术', degree: '硕士', duration: '2017.09 - 2020.06' }, isExpanded: false },
      { id: uuidv4(), fields: { school: '北京大学', major: '计算机科学与技术', degree: '本科', duration: '2013.09 - 2017.06' }, isExpanded: false }
    ]
  },
  {
    id: 'skills-block',
    type: 'skills',
    title: '专业技能',
    order: 2,
    visible: true,
    items: [{ id: uuidv4(), fields: { content: '1. 熟练掌握 Java 核心知识、JUC、HashMap 等...\n2. 深入理解 JVM 底层原理，熟悉 JVM 各类垃圾收集器的使用及核心参数的调优，具备 JVM 调优能力。' }, isExpanded: true }]
  },
  {
    id: 'work-block',
    type: 'work',
    title: '工作经历',
    order: 3,
    visible: true,
    items: [
      { 
        id: uuidv4(), 
        fields: { 
          name: '胡说集团', 
          dept: '用户增长部',
          role: 'Java开发专家',
          duration: '2024.05 - 2025.11',
          content: '- 负责公司Java项目的开发 and 维护，包括需求分析、设计、编码和测试。\n- 参与项目的技术选型和架构设计，负责核心代码的开发 and 优化。',
          performance: '1. 成功完成了某个重要子系统的设计 and 开发，将系统的响应时间降低了 X%。\n2. 优化了某个模块的代码逻辑 and 算法，将处理速度提升了 X 倍。'
        }, 
        isExpanded: true 
      }
    ]
  }
];

export const useResumeStore = create<ResumeState>()(
  temporal(
    persist(
      (set) => ({
        resume: {
          id: uuidv4(),
          title: '我的简历 2025',
          blocks: initialBlocks,
          settings: {
            fontSize: 12.5,
            lineHeight: 1.6,
            modelName: 'gemini-3-flash-preview',
            baseUrl: 'https://generativelanguage.googleapis.com'
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        activeBlockId: 'personal-block',
        isSettingsOpen: false,
        setSettingsOpen: (open) => set({ isSettingsOpen: open }),
        setActiveBlock: (id) => set({ activeBlockId: id }),
        updateResumeTitle: (title) => set((state) => ({
          resume: { ...state.resume, title, updatedAt: Date.now() }
        })),
        updateSettings: (newSettings) => set((state) => ({
          resume: {
            ...state.resume,
            settings: { ...state.resume.settings, ...newSettings },
            updatedAt: Date.now()
          }
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
        reorderBlocks: (activeId, overId) => set((state) => {
          const oldIndex = state.resume.blocks.findIndex(b => b.id === activeId);
          const newIndex = state.resume.blocks.findIndex(b => b.id === overId);
          const newBlocks = arrayMove(state.resume.blocks, oldIndex, newIndex);
          return {
            resume: { ...state.resume, blocks: newBlocks, updatedAt: Date.now() }
          };
        }),
        reorderItems: (blockId, activeId, overId) => set((state) => {
          const blockIndex = state.resume.blocks.findIndex(b => b.id === blockId);
          if (blockIndex === -1) return state;

          const items = [...state.resume.blocks[blockIndex].items];
          const oldIndex = items.findIndex(i => i.id === activeId);
          const newIndex = items.findIndex(i => i.id === overId);
          const newItems = arrayMove(items, oldIndex, newIndex);

          const newBlocks = [...state.resume.blocks];
          newBlocks[blockIndex] = { ...newBlocks[blockIndex], items: newItems };

          return {
            resume: { ...state.resume, blocks: newBlocks, updatedAt: Date.now() }
          };
        }),
        setResume: (resume) => set({ resume }),
      }),
      {
        name: 'resume-storage',
      }
    ),
    {
      partialize: (state) => ({ resume: state.resume }),
      limit: 50,
    }
  )
);
