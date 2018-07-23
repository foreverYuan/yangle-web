<template>
		<div class="app-container calendar-list-container fhrList" v-loading.body="pageLoading">
	 <!--<div>
	  <div id="mqid" v-show="false"></div>
	  <div id="message" style="text-align: center; margin-top: 20px; size: 20px;" @click="clickNotice"></div>
    </div> -->
    <el-table :data="list" v-loading.body="listLoading" border fit highlight-current-row style="width: 100%">
		  <el-table-column align="center"  label="消息" prop="relatedInfo">
				<template slot-scope="scope">
					<span>{{scope.row.userName}}已申请判读</span>
				</template>
			</el-table-column>
		   <el-table-column align="center"  label="状态" prop="result">
				<template slot-scope="scope">
					<span>{{scope.row.result | getResultState}}</span>
				</template>
			</el-table-column>
		 	<el-table-column align="center"   label="操作">
				<template slot-scope="scope">
					<!--	 <el-button  v-if="scope.row.state=='3'" type="primary" @click="handleRead(scope.row.heartRecord,scope.row.moveId,scope.row.state)">判读</el-button>-->
					<el-button v-if="scope.row.result=='1'" type="primary" @click="clickNotice(scope.row)">抢单</el-button>
				</template>
			</el-table-column>
 	</el-table>
 		<!-- 分页 -->
		<div v-show="!listLoading" class="pagination-container">
			<el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
			</el-pagination>
		</div>
 </div>
 </template>
<script>
 import waves from "@/directive/waves";
import {createOrder,tbTaskList} from "@/api/fetalHeart";
export default {
  directives: {
    waves
  },
  data() {
    return { 
          mqid:"",
          listLoading: true,
          list:"",
          queueReceiveSetting: {//消息队列配置
          websock: null,
          client: null,
          wsuri: "",
          },
          tbTaskListQuery: {
					page: 1,
					limit: 10,
			 	},
          listQuery: {
           platform: "app",
           mqid:"",
           userId:""
         } 
    };
  },

  created() {
  	this.getList()
    this.initWebSocket()
    
  },
  watch:{
  },
  filters: { 
  getResultState(result){
  	if(result!=null){
  		if(result==0){
  		  return "开始";	
  		}else if(result==1){
  			return "已发送";
  		}else if(result==2){
  			return "已接单";
  		}
  	}
  }
  },
  methods: {
  	getList(){
  		this.listLoading = true;
    	tbTaskList(this.tbTaskListQuery).then(response => {
					this.list = response.data.page.list;
                    this.total = response.data.page.totalCount;
					this.listLoading = false;
				});
  	},
  	handleSizeChange(val) {
				this.tbTaskListQuery.limit = val;
				this.getList();
			},
 	handleCurrentChange(val) {
 
				this.tbTaskListQuery.page = val;
				this.getList();
			},
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
          alert("data.message data.message data.message "+data.message )
         //document.getElementById('message').innerHTML += data.message +'&nbsp&nbsp'+'<button onclick="clickNotice">点击抢单</button>' +'<br/>';
         // document.getElementById('mqid').innerHTML = data.mqid  ;
        // this.mqid=data.mqid
 
        };
//      this.queueReceiveSetting.websock.onclose = function (res) {
//                 console.log("连接关闭")
//      };
//      this.queueReceiveSetting.websock.onerror = function (res) {
//                 console.log("连接出错")
//     
//      };
     } ,
     clickNotice(row){
       var userId= JSON.parse(localStorage.getItem('userInfo')).userId
       this.listQuery.mqid=row.mqid
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
