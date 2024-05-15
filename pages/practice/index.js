// pages/practice/index.js
import { $wuxDialog } from '../../miniprogram_npm/wux-weapp/index';
const common = require('../../common/common');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    timeout: undefined,
    animations: [],
    visible: {
      prev: true,
      next: true,
      playBtn: true,
      recordBtn: true,
      voicePrint: false,
      evaluate: false
    },
    // 记录是播放原声还是重听跟读录音
    playStatus: "",
    // 歌词内容，最多同时显示三条
    lyrics: {
      content: ["测试歌词第一句","测试歌词第二句","测试歌词第三句","测试歌词第四句","测试歌词第五句"],
      // 当前封面图
      curCoverImg: "",
      // 当前显示内容的索引
      curIndex: 0,
      // 下一条内容的索引
      nextIndex: 1,
      // 上一条内容的索引
      prevIndex: -1,
      displayed: {
        prev: "",
        cur: "",
        next: ""
      }
    },
    // 评测星级
    evaluateStars: 0
  },

  // 初始进来显示歌词内容
  showLyricTexts: function() {
    const lyricContent = this.data.lyrics.content;
    // 初始没有前一句，因此只需要截取当前和下一句
    const displayed = lyricContent.slice(this.data.lyrics.curIndex, this.data.lyrics.curIndex + 2);
    this.data.lyrics.displayed = {
      prev: "",
      cur: displayed[0],
      next: displayed[1]
    };
    // 初始不能往前翻
    this.data.visible.prev = false;
    // 判断能否往后翻: 后面没有句子了就不能翻了
    let nextIndex = this.data.lyrics.nextIndex;
    let len = this.data.lyrics.content.length;
    if(nextIndex > len - 1) {
      this.data.visible.next = false;
    }
    this.setData({
      lyrics: this.data.lyrics,
      visible: this.data.visible
    });
  },
  goPrev: function() {
    // 维护索引
    let curIndex = this.data.lyrics.curIndex;
    let prevIndex = this.data.lyrics.prevIndex;
    let nextIndex = this.data.lyrics.nextIndex;
    this.data.lyrics.curIndex = --curIndex;
    this.data.lyrics.prevIndex = -- prevIndex;
    this.data.lyrics.nextIndex = --nextIndex;
    // 不能再翻了
    if(prevIndex < 0) {
      this.data.visible.prev = false;
    }
    // 可以往后翻了
    this.data.visible.next = true;
    this.data.visible.evaluate = false;
    // 更新内容
    let displayed = this.data.lyrics.displayed;
    let prev = this.data.lyrics.content[prevIndex];
    displayed = {
      prev: prev,
      cur: displayed.prev,
      next: displayed.cur
    };
    this.data.lyrics.displayed = displayed;
    this.setData({
      lyrics: this.data.lyrics,
      visible: this.data.visible
    });
  },
  goNext: function() {
    // curIndex加一
    let prevIndex = this.data.lyrics.prevIndex;
    let curIndex = this.data.lyrics.curIndex;
    let nextIndex = this.data.lyrics.nextIndex;
    const len = this.data.lyrics.content.length;
    this.data.lyrics.prevIndex = ++prevIndex;
    this.data.lyrics.curIndex = ++curIndex;
    this.data.lyrics.nextIndex = ++nextIndex;
    // 不能再翻了
    if(nextIndex > len - 1) {
      this.data.visible.next = false;
    }
    // 可以往前翻了
    this.data.visible.prev = true;
    this.data.visible.evaluate = false;
    // 更新内容
    let displayed = this.data.lyrics.displayed;
    let next = this.data.lyrics.content[nextIndex];
    displayed = {
      prev: displayed.cur,
      cur: displayed.next,
      next: next
    };
    this.data.lyrics.displayed = displayed;
    this.setData({
      lyrics: this.data.lyrics,
      visible: this.data.visible
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {  
  },  

  startAnimation: function () {  
    var animations = [];  
    for (var i = 0; i < 4; i++) {  
      var animation = wx.createAnimation({  
        duration: 1000,  
        timingFunction: 'ease',  
        delay: i * 200  
      });  
      animation.scaleY(1).step().scaleY(1.5).step();  
      animations[i] = animation.export();  
    }  
    this.setData({ animations: animations });  
  }, 
  closeAnimation: function() {
    clearInterval(this.interval);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log("onReady");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log("onShow");
    const curLyrics = app.globalData.currentLyrics;
    // console.log(curLyrics);
    const curCoverImg = app.globalData.curCoverImg;
    if(curLyrics.length == 0) {
      wx.showModal({
        title: '',
        content: '请从歌词tab选中一首歌再来练习',
        complete: (res) => {
          wx.switchTab({
            url: '/pages/lyric/index',
          })
        }
      });
      return;
    } else {
      this.data.lyrics.content = curLyrics;
      this.data.lyrics.curCoverImg = curCoverImg;
      this.setData({
        lyrics: this.data.lyrics
      });
    }
    // 显示歌词
    this.showLyricTexts();
    // 显示音纹的时候开启动画
    if(this.data.visible.voicePrint) {
      this.startAnimation();
      this.interval = setInterval(this.startAnimation, 2000);
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.log("onHide");
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log("onUnload");
    this.closeAnimation();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    console.log("pullDown");
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    console.log("reachBottom");
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    console.log("share");
  },

  showVoicePrint() {
    // 显示波形音纹，隐藏播放和录音按钮
    this.data.visible.playBtn = false;
    this.data.visible.recordBtn = false;
    this.data.visible.voicePrint = true;
    this.data.visible.evaluate = false;
    this.data.playStatus = "play";
    this.setData({
      visible: this.data.visible,
      playStatus: this.data.playStatus
    });
  },
  hideVoicePrint() {
    // 关闭波形音纹，显示播放和录音按钮
    this.data.visible.playBtn = true;
    this.data.visible.recordBtn = true;
    this.data.visible.voicePrint = false;
    this.data.visible.evaluate = false;
    this.data.playStatus = "";
    this.setData({
      visible: this.data.visible,
      playStatus: this.data.playStatus
    });
  },

  // tts播放文本内容
  playContent: function() {
    this.showVoicePrint();
    const text = this.data.lyrics.content[this.data.lyrics.curIndex];
    console.log("text:" + text);
    // todo: tts play，没翻页重复听不请求
    common.wxRequest({
      url: "/voice/play?text=" + text,
      cb: ret => {
        this.hideVoicePrint();
      }
    });
  },
  // 跟读收音
  recordVoice: function() {
    this.showVoicePrint();
    common.requestRecordPermission();
  },
  stopRecord: function () {
    this.hideVoicePrint();
    const recorderManager = wx.getRecorderManager();
    recorderManager.onStop((res) => {
      console.log('停止录音', res);
      const { tempFilePath } = res;
      const text = this.data.lyrics.content[this.data.lyrics.curIndex];
      // 传输音频给服务端评测
      wx.uploadFile({
        filePath: tempFilePath,
        name: 'file',
        url: common.config.httpDomain + '/voice/evaluateFile',
        formData: {
          text
        },
        success: ret => {
          console.log(ret);
          // 根据星级展示星星
          const data = ret.data;
          const dataJson = JSON.parse(data);
          if(dataJson.success) {
            const stars = dataJson.data.stars;
            console.log(stars);
            this.setData({
              evaluateStars: stars
            });
          }
          // 展示评测等级
          this.data.visible.evaluate = true;
          this.setData({
            visible: this.data.visible
          });
        },
        fail: err => {
          console.error(err);
        }
      })
    });
    recorderManager.stop();
  }
})