<template>
  <div class="app-container calendar-list-container" v-loading.body="pageLoading">
     <!-- 检索条件 -->
         <div class="filter-container">
       <el-select @keyup.enter.native="handleFilter" style="width: 170px;" class="filter-item" v-model="listQuery.state" placeholder="请选择条件">
				<el-option v-for="item in conditionType" :key="item.key" :label="item.display_name" :value="item.key">
				</el-option>
			</el-select>
      <el-date-picker
        @keyup.enter.native="handleFilter"
        v-model="startTime"
        class="filter-item"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions2"
        value-format="yyyy-MM-dd">
    </el-date-picker>
    <el-input  @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="关键字" v-model="listQuery.userName"></el-input>
    <el-input  @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="来源" v-model="listQuery.doctor"></el-input>
     <el-button class="filter-item" style="margin-left: 10px;" @click="handleFilter" type="primary"  v-waves>查询</el-button>
    </div>
     <!-- 一览部分 -->
    <el-table  :data="list" v-loading.body="listLoading" border fit highlight-current-row style="width: 100%"   >
    	<el-table-column type="index" label="序号" :index="indexMethod" width="100%">
			</el-table-column>
      <el-table-column align="center" width="220" label="监测(上传)时间" prop="startTime" >
        <template slot-scope="scope">
          <span>{{scope.row.startTime | getdate }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="孕妇账号" >
        <template slot-scope="scope">
          <span>{{scope.row.userAccount}}</span>
        </template>
      </el-table-column>
       <el-table-column align="center" label="姓名" >
        <template slot-scope="scope">
          <span>{{scope.row.userName}}</span>
        </template>
      </el-table-column>
     <el-table-column align="center" width="220" label="监测时长" prop="monitoringTime"   >
        <template slot-scope="scope">
          <span>{{scope.row.monitoringTime}}</span>
        </template>
      </el-table-column>
      <!--<el-table-column align="center" label="平均心率">
        <template slot-scope="scope">
          <span>{{scope.row.meanHeartRate }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" width="240" label="胎动次数">
        <template slot-scope="scope">
          <span>{{scope.row.fetalMove}}</span>
        </template>
      </el-table-column>
     <el-table-column align="center" width="240" label="判读状态">
        <template slot-scope="scope">
          <span>{{scope.row.state | getstate}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" width="240" label="判读结果">
        <template slot-scope="scope">
          <span>{{scope.row.resultState | getResultState}}</span>
        </template>
      </el-table-column>-->
      <el-table-column align="center" width="240" label="操作">
        <template slot-scope="scope">
       	 <el-button  v-if="scope.row.state=='3'" type="primary" @click="handleRead(scope.row.heartRecord,scope.row.moveId,scope.row.state)">判读</el-button>
        <el-button   v-if="scope.row.state=='4'"  type="primary" @click="handleRead(scope.row.heartRecord,scope.row.moveId,scope.row.state)">查看详情</el-button>
          </template>
      </el-table-column>
      </el-table>
    <!-- 分页 -->
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
     <!--柱状图-->
    <el-dialog :title = "textMap[dialogChartsStatus]" :visible.sync = "dialogChartsFormVisible" top="15vh" width="60%" >
      <div id="app" @contextmenu="showMenu" >
      <div id="singleEcg_">
        <canvas class="myCanvas" id="myCanvas" width="1024px" height="350px"></canvas>
<!--        <canvas class="myCanvas1" id="myCanvas1" width="1024px" height="500px"></canvas>
-->        </div>
      <div id="single">
         <canvas class="myCanvas1" id="myCanvas1" width="1024px" height="220px"></canvas>
         </div>
     	<div v-if="state=='3'"  style="margin-left: 50px;">
     		   <el-select  class="filter-item"  v-model="resultState" placeholder="请选择判读结果">
          <el-option v-for="item in stateType" :key="item.key" :label="item.display_name" :value="item.key">
          </el-option>
        </el-select>
      <el-input style="width: 60%;" class="filter-item" placeholder="操作内容" v-model="readContent"></el-input>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleSave" type="primary" icon="el-icon-search" v-waves>保存</el-button>
     	</div>
      <vue-context-menu :contextMenuData="contextMenuData"
	                  @savedata="savedata"
	                  @newdata="newdata">
    </vue-context-menu>
    </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from "@/directive/waves";
import { moveList,updateFetalMove} from "@/api/fetalHeart";
import { getCookie } from "@/utils";
import VueContextMenu from 'vue-contextmenu'
import 'vue-contextmenu/style/css/font-awesome.min.css'
 

//引入Echarts主模块
let echarts = require("echarts/lib/echarts");
//引入折线图
require("echarts/lib/chart/line");
//引入所需组件
require("echarts/lib/component/tooltip");
require("echarts/lib/component/legend");

 const stateType = [
  { key: "1", display_name: "正常" },
  { key: "2", display_name: "异常" }
]; 
const conditionType=[
  { key: "3", display_name: "待判读" },
  { key: "4", display_name: "已判读" }
]

export default {
  directives: {
    waves
  },
  data() {
    return {
      pageLoading: false,
      tableKey: 0,
      total: null,
      list: null,
      startTime:"",
      listLoading: true,
      readContent:"",
      moveId:"",
      resultState:"",
      stateType,
      state:"",
      conditionType,
      indexMethod: 1,
      listQuery: {
        page: 1,
        limit: 10,
        state:"",
        startTimeStart:undefined,
        startTimeEnd:undefined,
        userName:undefined,
        doctor:undefined
      },
      dialogChartsStatus: "",
      dialogChartsFormVisible: false,
       textMap: {
        detail: "详情"
      },
     YFetalMovementEntity: {
          state: "",
          resultState:"",
          readContent: "",
          moveId:""
       },
     xdata:[] ,
     pickerOptions2: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
        contextMenuData: {
          menuName: 'demo',
          axios: {
            x: null,
            y: null
          },
         menulists: [
            {
              fnHandler: 'savedata', // Binding events(绑定事件)
              icoName: 'fa fa-home fa-fw', // icon (icon图标 )
              btnName: 'Save' // The name of the menu option (菜单名称)
            },
            {
              fnHandler: 'newdata',
              icoName: 'fa fa-home fa-fw',
              btnName: 'New'
            }
          ]
        }
    };
  },

  created() {
    this.getList();
  //  window.open="../webSocket.html"
  },
    watch: {
    startTime() {
      this.listQuery.startTimeStart = this.startTime[0];
      this.listQuery.startTimeEnd = this.startTime[1];
    }
  },
  filters: {
    getdate(date) {
      if (date != null) {
        return date.substr(0, 10);
      }
    },
    getstate(state){
    	if(state!=null){
    		if(state==1){
    			return "不合规";
    		} 	else if(state==2){
    			return "未提交";
    		}else if(state==3){
    			return "待判读";
    		}else{
    			return "已判读";
    		}
    	}
    },
    getResultState(resultState){
    		if(resultState!=null){
    	if(resultState==1){
    		return "正常";
    	}else{
    		return "异常";
    	}
    	}
    }
  },
  methods: {
    getList() {
      this.listLoading = true;
    this.listQuery.userId= JSON.parse(localStorage.getItem('userInfo')).userId
   // alert( this.listQuery.userId)
      moveList(this.listQuery).then(response => {
        this.list = response.data.page.list;
         
        this.total = response.data.page.totalCount;
        this.listLoading = false;
      });
    },
    handleFilter(){
      this.listQuery.page = 1;
		  this.getList();
    },
      handleSave(){
         this.YFetalMovementEntity.state="4"
        this.YFetalMovementEntity.resultState=this.resultState
    		this.YFetalMovementEntity.readContent=this.readContent
    		this.YFetalMovementEntity.moveId=this.moveId
        updateFetalMove(this.YFetalMovementEntity).then(response => {
            //console.log(response);
            if (response.data.resultCode == 200) {
              this.$notify({
                type: "success",
                message: "保存成功!"
              });
         this.dialogChartsFormVisible = false
         this.getList()
              this.state=""
              this.readContent=""
            } else {
              this.$notify({
                type: "filed",
                message: "保存失败!"
              });
            }
              });

    },
    refrshFilter() {
      this.getList();
    },
     handleSizeChange(val) {
      this.listQuery.limit = val;
      this.getList();
    },
    handleCurrentChange(val) {
    	this.indexMethod = this.listQuery.limit * (val - 1) + 1;
      this.listQuery.page = val;
      this.getList();
    },
     /*创建折线图延时加载500ms*/
    setTimecreateChartOne() {
      setTimeout(this.createChartOne, 200);
    },
     createChartOne() { 
     	 var fecg_data = new Array();
     	 var fecg_data1=new Array();
         var canvas = document.getElementById("myCanvas");
         var canvas1 = document.getElementById("myCanvas1");

         if (canvas.getContext) {
              var ctx = canvas.getContext("2d");
              var offsetx = 50;
              var offsety = 20;
              var offsety_diff = 20;
              var width = 1000;
              var height = 480;

              ctx.fillStyle = "rgba(255,255,255,1)";
              ctx.fillRect (offsetx, offsety, width, height);

              var xOffset = 2;

              var d_x = 80;
              for (var i = 0; i <= 1000; i++)
              {
              	
                 if (i%d_x == 0){
                   ctx.strokeStyle = "rgba(255,0,0,.3)";
                   ctx.lineWidth = 1;
                   ctx.beginPath();
                   ctx.moveTo(i+offsetx, offsety);
                   ctx.lineTo(i+offsetx,16 *offsety_diff + offsety);
                   ctx.stroke();
                 }            
              }
              
              
              for (var j = 0; j <= 16; j++)
              {
                 if (j% 3 != 0){
                   ctx.strokeStyle = "rgba(255,0,0,.3)";
                   ctx.lineWidth = 1;
                   ctx.beginPath();
                   ctx.moveTo(offsetx, j*offsety_diff + offsety);
                   ctx.lineTo(width+offsetx, j*offsety_diff + offsety);
                   ctx.stroke();
                  }else{
                    ctx.strokeStyle = "rgba(255,0,0,.6)";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(offsetx, j*offsety_diff + offsety);
                    ctx.lineTo(width+offsetx, j*offsety_diff + offsety);
                    ctx.stroke();
                  }

                  if (j%3 == 0){ 
                    ctx.font="15px Arial";
                    ctx.fillStyle = "rgb(0,0,0)";
                    ctx.fillText(210 - 10*j,60+offsetx,j*offsety_diff + offsety);
                  }
               }

               //画胎心数据 胎心率
             var data = this.xdata;
            for (var i =0; i < data.length-1; i++){
                  var item = data[i];
                  var arr = new Array();
                  arr[0] = item[0];
                  arr[1] = item[1];
                
                  fecg_data[i] = arr;
                  
             }
            ctx.beginPath();
             var tempY = 0;//之前的y值
             var detal = 0;//两个点的y轴差值
             var x = 0;//150,实时监护时曲线的最右边，右边的一大段都没有曲线绘制
             var ratio = 1;
             var fhr1_y_old = 0,toco_y_old = 50;
             for (var i = 0; i < fecg_data.length; i++)
             {
                  ctx.strokeStyle = "rgb(0,0,128)";
                  var rate = fecg_data[i][1];
                  var fhr1_y;
                  if((rate)&&(rate > 210)){
                      rate = 0;
                  }
                  fhr1_y = (height * 0.615)* (210 - rate) / (210 - 50 )+ 13 +offsety;
                  console.log("SSSSSSSSSSSSSSSSSS"+rate)
               console.log("SSSSSSSSSSSSSSSSSS"+fhr1_y)

                  x = xOffset + i/ratio +offsetx;

                  detal = fhr1_y - tempY;
                  tempY = fhr1_y;
                  if (i == 0) {
                      ctx.moveTo(x,fhr1_y);
                  }else{
                      ctx.moveTo(x-1,fhr1_y_old);
                  }
                  if((rate < 50)&&(rate)){
                      rate = 50;
                  }
                  if(rate >= 50 ){
                      if (Math.abs(detal) > 25) {
                          ctx.stroke();
                          ctx.moveTo(x,fhr1_y);
                      } else {
                          ctx.lineTo(x,fhr1_y);
                      }
                  }
                  fhr1_y_old = fhr1_y;
              }
           
    }  
        if (canvas1.getContext) { 
        	 var ctx = canvas1.getContext("2d");
              var offsetx = 50;
              var offsety = 20;
              var offsety_diff = 20;

              var width = 1000;
              var height = 220;

              ctx.fillStyle = "rgba(255,255,255,1)";
              ctx.fillRect (offsetx, offsety, width, height);

              var xOffset = 2;

              var d_x = 80;
              for (var i = 0; i <= 1000; i++)
              {
                 if (i%d_x == 0){
                   ctx.strokeStyle = "rgba(255,0,0,.3)";
                   ctx.lineWidth = 1;
                   ctx.beginPath();
                   ctx.moveTo(i+offsetx, offsety);
                   ctx.lineTo(i+offsetx,16 *offsety_diff + offsety);
                   ctx.stroke();
                 }            
              }
              
              
              for (var j = 0; j <= 16; j++)
              {
                 if (j% 2 != 0){
                   ctx.strokeStyle = "rgba(255,0,0,.3)";
                   ctx.lineWidth = 1;
                   ctx.beginPath();
                   ctx.moveTo(offsetx, j*offsety_diff + offsety);
                   ctx.lineTo(width+offsetx, j*offsety_diff + offsety);
                   ctx.stroke();
                  }else{
                    ctx.strokeStyle = "rgba(255,0,0,.6)";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(offsetx, j*offsety_diff + offsety);
                    ctx.lineTo(width+offsetx, j*offsety_diff + offsety);
                    ctx.stroke();
                  }

                  if (j%2 == 0){ 
                    ctx.font="15px Arial";
                    ctx.fillStyle = "rgb(0,0,0)";
                    ctx.fillText(100 - 10*j,60+offsetx,j*offsety_diff + offsety);
                  }
               }

               //画胎心数据
               var data = this.xdata;

             for (var i =0; i < data.length-1; i++){
                  var item = data[i];
                  var arr = new Array();
                  arr[0] = item[0];
                  arr[1] = item[2];
                  fecg_data1[i] = arr;
             }
             ctx.beginPath();
             var x = 0;//150,实时监护时曲线的最右边，右边的一大段都没有曲线绘制
             var ratio = 1;
             var fhr1_y_old = 50;
             for (var i = 0; i < fecg_data1.length; i++)
             {
                  ctx.strokeStyle = "rgb(0,0,128)";
                  ctx.lineWidth = 1;
                  var rate = fecg_data1[i][1];
                  var fhr1_y;
                  if((rate)&&(rate > 100)){
                      rate = 0;
                  }
                       fhr1_y = 220 - (200 / 100) * fecg_data1[i][1];
                  //fhr1_y = (height * 0.70 +4)+height * 0.265 * (100 - rate+6) / (100 + 10);
                  x = xOffset + i/ratio +offsetx;
             console.log("raterateraterate"+rate)
               console.log("fhr1_yfhr1_yfhr1_yfhr1_yfhr1_y"+fhr1_y)
                  if (i == 0) {
                      ctx.moveTo(x,fhr1_y);
                  }else{
                      ctx.moveTo(x-1,fhr1_y_old);
                  }
                  ctx.stroke();
                  ctx.lineTo(x,fhr1_y);
                  fhr1_y_old = fhr1_y;
              }
        }
     },

    handleRead(aa,bb,cc){
    	this.moveId=bb
    	this.state=cc
      this.dialogChartsStatus = "detail"
      this.dialogChartsFormVisible = true;
      this.getData(aa);
    	this.setTimecreateChartOne();
    },
       getData(aa){
  	   var arr=[[]]
  	   arr=JSON.parse(aa)
    	this.xdata=arr
    	//alert(this.xdata)
    },
 
       showMenu () {
        event.preventDefault()
        var x = event.clientX
        var y = event.clientY
        // Get the current location
        this.contextMenuData.axios = {
          x, y
        }
      },
      savedata () {
      	alert(1)
      },
      newdata () {
      	console.log('newdata!')
      }
    
  }
};
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
  width: 60%;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
