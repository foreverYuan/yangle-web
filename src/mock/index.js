import Mock from 'mockjs'
import loginAPI from './login'
import costInvoiceAPI from './costInvoice'
import refundTeamAPI from './refundTeam'
// import bizCaseAPI from './bizCase'

// Mock.setup({
//   timeout: '350-600'
// })

// 登录相关
Mock.mock(/\/login\/login/, 'post', loginAPI.loginByUsername)
Mock.mock(/\/login\/logout/, 'post', loginAPI.logout)
Mock.mock(/\/user\/info\.*/, 'get', loginAPI.getUserInfo)

// 合同管理相关
// Mock.mock(/\/biz\/case\/list/, 'get', bizCaseAPI.getList)

// 成本发票相关
Mock.mock(/\/costInvoice\/list/, 'get', costInvoiceAPI.getList)
Mock.mock(/\/costInvoice\/create/, 'post', costInvoiceAPI.create)
Mock.mock(/\/costInvoice\/update/, 'post', costInvoiceAPI.update)

// 团队退费相关
Mock.mock(/\/refundTeam\/list/, 'get', refundTeamAPI.getList)
Mock.mock(/\/refundTeam\/create/, 'post', refundTeamAPI.create)
Mock.mock(/\/refundTeam\/update/, 'post', refundTeamAPI.update)

export default Mock
