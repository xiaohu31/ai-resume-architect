'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { ResumeContent, Block, ResumeSettings, BlockItem } from './types';
import { v4 as uuidv4 } from 'uuid';
import { arrayMove } from '@dnd-kit/sortable';

const initialResume: ResumeContent = {
  id: uuidv4(),
  title: '张志诚 - 高级产品专家 - 10年互联网经验',
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
    templateId: 'classic',
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
            name: '张志诚',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            jobIntention: '产品总监 / 资深产品专家',
            yearsOfExperience: '10年',
            location: '北京',
            jobStatus: '离职-随时到岗',
            summary: '10年互联网产品实战经验，先后供职于腾讯、字节跳动。深耕增长工具与商业化引擎，擅长通过数据驱动决策，曾主导 DAU 过亿级产品的核心功能迭代。具备极强的商业敏锐度与团队管理能力策略。',
            gender: '男',
            age: '32岁',
            birthday: '1992/05',
            phone: '166-6666-6666',
            email: 'chicheng_zhang@example.com',
            wechat: 'chicheng_pm',
            github: 'github.com/pm-zhang',
            expectedSalary: '40-60k'
          },
          isExpanded: true
        }
      ]
    },
    {
      id: 'work',
      type: 'work',
      title: '工作经历',
      order: 1,
      visible: true,
      items: [
        {
          id: uuidv4(),
          fields: {
            name: '字节跳动 (ByteDance)',
            dept: '搜索策略组',
            role: '资深产品经理 (2-2)',
            duration: '2019.10 - 2023.12',
            content: '1. **策略优化**: 负责抖音搜索推荐策略优化，通过引入知识图谱增强语义理解，搜索点击准确率提升了 12%。\n2. **产品迭代**: 主导“智能搜索提示”功能上线，日均 PV 增长 25%，搜索到播放的转化率提升 5%。\n3. **跨部门协同**: 联合算法、研发团队，通过 AB Test 验证了超过 50 个实验方案，沉淀了一套完整的搜索评价指标体系。',
            performance: '- 荣获 2021 年度公司级“卓越个人奖”。\n- 带领 5 人产品小组，成功支撑了春晚红包项目期间的千万级搜索并发需求。'
          },
          isExpanded: true
        },
        {
          id: uuidv4(),
          fields: {
            name: '腾讯 (Tencent)',
            dept: 'QQ 浏览器业务部',
            role: '产品经理',
            duration: '2014.07 - 2019.09',
            content: '1. **内容生态**: 负责内容流推荐算法的初衷建设，建立了一套基于兴趣标签的池化管理机制（Pool System）。\n2. **工具效率**: 优化了浏览器内核的离线加载策略，提升首页秒开率 15%。',
            performance: '- 该项目获得 BG 级技术突破奖。'
          },
          isExpanded: false
        }
      ]
    },
    {
      id: 'education',
      type: 'education',
      title: '教育背景',
      order: 2,
      visible: true,
      items: [
        {
          id: uuidv4(),
          fields: {
            school: '清华大学',
            major: '计算机科学与技术',
            degree: '硕士',
            duration: '2012.09 - 2014.07'
          },
          isExpanded: false
        },
        {
          id: uuidv4(),
          fields: {
            school: '北京航空航天大学',
            major: '信息工程',
            degree: '学士',
            duration: '2008.09 - 2012.07'
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
            name: '企业级 AI 诊断系统',
            role: '项目负责人',
            duration: '2023.01 - 2023.10',
            content: '基于 LLM 构建的企业级内部故障预测系统。使用 LangChain 框架整合公司内部 Wiki 与监控数据，实现故障毫秒级自动定位。',
            performance: '- 降低了运维人力成本约 40%，月均减少 P0 故障修复时长 15 分钟。'
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
            content: '- **产品能力**: 深厚的策略产品功底，擅长数据建模与增长实验。\n- **技术广度**: 熟悉 Python, SQL，能独立进行复杂数据探索分析。\n- **软技能**: 优秀的商业分析能力，能敏锐洞察行业趋势。'
          },
          isExpanded: true
        }
      ]
    },
    {
      id: 'volunteer',
      type: 'custom',
      title: '社交主页',
      order: 5,
      visible: true,
      items: [
        {
          id: uuidv4(),
          fields: {
            content: 'www.linkedin.com/in/chicheng-zhang / www.zhangpm.com'
          },
          isExpanded: true
        }
      ]
    }
  ]
};

interface ResumeState {
  resume: ResumeContent;
  activeBlockId: string | null;
  isSettingsOpen: boolean;

  setActiveBlock: (id: string | null) => void;
  setSettingsOpen: (isOpen: boolean) => void;
  setResume: (resume: ResumeContent) => void;
  updateResumeTitle: (title: string) => void;
  updateSettings: (settings: Partial<ResumeSettings>) => void;

  addCustomBlock: (title: string) => void;
  removeBlock: (id: string) => void;
  updateBlockTitle: (id: string, title: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;

  addBlockItem: (blockId: string) => void;
  removeBlockItem: (blockId: string, itemId: string) => void;
  updateBlockItemField: (blockId: string, itemId: string, field: string, value: string) => void;
  toggleBlockItemExpanded: (blockId: string, itemId: string) => void;
  reorderItems: (blockId: string, activeId: string, overId: string) => void;
}

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

          if (oldIndex === -1 || newIndex === -1) return state;

          const newBlocks = arrayMove(state.resume.blocks, oldIndex, newIndex).map((b, i) => ({ ...b, order: i }));

          return {
            resume: {
              ...state.resume,
              blocks: newBlocks,
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