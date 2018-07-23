<template>

 <div class="menu-wrapper">
 	<div>
    <div  class="image1">
      <img       :src="img_logo">
      <p style="color: #FFFFFF; margin-top: 5px;">后台管理系统</p>
    </div>
    <div style="text-align: center;">
    <img style="width: 55px;height: 55px;border-radius: 55px;" src="http://118.31.66.193:8080/yangle/resources/3f0cbda2-21ce-4fea-a4c3-5d3de8215ebc.jpg"/>
      <p  id="dateT" style="color: #FFFFFF; font-size: 10px;"> </p>
  </div>
    </div>
    
   <template v-for="item in routes" v-if="!item.hidden&&item.children">

      <router-link v-if="item.children.length===1 && !item.children[0].children" :to="item.path+'/'+item.children[0].path" :key="item.children[0].name">
        <el-menu-item :index="item.path+'/'+item.children[0].path" class='submenu-title-noDropdown'>
          <svg-icon v-if="item.children[0].meta&&item.children[0].meta.icon" :icon-class="item.children[0].meta.icon"></svg-icon>
          <span v-if="item.children[0].meta&&item.children[0].meta.title">{{item.children[0].meta.title}}</span>
        </el-menu-item>
      </router-link>

      <el-submenu v-else :index="item.name||item.path" :key="item.name">
        <template slot="title">
          <svg-icon v-if="item.meta&&item.meta.icon" :icon-class="item.meta.icon"></svg-icon>
          <span v-if="item.meta&&item.meta.title">{{item.meta.title}}</span>
        </template>

        <template v-for="child in item.children" v-if="!child.hidden">
          <sidebar-item class="nest-menu" v-if="child.children&&child.children.length>0" :routes="[child]" :key="child.path"></sidebar-item>

          <router-link v-else :to="item.path+'/'+child.path" :key="child.name">
            <el-menu-item :index="item.path+'/'+child.path">
              <svg-icon v-if="child.meta&&child.meta.icon" :icon-class="child.meta.icon"></svg-icon>
              <span v-if="child.meta&&child.meta.title">{{child.meta.title}}</span>
            </el-menu-item>
          </router-link>
        </template>
      </el-submenu>

    </template>
  </div>
</template>

<script>

import img_logo from '@/assets/logo.png'
 
export default {
  name: 'SidebarItem',
  props: {
    routes: {
      type: Array
    }
  },
  data() {
    return {
      img_logo
    }
  },
  mounted(){
  	this.getDate()
  },
  methods: {
     getDate(){
         var now = new Date()
     	  var hour = now.getHours()
        if(hour < 6){document.getElementById('dateT').innerHTML="凌晨好,医生~" }
       else if (hour <= 9){document.getElementById('dateT').innerHTML="早上好,医生~" } 
       else if (hour <= 12){document.getElementById('dateT').innerHTML="上午好,医生~" } 
       else if (hour <= 14){
       	document.getElementById('dateT').innerHTML="中午好,医生~"
       } else if (hour <= 17){
          	document.getElementById("dateT").innerHTML="下午好,医生~"
         
        }
       else if (hour <= 19){document.getElementById('dateT').innerHTML="傍晚好,医生~" } 
       else if (hour <= 22){document.getElementById('dateT').innerHTML="晚上好,医生~" } 
       else {document.getElementById('dateT').innerHTML="夜里好,医生~" } 
     }
  }
}
</script>

<style>
	.image1{
		text-align: center;
		margin-top: 12px;
	}
</style>