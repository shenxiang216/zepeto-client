// pages/selfInfo/selfInfo.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
      user_name:"",
      college:'',
      major:"",
      classNumFirst:"",
      classNumLast:"",
      canSearchMe:"true",
    isShowText:1,
    collegeList:["计算机科学学院","经济学院","法学院","民族学与社会学学院","马克思主义学院","教育学院","体育学院","文学与新闻传播学院","外语学院","数学与统计学学院","电子信息工程学院","化学与材料科学学院","药学院","生命科学学院","生物医学工程学院","资环学院","美术学院","管理学院","公共管理学院","音乐舞蹈学院"],
    majorList:["机械设计制造及其自动化","自动化","轨道交通信号与控制","计算机科学与技术","软件工程","网络工程","智能科学与技术"],
    school_info:{
      "经济学院":["经济学","经济统计学","金融学","金融工程","保险学","国际经济与贸易"],
      "法学院":["法学","知识产权","政治学与行政学"],
      "民族学与社会学学院":["社会学","社会工作","民族学","历史学","文物与博物馆学",],
      "马克思主义学院":["思想与政治教育"],
      "教育学院":["教育学","教育技术学","应用心理学"],
      "体育学院":["社会体育指导与管理"],
      "文学与新闻传播学院":["汉语言文学","汉语国际教育","新闻学","广播电视学","广告学"],
      "外语学院":["英语","日语","朝鲜语","翻译","商务英语",],
      "数学与统计学学院":["数学与应用数学","信息与计算科学","应用统计学"],
      "电子信息工程学院":["物理学","电子信息工程","通信工程","光电信息科学与工程"],
      "化学与材料科学学院":["应用化学","材料化学","高分子材料与工程","化学工程与工艺"],
      "药学院":["化学生物学","药学","药物制剂","药物分析"],
      "生命科学学院":["生物技术","食品质量与安全","生物工程","生物制药"],
      "计算机科学学院":["机械设计制造及其自动化","自动化","轨道交通信号与控制","计算机科学与技术","软件工程","网络工程","智能科学与技术"],
      "生物医学工程学院":["医学信息工程","生物医学工程"],
      "资环学院":["水文与水资源工程","环境工程","环境科学","资源环境科学"],
      "美术学院":["建筑学","动画","美术学","绘画","视觉传达设计","环境设计","产品设计","服装与服饰设计"],
      "管理学院":["信息管理与信息系统","工商管理","市场营销","会计学","财务管理","人力资源管理","电子商务","旅游管理"],
      "公共管理学院":["公共事业管理","行政管理","劳动与社会保障","土地资源管理"],
      "音乐舞蹈学院":["音乐学","舞蹈表演","舞蹈学"]
    },
    multiArray: [['00', '01',"02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19"], ['01', '02', '03', '04', '05',"06","07","08","09","10","11","12","13","14"]],
    multiIndex: [16, 0],
    collegeIndex:0,
    majorIndnx:0,
    switchChecked:false,
    btnActive:false,
    otherData:{
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  bindCollegeChange:function(e){
    this.setData({
      college:this.data.collegeList[e.detail.value],
      majorList:this.data.school_info[this.data.collegeList[e.detail.value]],
    })
    this.checkInfoChange()
  },
  bindMajorChange:function(e){
    this.setData({
      major:this.data.majorList[e.detail.value]
    })
    this.checkInfoChange()
  },
  bindMultiPickerChange:function(e){
    this.data.multiIndex=e.detail.value;
    this.setData({
      classNumFirst:this.data.multiArray[0][this.data.multiIndex[0]],
      classNumLast:this.data.multiArray[1][this.data.multiIndex[1]]
    })
    this.checkInfoChange()
  },
  change_user_name:function(e){
  this.setData({
    user_name:e.detail.value
  })
  },
  switchChange:function(e){
    this.setData({
      canSearchMe:e.detail.value+""
    })
     this.checkInfoChange()
  },
  //检查当前个人信息与global中是否相同，不同则要改变按钮状态。
  checkInfoChange:function(){
    let userInfo = app.globalData.userInfo;
    let classNum =this.data.classNumFirst+this.data.classNumLast;
    if(this.data.user_name!=userInfo.name||this.data.college!=userInfo.college||this.data.major!=userInfo.major||classNum!=userInfo.class||this.data.canSearchMe!=userInfo.canSearchMe){
      this.setData({
        btnActive:true
      })
    }else{
      this.setData({
        btnActive:false
      })
    }
  },
  //btn_post_selfinfo 修改个人信息，后面应该改成每个用户只能修改一次。
  btn_post_selfinfo:function(){
     let user_id = app.globalData.userInfo.user_id;
     let name = this.data.user_name;
     let college = this.data.college;
     let major = this.data.major;
     let classNum = this.data.classNumFirst + this.data.classNumLast
     let canSearchMe = this.data.canSearchMe
     let dataCheck = (this.data.school_info[this.data.college].indexOf(major)==-1)?false:true&&Boolean(this.data.user_name)&&this.data.btnActive;
     if(dataCheck){
      app.netHandlers.updateSelfInfo(user_id,name,college,major,classNum,canSearchMe).then(res=>{
        let Data = res.Data;
        console.log(res)
        let userInfo={
          id:res.Data.ID,
          user_id:Data.USERID,
          name:Data.NAME,
          college:Data.COLLEGE,
          major:Data.MAJOR,
          class:Data.CLASS,
          my_img:Data.MYIMG,
          canSearchMe:Data.CanSearchMe
        }
        app.globalData.userInfo = userInfo;
        wx.setStorage({
          key:"USERINFO",
          data:userInfo
        })
        this.checkInfoChange()
      })
     }else{wx.showToast({
       title: '保存个锤子',
       icon:"none"
     })}
  },
  onLoad: function (options) {
    this.setData({
      user_name:app.globalData.userInfo.name,
      college:app.globalData.userInfo.college,
      major:app.globalData.userInfo.major,
      classNumFirst:app.globalData.userInfo.class.substr(0,2),
      classNumLast:app.globalData.userInfo.class.substr(2,2),
      canSearchMe:app.globalData.userInfo.canSearchMe
    })
    if(app.globalData.userInfo.canSearchMe==="true"){
      this.setData({
        switchChecked:true
      })
    }
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
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  }
})

