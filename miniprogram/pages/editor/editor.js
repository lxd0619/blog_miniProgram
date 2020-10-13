//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    md: "# 111",
    isLoading: true, // 判断是否尚在加载中
    article: {} // 内容数据
  },
  onLoad: function () {
    /**
     * app.towxml(str,type,options)有三个参数

      str 必选，html或markdown字符串
      type 必选，需要解析的内容类型html或markdown
      options [object] 可选，可以该选项设置主题、绑定事件、设置base等
        base [string] 可选，用于指定静态相对资源的base路径。例如：https://xx.com/static/
        theme [string] 可选，默认:light，用于指定主题'light'或'dark'，或其它自定义
        events [object] 可选，用于为元素绑定事件。key为事件名称，value则必须为一个函数。例如:{tap:e=>{console.log(e)}}
     */
    let result = app.towxml(`# Markdown \n 123456`, 'markdown', {
      base: 'https://xxx.com', // 相对资源的base路径
      theme: 'light', // 主题，默认`light`
      events: { // 为元素绑定的事件方法
        tap: (e) => {
          console.log('tap', e);
        }
      }
    });

    // 更新解析数据
    this.setData({
      article: result,
      isLoading: false
    });

  }

})