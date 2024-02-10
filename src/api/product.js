import request from '@/utils/request'

export function getProductPage(params) {
  return request({
    url: '/product/page',
    method: 'get',
    params
  })
}

export function getProductInfo(params) {
  return request({
    url: '/product/info',
    method: 'get',
    params
  })
}

export function getSku(params) {
  return request({
    url: '/product/sku',
    method: 'get',
    params
  })
}

export function updateProduct(data) {
  return request({
    url: '/product/update',
    method: 'post',
    data
  })
}
