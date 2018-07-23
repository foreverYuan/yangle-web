import request from '@/utils/request'

export function moveList(query) {
  return request({
    url: '/yFetalMovement/yfetalmovement/list',
    method: 'get',
    params: query
  })
}

export function tbTaskList(query) {
  return request({
    url: '/api/tbTasklist',
    method: 'get',
    params: query
  })
}


 export function updateFetalMove(data) {
  return request({
    url: '/yFetalMovement/yfetalmovement/updateWeb',
    method: 'post',
    data: data,
   })
}
 
export function createOrder(data) {
  return request({
    url: '/api/takeOrder',
    method: 'post',
    data: data,
   })
}

export function autoScore(data) {
  return request({
    url: '/appUpdate/autoScore',
    method: 'post',
    data: data,
   })
}

export function moveDetail(data) {
  return request({
    url: '/yFetalMovement/yfetalmovement/printDetail',
    method: 'post',
    data: data,
   })
}