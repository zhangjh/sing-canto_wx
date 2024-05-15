const debug = true;
const env = "local";

const config = {
  httpDomain: env === "prod" ? "" : "http://localhost:8080/canto"
}

const wxRequest = function(req) {
  let url = req.url;
  if(!url.startsWith("http")) {
    url = config.httpDomain + url;
  }
  if(!req.method) {
    req.method = "GET";
  }
  if(!req.header) {
    req.header = {};
  }
  req.header["content-type"] = "application/json";
  wx.request({
    url: url,
    data: req.data,
    method: req.method,
    timeout: req.timeout ? req.timeout : 60000,
    complete: req.completeCb,
    success: ret => {
      if(ret.statusCode === 200 && ret.data.success) {
        if(ret.data && ret.data.total) {
          ret.data.data.total = ret.data.total;
        }
        if(req.cb) {
          req.cb(ret.data.data);
        }
      } else {
        if(req.failCb) {
          req.failCb(ret.data.errorMsg);
        }
        wx.showModal({
          title: '错误',
          content: ret.data.errorMsg,
          showCancel: false,
          complete: res => {

          }
        })
      }
    },
    fail: err => {
      if(req.failCb) req.failCb(err);
      wx.showModal({
        title: '错误',
        content: '网络好像有点问题?',
        showCancel: false,
        complete: (res) => {
        }
      })
    }
  });
}

const startRecording = function () {
  const recorderManager = wx.getRecorderManager();
  recorderManager.onStart(() => {
    console.log('recorder start');
  });
  recorderManager.onError((res) => {
    console.error('recorder error:', res);
  });
  // 录音配置
  const options = {
    duration: 60000,  // 最长录音时间（毫秒）
    sampleRate: 16000,  // 采样率
    numberOfChannels: 1,  // 录音通道数
    encodeBitRate: 96000,  // 编码码率
    format: 'aac'  // 音频格式
  };
  recorderManager.start(options);
}

// 请求录音权限
const requestRecordPermission = function() {
  wx.authorize({
    scope: 'scope.record',
    success: () => {
      startRecording();
    },
    fail: () => {
      wx.showModal({
        title: '用户未授权',
        content: '录音功能需要授权才能使用，请在设置中打开授权',
        showCancel: false,
        success: modalRes => {
          if (modalRes.confirm) {
            wx.openSetting();
          }
        }
      });
    }
  });
}

module.exports = {
  config,
  wxRequest,
  requestRecordPermission,
};