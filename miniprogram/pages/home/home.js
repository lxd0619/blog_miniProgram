//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    TabCur: 1,
    scrollLeft: 0,
    avatarUrl: '../index/user-unlogin.png',
    userInfo: {},
    Role: "游客",
    queryResult: [],
    swiperList: [{
      id: 0,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big84000.jpg'
    }, {
      id: 1,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big84001.jpg',
    }, {
      id: 2,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big39000.jpg'
    }, {
      id: 3,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg'
    }, {
      id: 4,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big25011.jpg'
    }, {
      id: 5,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big21016.jpg'
    }, {
      id: 6,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big99008.jpg'
    }],
    cover: "",
    id: "",
    keyWord: ""
  },
  onLoad: function () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
              // app.globalData.userInfo = res.userInfo
            }
          })
        }
      }
    })
  },
  onShow: function () {
    this.onQuery()
  },
  fnKeyWord: function (e) {
    this.setData({
      keyWord: e.detail.value
    })
  },
  //查询列表
  onQuery: function () {
    const db = wx.cloud.database()
    db.collection('article').where({
      _openid: this.data.openid,
      title: db.RegExp({
        regexp: this.data.keyWord,
        options: 's'
      })
    }).get({
      success: res => {
        let queryList = []
        res.data && res.data.map((item) => {
          queryList.push({
            _id: item._id,
            title: item.title,
            content: item.content,
            cover: item.cover || "",
            time: util.formatTime(new Date(item.time))
          })
        })
        this.setData({
          queryResult: queryList
        })
        // console.log('[数据库] [查询记录] 成功: ', res)
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
  //根据fileID获取图片
  getPic: function (cover) {
    cover && wx.cloud.getTempFileURL({
      fileList: [cover],
      success: res => {
        return res.fileList.tempFileURL
      },
      fail: console.error
    })
  },
  goDetail: function (data) {
    // wx.navigateTo({url: '../detail/detail?id=' + data.currentTarget.dataset.id})
    wx.navigateTo({
      url: '../editor/editor?id=' + data.currentTarget.dataset.id + "&type=detail"
    })
  },
  goEdit: function (data) {
    wx.navigateTo({
      url: '../editor/editor?id=' + data.currentTarget.dataset.id + "&type=edit"
    })
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  goEditor() {
    wx.navigateTo({
      url: '../editor/editor?type=add',
    })
  },
  delModal(e) {
    console.log(e.currentTarget)
    this.setData({
      modalName: e.currentTarget.dataset.target,
      id: e.currentTarget.dataset.id
    })
  },
  fnRemove: function () {
    console.log(this.data)
    const db = wx.cloud.database()
    db.collection('article').doc(this.data.id).remove({
      success: res => {
        wx.showToast({
          title: '删除成功',
        })
        this.hideModal()
        this.onQuery()
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '删除失败',
        })
        console.error('[数据库] [删除记录] 失败：', err)
      }
    })
  },
  fnUp: function () {
    this.setData({
      top: 0
    })
    // wx.pageScrollTo({
    //   scrollTop: 0,
    //   duration: 300
    // })
  },
  // ListTouch触摸开始
  ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  // ListTouch计算方向
  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  // ListTouch计算滚动
  ListTouchEnd(e) {
    if (this.data.ListTouchDirection == 'left') {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  }
})