<template>
	<div class="app-container calendar-list-container fhrList" v-loading.body="pageLoading">
		<!-- 检索条件 -->
		<div class="filter-container">
			<el-select @keyup.enter.native="handleFilter" style="width: 170px;" class="filter-item" v-model="listQuery.state" placeholder="请选择条件">
				<el-option v-for="item in conditionType" :key="item.key" :label="item.display_name" :value="item.key">
				</el-option>
			</el-select>
			<el-date-picker @keyup.enter.native="handleFilter" v-model="startTime" class="filter-item" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions2" value-format="yyyy-MM-dd">
			</el-date-picker>
			<el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="关键字" v-model="listQuery.userName"></el-input>
			<el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="来源" v-model="listQuery.doctor"></el-input>
			<el-button class="filter-item" style="margin-left: 10px;" @click="handleFilter" type="primary" v-waves>查询</el-button>
		</div>
		<!-- 一览部分 -->
		<el-table :data="list" v-loading.body="listLoading" border fit highlight-current-row style="width: 100%">
			<el-table-column type="index" label="序号" :index="indexMethod" width="100%">
			</el-table-column>
			<el-table-column align="center" width="220" label="监测(上传)时间" prop="startTime">
				<template slot-scope="scope">
					<span>{{scope.row.startTime }}</span>
				</template>
			</el-table-column>
			<el-table-column align="center" label="孕妇账号">
				<template slot-scope="scope">
					<span>{{scope.row.userAccount}}</span>
				</template>
			</el-table-column>
			<el-table-column align="center" label="姓名">
				<template slot-scope="scope">
					<span>{{scope.row.userName}}</span>
				</template>
			</el-table-column>
			<el-table-column align="center" label="年龄">
				<template slot-scope="scope">
					<span>{{scope.row.age }}</span>
				</template>
			</el-table-column>
			<el-table-column align="center" label="预产期">
				<template slot-scope="scope">
					<span>{{scope.row.pregnancyDate |getdate }}</span>
				</template>
			</el-table-column>
			<el-table-column align="center" width="220" label="监测时长" prop="monitoringTime">
				<template slot-scope="scope">
					<span>{{scope.row.monitoringTime}}</span>
				</template>
			</el-table-column>
			<el-table-column align="center" width="240" label="操作">
				<template slot-scope="scope">
					<!--	 <el-button  v-if="scope.row.state=='3'" type="primary" @click="handleRead(scope.row.heartRecord,scope.row.moveId,scope.row.state)">判读</el-button>-->
					<el-button type="primary" @click="handleRead(scope.row)">查看详情</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!-- 分页 -->
		<div v-show="!listLoading" class="pagination-container">
			<el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
			</el-pagination>
		</div>
		<!--柱状图-->
		<div id="div-score">
			<el-dialog :title="textMap[dialogChartsStatus]" :visible.sync="dialogChartsFormVisible" id="score-dialog" top="7vh">
				<div id="app" @contextmenu="showMenu" style="width: 100%;height: 100%;">

					<div id="canvas-container" style="overflow:auto;margin:0 3rem" ref="canvasContainer">
						<canvas class="myCanvas" id="myCanvas" ref="myCanvas" :width="fhrCanvasWidth*5" :height="fhrCanvasHeight"></canvas>
						<canvas class="myCanvas1" id="myCanvas1" ref="myCanvas1" :width="tcCanvasWidth*5" :height="tcCanvasHeight"></canvas>
					</div>
					<!--<div id="single">
         <canvas class="myCanvas1" id="myCanvas1" width="1024px" height="220px"></canvas>
      </div>-->
					<!--<div v-if="state=='3'"  style="margin-left: 50px;">
     		   <el-select  class="filter-item"  v-model="resultState" placeholder="请选择判读结果">
          <el-option v-for="item in stateType" :key="item.key" :label="item.display_name" :value="item.key">
          </el-option>
        </el-select>
      <el-input style="width: 60%;" class="filter-item" placeholder="操作内容" v-model="readContent"></el-input>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleSave" type="primary" icon="el-icon-search" v-waves>保存</el-button>
     	</div>-->
					<vue-context-menu :contextMenuData="contextMenuData" @savedata="savedata" @newdata="newdata">
					</vue-context-menu>
				</div>
			</el-dialog>
		</div>

		<!--评分页面-->
		<el-dialog :title="textMap[dialogAutoScoreStatus]" :visible.sync="dialogAutoScoreFormVisible" top="15vh" width="45%">
			<div>
				<p style="margin-left: 10px;">评分方式:</p>
				<el-radio-group v-model="radioScore" @change="clickScoreType">
					<el-radio label="3">Fischer</el-radio>
					<el-radio label="5">Krebs</el-radio>
					<!--  <el-radio label="5">Krebs(12)</el-radio>   -->
					<el-radio label="1">ACOG</el-radio>
					<el-radio label="2">NST</el-radio>
				</el-radio-group>
			</div>
			<div>
				<p class="autoCore" v-if="radioScore=='3'">Fischer(NST/NS-CST)</p>
				<p class="autoCore" v-if="radioScore=='4'">Krebs(NST/NS-CST)</p>
				<!--    <p v-if="radioScore=='5'">Krebs(12)</p>-->
				<p class="autoCore" v-if="radioScore=='1'">ACOG</p>
				<p class="autoCore" v-if="radioScore=='2'">NST</p>
				<!--自动评分-->
				<el-button class="autoCore1" type="primary" @click="autoScore">自动评分</el-button>
			</div>
			<!--点击出现的Fischer  table-->
			<table v-if="radioScore=='3'" border="1" cellspacing="0" width="100%" height="150">
				<tr>
					<td>评分标准</td>
					<td>胎心率基线(BPM)</td>
					<td>振幅变异(BPM)</td>
					<td>周期变异(次/分)</td>
					<td>加速(次/30分)</td>
					<td>减速(次/30分)</td>
				</tr>
				<tr>
					<td>0</td>
					<td>
						<100或>180</td>
					<td>
						<5</td>
							<td>
								<2</td>
									<td>0</td>
									<td>LD,PD,重度VD</td>
				</tr>
				<tr>
					<td>1</td>
					<td>100-109 161-180 </td>
					<td>5-9或 >30</td>
					<td>2-5</td>
					<td>1-2</td>
					<td>轻度VD>2 或 ED>2</td>
				</tr>
				<tr>
					<td>2</td>
					<td>110-160 </td>
					<td>10-30</td>
					<td>>5</td>
					<td>>2</td>
					<td>无</td>
				</tr>
				<tr>
					<td>结果</td>
					<td>
						<el-input v-model="bfhr1"></el-input>
					</td>
					<td>
						<el-input v-model="var1"></el-input>
					</td>
					<td>
						<el-input v-model="cyc1"></el-input>
					</td>
					<td>
						<el-input v-model="acct1"></el-input>
					</td>
					<td>
						<el-input v-model="dect1"></el-input>
					</td>
				</tr>
				<tr>
					<td>分值</td>
					<td>
						<el-input v-model="sbfhr1" :disabled="true"></el-input>
					</td>
					<td>
						<el-input v-model="svar1" :disabled="true"></el-input>
					</td>
					<td>
						<el-input v-model="scpm1" :disabled="true"></el-input>
					</td>
					<td>
						<el-input v-model="sacct1" :disabled="true"></el-input>
					</td>
					<td>
						<el-input v-model="sdect1" :disabled="true"></el-input>
					</td>
				</tr>
				<tr>
					<td>总分</td>
					<td colspan="5">
						<el-input v-model="fischerScore1" :disabled="true"></el-input>
					</td>
				</tr>
			</table>
			<table v-if="radioScore=='5'" border="1" cellspacing="0" width="100%" height="150">
				<tr>
					<td>评分标准</td>
					<td>胎心率基线(BPM)</td>
					<td>振幅变异(BPM)</td>
					<td>周期变异(次/分)</td>
					<td>加速(次/30分)</td>
					<td>减速(次/30分)</td>
					<td>胎动次数(次/30分)</td>
				</tr>
				<tr>
					<td>0</td>
					<td>
						<100或>180</td>
					<td>
						<5</td>
							<td>
								<3</td>
									<td>0</td>
									<td>>2</td>
									<td>0</td>
				</tr>
				<tr>
					<td>1</td>
					<td>100-109 161-180 </td>
					<td>5-9或 >25</td>
					<td>3-6</td>
					<td>1-4</td>
					<td>1-2</td>
					<td>1-4</td>
				</tr>
				<tr>
					<td>2</td>
					<td>110-160 </td>
					<td>10-25</td>
					<td>>6</td>
					<td>>=5</td>
					<td>0</td>
					<td>>=5</td>
				</tr>
				<tr>
					<td>结果</td>
					<td>
						<el-input v-model="bfhr2"></el-input>
					</td>
					<td>
						<el-input v-model="var2"></el-input>
					</td>
					<td>
						<el-input v-model="cyc2"></el-input>
					</td>
					<td>
						<el-input v-model="acct2"></el-input>
					</td>
					<td>
						<el-input v-model="dect2"></el-input>
					</td>
					<td>
						<el-input v-model="fmcnt2"></el-input>
					</td>
				</tr>
				<tr>
					<td>分值</td>
					<td>
						<el-input v-model="sbfhr2" :disabled="true"></el-input>
					</td>
					<td>
						<el-input v-model="svar2" :disabled="true"></el-input>
					</td>
					<td>
						<el-input v-model="scpm2" :disabled="true"></el-input>
					</td>
					<td>
						<el-input v-model="sacct2" :disabled="true"></el-input>
					</td>
					<td>
						<el-input v-model="sdect2" :disabled="true"></el-input>
					</td>
					<td>
						<el-input v-model="sfmcnt2" :disabled="true"></el-input>
					</td>
				</tr>
				<tr>
					<td>总分</td>
					<td colspan="6">
						<el-input v-model="fischerScore2" :disabled="true"></el-input>
					</td>
				</tr>
			</table>
			<!--点击出现的NST  table-->
			<table v-if="radioScore=='2'" border="1" cellspacing="0" width="100%" height="150">
				<tr>
					<td>评分标准</td>
					<td>胎心率基线(BPM)</td>
					<td>振幅变异(BPM)</td>
					<td>胎动次数 </td>
					<td>加速幅度 </td>
					<td>加速时间 </td>
				</tr>
				<tr>
					<td>0</td>
					<td>
						<100或>180</td>
					<td>
						<=5</td>
							<td>0</td>
							<td>
								<=10</td>
									<td>
										<=10</td>
				</tr>
				<tr>
					<td>1</td>
					<td>100-109 161-180 </td>
					<td>>25</td>
					<td>1</td>
					<td>10-14</td>
					<td>10-14</td>
				</tr>
				<tr>
					<td>2</td>
					<td>110-160 </td>
					<td>6-25</td>
					<td>>=2</td>
					<td>>=15</td>
					<td>>=15</td>
				</tr>
				<tr>
					<td>结果</td>
					<td>
						<el-input v-model="bfhr4"></el-input>
					</td>
					<td>
						<el-input v-model="var4"></el-input>
					</td>
					<td>
						<el-input v-model="fmcnt4"></el-input>
					</td>
					<td>
						<el-input v-model="fmv4"></el-input>
					</td>
					<td>
						<el-input v-model="fmd4"></el-input>
					</td>
				</tr>
				<tr>
					<td>分值</td>
					<td>
						<el-input v-model="sbfhr4" :disabled="true"></el-input>
					</td>
					<td>
						<el-input v-model="svar4" :disabled="true"></el-input>
					</td>
					<td>
						<el-input v-model="sfmcnt4" :disabled="true"></el-input>
					</td>
					<td>
						<el-input v-model="sfmv4" :disabled="true"></el-input>
					</td>
					<td>
						<el-input v-model="sfmd4" :disabled="true"></el-input>
					</td>
				</tr>
				<tr>
					<td>总分</td>
					<td colspan="5">
						<el-input v-model="fischerScore4"></el-input>
					</td>
				</tr>
			</table>
			<!--点击acog-->
			<table v-if="radioScore=='1'" border="1" cellspacing="0" width="100%" height="150">
				<tr>
					<td>胎心率基线(BPM)</td>
					<td>
						<el-radio v-model="baseline" label="1">正常(110-160bpm)</el-radio>
					</td>
					<td>
						<el-radio v-model="baseline" label="2">胎心过速(>160bpm)</el-radio>
						<el-radio v-model="baseline" label="3">胎心过缓(
							<110bpm)</el-radio>
					</td>
					<td rowspan="6">基线变异缺失 (0bpm)且存在<br/>
						<el-radio v-model="dec" label="8">心率过缓</el-radio><br/><br/>
						<el-radio v-model="dec" label="9">周期性变异减速</el-radio><br/><br/>
						<el-radio v-model="dec" label="10">周期性晚期减速</el-radio>
					</td>
				</tr>
				<tr>
					<td>胎心基线变异</td>
					<td>
						<el-radio v-model="varr" label="1">中度</el-radio>
					</td>
					<td>
						<el-radio v-model="varr" label="2">微小变异</el-radio><br/>
						<el-radio v-model="varr" label="3">显著变异</el-radio><br/>
						<el-radio v-model="varr" label="4">变异缺失(0bpm)不伴反复出现的晚期减速</el-radio>
					</td>

				</tr>
				<tr>
					<td>胎心加速</td>
					<td>
						<!-- 或者2-->
						<el-radio v-model="acc" label="1">有或无</el-radio>
						<!--						<el-radio v-model="acc" label="2"></el-radio>
-->
					</td>
					<td>
						<p>刺激胎儿后仍无加速</p>
					</td>

				</tr>
				<tr>
					<td rowspan="3">减速</td>
					<td>
						<el-radio v-model="dec" label="1">无加速</el-radio>
					</td>
					<td>
						<!--3或者4-->
						<el-radio v-model="dec" label="2">存在非周期性的变异减速或晚期减速</el-radio>
					</td>

				</tr>
				<tr>
					<td>
						<el-radio v-model="dec" label="3">无变异减速</el-radio>
					</td>
					<td>
						<!--1,6,7-->
						<el-radio v-model="dec" label="4">基线变异适中且存在周期性的变异减速</el-radio><br/>
						<el-radio v-model="dec" label="5">基线变异适中且存在周期性的晚期减速</el-radio>
					</td>

				</tr>
				<tr>
					<td>
						<el-radio v-model="dec" label="6">无变异减速或晚期减速</el-radio>
					</td>
					<td>
						<el-radio v-model="dec" label="7">存在延长减速</el-radio>
					</td>
					<td> </td>
				</tr>
				<tr>
					<td>正常曲线</td>

					<td colspan="2">
						<el-radio v-model="sine" label="1">否</el-radio>
					</td>
					<td>
						<el-radio v-model="sine" label="2">是</el-radio>
					</td>
				</tr>
				<tr>
					<td>胎心监护结果</td>
					<td>
						<el-radio v-model="stv" label="1">正常的EFM</el-radio>
					</td>
					<td>
						<el-radio v-model="stv" label="2">可疑的EFM</el-radio>
					</td>
					<td>
						<el-radio v-model="stv" label="3">异常的EFM</el-radio>
					</td>
				</tr>
			</table>
			<!--医嘱-->
			<div style="display: flex;">
				<p style="width: 50%;-webkit-margin-after: 0;">医嘱:</p>
				<p style="-webkit-margin-after: 0;">
					请选择:
					<el-radio-group v-model="resultState" @change="clickResultState">
						<el-radio label="1">正常</el-radio>
						<el-radio label="2">异常</el-radio>
					</el-radio-group>
				</p>
			</div>

			<div style="display: flex;">

				<textarea rows="10" cols="50" style="width: 60%;" v-model="doctorAdvice"></textarea>
				<div style="width: 40%;">
					<div style="display: flex;height: 25%;">
						<span>异常结果如下:</span>
					</div>
					<!--<div style="display: flex;height: 25%;">
						<el-radio v-model="radio1" label="1" style="width: 50%;">低分告警</el-radio>
						<el-radio v-model="radio1" label="2" style="width: 50%;">存在减速</el-radio>
					</div>
					<div style="display: flex;height: 25%;">
						<el-radio v-model="radio1" label="3" style="width: 50%;">心率异常</el-radio>
						<el-radio v-model="radio1" label="4" style="width: 50%;">正弦波存在</el-radio>
					</div>
					<div style="display: flex;height: 25%;">
						<el-radio v-model="radio1" label="5" style="width: 50%;">长变异缺失</el-radio>
						<el-radio v-model="radio1" label="6" style="width: 50%;">短变异缺失</el-radio>
					</div>-->
					<el-checkbox-group v-model="radio1" size="small">
						<div style="display: flex;height: 25%;">
							<el-checkbox label="1">低分告警</el-checkbox>
							<el-checkbox label="2">存在减速</el-checkbox>
						</div>
						<div style="display: flex;height: 25%;">
							<el-checkbox label="3">心率异常</el-checkbox>
							<el-checkbox label="4">正弦波存在</el-checkbox>
						</div>
						<div style="display: flex;height: 25%;">
							<el-checkbox label="5">长变异缺失</el-checkbox>
							<el-checkbox label="6">短变异缺失</el-checkbox>
						</div>
					</el-checkbox-group>
				</div>

			</div>
			<br/> 医生签名：
			<el-input v-model="doctorSign"></el-input>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="handleSave">确 定</el-button>
				<el-button @click="dialogAutoScoreStatus = false">取 消</el-button>
				<br/>&nbsp;
			</div>
		</el-dialog>
	</div>
</template>

<script>
	import waves from "@/directive/waves";
	import { moveList, updateFetalMove, autoScore } from "@/api/fetalHeart";
	import { getCookie } from "@/utils";

	//引入Echarts主模块
	let echarts = require("echarts/lib/echarts");
	//引入折线图
	require("echarts/lib/chart/line");
	//引入所需组件
	require("echarts/lib/component/tooltip");
	require("echarts/lib/component/legend");

	const stateType = [{
			key: "1",
			display_name: "正常"
		},
		{
			key: "2",
			display_name: "异常"
		}
	];
	const conditionType = [{
			key: "3",
			display_name: "待判读"
		},
		{
			key: "4",
			display_name: "已判读"
		}
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
				startTime: "",
				scoreType: "",
				monitoringTime: "",
				beginTime: "",
				age: "",
				listLoading: true,
				readContent: "",
				moveId: "",
				resultState: "",
				stateType,
				state: "",
				conditionType,
				indexMethod: 1,
				radioScore: "1",
				scoreRadio: "",
				radio1: [],
				doctorAdvice: "",
				listQuery: {
					page: 1,
					limit: 10,
					state: "",
					startTimeStart: undefined,
					startTimeEnd: undefined,
					userName: undefined,
					doctor: undefined
				},
				scoreQuery: {
					urll: "",
					type: "3p",
					key: {
						"fhr1": 0,
						"fhr2": 1,
						"afm": 2,
						"toco": 3,
						"fhrsign": 4,
						"afmcount": 5,
						"fmcount": 6,
						"battery": 7,
						"charge": 8
					},
					data: "",
					tlong: "",
					begindate: ""
				},
				dialogChartsStatus: "",
				dialogChartsFormVisible: false,
				dialogAutoScoreStatus: "",
				dialogAutoScoreFormVisible: false,
				textMap: {
					detail: "详情",
					autoScore: "评分"
				},
				YFetalMovementEntity: {
					state: "",
					resultState: "",
					scoreData: "",
					nstResult: "",
					acogResult: "",
					fischerResult: "",
					krebsResult: "",
					moveId: "",
					readContent:""
				},
				xdata: [],
				pickerOptions2: {
					shortcuts: [{
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
					menulists: [{
							fnHandler: 'savedata', // Binding events(绑定事件)
							icoName: 'fa fa-home fa-fw', // icon (icon图标 )
							btnName: '评分' // The name of the menu option (菜单名称)
						},
						{
							fnHandler: 'newdata',
							icoName: 'fa fa-home fa-fw',
							btnName: '打印'
						}
					]
				},
				screenWidth: document.body.clientWidth,
				screenHeight: document.body.clientHeight,
				fhrCanvasWidth: document.body.clientWidth * 0.8, //胎心率画布宽度
				fhrCanvasHeight: document.body.clientHeight * 0.8 * 0.5, //胎心率画布高度
				tcCanvasWidth: document.body.clientWidth * 0.8, //宫缩画布宽度
				tcCanvasHeight: document.body.clientHeight * 0.8 * 0.3, //宫缩画布高度
				//存进数据库里面的四种类型
				fischerData: "",
				krebsData: "",
				acogData: "",
				nstData: "",
				doctorSign: JSON.parse(localStorage.getItem('userInfo')).userName,
				//Fischer
				bfhr1: "",
				var1: "",
				cyc1: "",
				acct1: "",
				dect1: "",
				sbfhr1: 0,
				svar1: 0,
				scpm1: 0,
				sacct1: 0,
				sdect1: 0,
				fischerScore1: 0,
				//Krebs
				bfhr2: "",
				var2: "",
				cyc2: "",
				acct2: "",
				dect2: "",
				fmcnt2: 0,
				sbfhr2: 0,
				svar2: 0,
				scpm2: 0,
				sacct2: 0,
				sdect2: 0,
				sfmcnt2: 0,
				fischerScore2: 0,
				//ACOG
				baseline: "",
				sine: "",
				stv: "",
				varr: "",
				dec: "",
				acc: "",
				//NST
				bfhr4: "",
				var4: "",
				fmcnt4: "",
				fmv4: "",
				fmd4: "",
				sbfhr4: 0,
				svar4: 0,
				sfmv4: 0,
				sfmcnt4: 0,
				sfmd4: 0,
				fischerScore4: 0,
				checkList: ""
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
			},
			// bfhr1: "",  
			bfhr1() {
				if(this.bfhr1 < 100 || this.bfhr1 > 180) {
					this.sbfhr1 = 0
				} else if(this.bfhr1 > 110 && this.bfhr1 < 160) {
					this.sbfhr1 = 2
				} else if((this.bfhr1 > 100 && this.bfhr1 < 109) || (this.bfhr1 > 161 && this.bfhr1 < 180)) {
					this.sbfhr1 = 1
				}
			},
			//	 var1: "",
			var1() {
				if(this.var1 < 5) {
					this.svar1 = 0
				} else if((this.var1 > 5 && this.var1 < 9) || this.var1 > 30) {
					this.svar1 = 1
				} else if(this.var1 > 10 && this.var1 < 30) {
					this.svar1 = 2
				}
			},
			//	 cyc1 : "",
			cyc1() {
				if(this.cyc1 < 2) {
					this.scpm1 = 0
				} else if(this.cyc1 > 2 && this.cyc1 < 5) {
					this.scpm1 = 1
				} else if(this.cyc1 > 5) {
					this.scpm1 = 2
				}
			},
			//	 acct1: "",
			acct1() {
				if(this.acct1 == 0) {
					this.sacct1 = 0
				} else if(this.acct1 > 1 && this.acct1 < 2) {
					this.sacct1 = 1
				} else if(this.acct1 > 2) {
					this.sacct1 = 2
				}
			},
			//	 dect1: "",
			dect1() {
				if(this.dect1 == 2) {
					this.sdect1 = 2
				} else if(this.dect1 == 1) {
					this.sdect1 = 1
				} else {
					this.dect1 = 0
					this.sdect1 = 0
				}
			},
			//fischerScore1
			//			fischerScore1(){
			//				this.fischerScore1=this.sbfhr1+this.svar1+this.scpm1+this.sacct1+this.sdect1
			//			}
			//  bfhr2: "",  
			bfhr2() {
				if(this.bfhr2 < 100 || this.bfhr2 > 180) {
					this.sbfhr2 = 0
				} else if(this.bfhr2 > 110 && this.bfhr2 < 160) {
					this.sbfhr2 = 2
				} else if((this.bfhr2 > 100 && this.bfhr2 < 109) || (this.bfhr2 > 161 && this.bfhr2 < 180)) {
					this.sbfhr2 = 1
				}
			},
			//	 var2: "",
			var2() {
				if(this.var2 < 5) {
					this.svar2 = 0
				} else if((this.var2 > 5 && this.var2 < 9) || this.var2 > 25) {
					this.svar2 = 1
				} else if(this.var2 > 10 && this.var2 < 25) {
					this.svar2 = 2
				}
			},
			//	 cyc2 : "",
			cyc2() {
				if(this.cyc2 < 3) {
					this.scpm2 = 0
				} else if(this.cyc2 > 3 && this.cyc2 < 6) {
					this.scpm2 = 1
				} else if(this.cyc2 > 6) {
					this.scpm2 = 2
				}
			},
			//	 acct2: "",
			acct2() {
				if(this.acct2 == 0) {
					this.sacct2 = 0
				} else if(this.acct2 > 1 && this.acct2 <= 4) {
					this.sacct2 = 1
				} else if(this.acct2 >= 5) {
					this.sacct2 = 2
				}
			},
			//	 dect2: "",
			dect2() {
				if(this.dect2 == 2) {
					this.sdect1 = 0
				} else if(this.dect2 > 1 && this.dect2 < 2) {
					this.sdect1 = 1
				} else if(this.dect2 == 0) {

					this.sdect1 = 2
				}
			},
			//	 fmcnt2: "",
			fmcnt2() {
				if(this.fmcnt2 == 0) {
					this.sfmcnt2 = 0
				} else if(this.fmcnt2 > 1 && this.fmcnt2 < 4) {
					this.sfmcnt2 = 1
				} else if(this.fmcnt2 >= 5) {
					this.sfmcnt2 = 2
				}
			},
			// bfhr4: "",  
			bfhr4() {
				if(this.bfhr4 < 100 || this.bfhr4 > 180) {
					this.sbfhr4 = 0
				} else if(this.bfhr4 > 110 && this.bfhr4 < 160) {
					this.sbfhr4 = 2
				} else if((this.bfhr4 > 100 && this.bfhr4 < 109) || (this.bfhr4 > 161 && this.bfhr4 < 180)) {
					this.sbfhr4 = 1
				}
			},
			//  var4: "",
			var4() {
				if(this.var4 <= 5) {
					this.svar4 = 0
				} else if(this.var4 > 25) {
					this.svar4 = 1
				} else if(this.var4 > 6 && this.var4 < 25) {
					this.svar4 = 2
				}
			},
			//  fmcnt4: "",
			fmcnt4() {
				if(this.fmcnt4 == 0) {
					this.sfmcnt4 = 0
				} else if(this.fmcnt4 > 2 || this.fmcnt4 == 2) {
					this.sfmcnt4 = 2
				} else if(this.fmcnt4 == 1) {
					this.sfmcnt4 = 1
				}
			},
			//    fmv4: "",
			fmv4() {
				if(this.fmv4 <= 10) {
					this.sfmv4 = 0
				} else if(this.fmv4 > 10 && this.fmv4 < 14) {
					this.sfmv4 = 1
				} else if(this.fmv4 >= 15) {
					this.sfmv4 = 2
				}
			},
			//   fmd4:"",
			fmd4() {
				if(this.fmd4 <= 10) {
					this.sfmd4 = 0
				} else if(this.fmd4 > 10 && this.fmd4 < 14) {
					this.sfmd4 = 1
				} else if(this.fmd4 >= 15) {
					this.sfmd4 = 2
				}
			},
			//总分
			fischerScore1() {

				this.fischerScore1 = parseInt(this.sbfhr1) + parseInt(this.svar1) + parseInt(this.scpm1) + parseInt(this.sacct1) + parseInt(this.sdect1)
			},
			fischerScore2() {
				this.fischerScore2 = parseInt(this.sbfhr2) + parseInt(this.svar2) + parseInt(this.scpm2) + parseInt(this.sacct2) + parseInt(this.sdect2) + parseInt(this.sfmcnt2)
			},
			fischerScore4() {
				this.fischerScore4 = parseInt(this.sbfhr4) + parseInt(this.svar4) + parseInt(this.sfmv4) + parseInt(this.sfmcnt4) + parseInt(this.sfmd4)
			}

		},

		filters: {
			getdate(date) {
				if(date != null) {
					return date.substr(0, 10);
				}
			},
			getstate(state) {
				if(state != null) {
					if(state == 1) {
						return "不合规";
					} else if(state == 2) {
						return "未提交";
					} else if(state == 3) {
						return "待判读";
					} else {
						return "已判读";
					}
				}
			},
			getResultState(resultState) {
				if(resultState != null) {
					if(resultState == 1) {
						return "正常";
					} else {
						return "异常";
					}
				}
			}
		},
		methods: {
			getList() {
				this.listLoading = true;
				this.listQuery.userId = JSON.parse(localStorage.getItem('userInfo')).userId
				// alert( this.listQuery.userId)
				moveList(this.listQuery).then(response => {
					this.list = response.data.page.list;

					this.total = response.data.page.totalCount;
					this.listLoading = false;
				});
			},
			handleFilter() {
				this.listQuery.page = 1;
				this.getList();
			},
			decideIsNull(aa) {
				if(aa != "") {
					this.checkList += "," + aa;
				}
			},

			handleSave() {
				//alert("11111111"+this.doctorAdvice)
				if(this.doctorAdvice==""){
					alert("医嘱不能为空，请选择");
				}
				this.checkList = "";

				this.YFetalMovementEntity.state = "4"
				this.YFetalMovementEntity.resultState = this.resultState
				if(this.resultState=='1'){
					this.YFetalMovementEntity.readContent='正常'
				}else if(this.resultState=='2'){
					 this.YFetalMovementEntity.readContent='异常'
				}
				this.YFetalMovementEntity.nstResult = this.bfhr4 + "," + this.var4 + "," + this.fmcnt4 + "," + this.fmv4 + "," + this.fmd4
				if(this.baseline == "") {
					this.baseline = 0
				}
				if(this.sine == "") {
					this.sine = 0
				}
				if(this.stv == "") {
					this.stv = 0
				}
				if(this.varr == "") {
					this.varr = 0
				}
				if(this.dec == "") {
					this.dec = 0
				}
				if(this.acc == "")(
					this.acc = 0
				)
				this.YFetalMovementEntity.acogResult = this.baseline + "," + this.sine + "," + this.stv + "," + this.varr + "," + this.dec + "," + this.acc
				this.YFetalMovementEntity.fischerResult = this.bfhr1 + "," + this.var1 + "," + this.cyc1 + "," + this.acct1 + "," + this.dect1
				this.YFetalMovementEntity.krebsResult = this.bfhr2 + "," + this.var2 + "," + this.cyc2 + "," + this.acct2 + "," + this.dect2
				this.decideIsNull(this.radio1);
				if(this.checkList.indexOf(",") != -1) {
					this.YFetalMovementEntity.scoreData = this.checkList.substring(1, this.checkList.length)
				} else {
					this.YFetalMovementEntity.scoreData = this.checkList
				}

				//	this.YFetalMovementEntity.readContent = this.readContent
				this.YFetalMovementEntity.moveId = this.moveId
				updateFetalMove(this.YFetalMovementEntity).then(response => {
					//console.log(response);
					if(response.data.resultCode == 200) {
						this.$notify({
							type: "success",
							message: "保存成功!"
						});
						this.dialogAutoScoreFormVisible = false
						//this.dialogChartsFormVisible = false
						this.getList()

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
			setTimecreateChartOne(monitoringTime) {
				this.createChartOne(monitoringTime)
				//				setTimeout(this.createChartOne(monitoringTime), 200);
			},
			createChartOne(monitoringTime) {
				this.$nextTick(function() {
					var canvasContainer = this.$refs.canvasContainer;
					var canvas = this.$refs.myCanvas;
					var canvas1 = this.$refs.myCanvas1;
					canvasContainer.style.width = this.fhrCanvasWidth;
					canvasContainer.style.height = (this.fhrCanvasHeight + this.tcCanvasHeight);
					var fhrTimeSecond = parseInt(monitoringTime.split(':')[0] * 60) + parseInt(monitoringTime.split(':')[1]);
				console.log("fhrTimeSecond", fhrTimeSecond);
				var fecg_data = new Array();
				var fecg_data1 = new Array();

				if(canvas.getContext) {
					var ctx = canvas.getContext("2d");
					var offsetx = 10;
					var offsety = 30;
					var width = canvas.width;
					var height = canvas.height;
					var picWidth = canvas.width - 2 * offsetx;
					var picHeight = canvas.height - 2 * offsety;
					var gap = 210 - 50;
					//横轴每格的间距
					var offsetx_diff = (width - 2 * offsetx) / 30;
					//纵轴每格的间距
					var offsety_diff = (height - 2 * offsety) / 16;
					var timeSecond = 30 * 60; //总共的时间(以秒为单位)
					ctx.fillStyle = "rgba(255,255,255,1)";
					ctx.fillRect(offsetx, offsety, width, height);

					var xOffset = 2;

					var d_x = Math.floor((width - offsetx * 2) / 30);
					var maxWidth = width - offsetx;
					//画竖线，分成30min的,每一格代表1min
					//					for(var i = 0; i <= width - offsetx * 2; i++) {
					//
					//						if(i % d_x == 0) {
					//							ctx.strokeStyle = "rgba(255,0,0,.3)";
					//							ctx.lineWidth = 1;
					//							ctx.beginPath();
					//							ctx.moveTo(i + offsetx, offsety);
					//							ctx.lineTo(i + offsetx, height - offsety);
					//							ctx.stroke();
					//						}
					//					}

					ctx.fillStyle = "#FFEAF6";
					ctx.fillRect(offsetx, 5 * offsety_diff + offsety, picWidth, 5 * offsety_diff);
					//画竖线，分成30min的,每一格代表1min
					for(var i = 0; i <= 30; i++) {
						ctx.strokeStyle = "rgba(255,0,0,.3)";
						ctx.lineWidth = 1;
						ctx.beginPath();
						ctx.moveTo(i * offsetx_diff + offsetx, offsety);
						ctx.lineTo(i * offsetx_diff + offsetx, height - offsety);
						ctx.font = "10px Arial";
						ctx.fillStyle = "#333333";
						ctx.fillText(i + "'", i * offsetx_diff + offsetx - 3, height - 15);
						ctx.stroke();
					}

					//画横线
					for(var j = 0; j <= 16; j++) {
						if(j % 3 != 0) {
							ctx.strokeStyle = "rgba(255,0,0,.3)";
							ctx.lineWidth = 1;
							ctx.beginPath();
							ctx.moveTo(offsetx, j * offsety_diff + offsety);
							ctx.lineTo(maxWidth, j * offsety_diff + offsety);
							ctx.stroke();
						} else {
							ctx.strokeStyle = "rgba(255,0,0,.6)";
							ctx.lineWidth = 2;
							ctx.beginPath();
							ctx.moveTo(offsetx, j * offsety_diff + offsety);
							ctx.lineTo(maxWidth, j * offsety_diff + offsety);
							ctx.stroke();
						}

						if(j % 3 == 0) {
							ctx.font = "10px Arial";
							ctx.fillStyle = "#333333";
							for(var i = 1; i < 20; i++) {
								ctx.fillText(210 - 10 * j, i * (maxWidth / 20), j * offsety_diff + offsety);
							}
						}
					}

					//画胎心数据 胎心率
					var data = this.xdata;
					for(var i = 0; i < data.length - 1; i++) {
						var item = data[i];
						var arr = new Array();
						arr[0] = item[0];
						arr[1] = item[1];

						fecg_data[i] = arr;

					}
					ctx.beginPath();
					var tempY = 0; //之前的y值
					var detal = 0; //两个点的y轴差值
					var x = 0; //150,实时监护时曲线的最右边，右边的一大段都没有曲线绘制
					var ratio = 1;
					var fhr1_y_old = 0,
						toco_y_old = 50;
					//每个数据所占的长度
					var perLength = ((picWidth / timeSecond) * fhrTimeSecond) / fecg_data.length;
					for(var i = 0; i < fecg_data.length; i++) {
						ctx.strokeStyle = "rgb(0,0,128)";
						if(i != fecg_data.length - 1) {
							var rate = fecg_data[i][1];
							var rate1 = fecg_data[i + 1][1]
							if((rate) && (rate > 210)) {
								rate = 210;
								//							rate = 210;
							}
							if((rate < 50) && (rate)) {
								rate = 50;
							}
							if((rate1) && (rate1 > 210)) {
								rate = 210;
								//							rate1 = 210;
							}
							if((rate1 < 50) && (rate1)) {
								rate1 = 50;
							}
							if(rate >= 50 && rate <= 210 && rate1 >= 50 && rate1 <= 210) {
								var fhr1_y1 = height - offsety - (picHeight / gap) * (rate - 50);
								var fhr1_y2 = height - offsety - (picHeight / gap) * (rate1 - 50);
								ctx.moveTo(offsetx + i * perLength, fhr1_y1);
								ctx.lineTo(offsetx + (i + 1) * perLength, fhr1_y2);
							}
						}
						////						fhr1_y = (height * 0.615) * (210 - rate) / (210 - 50) + 13 + offsety;
						//						x = xOffset + i / ratio + offsetx;
						//						detal = fhr1_y - tempY;
						//						tempY = fhr1_y;
						//						if(i == 0) {
						//							ctx.moveTo(x, fhr1_y);
						//						} else {
						//							ctx.moveTo(x - 1, fhr1_y_old);
						//						}
						//						if((rate < 50) && (rate)) {
						//							rate = 50;
						//						}
						//						if(rate >= 50) {
						//							if(Math.abs(detal) > 25) {
						//								ctx.stroke();
						//								ctx.moveTo(x, fhr1_y);
						//							} else {
						//								ctx.lineTo(x, fhr1_y);
						//							}
						//						}
						//						fhr1_y_old = fhr1_y;
					}
					ctx.stroke();

				}
				if(canvas1.getContext) {
					var ctx = canvas1.getContext("2d");
					var offsetx = 10;
					var offsety = 30;
					var width = canvas1.width;
					var height = canvas1.height;
					var picWidth = canvas1.width - 2 * offsetx;
					var picHeight = canvas1.height - 2 * offsety;
					var gap = 100 - 0;
					//横轴每格的间距
					var offsetx_diff = (width - 2 * offsetx) / 30;
					//纵轴每格的间距
					var offsety_diff = (height - 2 * offsety) / 10;
					var timeSecond = 30 * 60; //总共的时间(以秒为单位)
					ctx.fillStyle = "rgba(255,255,255,1)";
					ctx.fillRect(offsetx, offsety, width, height);

					var d_x = Math.floor((width - offsetx * 2) / 30);
					var maxWidth = width - offsetx;

					//画竖线，分成30min的,每一格代表1min
					for(var i = 0; i <= 30; i++) {
						ctx.strokeStyle = "rgba(255,0,0,.3)";
						ctx.lineWidth = 1;
						ctx.beginPath();
						ctx.moveTo(i * offsetx_diff + offsetx, offsety);
						ctx.lineTo(i * offsetx_diff + offsetx, height - offsety);
						ctx.font = "10px Arial";
						ctx.fillStyle = "#333333";
						ctx.fillText(i + "'", i * offsetx_diff + offsetx - 3, height - 15);
						ctx.stroke();
					}

					//画横线
					for(var j = 0; j <= 10; j++) {
						if(j % 2 != 0) {
							ctx.strokeStyle = "rgba(255,0,0,.3)";
							ctx.lineWidth = 1;
							ctx.beginPath();
							ctx.moveTo(offsetx, j * offsety_diff + offsety);
							ctx.lineTo(maxWidth, j * offsety_diff + offsety);
							ctx.stroke();
						} else {
							ctx.strokeStyle = "rgba(255,0,0,.6)";
							ctx.lineWidth = 2;
							ctx.beginPath();
							ctx.moveTo(offsetx, j * offsety_diff + offsety);
							ctx.lineTo(maxWidth, j * offsety_diff + offsety);
							ctx.stroke();
						}

						if(j % 2 == 0) {
							ctx.font = "10px Arial";
							ctx.fillStyle = "#333333";
							for(var i = 1; i < 20; i++) {
								ctx.fillText(100 - 10 * j, i * (maxWidth / 20), j * offsety_diff + offsety);
							}
						}
					}

					//画胎心数据 胎心率
					var data = this.xdata;
					for(var i = 0; i < data.length - 1; i++) {
						var item = data[i];
						var arr = new Array();
						arr[0] = item[0];
						arr[1] = item[2];

						fecg_data1[i] = arr;

					}
					ctx.beginPath();
					var tempY = 0; //之前的y值
					var detal = 0; //两个点的y轴差值
					var x = 0; //150,实时监护时曲线的最右边，右边的一大段都没有曲线绘制
					var ratio = 1;
					var fhr1_y_old = 0,
						toco_y_old = 50;
					//每个数据所占的长度
					var perLength = ((picWidth / timeSecond) * fhrTimeSecond) / fecg_data1.length;
					for(var i = 0; i < fecg_data.length; i++) {
						ctx.strokeStyle = "rgb(0,0,128)";
						if(i != fecg_data1.length - 1) {
							var rate = fecg_data1[i][1];
							var rate1 = fecg_data1[i + 1][1]
							if((rate) && (rate > 100)) {
								rate = 100;
								//							rate = 210;
							}
							if((rate < 0) && (rate)) {
								rate = 0;
							}
							if((rate1) && (rate1 > 100)) {
								rate = 100;
								//							rate1 = 210;
							}
							if((rate1 < 0) && (rate1)) {
								rate1 = 0;
							}
							if(rate >= 0 && rate <= 100 && rate1 >= 0 && rate1 <= 100) {
								var fhr1_y1 = height - offsety - (picHeight / gap) * (rate);
								var fhr1_y2 = height - offsety - (picHeight / gap) * (rate1);
								ctx.moveTo(offsetx + i * perLength, fhr1_y1);
								ctx.lineTo(offsetx + (i + 1) * perLength, fhr1_y2);
							}
						}
						////						fhr1_y = (height * 0.615) * (210 - rate) / (210 - 50) + 13 + offsety;
						//						x = xOffset + i / ratio + offsetx;
						//						detal = fhr1_y - tempY;
						//						tempY = fhr1_y;
						//						if(i == 0) {
						//							ctx.moveTo(x, fhr1_y);
						//						} else {
						//							ctx.moveTo(x - 1, fhr1_y_old);
						//						}
						//						if((rate < 50) && (rate)) {
						//							rate = 50;
						//						}
						//						if(rate >= 50) {
						//							if(Math.abs(detal) > 25) {
						//								ctx.stroke();
						//								ctx.moveTo(x, fhr1_y);
						//							} else {
						//								ctx.lineTo(x, fhr1_y);
						//							}
						//						}
						//						fhr1_y_old = fhr1_y;
					}
					ctx.stroke();

				}
				})
			},
			handleRead(row) {
				this.moveId = row.moveId
				this.state = row.state
				this.beginTime = row.startTime
				//对时间进行格式化
		  	//alert("csssssssss"+);	
			var monitor1= row.monitoringTime.split(":")[0];
		    var monitor2= row.monitoringTime.split(":")[1];
			//monitor1包含0
//			if(monitor1.indexOf("0")==0){
//		       }
 
           //  this.monitoringTime=row.monitoringTime
				this.monitoringTime =parseInt(monitor1*60)+parseInt(monitor2)
				this.age = row.age
				//把值赋给每一个 fischerResult
				if(row.fischerResult != null && row.fischerResult != "") {
					this.bfhr1 = row.fischerResult.split(",")[0];
					this.var1 = row.fischerResult.split(",")[1];
					this.cyc1 = row.fischerResult.split(",")[2];
					this.acct1 = row.fischerResult.split(",")[3];
					this.dect1 = row.fischerResult.split(",")[4];
				}

				// //Krebs
				if(row.krebsResult != null && row.krebsResult != "") {
					this.bfhr2 = row.krebsResult.split(",")[0];
					this.var2 = row.krebsResult.split(",")[1];
					this.cyc2 = row.krebsResult.split(",")[2];
					this.acct2 = row.krebsResult.split(",")[3];
					this.dect2 = row.krebsResult.split(",")[4];
				}
				//acog
				if(row.acogResult != null && row.acogResult != "") {
					this.baseline = row.acogResult.split(",")[0];
					this.sine = row.acogResult.split(",")[1];
					this.stv = row.acogResult.split(",")[2];
					this.varr = row.acogResult.split(",")[3];
					this.dec = row.acogResult.split(",")[4];
					this.acc = row.acogResult.split(",")[5];
				}
				//nst
				if(row.nstResult != null && row.nstResult != "") {
					this.bfhr4 = row.nstResult.split(",")[0];
					this.var4 = row.nstResult.split(",")[1];
					this.fmcnt4 = row.nstResult.split(",")[2];
					this.fmv4 = row.nstResult.split(",")[3];
					this.fmd4 = row.nstResult.split(",")[4];
				}
				//	  alert("2222222"+row.scoreData)
				//异常情况
				if(row.scoreData != null && row.scoreData != "") {

					//  alert("row.scoreDatarow.scoreData"+ row.scoreData.length)
					if(row.scoreData.length == 1) {
						this.radio1.push(row.scoreData)
					} else {

						var scoreData1 = row.scoreData.split(",");
						//  alert("scoreData1scoreData1"+scoreData1)
						for(let i = 0; i < scoreData1.length; i++) {
							this.radio1.push(scoreData1[i])
						}
					}

				}

				//resultState
				this.resultState = row.resultState;
				if(this.resultState == "1") {
					this.doctorAdvice = "正常"
				} else {
					this.doctorAdvice = "异常"
				}
				this.dialogChartsStatus = "detail"
				this.dialogChartsFormVisible = true;
				this.getData(row.heartRecord);
				this.setTimecreateChartOne(row.monitoringTime);
			},
			getData(aa) {
				var arr = [
					[]
				]
				arr = JSON.parse(aa)
				this.xdata = arr
				//alert(this.xdata)
			},

			showMenu() {
				event.preventDefault()
				var x = event.clientX
				var y = event.clientY
				// Get the current location
				this.contextMenuData.axios = {
					x,
					y
				}
			},
			//评分页面
			savedata() {
				 this.radio1=[]
                this.doctorAdvice=""
                
				this.dialogAutoScoreStatus = "autoScore"
				this.dialogAutoScoreFormVisible = true
			},
			//
			autoScore() {
				//alert("wwwwwwwww"+this.age);
				//对胎心1进行评分
				if(this.scoreType == "1") {
					this.scoreQuery.urll = "http://193.112.141.156/autoscore?uid=zhangmin&pwd=zhangmin123&gestage="+this.age+"&sctype=1&selfhr=1&detail=0";
				} else if(this.scoreType == "2") {
					this.scoreQuery.urll = "http://193.112.141.156/autoscore?uid=zhangmin&pwd=zhangmin123&gestage="+this.age+"&sctype=1&selfhr=1&detail=0";
				} else if(this.scoreType == "3") {
					this.scoreQuery.urll = "http://193.112.141.156/autoscore?uid=zhangmin&pwd=zhangmin123&gestage="+this.age+"&sctype=1&selfhr=1&detail=0";
				} else {
					this.scoreQuery.urll = "http://193.112.141.156/autoscore?uid=zhangmin&pwd=zhangmin123&gestage="+this.age+"&sctype=1&selfhr=1&detail=0";
				}

				var scoreData = [];
					  	  for(let i=0;i<this.xdata.length;i++){
					    	//胎心率
						  scoreData.push(this.xdata[i][1]);
						  scoreData.push(0);
						  scoreData.push(0);
						  scoreData.push(this.xdata[i][2]);
						  scoreData.push(0);
						  scoreData.push(0);
						  scoreData.push(this.xdata[i][3]);
						  scoreData.push(0);
						  scoreData.push(0);
						  }
//				for(let i = 0; i < 4800; i++) {
//					//胎心率
//					scoreData.push(120);
//					scoreData.push(0);
//					scoreData.push(0);
//					scoreData.push(50);
//					scoreData.push(0);
//					scoreData.push(0);
//					scoreData.push(0);
//					scoreData.push(0);
//					scoreData.push(0);
//				}
				//alert("this.xdatathis.xdatathis.xdata"+scoreData)
				//调评分接口
				this.scoreQuery.data = scoreData
				this.scoreQuery.begindate = this.beginTime
				this.scoreQuery.tlong = this.monitoringTime
				autoScore(this.scoreQuery).then(response => {
					if(response.data.errmsg == '0') {
						//把自动评分的结果赋值给table表中
						var reslut = response.data.param.result.split("@")[0];
						var avgScore = response.data.param.result.split("@")[1];
						var totalScore1 = response.data.param.totalscore[0];
						var totalScore2 = response.data.param.totalscore[1];
						var acogType = response.data.param.type;
						var acogAdvice = response.data.param.advise;
						// alert(totalScore1+totalScore2);
						/*	 bfhr: "",  
				 var1: "",
				 cyc : "",
				 acct: "",
				 dect: "",
				 sbfhr: "",
				 svar: "",
				 scpm: "",
				 sacct: "",
				 sdect: "",
				 fischerScore:""*/
						if(this.scoreType == "3") {
							//	this.fischerData=response.data.param.result
							this.bfhr1 = reslut.split(",")[0]
							this.var1 = reslut.split(",")[1]
							this.cyc1 = reslut.split(",")[2]
							this.acct1 = reslut.split(",")[3]
							this.dect1 = reslut.split(",")[4]
							this.sbfhr1 = avgScore.split(",")[0]
							this.svar1 = avgScore.split(",")[1]
							this.scpm1 = avgScore.split(",")[2]
							this.sacct1 = avgScore.split(",")[3]
							this.sdect1 = avgScore.split(",")[4]
							if(totalScore1 == totalScore2) {
								this.fischerScore1 = totalScore1
							} else {
								this.fischerScore1 = totalScore1 + "-" + totalScore2
							}
						} else if(this.scoreType == "5") {
							//	this.krebsData=response.data.param.result
							this.bfhr2 = reslut.split(",")[0]
							this.var2 = reslut.split(",")[1]
							this.cyc2 = reslut.split(",")[2]
							this.acct2 = reslut.split(",")[3]
							this.dect2 = reslut.split(",")[4]
							this.fmcnt2 = reslut.split(",")[5]
							this.sbfhr2 = avgScore.split(",")[0]
							this.svar2 = avgScore.split(",")[1]
							this.scpm2 = avgScore.split(",")[2]
							this.sacct2 = avgScore.split(",")[3]
							this.sdect2 = avgScore.split(",")[4]
							this.sfmcnt2 = avgScore.split(",")[5]
							if(totalScore1 == totalScore2) {
								this.fischerScore2 = totalScore1
							} else {
								this.fischerScore2 = totalScore1 + "-" + totalScore2
							}

						} else if(this.scoreType == "2") {
							//this.nstData=response.data.param.result
							this.bfhr4 = reslut.split(",")[0]
							this.var4 = reslut.split(",")[1]
							this.fmcnt4 = reslut.split(",")[5]
							this.fmv4 = reslut.split(",")[6]
							this.fmd4 = reslut.split(",")[7]
							this.sbfhr4 = avgScore.split(",")[0]
							this.svar4 = avgScore.split(",")[1]
							this.sfmcnt4 = avgScore.split(",")[5]
							this.sfmv4 = avgScore.split(",")[6]
							this.sfmd4 = avgScore.split(",")[7]
							if(totalScore1 == totalScore2) {
								this.fischerScore4 = totalScore1
							} else {
								this.fischerScore4 = totalScore1 + "-" + totalScore2
							}

						} else if(this.scoreType == "1") {
							//this.acogData=response.data.param.result
							//胎心率基线
							if(acogType[0] == 1) {
							  	this.baseline = 1
							 } else if(acogType[0] == 2) {
								this.baseline = 2
							} else if(acogType[0] == 3) {
								this.baseline = 3
							}
							//胎心基线变异
							if(acogType[1] == 1) {
								this.varr = 1
							} else if(acogType[1] == 2) {
								this.varr = 2
							} else if(acogType[1] == 3) {
								this.varr = 3
							} else if(acogType[1] == 4 && acogType[3] < 6) {
								this.varr = 4
							}
							//胎心加速
							this.acc = 1
							//胎心减速
							if(acogType[3] == 1) {
								this.dec = 1
							} else if(acogType[3] == 3 || acogType[3] == 4) {
								this.dec = 2
							} else if(acogType[3] == 2) {
								this.dec = 3
							} else if(acogType[3] == 1 || acogType[3] == 6) {
								this.dec = 4
							} else if(acogType[3] == 1 || acogType[3] == 7) {
								this.dec = 5
							} else if(acogType[3] == 8) {
								this.dec = 6
							} else if(acogType[3] == 5) {
								this.dec = 7
							} else if(acogType[1] > 2 && acogType[0] == 3) {
								this.dec = 8
							} else if(acogType[1] > 2 && acogType[3] == 6) {
								this.dec = 9
							} else if(acogType[1] > 2 && acogType[3] == 7) {
								this.dec = 10
							}

							//正弦曲线
							if(acogType[4] == 1) {
								this.sine = 1
							} else if(acogType[4] == 2) {
								this.sine = 2
							}
							//胎心监护结果
							if(acogAdvice[0] == 1) {
								this.stv = 1
							} else if(acogAdvice[0] == 2) {
								this.stv = 2
							} else if(acogAdvice[0] == 3) {
								this.stv = 3
							}
						}

						this.$notify({
							type: "success",
							message: "自动评分成功!",
							duration: 2000
						});
					} else if(response.data.errmsg == '-1') {
						this.$notify({
							type: "info",
							message: "密码错误!",
							duration: 2000
						});
					} else if(response.data.errmsg == '-2') {
						this.$notify({
							type: "info",
							message: "用户名错误!",
							duration: 2000
						});
					} else if(response.data.errmsg == '-4') {
						this.$notify({
							type: "info",
							message: "评分失败!",
							duration: 2000
						});
					} else {
						this.$notify({
							type: "info",
							message: "参数错误!",
							duration: 2000
						});
					}
				});
			},
			//打印
			newdata() {
				console.log('newdata!');
				this.$router.push({
					path: '/print',
					query: {
						moveId: this.moveId //胎心id
					}
				})
			},
			clickScoreType(value) {
				//alert("评分方式"+value);
				this.scoreType = value
				//				if(this.scoreType){
				//					this.baseline="" 
				//					this.varr=""
				//					this.acc=""
				//                   this.dec=""
				//                    this.sine=""
				//                    this.stv=""
				//                    this.radio1=""
				//			}

			},
			clickResultState(value) {
				if(value == 1) {
					this.doctorAdvice = "正常"
				} else {
					this.doctorAdvice = "异常"
				}
			}

		}
	};
</script>

<style>
	#div-score .el-dialog {
		width: 80%;
		height: 80%;
	}
	
	#div-score .el-dialog__body {
		padding: 0;
	}
	
	.edit-input {
		padding-right: 100px;
		width: 60%;
	}
	
	.cancel-btn {
		position: absolute;
		right: 15px;
		top: 10px;
	}
	
	.autoCore {
		float: left;
	}
	
	.autoCore1 {
		float: right;
		/*	margin-left: 20PX;
*/
	}
</style>