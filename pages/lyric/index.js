const app = getApp();
const common = require("../../common/common");
import { $wuxLoading } from '../../miniprogram_npm/wux-weapp/index';

Page({
  data: {
    visible: {
      searchLyric: false,
      isMaskVisible: false,
    },
    pageIndex: 1,
    hasMore: true,
    lyricsList: [
    ],
    filteredList: [],
    searchOptions: {
      song: "",
      singer: "",
      gender: 0
    },
    searchValue: {
      song: "",
      singer: "",
      album: ""
    }
  },

  onLoad: function (options) {
    this.getLyrics();
    if(!app.globalData.userInfo.userId) {
      app.login();
    }
  },
  onShow: function () {
    
  },

  // 上拉触底事件
  onReachBottom: function () {
    console.log("reach bottom");
    if(!this.data.hasMore) {
      return;
    }
    this.data.pageIndex++;
    this.getLyrics();
  },

  onShareAppMessage() {
    const promise = new Promise(resolve => {
      setTimeout(() => {
        resolve({
          title: '粤语歌曲速成'
        })
      }, 2000)
    })
    return {
      promise
    }
  },

  onShareTimeline() {
    return {
      title: "快来练习你心仪的粤语歌",
      query: ""
    };
  },

  handleInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`searchOptions.${field}`]: e.detail.value
    });
  },

  handleFilterChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`searchOptions.${field}`]: e.detail.value
    });
  },

  applyFilters() {
    this.setData({
      pageIndex: 1
    });
    this.getLyrics();
  },

  handleLyric(lyric) {
    return lyric.split(",");
  },

  getLyrics: function () {
    this.showLoading("加载中，请等待...");
    common.wxRequest({
      url: "/canto/lyric/query",
      data: {
        song: this.data.searchOptions.song,
        singer: this.data.searchOptions.singer,
        gender: this.data.searchOptions.gender,
        pageIndex: this.data.pageIndex
      },
      cb: ret => {
        console.log(ret);
        if(common.objectEmpty(ret)) {
          this.setData({
            hasMore: false
          });
          this.hideLoading();
          return;
        }
        // 组装：songName, singer, lyrics, coverImg, expanded
        let lyricsList = this.data.lyricsList;
        for (let lyric of ret) {
          const temp = {
            id: lyric.id,
            songName: lyric.song,
            singer: lyric.singer,
            lyrics: this.handleLyric(lyric.lyrics),
            coverImg: lyric.cover,
            expanded: false,
          };
          lyricsList.push(temp);
        }
        this.setData({
          lyricsList
        });
        this.hideLoading();
      }
    });
  },

  toggleLyric(event) {
    const index = event.currentTarget.dataset.index;
    const expandedKey = `lyricsList[${index}].expanded`;
    this.setData({
      [expandedKey]: !this.data.lyricsList[index].expanded
    });
  },

  uploadLyrics() {
    this.data.visible.searchLyric = true;
    this.data.visible.isMaskVisible = true;
    this.setData({
      visible: this.data.visible
    });
  },

  songInputChange(e) {
    if(e.detail.value) {
      this.data.searchValue.song = e.detail.value;
      this.setData({
        searchValue: this.data.searchValue
      });
    }
  },

  singerInputChange(e) {
    if(e.detail.value) {
      this.data.searchValue.singer = e.detail.value;
      this.setData({
        searchValue: this.data.searchValue
      });
    }
  },

  albumInputChange(e) {
    if(e.detail.value) {
      this.data.searchValue.album = e.detail.value;
      this.setData({
        searchValue: this.data.searchValue
      });
    }
  },

  showLoading(msg) {
    this.data.visible.searchLyric = false;
    this.data.visible.isMaskVisible = true;
    this.setData({
      visible: this.data.visible
    });
    this.$wuxLoading = $wuxLoading();
    this.$wuxLoading.show({
      text: msg
    });
  },

  hideLoading() {
    this.data.visible.isMaskVisible = false;
    this.setData({
      visible: this.data.visible
    });
    this.$wuxLoading.hide();
  },

  applySearch() {
    console.log(this.data.searchValue);
    // 发起查询
    if(!this.data.searchValue.song) {
      wx.showModal({
        title: '参数错误',
        content: '歌名和歌手名必填',
        showCancel: false,
        complete: (res) => {
        }
      })
      return;
    }
    this.showLoading("搜索中，请等待...");
    common.wxRequest({
      url: "/canto/lyric/search?song=" + this.data.searchValue.song + "&singer=" + this.data.searchValue.singer + "&album=" + this.data.searchValue.album,
      cb: ret => {
        this.hideLoading();
        const song = ret.song;
        const singer = ret.singer;
        const lyric = ret.lyric;
        const cover = ret.cover;
        const len = lyric.length;
        const cutLen = Math.min(len, 100);
        const cutLyric = lyric.substring(0, cutLen) + "...";
        const content = [
          "歌名: " + song,
          "歌手: " + singer,
          "歌词: " + cutLyric
        ];
        wx.showModal({
          title: '是这首吗?',
          content: content.join('\r\n'),
          confirmText: "对,保存",
          complete: (res) => {
            if (res.cancel) {
              return; 
            }
            if (res.confirm) {
              // 保存
              common.wxRequest({
                url: "/canto/lyric/save",
                method: "POST",
                data: {
                  creator: app.globalData.userInfo.userId,
                  song,
                  singer,
                  lyrics: lyric,
                  cover
                },
                cb: ret => {
                  this.setData({
                    pageIndex: 1
                  });
                  this.getLyrics();
                  wx.showModal({
                    title: '',
                    content: '保存成功',
                  });                  
                }
              });
            }
          }
        })
      }
    });
  },

  goPractice(event) {
    const lyrics = event.currentTarget.dataset.lyrics;
    const coverImg = event.currentTarget.dataset.coverimg;
    const songId = event.currentTarget.dataset.songid;
    app.globalData.currentLyrics = lyrics;
    // userId
    const userId = app.globalData.userInfo.userId;
    // 没有封面图时显示默认
    if(coverImg) {
      app.globalData.curCoverImg = coverImg;
    }
    // 保存跟练记录
    common.wxRequest({
      url: "/canto/lyric/savePracticed",
      method: "POST",
      data: {
        user: userId,
        songId: songId
      },
      cb: ret => {
        console.log(ret);
      }
    });
    wx.switchTab({
      url: `/pages/practice/index`
    });
  }
});
