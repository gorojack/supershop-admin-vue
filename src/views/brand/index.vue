<template>
  <div class="app-container">
    <el-dialog
      :visible.sync="detailFormVisible"
      :title="'详细 '+detailForm.brandId"
      width="600"
      :append-to-body="true"
      class="roll-dialog"
    >
      <el-form :model="detailForm" label-width="80px">
        <el-form-item label="序列号">
          <el-input v-model="detailForm.brandSn" autocomplete="off" disabled/>
        </el-form-item>
        <el-form-item label="品牌名">
          <el-input v-model="detailForm.name" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="品牌口号">
          <el-input v-model="detailForm.slogan" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="品牌故事">
          <el-input
            v-model="detailForm.brandStory"
            type="textarea"
            :rows="6"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="品牌logo">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="uploadSuccess"
            :headers="{'Authorization':token}"
          >
            <img v-if="detailForm.logo" :src="detailForm.logo" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="detailForm.status">
            <el-option label="正常" value="0"/>
            <el-option label="禁用" value="1"/>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailFormVisible = false">取消</el-button>
          <el-button type="primary" @click="submitDetail">修改</el-button>
        </div>
      </template>
    </el-dialog>
    <el-form :inline="true" :model="queryForm">
      <el-form-item label="品牌名">
        <el-input v-model="queryForm.name" placeholder="输入品牌名" clearable/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="query">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      :cell-style="{padding: '0'}"
      border
      fit
      highlight-current-row
    >
      <el-table-column type="selection" width="40"/>
      <el-table-column align="center" label="品牌ID" width="120">
        <template slot-scope="scope">
          {{ scope.row.brandId }}
        </template>
      </el-table-column>
      <el-table-column label="序列号" width="120">
        <template slot-scope="scope">
          {{ scope.row.brandSn }}
        </template>
      </el-table-column>
      <el-table-column label="品牌名" width="180">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="logo" width="80">
        <template slot-scope="scope">
          <el-image
            style="width: 50px; height: 50px"
            :src="scope.row.logo"
            :preview-src-list="[scope.row.logo]"
          />
        </template>
      </el-table-column>
      <el-table-column label="口号" width="180" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.slogan }}
        </template>
      </el-table-column>
      <el-table-column label="品牌故事" width="480" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.brandStory }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收藏数" width="100">
        <template slot-scope="scope">
          {{ scope.row.favouriteCount }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="150">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="checkDetail(scope.row)">详细</el-button>
          <el-button type="danger" size="small" @click="delBrand(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="demo-pagination-block">
      <el-pagination
        :current-page="number"
        :page-size="size"
        :page-sizes="[5, 10, 15, 20]"
        :small="false"
        :disabled="false"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalElements"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { getBrandPage, getBrandInfo, updateBrand } from '@/api/brand'
import querystring from 'querystring'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      uploadUrl: process.env.VUE_APP_IMAGE_UPLOAD_URL,
      token: process.env.VUE_APP_IMAGE_UPLOAD_TOKEN,
      list: null,
      totalElements: 0,
      number: 1,
      size: 10,
      listLoading: true,
      queryForm: {},
      categoryList: [],
      ndCategoryList: [],
      detailFormVisible: false,
      detailForm: {}
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    uploadSuccess(resp) {
      const { data, status } = resp
      Message({
        message: resp.message,
        type: status ? 'success' : 'error',
        duration: 3 * 1000
      })
      if (status) {
        this.detailForm.logo = data.links.url
      }
    },
    submitDetail() {
      this.detailForm.props = this.detailForm.props.filter(item =>
        !item.isDel &&
        item.name !== '' &&
        item.name !== undefined &&
        item.value !== '' &&
        item.value !== undefined)
      updateBrand(this.detailForm).then(resp => {
        Message({
          message: resp.msg,
          type: 'success',
          duration: 3 * 1000
        })
        this.detailFormVisible = false
      })
    },
    addAttr() {
      this.detailForm.props.push({})
    },
    deleteAttr(prop) {
      const index = this.detailForm.props.indexOf(prop)
      this.detailForm.props[index]['isDel'] = !prop['isDel']
      this.$forceUpdate()
    },
    checkDetail(row) {
      getBrandInfo({ brandId: row.brandId }).then(resp => {
        const { data } = resp
        this.detailForm = data
        this.detailFormVisible = true
      })
    },
    query() {
      this.listLoading = true
      getBrandPage({
        page: this.number,
        pageSize: this.size,
        query: querystring.stringify(this.queryForm)
      }).then(resp => {
        const { data } = resp
        this.list = data.content
        this.totalElements = data.totalElements
        this.number = data.number + 1
        this.size = data.size
        this.listLoading = false
      })
    },
    handleSizeChange(size) {
      this.size = size
      if (this.queryForm.name) {
        this.query()
      } else {
        this.fetchData()
      }
    },
    handleCurrentChange(number) {
      this.number = number
      if (this.queryForm.name) {
        this.query()
      } else {
        this.fetchData()
      }
    },
    fetchData() {
      this.listLoading = true
      getBrandPage({ page: this.number, pageSize: this.size }).then(resp => {
        const { data } = resp
        this.list = data.content
        this.totalElements = data.totalElements
        this.number = data.number + 1
        this.size = data.size
        this.listLoading = false
      })
    }
  }
}
</script>

<style>
.roll-dialog .el-dialog__body {
  padding: 3px 30px;
  overflow-y: auto;
  height: calc(100vh - 40vh);
}

.el-tooltip__popper {
  font-size: 14px;
  max-width: 40%
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
