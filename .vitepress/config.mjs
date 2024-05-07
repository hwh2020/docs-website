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
        {text: 'FastAPI',link: '/后端/fastapi/fastapi'},
      ] },
      { text: 'AI', items:[
        {text: '神经网络与深度学习',link: '/AI学习/神经网络与深度学习'}
      ]}

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