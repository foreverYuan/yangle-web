<template>
	<div>
	 <div id="mqid"></div>
	  <div id="message" style="text-align: center; margin-top: 20px; size: 20px;" @click="clickNotice"></div>
    <!--<div  style="margin-left: 1220px; margin-top: 60px; size: 20px;"><button onclick="click">点击抢单</button></div>
	-->
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
        alert("userId"+userId)
        this.queueReceiveSetting.wsuri="wss://192.168.0.109:8080/yangle/websocket/"+userId
        this.queueReceiveSetting.websock = new WebSocket(this.queueReceiveSetting.wsuri);
        this.queueReceiveSetting.websock.onopen = function (res) {
             console.log("开启连接")
        };
        
        this.queueReceiveSetting.websock.onmessage = function (res) {
        let data = JSON.parse(res.data)
        document.getElementById('message').innerHTML += data.message + '<br/>';
        document.getElementById('mqid').innerHTML = data.mqid  ;
         this.mqid=data.mqid
         alert("this.mqidthis.mqid11111"+this.mqid)
    //    console.log("收到数据：" +data)
//        Message({
//          message: data.content,
//          type: 'info',
//          showClose: true,
//          duration: 3 * 1000
//        })
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
     //	alert("this.mqidthis.mqidthis.mqid"+this.mqid);
       //alert("this.mqid"+document.getElementById('mqid').innerHTML);
     //   window.location.href="https://192.168.0.109:8080/yangle/api/takeOrder/app/"+document.getElementById('mqid').innerHTML+"/"+userId
      // setTimeout("alert('请等一秒钟')", 1000 )
     //  window.location.href="../webSocket.html"
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
