// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    });
    console.log(this.globalData);
  },
  globalData: {
    userInfo: null,
    // 全局记录当前待播放的歌词内容
    currentLyrics: [],
    // 默认封面图
    curCoverImg: "https://img.zcool.cn/community/01896b597ac380a8012193a3db4f2d.png",
  }
})
