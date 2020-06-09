// 移植过来的部分
let index = 0,
  items = [],
  flag = true,
  itemId = 1;
const maskCanvas = wx.createCanvasContext('maskCanvas');
// 移植过来的部分
const app = getApp()
const {upload} = require("../../qiniu/qiniuUploader.js")
const {getFileNameGroupPhotos} = require("../../utils/handlers")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    shrink:1,
    currentTab:0,
    tabItems:[{navbar_title:'人物'},{navbar_title:'背景'},{navbar_title:'装饰'}],
    toolitemList: [1,2,3,4,5,6,7],
    current_item_bg:0,
    bg_container_image:'https://wenda-data.nt-geek.club/bg05.png',//当前的背景图片
    itemList: [],
    
  },
  otherData:{
    personList:null,
    fileName:'',
    uptoken:'',
    location:'',
    time:'',
    sysData:null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  changeHeight:function(){
    this.setData({
      shrink:!this.data.shrink
  })},
  switchNav:function(e){
    let current = e.target.dataset.current
    this.setData({
      currentTab: current,
    })
    if(current==0){
      this.setData({
        toolitemList:this.otherData.personList,
      })
    }else if(current==1){
      this.setData({
        toolitemList:app.globalData.backgroundList,
      })
    }else{
      this.setData({
        toolitemList:app.globalData.decorationList,
      })
    }
  },
  selected_bg_item:function(e){
    this.setData({
      current_item_bg: e.currentTarget.dataset.id,
      bg_container_image: e.currentTarget.dataset.src
    })
  },
  onLoad: function (options) {
    let that = this;
    this.otherData.personList=this.getPersonList();
    this.setData({
      toolitemList:this.otherData.personList,
      uptoken:this.otherData.uptoken
    })
    // 移植过来的部分
    items = this.data.itemList;
    this.drawTime = 0
    wx.getSystemInfo({
      success: sysData => {
        this.sysData = sysData
        that.otherData.sysData = sysData
        this.setData({
          canvasWidth: this.sysData.windowWidth, // 如果觉得不清晰的话，可以把所有组件、宽高放大一倍
          canvasHeight: this.sysData.windowHeight,
        })
      }
    })
    this.getUptokenPhotos();
  },
  //getPersonList 去除人物列表中重复的部分。
  getPersonList:function(){
   let result = [{
    ID:app.globalData.userInfo.id,
    NAME:app.globalData.userInfo.name,
    MYIMG:app.globalData.userInfo.my_img,
    selected:false
  }];
   let friendList = app.globalData.friendList;
   let classmateList = app.globalData.classmateList;
   if(classmateList){classmateList.map(item=>{item.selected=false;result.push(item)})}
   if(friendList){friendList.map(item=>{item.selected=false;result.push(item)})}
   let hash = {};
    result = result.reduce(function(arr, current) {
    hash[current.ID] ? '' : hash[current.ID] = true && arr.push(current);
    return arr
   }, []);
    return result;
  },
  selected_person_item:function(e){
    let list = this.otherData.personList;
    let getPosition = ()=>{
      for(let i=0;i<list.length;i++){
        if(list[i].ID===e.currentTarget.dataset.id){return i}
      }
    }  
    let position =getPosition()
    if(!list[position].selected){
      this.setDropItem({
        url: e.currentTarget.dataset.src
      });
    }else{
    }
    list[position].selected=!list[position].selected
    this.setData({
      toolitemList:list
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  setDropItem(imgData) {
    let that = this;
    let data = {}
    wx.getImageInfo({
      src: imgData.url,
      success: res => {
  
        // 初始化数据
        data.width = res.width/1.4; //宽度
        data.height = res.height/1.4; //高度
        data.image = imgData.url; //地址
        data.id = ++itemId; //id
        data.top = (that.otherData.sysData.windowHeight-res.height/1.4)/2; //top定位
        data.left = (that.otherData.sysData.windowWidth-res.width/1.4)/2; //left定位
        //圆心坐标
        data.x = data.left + data.width / 2;
        data.y = data.top + data.height / 2;
        data.scale = 1; //scale缩放
        data.oScale = 1; //方向缩放
        data.rotate = 1; //旋转角度
        data.active = false; //选中状态
        console.log(data)
        items[items.length] = data;
        this.setData({
          itemList: items
        })
      }
    })
  },
  WraptouchStart: function(e) {
    for (let i = 0; i < items.length; i++) {
      items[i].active = false;
      if (e.currentTarget.dataset.id == items[i].id) {
        index = i;
        items[index].active = true;
      }
    }
    this.setData({
      itemList: items
    })

    items[index].lx = e.touches[0].clientX;
    items[index].ly = e.touches[0].clientY;

    console.log(items[index])
  },
  WraptouchMove(e) {
    if (flag) {
      flag = false;
      setTimeout(() => {
        flag = true;
      }, 100)
    }
    // console.log('WraptouchMove', e)
    items[index]._lx = e.touches[0].clientX;
    items[index]._ly = e.touches[0].clientY;

    items[index].left += items[index]._lx - items[index].lx;
    items[index].top += items[index]._ly - items[index].ly;
    items[index].x += items[index]._lx - items[index].lx;
    items[index].y += items[index]._ly - items[index].ly;

    items[index].lx = e.touches[0].clientX;
    items[index].ly = e.touches[0].clientY;
   // console.log(items)
    this.setData({
      itemList: items
    })
  },
  WraptouchEnd() {
    console.log("touchend")
    this.synthesis()
  },
  oTouchStart(e) {
    //找到点击的那个图片对象，并记录
    for (let i = 0; i < items.length; i++) {
      items[i].active = false;
      if (e.currentTarget.dataset.id == items[i].id) {
        console.log('e.currentTarget.dataset.id', e.currentTarget.dataset.id)
        index = i;
        items[index].active = true;
      }
    }
    //获取作为移动前角度的坐标
    items[index].tx = e.touches[0].clientX;
    items[index].ty = e.touches[0].clientY;
    //移动前的角度
    items[index].anglePre = this.countDeg(items[index].x, items[index].y, items[index].tx, items[index].ty)
    //获取图片半径
    items[index].r = this.getDistancs(items[index].x, items[index].y, items[index].left, items[index].top);
    console.log(items[index])
  },
  oTouchMove: function(e) {
    if (flag) {
      flag = false;
      setTimeout(() => {
        flag = true;
      }, 100)
    }
    //记录移动后的位置
    items[index]._tx = e.touches[0].clientX;
    items[index]._ty = e.touches[0].clientY;
    //移动的点到圆心的距离
    items[index].disPtoO = this.getDistancs(items[index].x, items[index].y, items[index]._tx, items[index]._ty - 10)

    items[index].scale = items[index].disPtoO / items[index].r;
    items[index].oScale = 1 / items[index].scale;

    //移动后位置的角度
    items[index].angleNext = this.countDeg(items[index].x, items[index].y, items[index]._tx, items[index]._ty)
    //角度差
    items[index].new_rotate = items[index].angleNext - items[index].anglePre;

    //叠加的角度差
    items[index].rotate += items[index].new_rotate;
    items[index].angle = items[index].rotate; //赋值

    //用过移动后的坐标赋值为移动前坐标
    items[index].tx = e.touches[0].clientX;
    items[index].ty = e.touches[0].clientY;
    items[index].anglePre = this.countDeg(items[index].x, items[index].y, items[index].tx, items[index].ty)

    //赋值setData渲染
    this.setData({
      itemList: items
    })

  },
  getDistancs(cx, cy, pointer_x, pointer_y) {
    var ox = pointer_x - cx;
    var oy = pointer_y - cy;
    return Math.sqrt(
      ox * ox + oy * oy
    );
  },
  /*
   *参数1和2为图片圆心坐标
   *参数3和4为手点击的坐标
   *返回值为手点击的坐标到圆心的角度
   */
  countDeg: function(cx, cy, pointer_x, pointer_y) {
    var ox = pointer_x - cx;
    var oy = pointer_y - cy;
    var to = Math.abs(ox / oy);
    var angle = Math.atan(to) / (2 * Math.PI) * 360;
    // console.log("ox.oy:", ox, oy)
    if (ox < 0 && oy < 0) //相对在左上角，第四象限，js中坐标系是从左上角开始的，这里的象限是正常坐标系  
    {
      angle = -angle;
    } else if (ox <= 0 && oy >= 0) //左下角,3象限  
    {
      angle = -(180 - angle)
    } else if (ox > 0 && oy < 0) //右上角，1象限  
    {
      angle = angle;
    } else if (ox > 0 && oy > 0) //右下角，2象限  
    {
      angle = 180 - angle;
    }
    return angle;
  },
  deleteItem: function(e) {
    let newList = [];
    for (let i = 0; i < items.length; i++) {
      if (e.currentTarget.dataset.id != items[i].id) {
        newList.push(items[i])
      }
    }
    if (newList.length > 0) {
      newList[newList.length - 1].active = true;
    }
    items = newList;
    this.setData({
      itemList: items
    })
  },
  openMask () {
    this.synthesis()
  },
  getImg: function (src) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src,
        success(res) {
          resolve(res.path)
        }
      })
    })
  },
  async synthesis() { // 合成图片
    var local_img = JSON.parse(JSON.stringify(this.data.itemList));
    var bg_img=await this.getImg(this.data.bg_container_image)
    for(var itm in this.data.itemList){
      local_img[itm].image=await this.getImg(this.data.itemList[itm].image)
    }
    maskCanvas.drawImage(bg_img, 0, 0, this.data.canvasWidth, this.data.canvasHeight)
    const num = 1,
    prop = 1;
    local_img.forEach((currentValue, index) => {
      maskCanvas.save();
      maskCanvas.translate(this.data.canvasWidth * (1 - num) / 2, 0);
      maskCanvas.beginPath();
      maskCanvas.translate(currentValue.x * prop, currentValue.y * prop); //圆心坐标
      maskCanvas.rotate(currentValue.angle * Math.PI / 180);
      maskCanvas.translate(-(currentValue.width * currentValue.scale * prop / 2), -(currentValue.height * currentValue.scale * prop / 2))
      maskCanvas.drawImage(currentValue.image, 0, 0, currentValue.width * currentValue.scale * prop, currentValue.height * currentValue.scale * prop);
      maskCanvas.restore();
    })
    var that=this
    maskCanvas.draw(setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: 'maskCanvas',
        success: function (res) {
          that.uploadPhotos(res.tempFilePath)//upload photos tp cloud storage
        }
      })
    }, 100))
  },

  disappearCanvas() {
    this.setData({
      showCanvas: false
    })
  },

  saveImg: function() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.canvasTemImg,
      success: res => {
        wx.showToast({
          title: '保存成功',
          icon: "success"
        })
      },
      fail: res => {
        console.log(res)
        wx.openSetting({
          success: settingdata => {
            console.log(settingdata)
            if (settingdata.authSetting['scope.writePhotosAlbum']) {
              console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
            } else {
              console.log('获取权限失败，给出不给权限就无法正常使用的提示')
            }
          },
          fail: error => {
            console.log(error)
          }
        })
        wx.showModal({
          title: '提示',
          content: '保存失败，请确保相册权限已打开',
        })
      }
    })
  },
  //getUptokenPhotos 获取上传凭证
  getUptokenPhotos:function(){
    app.netHandlers.getUptokenPhotos().then(res=>{
      this.otherData.uptoken = res.Data
    })
  },
  uploadPhotos:function(filePath){
    let that = this
    let fileName= getFileNameGroupPhotos(app.globalData.userInfo.id)
    upload(filePath, (res) => {
      app.netHandlers.addGroupPhoto(app.globalData.userInfo.id,app.globalData.userInfo.user_id,that.otherData.location,that.otherData.time,res.fileURL).then(res=>{
        let Data = res.Data
      })
      }, (error) => {
        console.error('error: ' + JSON.stringify(error))
      }, {
        region: 'ECN',
        key:fileName,
        uptoken: this.otherData.uptoken,
        domain: 'https://zepeto.nt-geek.club',
        shouldUseQiniuFileName: false
      },
      (progress) => {
    
      }, cancelTask => {
    
      })
  }
})





