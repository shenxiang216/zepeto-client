
const ctx = wx.createCanvasContext('myCanvas')
Page({
  data: {
    tmpimg: "",
    left:'',
    src:'',
    cameraHeight:''
  },
  otherData: {
    sysData: null
  },
  onLoad() {
    let that = this;
    wx.getSystemInfo({
      success: sysData => {
  console.log(sysData)
        that.otherData.sysData = sysData
        this.setData({
          canvasWidth: sysData.windowWidth,
          canvasHeight: sysData.windowHeight,
          cameraHeight:sysData.windowHeight,
          left:(sysData.windowWidth-200)/2
        })
      }
    })
  },
  onReady() {
    
  },
  takePhoto() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log(res)
        this.save(res.tempImagePath)
      }
    })
  },
  save(path) {
    var that = this
    var x = (this.otherData.sysData.windowWidth-200)/2+100,
    y = 227,
    a = 100,
    b = 127
    let dt = 1 / Math.max(a, b) // 绘制时的角度增量 Δt
   // ctx.moveTo(x + a, y) // 移动到起始点
    for (let t = 0; t < Math.PI * 2; t += dt) {
      ctx.lineTo(x + a * Math.cos(t), y + b * Math.sin(t))
    }
    ctx.clip()
    ctx.drawImage(path,0,0,that.otherData.sysData.windowWidth,that.otherData.sysData.windowHeight-100)
    ctx.draw(true, () => {
      wx.canvasToTempFilePath({
        x:(this.otherData.sysData.windowWidth-200)/2,
        y:100,
        width:200,
        height:254,
        destWidth: 200,
         destHeight: 254,
        canvasId: 'myCanvas',
        success: function (res) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath, //save face picture
          })
        }
      })
    })
  }
})
