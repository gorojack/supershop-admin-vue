<template>
  <div class="app-container">
    <el-dialog
      :visible.sync="detailFormVisible"
      :title="'详细 '+detailForm.productId"
      width="600"
      :append-to-body="true"
      class="roll-dialog"
    >
      <el-form :model="detailForm" label-width="80px">
        <el-form-item label="商品名">
          <el-input v-model="detailForm.title" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="品牌">
          <el-row>
            <el-col :span="6">
              <el-input v-model="detailForm.brandId" placeholder="品牌ID"/>
            </el-col>
            <el-col :span="2" style="margin-left: 15px">品牌名</el-col>
            <el-col :span="6">
              <el-tooltip effect="dark" :content="detailForm.brandShowName" placement="left">
                <el-input v-model="detailForm.brandShowName" placeholder="品牌名" disabled/>
              </el-tooltip>
            </el-col>
            <el-col :span="2" style="margin-left: 15px">序列号</el-col>
            <el-col :span="6">
              <el-tooltip effect="dark" :content="detailForm.brandStoreSn" placement="left">
                <el-input v-model="detailForm.brandStoreSn" placeholder="品牌名" disabled/>
              </el-tooltip>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="SKU">
          <el-select v-model="detailForm.skuId">
            <el-tooltip v-for="(sku) in detailForm.sku" :key="sku.skuId" effect="dark" placement="right">
              <div slot="content">
                Sku: {{ sku.sku }} <br>
                SkuID: {{ sku.skuId }} <br>
                尺寸ID: {{ sku.sizeDetailId }} <br>
                标价: {{ sku.saleMarketPrice }} <br>
                折扣: {{ sku.saleDiscount }}<br>
                售价: {{ sku.salePrice }}<br>
              </div>
              <el-option :label="sku.skuId" :value="sku.skuId"/>
            </el-tooltip>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="detailForm.status">
            <el-option label="正常" value="0"/>
            <el-option label="禁用" value="1"/>
          </el-select>
        </el-form-item>
        <el-form-item label="属性">
          <el-row v-for="(prop,index) in detailForm.props" :key="index">
            <el-col :span="6">
              <el-input v-model="detailForm.props[index].name" :disabled="prop.isDel"/>
            </el-col>
            <el-col style="margin-left: 5px" :span="6">
              <el-input v-model="detailForm.props[index].value" :disabled="prop.isDel"/>
            </el-col>
            <el-col style="margin-left: 10px" :span="1">
              <el-tooltip effect="dark" :content="prop.isDel?'撤销':'删除'" placement="right">
                <el-button
                  size="mini"
                  :icon="prop.isDel?'el-icon-refresh':'el-icon-remove'"
                  circle
                  @click="deleteAttr(detailForm.props[index])"
                />
              </el-tooltip>
            </el-col>
          </el-row>
          <el-tooltip effect="dark" content="添加属性" placement="right">
            <el-button size="mini" type="primary" icon="el-icon-plus" @click="addAttr"/>
          </el-tooltip>
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
        <el-input v-model="queryForm.brandName" placeholder="输入品牌名" clearable/>
      </el-form-item>
      <el-form-item label="分类">
        <el-select
          v-model="queryForm.stCategoryId"
          placeholder="选择分类"
          clearable
          @change="stCategoryChange"
        >
          <el-option
            v-for="(stCategory,index) in categoryList"
            :key="index"
            :label="stCategory.categoryTitle"
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
          <el-option
            v-for="(ndCategory,index) in ndCategoryList"
            :key="index"
            :label="ndCategory.categoryTitle"
            :value="ndCategory.categoryId"
          />
        </el-select>
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
          <el-image
            style="width: 50px; height: 50px"
            :src="scope.row.squareImage"
            :preview-src-list="[scope.row.squareImage]"
          />
        </template>
      </el-table-column>

      <el-table-column label="价格" width="100">
        <template slot-scope="scope">
          ￥{{ scope.row.price.salePrice }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="150">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="checkDetail(scope.row)">详细</el-button>
          <el-button type="danger" size="small" @click="delProduct()">删除</el-button>
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
import { getProductPage, getProductInfo, getSku, updateProduct } from '@/api/product'
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
      ndCategoryList: [],
      detailFormVisible: false,
      detailForm: {}
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
    submitDetail() {
      this.detailForm.props = this.detailForm.props.filter(item =>
        !item.isDel &&
        item.name !== '' &&
        item.name !== undefined &&
        item.value !== '' &&
        item.value !== undefined)
      updateProduct(this.detailForm).then(resp => {
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
      getProductInfo({ productId: row.productId }).then(resp => {
        const { data } = resp
        this.detailForm = data
        this.detailFormVisible = true
        getSku({ productId: row.productId }).then(resp => {
          const { data } = resp
          this.detailForm.sku = data
          this.$forceUpdate()
        })
      })
    },
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

<style>
.roll-dialog .el-dialog__body {
  padding: 3px 30px;
  overflow-y: auto;
  height: calc(100vh - 30vh);
}
</style>
