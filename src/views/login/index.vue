<template>
  <div class="login-container">
    <img src="../../../static/image.png" style="position:fixed;width:100%;height:100%;">
    <el-form class="login-form" autoComplete="on" :model="loginForm"  ref="loginForm" label-position="left" style="background:url('../../../static/loginbg.png')">
      <img src="../../../static/logo.png"  class="logo">
      <div class="title-container">
        <p class="title">艾宝后台管理系统</p>
        <p class="biaoti">Account Management System</p>
      </div>
      <el-form-item prop="userName" class="topinput" >
        <span class="svg-container svg-container_login" style="width:15%;font-size:16px;color:#304156;padding-left:20px">
          用户名
        </span>
        <el-input name="userAccount" style="width:70%;color:#9aa5b4 !important;" @click.native.prevent="yanzheng1" type="text" v-model="loginForm.userName" autoComplete="on" placeholder="请输入你的用户名" />
      </el-form-item>

      <el-form-item prop="userPassword" class="bottominput">
        <span class="svg-container" style="width:15%;font-size:16px;color:#304156;padding-left:20px">
          密码
        </span>
        <el-input name="userPassword" style="width:70%;color:#9aa5b4;" :type="pwdType" @keyup.enter.native="handleLogin" v-model="loginForm.userPassword" autoComplete="on"
          placeholder="请输入你的密码" @click.native.prevent="yanzheng2" />
        <span class="show-pwd" @click="showPwd">
          <svg-icon icon-class="eye" />
        </span>
      </el-form-item>
        <span class="error" v-show="isError">{{error}}</span>
      <el-button v-if="loginForm.userPassword==''|| loginForm.userAccount==''" type="primary" class="login" :loading="loading" @click.native.prevent="handleLogin" disabled="true">
        <span style="font-size:16px;opacity:0.4">登录</span>
      </el-button>
      <el-button v-else type="primary" class="login" :loading="loading" @click.native.prevent="handleLogin" >
        <span style="font-size:16px;">登录</span>
      </el-button>
    </el-form>
  </div>
</template>

<script>
import { isvaliduserAccount } from "@/utils/validate";
import { getCookie } from "@/utils";
export default {
  name: "login",
  data() {
    // const validateuserAccount = (rule, value, callback) => {

    //   if (!isvaliduserAccount(value)) {
    //     callback(new Error('Please enter the correct user name'))

    //   } else {
    //     callback()
    //   }
    // }
    // const validateuserPassword = (rule, value, callback) => {
    //   if (value.length < 6) {
    //     callback(new Error('The userPassword can not be less than 6 digits'))
    //   } else {
    //     callback()
    //   }
    // }

    return {
      loginForm: {
        userName: "",
        userPassword: ""
      },
      // loginRules: {
      //   userAccount: [{ required: true, trigger: 'blur', validator: validateuserAccount }],
      //   userPassword: [{ required: true, trigger: 'blur', validator: validateuserPassword }]
      // },
      pwdType: "userPassword",
      loading: false,
      showDialog: false,
      disabled: false,
      fill: true,
      isError: false,
      error: ""
    };
  },
  methods: {
    yanzheng1() {
      this.isError = false;
    },
    yanzheng2() {
      this.isError = false;
    },
    showPwd() {
      if (this.pwdType === "userPassword") {
        this.pwdType = "";
      } else {
        this.pwdType = "userPassword";
      }
    },
    handleLogin() {
      const that = this;
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("LoginByUserAccount", this.loginForm)
            .then(() => {
              this.loading = false;
             var cookie_val = getCookie("token");
              if (cookie_val == "undefined") {
                this.isError = true;
                this.error = "用户名或密码不正确";
              } else {
            // sessionStorage.setItem('userInfo',JSON.stringify(response.data.userObj))
               sessionStorage.setItem("userName", this.loginForm.userName);
                that.$router.push({ path: "/" });
            //   console.log("11111111userInfo"+JSON.parse(sessionStorage.getItem('userInfo')));
              }
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    }
  },
  created() {
    // window.addEventListener('hashchange', this.afterQRScan)
  },
  destroyed() {
    // window.removeEventListener('hashchange', this.afterQRScan)
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
$bg: #2d3a4b;
$bg2: #ffffff;
$light_gray: #eee;

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
    background: #ffffff;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;

      height: 47px;
      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px $bg2 inset !important;
        -webkit-text-fill-color: #9aa5b4 !important;
      }
    }
    input::-ms-input-placeholder {
      text-align: center;
      font-family: "微软雅黑";
      color: #9aa5b4;
    }
    input::-webkit-input-placeholder {
      text-align: center;
      font-family: "微软雅黑";
      color: #9aa5b4;
    }
  }
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
    .el-form-item__error {
      z-index: 99 !important;
      left: 18%;
    }
  }
  .logo {
    position: absolute;
    top: -47%;
    left: -18%;
  }
}
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/mixin.scss";
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  @include relative;
  height: 100vh;
  background-color: $bg;
  .login-form {
    position: absolute;
    left: 0;
    right: 0;
    width: 498px;
    height: 383px;
    padding: 50px 35px 40px 35px;
    margin: 270px auto 100px auto;
  }
  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }
  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
    &_login {
      font-size: 20px;
    }
  }
  .title-container {
    position: relative;
    .title {
      font-size: 26px;
      font-weight: 400;
      color: #ffffff;
      margin: 0px auto 8px auto;
      text-align: center;
      letter-spacing: 10px;
      font-family: "微软雅黑";
    }
    .biaoti {
      font-family: "微软雅黑";
      font-size: 12px;
      color: #ffffff;
      opacity: 0.4;
      text-align: center;
      margin-bottom: 30px;
    }
    .set-language {
      color: #fff;
      position: absolute;
      top: 5px;
      right: 0px;
    }
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
  .thirdparty-button {
    position: absolute;
    right: 35px;
    bottom: 28px;
  }
  .login {
    width: 100%;
    height: 54px;
    margin: 25px auto 40px auto;
    background: #32b1ff;
    border-radius: 4px;
  }
  .topinput {
    background: #ffffff;
    margin-bottom: 0;
    border-bottom: 1px solid #dcdfe6;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
    padding: 4px 0;
    color: #9aa5b4;
    font-family: "微软雅黑";
  }
  .bottominput {
    background: #ffffff;
    border-top-left-radius: 0px;
    border-top-right-radius: 0px;
    padding: 4px 0;
    color: #9aa5b4;
    font-family: "微软雅黑";
  }
  .error {
    font-size: 14px;
    color: red;
    position: absolute;
    margin-top: -10px;
    left: 35%;
  }
}
</style>
