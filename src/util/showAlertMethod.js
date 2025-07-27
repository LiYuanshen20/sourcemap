import { lgAlert } from "lancoo-web-ui";

/**
 * 
 * @param {String} content 标题
 * @param {String} tipType lgAlert展示的类型 info | error | warning | success | loading | question | fail | closeAll
 * @param {Object} tipType lgAlert的其他配置
 * @returns {Object} alert lgAlert.show返回的数据
 */
export function showMsgAlert(content = "content", tipType = "error", params = {}) {
  let alert = lgAlert.show({
    content,
    tipType,
    ...params
  })
  return alert
}

/**
 * 
 * @param {String} content 标题
 * @param {String} description 小字描述
 * @param {String} tipSize 框的大小 big | small | mini
 * @param {String} tipType lgAlert展示的类型 info | error | warning | success | loading | question | fail | closeAll
 * @param {String} confirmText 确定的文字
 * @param {String} closeText 取消的文字
 * @param {function} onConfirm 确定后的回调
 * @returns {Object} alert lgAlert.show返回的数据
 */
export function showMsgModal({
  content = '标题',
  description = ' ',
  tipSize = 'big',
  tipType = 'error',
  confirmText = "确定",
  closeText = "取消",
  onConfirm = () => {},
  ...pramas
}){
  let alert = lgAlert.show({
    duration: 0,
    content,
    description,
    tipSize,
    tipType,
    tipMouldType: "A",
    showCover: true,
    coverZIndex: 9100,
    confirmText,
    closeText,
    position: {
      xAxis: "center",
      yAxis: "center",
    },
    ...pramas,
    onConfirm: () => {
      onConfirm()
      lgAlert.close(alert.index)
    }
  });
  return alert
}