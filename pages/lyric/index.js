const app = getApp();
const common = require("../../common/common");

Page({
  data: {
    lyricsList: [
    ],
    filteredList: [],
    searchOptions: {
      song: "",
      singer: "",
      gender: 0
    },
  },

  onLoad: function (options) {
    this.getLyrics();
  },
  onShow: function () {
    
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
    this.getLyrics();
  },

  handleLyric(lyric) {
    return lyric.split(",");
  },

  getLyrics: function () {
    common.wxRequest({
      url: "/canto/lyric/query",
      data: {
        song: this.data.searchOptions.song,
        singer: this.data.searchOptions.singer,
        gender: this.data.searchOptions.gender
      },
      cb: ret => {
        console.log(ret);
        // 组装：songName, singer, lyrics, coverImg, expanded
        let lyricsList = [];
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
    wx.showModal({
      title: '',
      content: '😁唔好意思喎，呢個功能我仲未做好，敬請期待！😁',
      showCancel: false,
      complete: (res) => {
      }
    })
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
