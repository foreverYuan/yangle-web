<template>
  <div class="app-container calendar-list-container" v-loading.body="pageLoading">
    <!-- 检索条件 -->
    <div class="filter-container">
    <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="操作人" v-model="listQuery.userName"></el-input>

      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="操作内容" v-model="listQuery.operationContent"></el-input>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleFilter" type="primary" icon="el-icon-search" v-waves>搜索</el-button>
       <el-button class="filter-item" style="margin-left: 10px;" @click="refrshFilter" type="primary" icon="el-icon-refresh" v-waves>刷新</el-button>
     </div>
    <!-- 一览部分 -->
    <el-table  :data="list" v-loading.body="listLoading" border fit highlight-current-row style="width: 100%" @row-dblclick="handleDetail" @sort-change="sortChange">
      <el-table-column align="center" label="操作人"    >
        <template slot-scope="scope">
          <span>{{scope.row.userName}}</span>
        </template>
      </el-table-column>
        <el-table-column align="center" width="220" label="操作时间" prop="operation_time"  sortable="custom">
        <template slot-scope="scope">
          <span>{{scope.row.operationTime | getdate }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作内容">
        <template slot-scope="scope">
          <span>{{scope.row.operationContent }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" width="240" label="IP地址">
        <template slot-scope="scope">
          <span>{{scope.row.userIp}}</span>
        </template>
      </el-table-column>
      </el-table>
    <!-- 分页 -->
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <!-- 弹出窗口 -->
<el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="80%" :close-on-click-modal="false" top="15vh">
      <el-form ref="dataForm" :model="temp">
        <el-row :gutter="10">
            <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
            <el-form-item label="操作人：">{{temp.userName}}</el-form-item>
          </el-col>
       </el-row>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
            <el-form-item label="操作时间：">{{temp.operationTime | getdate}}</el-form-item>
          </el-col>
         </el-row>
         <el-row :gutter="10">
          <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
           <el-form-item label="操作内容：">{{temp.operationContent}}</el-form-item>
          </el-col>
        </el-row>
      <el-row :gutter="10">
          <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
            <el-form-item label="IP地址">{{temp.userIp}}</el-form-item>
          </el-col>
      </el-row>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
        <br/>&nbsp;
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from "@/directive/waves";
import { logList } from "@/api/user";
import { getCookie } from "@/utils";

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
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        userName: undefined,
        operationContent: undefined,
        sidx: undefined,
        order: undefined,
        token: getCookie("token")
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        detail: "详情"
      },
      temp: {
        userName: "",
        operationTime: "",
        operationContent: "",
        userIp: ""
      },

      downloadLoading: false,
      screenWidth: document.body.clientWidth
    };
  },

  created() {
    this.getList();
  },
  filters: {
    getdate(date) {
      if (date != null) {
        return date.substr(0, 10);
      }
    }
  },
  methods: {
    getList() {
      this.listLoading = true;
      logList(this.listQuery).then(response => {
        this.list = response.data.page.list;
        this.total = response.data.page.totalCount;
        this.listLoading = false;
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    refrshFilter() {
      this.listQuery.userName = "";
      this.listQuery.operationContent = "";
      this.getList();
    },
    sortChange(val) {
      if (val.prop != null) {
        this.listQuery.sidx = val.prop;
        if (val.order == "descending") {
          this.listQuery.order = "desc";
          val.order == "ascending";
        } else {
          this.listQuery.order = "asc";
          val.order = "descending";
        }
        this.getList();
      } else {
        this.listQuery.sidx = "";
      }
    },
    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.getList();
    },
    handleDetail(row) {
      this.resetTemp();
      this.dialogStatus = "detail";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.temp = row;
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleUpload() {},
    handleDownload() {
      this.downloadLoading = true;
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
