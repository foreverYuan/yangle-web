import request from '@/utils/request'

export function memberlist(query) {
  return request({
    url: '/userweb/list',
    method: 'get',
    params: query
  })
}

 
 

export function createmember(data) {
  return request({
    url: '/userweb/save',
    method: 'post',
    data: data,
   })
}

export function deletemember(data) {
  return request({
    url: '/userweb/delete',
    method: 'post',
    params: data,
  })
}

export function updatemember(data) {
  return request({
    url: '/userweb/update',
    method: 'post',
    data: data,
   })
}

export function updateamount(data) {
  return request({
    url: '/sys/user/updateAmount',
    method: 'post',
    data: data,
   })
}

export function deleteOne(query) {
return request({
    url: '/user/delete',
    method: 'get',
    params: query,
   })
}

export function updatepassword(data) {
  return request({
    url: 'userweb/password',
    method: 'post',
    params: data,
   })
}

 
