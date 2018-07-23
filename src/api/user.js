import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/sys/user/list',
    method: 'get',
    params: query
  })
}

export function fetchUser(userId) {
  return request({
    url: '/sys/user/info/' + userId,
    method: 'get'
  })
}
export function fetchDepartmentList() {
  return request({
    url: '/sys/user/departmentList',
    method: 'get',
  })
}
export function fetchUserPermissions(username) {
  return request({
    url: '/sys/permissions',
    method: 'get',
    params: { username }
  })
}

/**操作日志列表 */
export function logList(query) {
  return request({
    url: '/system/syslog/list',
    method: 'get',
    params: query
  })
}

