<template>
  <el-menu class="navbar" mode="horizontal">
    <hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger>
    <breadcrumb class="breadcrumb-container"></breadcrumb>
    <div class="right-menu">
      <el-dropdown class="avatar-container right-menu-item" trigger="click">
        <div class="avatar-wrapper">
          <img class="user-avatar" :src="imgUrl" style="width:20px;height:20px;">
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <span @click="logout" style="display:block;">退出登录</span>
          </el-dropdown-item>
<!-- 
           <el-dropdown-item>
            <span @click="resetname" style="display:block;">修改姓名</span>
          </el-dropdown-item> -->

          <el-dropdown-item>
            <span @click="resetpassword" style="display:block;">修改密码</span>
           </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogSelectFormVisible"   width="50%" top="15vh">
        <el-form  ref="dataChangeForm" :rules="rules2" :model="tempChange" label-position="right" label-width="120px">
           <el-row :gutter="12">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="12">
            <el-form-item label="输入旧密码：" prop="password">
              <el-input v-model="tempChange.password"  ></el-input>
            </el-form-item>
          </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="12">
            <el-form-item label="输入新密码：" prop="newPassword">
              <el-input v-model="tempChange.newPassword"  ></el-input>
            </el-form-item>
          </el-col>
           </el-row>
          
           <el-row :gutter="16">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="12">
            <el-form-item label="确认新密码：" prop="newPassword1">
              <el-input v-model="tempChange.newPassword1"  ></el-input>
              <br/>
             </el-form-item>
            </el-col>
             <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
            <el-form-item   prop="title">
              <el-button type="primary" @click="changePassword('dataChangeForm')">确 定</el-button>
              <el-button @click="dialogSelectFormVisible = false">取 消</el-button>
           </el-form-item>
          </el-col>
          </el-row>
          </el-form>
   </el-dialog>

       <el-dialog :title="textMap2[dialogStatus2]" :visible.sync="dialogSelectFormVisible2" :close-on-click-modal="false" width="35%" top="15vh">
        <el-form  ref="dataChangeForm" label-position="right" label-width="140px">
           <el-row :gutter="10">
          <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
            <el-form-item label="请输入新用户名：" prop="title">
              <el-input v-model="userName"  ></el-input>
            </el-form-item>
          </el-col>
           </el-row>
           <el-button style="margin-left:100px" type="primary" @click="changePassword">确 定</el-button>
          </el-form>
   </el-dialog>
      
    </div>
   </el-menu>
  
</template>

<script>
import { mapGetters } from "vuex";
import { removeToken } from "@/utils/auth";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
import { updatepassword } from "@/api/members";
export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters(["sidebar", "name", "avatar"])
  },

  data() {
    return {
      userName: "",
      dialogStatus: "",
      dialogStatus2: "",
      dialogSelectFormVisible: false,
      dialogSelectFormVisible2: false,
      textMap: {
        updatePassword: "重置密码"
      },
      textMap2: {
        updateName: "修改姓名"
      },
      tempChange: {
        password: "",
        newPassword: "",
        newPassword1: "",
        token: this.getCookie("token")
      },
      resettemp() {
        this.tempChange = {
          password: "",
          newPassword: "",
          newPassword1: ""
        };
      },
      rules2: {
        password: [
          { required: true, message: "请输入旧密码：", trigger: "blur" }
        ],
        newPassword: [
          { required: true, message: "请输入新密码：", trigger: "blur" }
        ],
        newPassword1: [
          { required: true, message: "请重新输入新密码：", trigger: "blur" }
        ]
      },
      imgUrl: "../../../static/logout.png"
    };
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch("toggleSideBar");
    },
    logout() {
      this.$store.dispatch("LogOut").then(() => {
        // 为了重新实例化vue-router对象 避免bug
        location.reload();
      });
    },
    resetname() {
      this.dialogSelectStatus2 = "updateName";
      this.dialogSelectFormVisible2 = true;
    },
    resetpassword() {
      this.resettemp();
      this.dialogSelectStatus = "updatePassword";
      this.dialogSelectFormVisible = true;
      //this.$nextTick(() => {
      //  this.$refs["dataForm"].clearValidate();
      //});
    },
    changePassword(temp) {
      this.$refs[temp].validate(valid => {
        if (valid) {
          if (this.tempChange.newPassword == "") {
            this.$message({
              message: "新密码不能为空!"
            });
            this.dialogSelectFormVisible = true;
          } else if (
            this.tempChange.newPassword != this.tempChange.newPassword1
          ) {
            this.$message({
              message: "输入新密码不一致!"
            });
            this.dialogSelectFormVisible = true;
          } else {
            updatepassword(this.tempChange).then(response => {
              //   alert(response.data.code)
              if (response.data.code == 0) {
                this.$message({
                  type: "success",
                  message: "重置成功!"
                });
                removeToken();
                window.setTimeout("window.location='/#/login'", 3000);
              } else {
                this.$message({
                  type: "旧密码不正确",
                  message: "旧密码不正确!"
                });
              }
              this.dialogSelectFormVisible = false;
            });
          }
        } else {
          console.log("请检查参数!!");
          return false;
        }
      });
    },
    getCookie(cookie_name) {
      var allcookies = document.cookie;
      var cookie_pos = allcookies.indexOf(cookie_name); //索引的长度

      // 如果找到了索引，就代表cookie存在，
      // 反之，就说明不存在。
      if (cookie_pos != -1) {
        // 把cookie_pos放在值的开始，只要给值加1即可。
        cookie_pos += cookie_name.length + 1; //这里容易出问题，所以请大家参考的时候自己好好研究一下
        var cookie_end = allcookies.indexOf(";", cookie_pos);

        if (cookie_end == -1) {
          cookie_end = allcookies.length;
        }

        var value = unescape(allcookies.substring(cookie_pos, cookie_end)); //这里就可以得到你想要的cookie的值了。。。
      }
      return value;
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.navbar {
  height: 50px;
  line-height: 50px;
  border-radius: 0px !important;
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }
  .breadcrumb-container {
    float: left;
  }
  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }
  .right-menu {
    float: right;
    height: 100%;
    &:focus {
      outline: none;
    }
    .right-menu-item {
      display: inline-block;
      margin: 0 8px;
    }
    .screenfull {
      height: 20px;
    }
    .international {
      vertical-align: top;
    }
    .theme-switch {
      vertical-align: 15px;
    }
    .avatar-container {
      height: 50px;
      margin-right: 30px;
      .avatar-wrapper {
        cursor: pointer;
        margin-top: 5px;
        position: relative;
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }
        .el-icon-caret-bottom {
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
