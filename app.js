// app.js
const common = require("./common/common");

App({
  onLaunch() {
    // 登录
    this.login();
    console.log(this.globalData);
  },
  login() {
    if(common.objectEmpty(this.globalData.userInfo)) {
      common.login().then(ret => {
        // 如果没有返回表示当前是登录状态
        const userId = ret ? ret.userId : wx.getStorageSync('openId');
        common.getUser(userId).then(user => {
          this.globalData.userInfo = user;
        });
      });
    }
  },
  globalData: {
    userInfo: null,
    // 全局记录当前待播放的歌词内容
    currentLyrics: [],
    // 默认封面图
    curCoverImg: "https://img.zcool.cn/community/01896b597ac380a8012193a3db4f2d.png",
  }
})
