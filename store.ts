'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { ResumeContent, Block, ResumeSettings, BlockItem } from './types';
import { v4 as uuidv4 } from 'uuid';
import { arrayMove } from '@dnd-kit/sortable';

const initialResume: ResumeContent = {
  id: uuidv4(),
  title: '陈建国 - 资深全栈开发工程师 - 8年互联网经验',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  settings: {
    fontSize: 15.5,
    lineHeight: 1.1,
    modelName: 'gemini-3-flash-preview',
    baseUrl: 'https://generativelanguage.googleapis.com',
    apiKey: '',
    provider: 'openai',
    apiEndpoint: 'http://192.168.10.18:8317/v1',
    templateId: 'classic',
    pagePadding: 10,
    fontFamily: '"Alibaba PuHuiTi 3.0", "Noto Sans SC", sans-serif',
    moduleTitleSize: 24,
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
          id: '3da7622f-68fe-4e0d-b58d-5c9ad0a921bb',
          fields: {
            name: '陈建国',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            jobIntention: '资深全栈开发工程师 / 前端专家',
            yearsOfExperience: '8年',
            location: '上海',
            jobStatus: '离职-随时到岗',
            summary: '8年全栈开发经验，前阿里巴巴（Ant Group）高级前端工程师。精通 React/Next.js 生态与 Node.js 异步编程。擅长攻克性能瓶颈，曾主导过百万级 QPS 系统的架构优化。高度关注代码质量与工程化建设，具备极强的模块化开发思维与大厂标准产出能力。',
            gender: '男',
            age: '30岁',
            phone: '138-1234-5678',
            email: 'jianguo.chen@tech.com',
            wechat: 'jg_tech_dev',
            github: 'github.com/jianguo-dev',
            expectedSalary: '45-65k'
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
          id: '0bf4a0fa-a621-4edc-bcc8-e503366bcc50',
          fields: {
            name: '蚂蚁集团 (Ant Group)',
            dept: '体验技术部 - 支付宝 core 业务组',
            role: '高级全栈工程师 (P7)',
            duration: '2019.06 - 2023.12',
            content: '1. **架构升级**: 主导支付宝某核心收银台页面的微前端重构，通过模块化解耦，将研发交付周期从 2 周缩短至 3 天。\n2. **性能优化**: 针对 H5 容器进行首屏加载专项优化，利用预加载（Pre-render）与离线包技术，将首屏平均耗时从 1.8s 降低至 0.9s，转化率提升 4.5%。\n3. **组件库建设**: 负责业务线基础组件库的底层封装，支持 20+ 个业务子系统，沉淀 50+ 个原子化组件，代码复用率高达 75% 以上。',
            performance: '- **卓越绩效表现：** 连续 3 年年度绩效考核位居全团队 **Top 10%（评级 S/3.75）**，在复杂业务迭代与核心系统稳定性保障中持续产出高质量技术方案，被评为部门年度“核心贡献者”。\n- **技术突破与创新：** 荣获蚂蚁集团**“技术突破奖”**。主导了针对分布式架构下高并发场景的**系统性能优化与链路重构**，通过引入多级缓存策略、异步化并行处理及 SQL 深度调优，将核心接口的**响应耗时（RT）降低了 45%**，单机 **QPS 吞吐能力提升 120%**。\n- **业务价值与影响力：** 沉淀出的通用优化方法论及技术组件被选树为 BU 级技术标杆，并**跨团队推广至全事业部 15+ 个核心业务模块**，显著提升了系统在高强度大促期间的稳定性，累计为公司**节省服务器计算资源成本逾 30%**。'
          },
          isExpanded: true
        },
        {
          id: '374e5b06-c94c-4b99-a3a1-560f0e5d0b37',
          fields: {
            name: '美团 (Meituan)',
            dept: '到店事业群 - 餐饮 SaaS 组',
            role: '全栈开发工程师',
            duration: '2016.07 - 2019.05',
            content: '1. **服务端开发**: 使用 Node.js + NestJS 构建高并发订单中台，通过 Redis 缓存优化及 SQL 深度索引调优，支撑了支撑了日均千万级的流量高峰。\n2. **前端开发**: 负责 SaaS 系统商户端管理后台开发，引入 TypeScript 与自动化测试流程，将线上 Bug 率降低了 35%。',
            performance: '年度绩效评定为 A（Top 10%）；作为核心负责人主导订单中台架构重构与性能攻坚，连续 3 年平稳支撑双十一大促峰值流量，成功应对 50w+ TPS 的高并发冲击，系统可用性达 99.99%，有力保障了业务从百万级向千万级日订单量的跨越式增长。'
          },
          isExpanded: true
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
          id: 'df58eb3d-7909-49d1-a9e2-028066853ff1',
          fields: {
            school: '复旦大学',
            major: '软件工程',
            degree: '硕士',
            duration: '2014.09 - 2016.07'
          },
          isExpanded: false
        },
        {
          id: '3756c7b4-ae3b-4a94-b5a8-417a955e9dee',
          fields: {
            school: '同济大学',
            major: '计算机科学与技术',
            degree: '学士',
            duration: '2010.09 - 2014.07'
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
          id: '616fa2cb-d6ba-4c1d-99bd-1c77fb6c7278',
          fields: {
            name: 'Low-Code 无代码研发平台',
            role: '架构负责人',
            duration: '2021.03 - 2022.12',
            content: '从 0 到 1 主导了公司内无代码可视化页面搭建平台的架构设计。实现了拖拽即构建、一键生成 React/Vue 源码的核心能力，覆盖了公司内部 60% 的营销活动页、落地页场景。',
            performance: '- 累计节省研发成本 500w+/年，赋能 200+ 名运营人员独立完成页面上线。'
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
          id: 'f2a36505-4852-4ba9-91ec-6e08d454e22e',
          fields: {
            content: '- **前端专功**: 精通 React 生态（Hooks, Context, Zustand），深入理解虚拟 DOM 与 Fiber 架构。\n- **全栈技术**: 熟练使用 Node.js, Golang, 扎实的并发编程与数据库设计能力。\n- **工程素养**: 深度实践 Webpack/Vite 打包链路优化，主张编写“整洁且可测试”的代码。\n- **领域专家**: 擅长微前端、可视化搭建系统及低功耗 H5 性能调优。'
          },
          isExpanded: true
        }
      ]
    },
    {
      id: 'certificate',
      type: 'custom',
      title: '荣誉奖项',
      order: 5,
      visible: true,
      items: [
        {
          id: '7d851cd9-c0fa-4fbd-a62c-da2f40b268bf',
          fields: {
            content: '- **第 15 届全国大学生数学竞赛**: 一等奖\n- **蚂蚁金服年度优秀员工**: 2021 年度\n- **个人专利**: 《一种基于 AST 的代码自动重构方法》 (CN102938...)'
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