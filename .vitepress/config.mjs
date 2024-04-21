import { defineConfig } from 'vitepress'
import { set_sidebar } from "./utils/auto_sidebar.mjs";	// 改成自己的路径
// https://vitepress.dev/reference/site-config
export default defineConfig({
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
      { text: 'Examples', link: '/markdown-examples' },
      { text: 'test', items:[
        {text: 'test_01',link: '/'}
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
  }
})
