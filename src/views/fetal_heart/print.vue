<template>
	<!-- 打印 -->
	<div class="print">
		<p id="print-title">XXX院胎心监护报告单</p>
		<button @click="print">打印</button>
		<div id="print-all-info">
			<div id="print-info">
				<!-- 基本信息 start -->
				<div id="base-info">
					<div class="line">
						<p class="left">姓名: {{fhrData.userName}}</p>
						<p class="right">型号: {{fhrData.userAccount}}</p>
					</div>

					<div class="line">
						<p class="left">年龄: {{fhrData.age}}</p>
						<p class="right">监护开始时间: {{fhrData.startTime}}</p>
					</div>

					<div class="line">
						<p class="left">预产期: {{fhrData.pregnancyDate}}</p>
						<p class="right">时长: {{fhrData.monitoringTime}}</p>
					</div>

					<!--<div class="line">
						<p class="left">产次:</p>
						<p class="right"></p>
					</div>

					<div class="line">
						<p class="left">走纸速度: 3cm/min</p>
						<p class="right"></p>
					</div>-->

					<p id="remarks">备注: {{fhrData.readContent}}</p>
				</div>
				<!-- 基本信息 end -->

				<!-- 专业信息 start -->
				<div id="major-info">
					<!-- 实验类型 -->
					<div id="test-type">
						<p>实验类型:</p>
						<input type="checkbox" name="NST" value="NST" />NST
						<input type="checkbox" name="NST" value="NST" />NS-CST
						<input type="checkbox" name="NST" value="NST" />OCT
						<input type="checkbox" name="NST" value="NST" />CST
					</div>

					<div id="score-data">
						<P>Fischer评分</P>
						<table border="1" cellspacing="0" cellpadding="3" :width="screenWidth * 0.4">
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
									{{bfhr1}}
								</td>
								<td>
									{{var1}}
								</td>
								<td>
									{{cyc1}}
								</td>
								<td>
									{{acct1}}
								</td>
								<td>
									{{dect1}}
								</td>
							</tr>
							<tr>
								<td>分值</td>
								<td>
									{{sbfhr1}}
								</td>
								<td>
									{{svar1}}
								</td>
								<td>
									{{scpm1}}
								</td>
								<td>
									{{sacct1}}
								</td>
								<td>
									{{sdect1}}
								</td>
							</tr>
							<tr>
								<td>总分</td>
								<td colspan="5">
									{{fischerScore1}}
								</td>
							</tr>
						</table>
					</div>

					<div id="result">
						<p>结论:</p>
						<input type="checkbox" name="NST" value="NST" />有反应
						<input type="checkbox" name="NST" value="NST" />无反应
						<input type="checkbox" name="NST" value="NST" />正弦曲线
						<input type="checkbox" name="NST" value="NST" />不满意
						<p id="doctor">医生:<input :value="userInfo.userName" id="input-doctor" style="zoom: normal;margin-left: 0.5rem;padding-left: 0.5rem;" /></p>
					</div>

				</div>
				<!-- 专业信息 end -->
			</div>

			<!-- 打印的胎心图 start -->
			<!--<div id="canvas-container" style="overflow:auto;margin:0 3rem" ref="canvasContainer">-->
			<div id="div-canvas">
				<div class="div-single-canvas">
					<canvas id="myCanvas1" ref="myCanvas1" :width="fhrCanvasWidth" :height="fhrCanvasHeight"></canvas>
					<canvas id="myCanvas2" ref="myCanvas2" :width="tcCanvasWidth" :height="tcCanvasHeight"></canvas>
				</div>

				<div class="div-single-canvas" v-if="fhrTimeSecond > 600">
					<div id="canvas-info">
						<p>姓名: {{fhrData.userName}}</p>
						<p>账号: {{}}</p>
						<p>走纸速度: 3.0cm/min</p>
						<p>监护开始时间: {{fhrData.startTime}}</p>
					</div>
					<canvas id="myCanvas3" ref="myCanvas3" :width="fhrCanvasWidth" :height="fhrCanvasHeight"></canvas>
					<canvas id="myCanvas4" ref="myCanvas4" :width="tcCanvasWidth" :height="tcCanvasHeight"></canvas>

				</div>

				<div class="div-single-canvas" v-if="fhrTimeSecond > 1200">
					<hr :width="fhrCanvasWidth - 20" />
					<canvas id="myCanvas5" ref="myCanvas5" :width="fhrCanvasWidth" :height="fhrCanvasHeight"></canvas>
					<canvas id="myCanvas6" ref="myCanvas6" :width="tcCanvasWidth" :height="tcCanvasHeight"></canvas>
				</div>

			</div>

			<!--</div>-->
			<!-- 打印的胎心图 end -->
		</div>
	</div>
</template>

<script>
	import { moveDetail } from "@/api/fetalHeart";
	export default {
		name: 'print',
		data() {
			return {
				screenWidth: document.body.clientWidth,
				screenHeight: document.body.clientHeight,
				fhrCanvasWidth: document.body.clientWidth * 0.8, //胎心率画布宽度
				fhrCanvasHeight: document.body.clientHeight * 0.5 * 0.6, //胎心率画布高度
				tcCanvasWidth: document.body.clientWidth * 0.8, //宫缩画布宽度
				tcCanvasHeight: document.body.clientHeight * 0.5 * 0.4, //宫缩画布高度
				moveId: this.$route.query.moveId, //从上个页面传过来的moveId
				fhrRecordData: [], //录制的胎心数据
				fhrData: {},
				monitoringTime: '', //监测时长
				fhrTimeSecond: 0, //监测总秒数时长
				query: {
					moveId: this.$route.query.moveId
				},
				userInfo: JSON.parse(localStorage.getItem("userInfo")), //用戶信息
				bfhr1: 0,
				var1: 0,
				cyc1: 0,
				acct1: 0,
				dect1: 0,
				sbfhr1: 0,
				svar1: 0,
				scpm1: 0,
				sacct1: 0,
				sdect1: 0,
				fischerScore1: 0,
			}
		},

		created() {
			this.requestFhrData();
			console.log("userInfo", this.userInfo);
		},

		mounted() {

		},

		methods: {
			aaa() {
				if(this.bfhr1 < 100 || this.bfhr1 > 180) {
					this.sbfhr1 = 0
				} else if(this.bfhr1 > 110 && this.bfhr1 < 160) {
					this.sbfhr1 = 2
				} else if((this.bfhr1 > 100 && this.bfhr1 < 109) || (this.bfhr1 > 161 && this.bfhr1 < 180)) {
					this.sbfhr1 = 1
				}
			},
			//	 var1: "",
			bbb() {
				if(this.var1 < 5) {
					this.svar1 = 0
				} else if((this.var1 > 5 && this.var1 < 9) || this.var1 > 30) {
					this.svar1 = 1
				} else if(this.var1 > 10 && this.var1 < 30) {
					this.svar1 = 2
				}
			},
			//	 cyc1 : "",
			ccc() {
				if(this.cyc1 < 2) {
					this.scpm1 = 0
				} else if(this.cyc1 > 2 && this.cyc1 < 5) {
					this.scpm1 = 1
				} else if(this.cyc1 > 5) {
					this.scpm1 = 2
				}
			},
			//	 acct1: "",
			ddd() {
				if(this.acct1 == 0) {
					this.sacct1 = 0
				} else if(this.acct1 > 1 && this.acct1 < 2) {
					this.sacct1 = 1
				} else if(this.acct1 > 2) {
					this.sacct1 = 2
				}
			},
			//	 dect1: "",
			eee() {
				if(this.dect1 == 2) {
					this.sdect1 = 2
				} else if(this.dect1 == 1) {
					this.sdect1 = 1
				} else {
					this.dect1 = 0
					this.sdect1 = 0
				}
			},
			//总分
			sum() {
				this.fischerScore1 = this.sbfhr1 + this.svar1 + this.scpm1 + this.sacct1 + this.sdect1;
			},

			/**
			 * 打印
			 */
			print() {
				window.print();
			},

			/**
			 * 请求胎心数据
			 */
			requestFhrData() {
				var _this = this;
				moveDetail(this.query).then(response => {
					if(response.data.resultCode == 200) {
						console.log("data", response.data.data);
						_this.fhrData = response.data.data;
						var results = response.data.data.fischerResult.split(',');
						_this.bfhr1 = parseInt(results[0]);
						_this.var1 = parseInt(results[1]);
						_this.cyc1 = parseInt(results[2]);
						_this.acct1 = parseInt(results[3]);
						_this.dect1 = parseInt(results[4]);
						_this.aaa();
						_this.bbb();
						_this.ccc();
						_this.ddd();
						_this.eee();
						_this.sum();
						var fhrRecordData = JSON.parse(response.data.data.heartRecord);
						var array1 = [],
							array2 = [],
							array3 = [];
						var monitoringTime = response.data.data.monitoringTime;
						var fhrTimeSecond = parseInt(monitoringTime.split(':')[0] * 60) + parseInt(monitoringTime.split(':')[1]);
						_this.fhrTimeSecond = fhrTimeSecond;
						//平均每分钟几条数据
						var perMinDataNum = Math.ceil(fhrRecordData.length / fhrTimeSecond) * 60;
						var durationMin = parseInt(monitoringTime.split(':')[0]);
						var durationSecond = parseInt(monitoringTime.split(':')[1]);
						for(var i = 0; i < fhrRecordData.length; i++) {
							if(i < 10 * perMinDataNum) {
								array1.push(fhrRecordData[i]);
							} else if(i >= 10 * perMinDataNum && i < 20 * perMinDataNum) {
								array2.push(fhrRecordData[i]);
							} else if(i >= 20 * perMinDataNum && i < fhrRecordData.length) {
								array3.push(fhrRecordData[i]);
							}
						}
						console.log("array1", array1);
						console.log("array2", array2);
						console.log("array3", array3);
						if(array2.length == 0) {
							_this.createChartOne(array1, monitoringTime, 1, fhrTimeSecond);
						} else if(array2.length > 0 && array3.length == 0) {
							_this.createChartOne(array1, monitoringTime, 1, 10 * 60);
							_this.createChartOne(array2, monitoringTime, 2, fhrTimeSecond - 10 * 60);
						} else if(array3.length > 0) {
							_this.createChartOne(array1, monitoringTime, 1, 10 * 60);
							_this.createChartOne(array2, monitoringTime, 2, 10 * 60);
							if(fhrTimeSecond > 1800) {
								_this.createChartOne(array3, monitoringTime, 3, 10 * 60);
							} else {
								_this.createChartOne(array3, monitoringTime, 3, fhrTimeSecond - 2 * 10 * 60);
							}

						}
					}

				});
			},

			createChartOne(fhrRecordData, monitoringTime, index, fhrTime) {
				this.$nextTick(function() {
					//							var canvasContainer = this.$refs.canvasContainer;
					//考虑数据太多时分开打印
					if(index == 1) {
						var canvas = this.$refs.myCanvas1;
						var canvas1 = this.$refs.myCanvas2;
					} else if(index == 2) {
						var canvas = this.$refs.myCanvas3;
						var canvas1 = this.$refs.myCanvas4;
					} else if(index == 3) {
						var canvas = this.$refs.myCanvas5;
						var canvas1 = this.$refs.myCanvas6;
					}
					//							canvasContainer.style.width = this.fhrCanvasWidth;
					//							canvasContainer.style.height = (this.fhrCanvasHeight + this.tcCanvasHeight);
					var fhrTimeSecond = parseInt(monitoringTime.split(':')[0] * 60) + parseInt(monitoringTime.split(':')[1]);
					//平均每分钟几条数据
					var perMinDataNum = Math.ceil(fhrRecordData.length / (fhrTimeSecond / 60));
					console.log("fhrTimeSecond", fhrTimeSecond);
					console.log("perMinDataNum", perMinDataNum);
					if(canvas.getContext) {
						var ctx = canvas.getContext("2d");
						var offsetx = 10;
						var offsety = 10;
						var width = canvas.width;
						var height = canvas.height;
						var picWidth = canvas.width - 2 * offsetx;
						var picHeight = canvas.height - 2 * offsety;
						var gap = 210 - 50;
						var showTime = 10; //一屏幕显示多长时间的胎心记录
						//横轴每格的间距
						var offsetx_diff = (width - 2 * offsetx) / showTime;
						//纵轴每格的间距
						var offsety_diff = (height - 2 * offsety) / 16;
						var timeSecond = showTime * 60; //总共的时间(以秒为单位)
						ctx.fillStyle = "rgba(255,255,255,1)";
						ctx.fillRect(offsetx, offsety, width, height);

						var xOffset = 2;

						var maxWidth = width - offsetx;
						ctx.fillStyle = "#FFEAF6";
						ctx.fillRect(offsetx, 5 * offsety_diff + offsety, picWidth, 5 * offsety_diff);
						//画竖线，分成30min的,每一格代表1min
						for(var i = 0; i <= showTime; i++) {
							ctx.strokeStyle = "rgba(255,0,0,.3)";
							ctx.lineWidth = 1;
							ctx.beginPath();
							ctx.moveTo(i * offsetx_diff + offsetx, offsety);
							ctx.lineTo(i * offsetx_diff + offsetx, height - offsety);
							ctx.font = "10px Arial";
							ctx.fillStyle = "#333333";
							ctx.fillText(i + (index - 1) * showTime + "'", i * offsetx_diff + offsetx - 3, height);
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
								for(var i = 1; i < 4; i++) {
									ctx.fillText(210 - 10 * j, i * (maxWidth / 4), j * offsety_diff + offsety);
								}
							}
						}

						//画胎心数据 胎心率
						ctx.beginPath();
						var tempY = 0; //之前的y值
						var detal = 0; //两个点的y轴差值
						var x = 0; //150,实时监护时曲线的最右边，右边的一大段都没有曲线绘制
						var ratio = 1;
						var fhr1_y_old = 0,
							toco_y_old = 50;
						//每个数据所占的长度
						var perLength = ((picWidth / timeSecond) * fhrTime) / fhrRecordData.length;
						for(var i = 0; i < fhrRecordData.length; i++) {
							ctx.strokeStyle = "rgb(0,0,128)";
							if(i != fhrRecordData.length - 1) {
								var rate = fhrRecordData[i][1];
								var rate1 = fhrRecordData[i + 1][1]
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
						}
						ctx.stroke();

					}

					if(canvas1.getContext) {
						var ctx = canvas1.getContext("2d");
						var offsetx = 10;
						var offsety = 10;
						var width = canvas1.width;
						var height = canvas1.height;
						var picWidth = canvas1.width - 2 * offsetx;
						var picHeight = canvas1.height - 2 * offsety;
						var gap = 100 - 0;
						var showTime = 10; //一屏幕显示多长时间的胎心记录
						//横轴每格的间距
						var offsetx_diff = (width - 2 * offsetx) / showTime;
						//纵轴每格的间距
						var offsety_diff = (height - 2 * offsety) / 10;
						var timeSecond = showTime * 60; //总共的时间(以秒为单位)
						ctx.fillStyle = "rgba(255,255,255,1)";
						ctx.fillRect(offsetx, offsety, width, height);

						var maxWidth = width - offsetx;

						//画竖线，分成30min的,每一格代表1min
						for(var i = 0; i <= showTime; i++) {
							ctx.strokeStyle = "rgba(255,0,0,.3)";
							ctx.lineWidth = 1;
							ctx.beginPath();
							ctx.moveTo(i * offsetx_diff + offsetx, offsety);
							ctx.lineTo(i * offsetx_diff + offsetx, height - offsety);
							ctx.font = "10px Arial";
							ctx.fillStyle = "#333333";
							ctx.fillText(i + (index - 1) * showTime + "'", i * offsetx_diff + offsetx - 3, height);
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
								for(var i = 1; i < 4; i++) {
									ctx.fillText(100 - 10 * j, i * (maxWidth / 4), j * offsety_diff + offsety);
								}
							}
						}
						ctx.beginPath();
						var tempY = 0; //之前的y值
						var detal = 0; //两个点的y轴差值
						var x = 0; //150,实时监护时曲线的最右边，右边的一大段都没有曲线绘制
						var ratio = 1;
						var fhr1_y_old = 0,
							toco_y_old = 50;
						//每个数据所占的长度
						var perLength = ((picWidth / timeSecond) * fhrTime) / fhrRecordData.length;
						for(var i = 0; i < fhrRecordData.length; i++) {
							ctx.strokeStyle = "rgb(0,0,128)";
							if(i != fhrRecordData.length - 1) {
								var rate = fhrRecordData[i][2];
								var rate1 = fhrRecordData[i + 1][2]
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
						}
						ctx.stroke();
					}
				})
			}
		}
	}
</script>

<style>
	@import url("../../styles/print.css");
</style>