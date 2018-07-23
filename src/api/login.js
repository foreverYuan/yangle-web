import request from '@/utils/request'

export function loginByUsername(userName, userPassword) {
  return request({
    url: '/userweb/weblogin',
    method: 'post',
    params: { userName, userPassword }
  })
}

export function logout() {
  return request({
    url: '/login/logout',
    method: 'post'
  })
}

export function getUserInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}
export function login(username, password) {
  return request({
    url: '/userweb/weblogin',
    method: 'post',
    params: { username, password }
  })
}


