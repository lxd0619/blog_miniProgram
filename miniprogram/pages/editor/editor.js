//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    formats: {},
    readOnly: false,
    placeholder: '正文...',
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
    title: "",
    cover: "https://ossweb-img.qq.com/images/lol/web201310/skin/big10006.jpg"
  },
  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly
    })
  },
  onLoad(options) {
    this.editorInit()
    console.log("options", options)
    if (options.id) {
      this.setData({
        id: options.id
      }, () => {
        this.onQuery(options.id)
      })
    }
  },
  // 查询详情
  onQuery: function (id) {
    var that = this
    const db = wx.cloud.database()
    db.collection('article').where({
      _id: id
    }).get({
      success: res => {
        this.setData({
          title: res.data[0].title,
          content: res.data[0].content,
          cover: res.data[0].cover,
          time: res.data[0].time
        })
        //富文本回显
        that.editorCtx.setContents({
          html: res.data[0].content,
          success: (res) => {
            console.log(res)
          },
          fail: (res) => {
            console.log(res)
          }
        })
        //封面图回显
        wx.cloud.getTempFileURL({
          fileList: [res.data[0].cover],
          success: res => {
            // fileList 是一个有如下结构的对象数组
            // [{
            //    fileID: 'cloud://xxx.png', // 文件 ID
            //    tempFileURL: '', // 临时文件网络链接
            //    maxAge: 120 * 60 * 1000, // 有效期
            // }]
            console.log(res.fileList)
            that.setData({
              cover: res.fileList.tempFileURL
            })
          },
          fail: console.error
        })
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
  // 上传图片
  doUpload: function () {
    var that = this
    // 选择图片
    wx.chooseImage({
      count: 1, //可选取图片张数
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        that.setData({
          cover: filePath
        })

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },
  //保存按钮
  formSave() {
    this.editorCtx.getContents({
      success: (res) => {
        const db = wx.cloud.database()
        db.collection('article').add({
          data: {
            title: this.data.title,
            content: res.html,
            cover: this.data.cover,
            time: new Date()
          },
          success: res => {
            wx.showToast({
              title: '保存成功',
            })
            console.log('[数据库] [新增记录] 成功，记录 _id: ', res)
            wx.navigateBack({
              delta: 0,
            })
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '新增记录失败'
            })
            console.error('[数据库] [新增记录] 失败：', err)
          }
        })
      },
      fail: (res) => {
        console.log(res);
      }
    })
  },
  // 更新
  onUpdate: function () {
    const db = wx.cloud.database()
    const newCount = this.data.count + 1
    db.collection('article').doc(this.data.id).update({
      data: {
        title: this.data.title,
        content: res.html,
        cover: this.data.cover,
        time: new Date()
      },
      success: res => {
        wx.showToast({
          title: '编辑成功',
        })
        console.log('[数据库] [更新记录] 成功，记录 _id: ', res)
        // wx.navigateBack({
        //   delta: 0,
        // })
      },
      fail: err => {
        icon: 'none',
        console.error('[数据库] [更新记录] 失败：', err)
      }
    })
  },
  //标题
  fnInput: function (e) {
    this.setData({
      title: e.detail.value
    })
  },
  //编辑器初始化
  editorInit: function () {
    const platform = wx.getSystemInfoSync().platform
    const isIOS = platform === 'ios'
    this.setData({
      isIOS
    })
    const that = this
    this.updatePosition(0)
    let keyboardHeight = 0
    wx.onKeyboardHeightChange(res => {
      if (res.height === keyboardHeight) return
      const duration = res.height > 0 ? res.duration * 1000 : 0
      keyboardHeight = res.height
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            that.updatePosition(keyboardHeight)
            that.editorCtx.scrollIntoView()
          }
        })
      }, duration)
    })
  },
  updatePosition(keyboardHeight) {
    const toolbarHeight = 50
    const {
      windowHeight,
      platform
    } = wx.getSystemInfoSync()
    let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight
    this.setData({
      editorHeight,
      keyboardHeight
    })
  },
  calNavigationBarAndStatusBar() {
    const systemInfo = wx.getSystemInfoSync()
    const {
      statusBarHeight,
      platform
    } = systemInfo
    const isIOS = platform === 'ios'
    const navigationBarHeight = isIOS ? 44 : 48
    return statusBarHeight + navigationBarHeight
  },
  onEditorReady() {
    const that = this
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context
      that.editorCtx.format('textIndent', '2em') //首行缩进
    }).exec()
  },
  blur() {
    this.editorCtx.blur()
  },
  undo() {
    this.editorCtx.undo()
  },
  redo() {
    this.editorCtx.redo()
  },
  format(e) {
    let {
      name,
      value
    } = e.target.dataset
    if (!name) return
    // console.log('format', name, value)
    this.editorCtx.format(name, value)

  },
  onStatusChange(e) {
    const formats = e.detail
    this.setData({
      formats
    })
  },
  insertDivider() {
    this.editorCtx.insertDivider({
      success: function () {
        console.log('insert divider success')
      }
    })
  },
  clear() {
    this.editorCtx.clear({
      success: function (res) {
        console.log("clear success")
      }
    })
  },
  removeFormat() {
    this.editorCtx.removeFormat()
  },
  insertDate() {
    const date = new Date()
    const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    this.editorCtx.insertText({
      text: formatDate
    })
  },
  insertImage() {
    const that = this
    wx.chooseImage({
      count: 1,
      success: function (res) {
        that.editorCtx.insertImage({
          src: res.tempFilePaths[0],
          data: {
            id: 'abcd',
            role: 'god'
          },
          width: '80%',
          success: function () {
            console.log('insert image success')
          }
        })
      }
    })
  }
})