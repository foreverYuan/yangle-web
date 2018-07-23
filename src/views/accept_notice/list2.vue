<template>
	 <div>
	  <div id="mqid" v-show="false"></div>
	  <div id="message" style="text-align: center; margin-top: 20px; size: 20px;" @click="clickNotice"></div>
    </div> 
 </template>
<script>
 import waves from "@/directive/waves";
import {createOrder} from "@/api/fetalHeart";
export default {
  directives: {
    waves
  },
  data() {
    return { 
          mqid:"",
          queueReceiveSetting: {//消息队列配置
          websock: null,
          client: null,
          wsuri: "",
          },
          listQuery: {
           platform: "app",
           mqid:"",
           userId:""
         } 
    };
  },

  created() {
    this.initWebSocket()
    
  },
  watch:{
  },
  filters: { },
  methods: {
  	initWebSocket() {
        //ws地址
        if (this.queueReceiveSetting.websock) {
          this.queueReceiveSetting.websock.close()
        }
        var userId= JSON.parse(localStorage.getItem('userInfo')).userId
        //alert("userId"+userId)
        this.queueReceiveSetting.wsuri="ws://118.31.66.193:8080/yangle/websocket/"+userId
        this.queueReceiveSetting.websock = new WebSocket(this.queueReceiveSetting.wsuri);
        this.queueReceiveSetting.websock.onopen = function (res) {
             console.log("开启连接")
        };
         this.queueReceiveSetting.websock.onmessage = function (res) {
         let data = JSON.parse(res.data)
         document.getElementById('message').innerHTML += data.message +'&nbsp&nbsp'+'<button onclick="clickNotice">点击抢单</button>' +'<br/>';
          document.getElementById('mqid').innerHTML = data.mqid  ;
         this.mqid=data.mqid
 
        };
        this.queueReceiveSetting.websock.onclose = function (res) {
                   console.log("连接关闭")
        };
        this.queueReceiveSetting.websock.onerror = function (res) {
                   console.log("连接出错")
       
        };
     } ,
     clickNotice(){
       var userId= JSON.parse(localStorage.getItem('userInfo')).userId
       this.listQuery.mqid=document.getElementById('mqid').innerHTML
       this.listQuery.userId=userId
       createOrder(this.listQuery).then(response => {
            //console.log(response);
            if (response.data.resultCode == 200) {
              this.$notify({
                type: "success",
                message: "抢单成功!"
              });
          } else {
              this.$notify({
                type: "filed",
                message: "已有人接单!"
              });
            }
              });   
             }
     }
  
};
</script>

<style scoped>
 
</style>
