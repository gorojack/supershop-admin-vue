import request from '@/utils/request'

export function getProductPage(params) {
  return request({
    url: '/product/page',
    method: 'get',
    params
  })
}
