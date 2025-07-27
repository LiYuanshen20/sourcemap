import React, { Component } from "react"
import { getQueryVariable, removeParam } from "../../util/public"
import Header from "../../components/header"
import Body from "../body"
import Footer from "../../components/footer"
import Loading from "../../components/loading"
import TaskProcess from "../../components/taskProcess"
import "./app.css"
import { requireSystemTheme, setSystemTheme } from "lancoo-web-ui"
import { SKIN_BG_COLOR } from "../../hooks/useGetThem"
import monitor from "lancoo-eyesdk"
class App extends Component {
  constructor(props) {
    super(props)
  }
  state = {
    token: getQueryVariable("lg_tk") || sessionStorage.getItem("token") || "",
    loading: true,
    skin: "",
  }
  componentWillMount() {
    console.log(monitor)
    monitor.error()
    monitor.behavior()
    monitor.performance()
    document.body.classList.add("lg-skin-s2")
    this.getCommonInfo()
  }
  // 获取公共信息
  getCommonInfo = () => {
    let token = this.state.token
    //没有token就掉线
    if (!token) {
      this.goLogin()
      return
    }
    this.setState({ loading: true })
    sessionStorage.setItem("token", token)
    Promise.all([this.getSysInfo(), this.getUserInfo(), this.getWorkInfo()])
      .then(() => {
        return this.lockerCheck()
      })
      .then(() => {
        this.linkCheck()
        this.getSkin()
        this.setState({ loading: false })
      })
      .catch((res) => {
        console.error("error", res)
        if (res.code == 401) {
          this.goLogin()
        }
      })
  }
  // 获取用户信息
  getUserInfo = () => {
    let obj = {
      token: this.state.token,
    }
    return new Promise((resolve, reject) => {
      this.$axios
        .get("api/common/user", {
          params: obj,
        })
        .then((res) => {
          if (res.code != 200) {
            reject(res)
            return
          }
          res.data.userName = decodeURIComponent(res.data.userName)
          sessionStorage.setItem("userId", res.data.userId)
          sessionStorage.setItem("userType", res.data.userType)
          sessionStorage.setItem("schoolId", res.data.schoolId)
          sessionStorage.setItem("userInfo", JSON.stringify(res.data))

          // 获取用户身份
          let ic =
            getQueryVariable("lg_ic") || sessionStorage.getItem("identityCode")
          let isCheck = false
          let identityCode = ""
          let identityInfo = {}
          if (ic) {
            Array.isArray(res.data.identityList) &&
              res.data.identityList.forEach((item) => {
                if (item.identityCode === ic) {
                  identityCode = item.identityCode
                  identityInfo = item
                  isCheck = true
                }
              })
          }
          if (!ic || !isCheck) {
            identityCode = res.data.identityList[0].identityCode
            identityInfo = res.data.identityList[0]
          }
          sessionStorage.setItem("identityCode", identityCode)
          sessionStorage.setItem("identityInfo", JSON.stringify(identityInfo))

          if (getQueryVariable("pageType") === "admin") {
            if (["2", "3"].includes(res.data.userType)) {
              alert("暂不支持当前身份进入，请重新登录")
              reject({ code: 401 })
              return
            } else {
              document.title = "周行事历管理"
            }
          }
          resolve()
        })
    })
  }
  // 获取系统信息
  getSysInfo = () => {
    return new Promise((resolve, reject) => {
      this.$axios.get("api/common/system/info").then((res) => {
        if (res.code == 200) {
          sessionStorage.setItem("baseUrl", res.data.baseUrl)
          sessionStorage.setItem("sysId", res.data.sysId)
          sessionStorage.setItem("sysInfo", JSON.stringify(res.data))
          resolve()
        } else {
          reject(res)
        }
      })
    })
  }
  // 获取各系统信息
  getWorkInfo = () => {
    return new Promise((resolve, reject) => {
      this.$axios
        .get("api/common/system/list", {
          params: {
            sysIds: "260,210",
          },
        })
        .then((res) => {
          if (res.code == 200) {
            let obj = {}
            Array.isArray(res.data) &&
              res.data.forEach((item) => {
                obj[item.sysId] = item.webSvrAddr
              })
            sessionStorage.setItem("sysAddrInfo", JSON.stringify(obj))
            resolve()
          } else {
            reject(res)
          }
        })
    })
  }
  // 锁控
  lockerCheck = () => {
    let sysInfo = JSON.parse(sessionStorage.getItem("sysInfo"))
    let userInfo = JSON.parse(sessionStorage.getItem("userInfo"))
    let obj = {
      sysId: sysInfo.weeklyRoutineSysId,
      lockerId: sysInfo.weeklyRoutineLockerId,
      schoolId: userInfo.schoolId,
    }
    return new Promise((resolve, reject) => {
      this.$axios
        .get("api/common/locker/inside/check", {
          params: obj,
        })
        .then((res) => {
          if (res.code == 200 && res.data.result == 1) {
            sessionStorage.setItem("lockerInfo", JSON.stringify(res.data))
            resolve()
          } else {
            window.location.replace(res.data.lockErrAddr + res.data.result)
            reject("锁控错误")
          }
        })
    })
  }
  // 获取当前皮肤
  getSkin = () => {
    return new Promise((resolve, reject) => {
      this.$axios
        .get(
          `${sessionStorage.getItem(
            "baseUrl"
          )}openapi/v1/system/facade/getSkin?token=${sessionStorage.getItem(
            "token"
          )}&appid=260`,
          {
            // appid: '260',
            // token: sessionStorage.getItem("token"),
          }
        )
        .then((res) => {
          console.log(res)
          if (res.StatusCode == 200) {
            this.setState({
              skin: `s${res.Data.skin}`,
            })
            sessionStorage.setItem("skin", `s${res.Data.skin}`)
          }
          // if (res.code == 200 && res.data.result == 1) {
          // sessionStorage.setItem("lockerInfo", JSON.stringify(res.data))
          resolve()
          // } else {
          //   // window.location.replace(res.data.lockErrAddr + res.data.result)
          //   reject("锁控错误")
          // }
        })
    })
  }
  // 掉线检测
  linkCheck = () => {
    let baseUrl = sessionStorage.getItem("baseUrl")
    let token = sessionStorage.getItem("token")
    if (!baseUrl || !token) {
      return
    }
    let script = document.createElement("script")
    script.src = baseUrl + "/UserMgr/Login/JS/CheckIsOnline2.js"
    script.type = "text/javascript"
    script.onload = function () {
      window._LgBase_initCheck(baseUrl, token, "E47")
    }
    document.getElementsByTagName("head")[0].appendChild(script)
  }
  // 跳转登录页
  goLogin = () => {
    let baseUrl = sessionStorage.getItem("baseUrl")
    if (!baseUrl) {
      this.getSysInfo().catch(() => {
        this.goLogin()
      })
      return
    }
    let href = removeParam(window.location.href, "lg_tk")
    sessionStorage.removeItem("token")
    window.location =
      baseUrl + "/login.html?lg_preurl=" + encodeURIComponent(href)
  }
  render() {
    let { loading } = this.state
    if (loading) {
      return <Loading width="100vw" height="100vh" />
    }
    let basicPlatformAddress = sessionStorage.getItem("baseUrl") //基础平台地址
    let appId = "252" //子系统ID
    let token = sessionStorage.getItem("token") //用户令牌
    /**
     * @description  : 此处用于非代理下的子系统，如另外需要部署的子系统调用；可以参考一卡通
     * @waring  : 注：此方法有请求，会导致部分系统产生跨域无法正常调用的情况，请子系统对接基础平台后参考调用形式四
     * @waring  : 注：如果控制台打印 “[web-ui] 缓存未获取到用户主题,请自行调用设置主题色工具,如已添加请忽略此打印” 请用此方法；
     */
    window?._defaultThemeColor?.error(() =>
      requireSystemTheme(basicPlatformAddress, appId, token)
    )
    return (
      <div className="my_app">
        <Header />
        <div
          className="NoticeCenter-div"
          style={{ backgroundColor: SKIN_BG_COLOR[this.state.skin] }}
        >
          <Body />
        </div>
        {/* <Body /> */}
        {/* <Footer /> */}

        {/* <TaskProcess
          width={915}
          title="周行事历应用流程"
          subtitle="周行事历说明"
          description={
            <>
              <p>"周行事历”包括:"周行事历管理"、"周行事历个人端”两个模块，可以通过办公平台首页快速进入”周行事历个人端”。</p>
              <p>管理员可以在”周行事历管理“模块中设置周行事历所属分区发布/编辑/删除周行事历，可以在”周行事历个人端”查看不同分区的周行事历</p>
              <p>老师和其他人员可以在”周行事历个人端”查看不同分区的周行事历。</p>
            </>
          } /> */}
      </div>
    )
  }
}

export default App
