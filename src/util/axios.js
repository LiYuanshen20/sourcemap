import axios from 'axios'
import ipConfig from './ipConfig'
import { getQueryVariable, removeParam } from './public'
import { showMsgModal } from './showAlertMethod'

const myAxios = axios.create({
  baseURL: ipConfig.baseUrl,
  headers: {
    Authorization: getQueryVariable("lg_tk") || sessionStorage.getItem("token")
  },
  // timeout: 10 * 1000
})

// 请求拦截器
myAxios.interceptors.request.use(beforeRequest, requestError)

// 返回拦截器
myAxios.interceptors.response.use(responseRight, responseError)

/**
 * 请求前调用
 * @param {Object} config 请求配置
 * @returns config
 */
function beforeRequest(config){
  return config
}
/**
 * 请求失败时调用
 * @param {Object} error 错误信息
 * @returns Promise.reject()
 */
function requestError(error){
  return Promise.reject(error)
}
/**
 * 2xx 范围内的状态码都会触发该函数。
 * @param {Object} response 返回的数据
 * @returns response
 */
function responseRight(response){
  let data = response.data
  return data
}
/**
 * 
 * @param {Object} error 错误信息
 * @returns Promise.reject()
 */
function responseError(error){
  console.log("responseError", error);
  let data = error?.response?.data || error
  showMsgModal({
    content: data.msg || data.message,
  })
  if(data.code == 401){
    goLogin()
  }
  return Promise.reject(data)
}

// 跳转登录页
function goLogin() {
  let baseUrl = sessionStorage.getItem("baseUrl");
  if (!baseUrl) {
    return;
  }
  let href = removeParam(window.location.href, "lg_tk");
  sessionStorage.removeItem("token");
  window.location =
    baseUrl + "/login.html?lg_preurl=" + encodeURIComponent(href);
};

export default myAxios;