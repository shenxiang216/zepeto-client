// pages/album/album.js
const app = getApp()
const {
  throttle,
} = require("../../utils/handlers")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    editActive: false, //处于编辑态
    sortTypeTime: false, //以时间排序
    selectAllActive: false,
    PhotoList: [],

    delbtn: false
  },
  otherData: {
    deleteList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(app.globalData.photoList!=null){
      this.setData({
        PhotoList: app.globalData.photoList.map(item => {
          item.selected = false;
          return item;
        })
      })
    }
  },

  del: throttle(function (e) {
    let newList = [],
      that = this,
      oldList = that.data.PhotoList;
    for (let i = 0; i < oldList.length; i++) {
      if (oldList[i].selected === true) {
        that.otherData.deleteList.push(oldList[i])
      } else {
        newList.push(oldList[i])
      }
    }
    app.globalData.photoList = newList
    wx.setStorageSync('PHOTOLIST', newList)
    that.setData({
      PhotoList: newList
    })
    //批量删除这里的方法临时使用，后面记得修改。
    for (let i = 0; i < that.otherData.deleteList.length; i++) {
      setTimeout(function() {
        app.netHandlers.deleteGroupPhoto(app.globalData.userInfo.id, app.globalData.userInfo.user_id, that.otherData.deleteList[i].ID).then(res=>{
          console.log(1)
        })
      }, 80)
    }
  },500),
  btnComplete: throttle(function (e) {
    this.setData({
      editActive: false
    })
    if(this.data.list!=null){
      let list = this.data.list.map(item => {
        item.selected = false;
        return item;
      })
      this.setData({
        list: list
      })
    }
  },100),
  btnEdit: throttle(function (e) {
    this.setData({
      editActive: true
    })
  },50),
  changeSortTypeToName: throttle(function (e) {
    this.setData({
      sortTypeTime: true
    })
    let newList = this.data.PhotoList;
    newList.sort(function(obj1,obj2){
       return obj1.LOCATION.localeCompare(obj2.LOCATION)
    })
    this.setData({
      PhotoList:newList
    })
    //排序方式以名称
  },50),
  changeSortTypeToTime: throttle(function (e) {
    this.setData({
      sortTypeTime: false
    })
    let newList = this.data.PhotoList;
    newList.sort(function(obj1,obj2){
      return obj1['TIME'] <= obj2['TIME'] ? 1 : -1 
    })
    this.setData({
      PhotoList:newList
    })
    //排序方式以时间
  },50),
 
  changeSelected: throttle(function (e) {
    if (this.data.editActive) {
      let list = this.data.PhotoList;
      let getPosition = () => {
        for (let i = 0; i < list.length; i++) {
          if (list[i].ID === e.currentTarget.dataset.id) {
            return i
          }
        }
      }
      let position = getPosition()
      if (!list[position].selected) {
      }
      list[position].selected = !list[position].selected
      this.setData({
        PhotoList: list
      })
    } else {
      var model = JSON.stringify(e.currentTarget.dataset);
      wx.navigateTo({
        url: '../imageDetail/imageDetail?model=' + model,
      })
    }
  },50),
  //全选
  btnSelectAll:  throttle(function (e) {
    let list = this.data.PhotoList.map(item => {
      item.selected = true;
      return item;
    })
    this.setData({
      PhotoList: list,
      selectAllActive: true
    })
  },100),
  btnSelectCancel: throttle(function (e) {
    let list = this.data.PhotoList.map(item => {
      item.selected = false;
      return item;
    })
    this.setData({
      PhotoList: list,
      selectAllActive: false
    })
  },100)
})