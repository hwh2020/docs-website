import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'
// https://vitepress.dev/reference/site-config
export default defineConfig({
  base : "/docs-website",
  title: "Mr.how",
  description: "个人学习总结",
  srcDir: 'docs',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    outlineTitle : "目录", //目录索引
    outline: [2,6], //2级标题到6级标题
    logo: '/logo.png',
    search: {
      provider:'local',
      options:{
        translations:{
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索文档",
          },
          modal: {
            noResultsText: "无法找到相关文档",
            resetButtonTitle:"清除查询条件",
            footer: {
              selectText:"选择",
              navigateText: "切换",
              closeText:"取消",
            },
          },
        },
      },
  },
    nav: [
      { text: 'Home', link: '/' },

      { text: 'backend', items:[
        {text: 'nginx基础',link: '/后端/nginx/nginx_base'},
        {text: 'Git',link: '/后端/git/git'},
        {text: 'FastAPI',link: '/后端/fastapi/fastapi'},
        {text: 'Redis基础',link:'/后端/redis/Redis_基础篇'},
        {text: 'Linux',items:[
          {text: 'Linux常用命令',link: '/后端/linux命令/Linux命令'},
          {text: 'Linux终端复用与管理', items:[
            {text: 'Screen',link:'/后端/screen/screen'},
            {text: 'Tmux',link:'后端/tmux/tmux'}
          ]}
        ]}
      ] },
      {text: '爬虫', items:[
        {text: 'selenium',link: '/后端/selenium/selenium'}
      ]},

      { text: 'AI', items:[
        {text: '神经网络与深度学习',link: '/AI学习/神经网络与深度学习/神经网络与深度学习'},
        {text: '提示工程',link:'/AI学习/提示工程/prompt_engineering'}
      ]},
      
      { text: 'Other', items:[
        {text: '全链路日志追踪',link: '/后端/other/全链路日志追踪'}
      ]

      }
    ],

    // sidebar: [
    //   {
    //     text: 'Examples',
    //     items: [
    //       { text: 'Markdown Examples', link: '/markdown-examples' },
    //       { text: 'Nginx', link: '/AI学习/nginx' }
    //     ]
    //   }
    // ], 
    // sidebar: { "/AI学习": set_sidebar("docs/AI学习") },
    sidebar:false,
    aside:"left",
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    footer:{
      copyright: "Copyright@ 2024 Mrhow"
    }
  },
  markdown: {
    config: (md) => {
      md.use(mathjax3);
    },
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => customElements.includes(tag),
      },
    },
  },
})
const customElements = [
  'math',
  'maction',
  'maligngroup',
  'malignmark',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mi',
  'mlongdiv',
  'mmultiscripts',
  'mn',
  'mo',
  'mover',
  'mpadded',
  'mphantom',
  'mroot',
  'mrow',
  'ms',
  'mscarries',
  'mscarry',
  'mscarries',
  'msgroup',
  'mstack',
  'mlongdiv',
  'msline',
  'mstack',
  'mspace',
  'msqrt',
  'msrow',
  'mstack',
  'mstack',
  'mstyle',
  'msub',
  'msup',
  'msubsup',
  'mtable',
  'mtd',
  'mtext',
  'mtr',
  'munder',
  'munderover',
  'semantics',
  'math',
  'mi',
  'mn',
  'mo',
  'ms',
  'mspace',
  'mtext',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mpadded',
  'mphantom',
  'mroot',
  'mrow',
  'msqrt',
  'mstyle',
  'mmultiscripts',
  'mover',
  'mprescripts',
  'msub',
  'msubsup',
  'msup',
  'munder',
  'munderover',
  'none',
  'maligngroup',
  'malignmark',
  'mtable',
  'mtd',
  'mtr',
  'mlongdiv',
  'mscarries',
  'mscarry',
  'msgroup',
  'msline',
  'msrow',
  'mstack',
  'maction',
  'semantics',
  'annotation',
  'annotation-xml',
  'mjx-container',
  'mjx-assistive-mml',
];