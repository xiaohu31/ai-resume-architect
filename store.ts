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
  title: '陈开发者 - 高级全栈工程师 - 8年经验',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  settings: {
    fontSize: 11,
    lineHeight: 1.6,
    modelName: 'gemini-2.0-flash',
    baseUrl: 'https://generativelanguage.googleapis.com',
    apiKey: '',
    provider: 'gemini',
    apiEndpoint: '',
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
            name: '陈修齐',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            summary: '8年互联网大厂经验 | 深度参与高并发电商中台建设 | 擅长 React/Next.js 与 Node.js 微服务架构',
            gender: '男',
            age: '30岁',
            phone: '138-0000-1234',
            email: 'dev_chen@example.com',
            wechat: 'chen_dev_88',
            github: 'github.com/developer-chen'
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
      items: [
        {
          id: uuidv4(),
          fields: {
            school: '中山大学',
            major: '软件工程',
            degree: '硕士',
            duration: '2014.09 - 2017.06'
          },
          isExpanded: false
        }
      ]
    },
    {
      id: 'work',
      type: 'work',
      title: '工作经历',
      order: 2,
      visible: true,
      items: [
        {
          id: uuidv4(),
          fields: {
            name: '阿里巴巴',
            dept: '零售技术事业部',
            role: '高级研发工程师 (L7/P7)',
            duration: '2020.05 - 至今',
            content: '1. 负责双11大促期间核心交易链路的性能压测与优化，通过多级缓存策略将系统 TPS 提升了 45%。\n2. 引入 Serverless 架构处理每日数千万次的图片处理需求，节省服务器成本约 30%。\n3. 指导 3 名中级工程师进行架构升级。',
            performance: '- 成功应对了每秒 50 万次的峰值请求，实现 0 事故运行。\n- 优化了搜索排名的分词算法，核心转化率提升了 3.2%。'
          },
          isExpanded: true
        },
        {
          id: uuidv4(),
          fields: {
            name: '字节跳动',
            dept: '抖音直播团队',
            role: '前端开发工程师',
            duration: '2017.07 - 2020.04',
            content: '1. 负责直播间互动弹幕引擎的开发，采用 Canvas 渲染技术支持万人同屏弹幕，保证 60FPS 帧率。\n2. 搭建基于 Webpack 5 的内部组件库分发系统，减少项目构建时间 40%。',
            performance: '- 编写的弹幕组件被公司 5 个以上部门引用，周活跃装机量 5w+。'
          },
          isExpanded: false
        }
      ]
    },
    {
      id: 'project',
      type: 'project',
      title: '项目经验',
      order: 3,
      visible: true,
      items: [
        {
          id: uuidv4(),
          fields: {
            name: '开源简历架构师 AI Resume Builder',
            role: '核心贡献者 / 架构设计',
            duration: '2024.10 - 2024.12',
            content: '基于 React 19 + Zustand 开发的一款 AI 驱动的简历编辑器。集成 Gemini 1.5 接口实现简历诊断与润色。',
            performance: '- GitHub 获得 200+ Stars。\n- 实现高度优化的 A4 分页算法，导出 PDF 保持 100% 格式还原。'
          },
          isExpanded: true
        }
      ]
    },
    {
      id: 'skills',
      type: 'skills',
      title: '专业技能',
      order: 4,
      visible: true,
      items: [
        {
          id: uuidv4(),
          fields: {
            content: '- **前端**: 熟练掌握 React 生态（Hooks, Next.js, Zustand, Tailwind CSS）。\n- **后端**: 深入理解 Node.js 异步非阻塞模型，精通 Redis, PostgreSQL, Kafka。\n- **架构**: 熟悉 DDD 领城驱动设计，具备微服务拆分与治理经验。'
          },
          isExpanded: true
        }
      ]
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