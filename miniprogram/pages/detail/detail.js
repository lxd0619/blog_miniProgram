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
    this.onQuery()
  },
  onQuery: function () {
    const db = wx.cloud.database()
    db.collection('article').where({
      _openid: this.data.openid
    }).get({
      success: res => {
        this.setData({
          queryResult: res.data
        })
        this.mark(res.data)
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
  mark: function (str) {
    let result = app.towxml(str, 'markdown', {
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