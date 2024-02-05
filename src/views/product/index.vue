<template>
  <div class="app-container">
    <el-form :inline="true" :model="queryForm">
      <el-form-item label="品牌名">
        <el-input v-model="queryForm.brandName" placeholder="输入品牌名" clearable/>
      </el-form-item>
      <el-form-item label="分类">
        <el-select
          v-model="queryForm.stCategoryId"
          placeholder="选择分类"
          clearable
          @change="stCategoryChange"
        >
          <el-option v-for="(stCategory) in categoryList" :label="stCategory.categoryTitle"
                     :value="stCategory.categoryId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="二级分类">
        <el-select
          v-model="queryForm.ndCategoryId"
          placeholder="选择分类"
          clearable
          @change="$forceUpdate();"
        >
          <el-option v-for="(ndCategory) in ndCategoryList" :label="ndCategory.categoryTitle"
                     :value="ndCategory.categoryId"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="query">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" :cell-style="{padding: '0'}" border
              fit highlight-current-row
    >
      <el-table-column type="selection" width="40"/>
      <el-table-column align="center" label="商品ID" width="180">
        <template slot-scope="scope">
          {{ scope.row.productId }}
        </template>
      </el-table-column>
      <el-table-column label="商品标题" width="450">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="厂商" width="250">
        <template slot-scope="scope">
          {{ scope.row.brandShowName }}
        </template>
      </el-table-column>
      <el-table-column label="预览图" width="80">
        <template slot-scope="scope">
          <el-image style="width: 50px; height: 50px" :src="scope.row.squareImage"
                    :preview-src-list="[scope.row.squareImage]" fit="cover"
          >
          </el-image>
        </template>
      </el-table-column>

      <el-table-column label="价格" width="100">
        <template slot-scope="scope">
          ￥{{ scope.row.price.salePrice }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="150">
        <template #default>
          <el-button type="primary" size="small" @click="checkDetail()">详细</el-button>
          <el-button type="danger" size="small" @click="delProduct()">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="demo-pagination-block">
      <el-pagination
        v-model:current-page="number"
        v-model:page-size="size"
        :page-sizes="[5, 10, 15, 20]"
        :small="small"
        :disabled="disabled"
        :background="background"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalElements"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
  </div>
</template>

<script>
import { getProductPage } from '@/api/product'
import { getCategory } from '@/api/category'
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
      list: null,
      totalElements: 0,
      number: 1,
      size: 10,
      listLoading: true,
      queryForm: {},
      categoryList: [],
      ndCategoryList: []
    }
  },
  created() {
    this.fetchData()
    getCategory({ stCateId: 0, ndCateId: 0 }).then(resp => {
      const { data } = resp
      this.categoryList = data
    })
  },
  methods: {
    stCategoryChange(value) {
      this.ndCategoryList = []
      this.queryForm.ndCategoryId = ''
      if (value === '') return
      getCategory({ stCateId: value, ndCateId: 0 }).then(resp => {
        const { data } = resp
        this.ndCategoryList = data
      })
    },
    query() {
      this.listLoading = true
      getProductPage({
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
      if (this.queryForm.brandName || this.queryForm.stCategoryId || this.queryForm.ndCategoryId) {
        this.query()
      } else {
        this.fetchData()
      }
    },
    handleCurrentChange(number) {
      this.number = number
      if (this.queryForm.brandName || this.queryForm.stCategoryId || this.queryForm.ndCategoryId) {
        this.query()
      } else {
        this.fetchData()
      }
    },
    fetchData() {
      this.listLoading = true
      getProductPage({ page: this.number, pageSize: this.size }).then(resp => {
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
