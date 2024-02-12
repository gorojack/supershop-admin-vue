import request from '@/utils/request'

export function getBrandPage(params) {
  return request({
    url: '/brand/page',
    method: 'get',
    params
  })
}

export function getBrandInfo(params) {
  return request({
    url: '/brand/info',
    method: 'get',
    params
  })
}

export function updateBrand(data) {
  return request({
    url: '/brand/update',
    method: 'post',
    data
  })
}
