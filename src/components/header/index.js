import React, { Component } from "react"
import logo from "../../images/logo.png"
import adminLogo from "../../images/adminLogo.png"
import {
  getQueryVariable,
  removeParam,
  loadScriptOrCss,
} from "../../util/public"
import { showMsgModal } from "../../util/showAlertMethod"
import "./index.scss"
import {
  lgAlert,
  LgSplitLine,
  LgDropdown,
  LgTopBarContainer,
  BackToOfficialBlock,
  IdentityBlock,
  LogoutBlock,
  MessageBlock,
  UserBlock,
  SystemInfo,
  createClassName,
  SystemInfoProps,
} from "lancoo-web-ui"
import IdentityIcon from "../identityIcon/index"

const { classNames } = createClassName("lg-top-bar")
class App extends Component {
  constructor(props) {
    super(props)
    let pageType = getQueryVariable("pageType")
    this.state = {
      pageType,
      logoUrl: pageType === "admin" ? adminLogo : logo,
      systemName: pageType === "admin" ? "周行事历管理" : "周行事历",
      userInfo: JSON.parse(sessionStorage.getItem("userInfo")),
      identityInfo: JSON.parse(sessionStorage.getItem("identityInfo")),
      sysAddrInfo: JSON.parse(sessionStorage.getItem("sysAddrInfo")),
    }
  }
  componentDidMount() {
    this.getMsgCenter()
  }
  // 引入消息中心（小铃铛）
  getMsgCenter = () => {
    let token = sessionStorage.getItem("token")
    let baseUrl = sessionStorage.getItem("baseUrl")
    let msgWebSerAddr = this.state.sysAddrInfo["210"]
    sessionStorage.setItem("PsnMgrToken", token) //用户Token
    sessionStorage.setItem("PsnMgrMainServerAddr", baseUrl) //基础平台IP地址和端口号 形如：http://192.168.129.1:30103/
    sessionStorage.setItem("PsnMgrLgAssistantAddr", msgWebSerAddr) //个人信息管理系统Web站点IP地址和端口号 形如：http://192.168.129.1:10103/
    let arr = [
      msgWebSerAddr + "/PsnMgr/LgAssistant/js/jquery-1.7.2.min.js",
      msgWebSerAddr + "/PsnMgr/LgAssistant/assets/jquery.pagination.js",
      msgWebSerAddr + "/PsnMgr/LgAssistant/js/lancoo.cp.assistantInfoCenter.js",
      msgWebSerAddr +
        "/PsnMgr/LgAssistant/css/lancoo.cp.assistantInfoCenter.css",
    ].reverse()
    loadScriptOrCss(arr)
  }
  // 打开个人信息中心
  toPerson = () => {
    let baseUrl = sessionStorage.getItem("baseUrl")
    // window.open(baseUrl + '/UserMgr/PersonalMgr/Default.aspx?lg_tk=' + token, '_blank');

    let token = sessionStorage.getItem("token")
    let pathName = "html/personalMgr"
    window.open(baseUrl + `${pathName}?lg_tk=${token}`, "_blank")
  }
  // 显示消息中心
  showMessage = () => {
    document.querySelector("#Assistant_infoCenter").click()
  }
  // 打开帮助文档
  toHelp = () => {
    // let pageType = this.state.pageType
    let token = sessionStorage.getItem("token")
    // let urlType = pageType == "admin"? "index.html": "S-index.html"
    // window.open(`${window.BasicProxy}/weeklyRoutineHelp/${urlType}?lg_tk=${token}`, '_blank')
    console.log(sessionStorage.getItem("baseUrl"))
    window.open(
      `${sessionStorage.getItem(
        "baseUrl"
      )}help/static/article-detail/48/?lg_tk=${token}`,
      "_blank"
    )
  }
  // 退出登录
  quitMethod = () => {
    showMsgModal({
      content: "确定要退出登录吗？",
      onConfirm: () => {
        let token = sessionStorage.getItem("token")
        this.$axios
          .get("api/common/user/logout", {
            params: {
              token,
              userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
            },
          })
          .then(() => {
            let str = removeParam(window.location.href, "lg_tk")
            sessionStorage.removeItem("token")
            window.location.href =
              sessionStorage.getItem("baseUrl") +
              "/login.html?lg_preurl=" +
              encodeURIComponent(str)
          })
      },
    })
  }
  // 返回办公平台
  toPlatFrom = () => {
    let token = sessionStorage.getItem("token")
    let baseUrl = this.state.sysAddrInfo["260"]
    window.open(baseUrl + "html/index/?lg_tk=" + token, "_blank")
  }
  render() {
    let { logoUrl, systemName, userInfo, identityInfo } = this.state

    const systemInfo = {
      type: "A",
      logoUrl: logoUrl,
      systemName: systemName,
      // version: "安防版",
      // role: "管理端",
      // children:(<LgDropdown
      //     className={classNames('system-select')}
      //     value={this.state.currentTerm}
      //     datalist={this.state.term}
      //     SelectOption={this.handSelectOption}
      // />)
    }
    return (
      // <div className='my_header'>
      //   <div className='header_container'>
      //     <div className='header_sysInfo'>
      //       <img alt={systemName} src={logoUrl} />
      //       <p className='sysInfo_systemName'>{systemName}</p>
      //     </div>
      //     <div className="header_btn">
      //         <span className="btn_work" onClick={this.toPlatFrom}>返回办公平台</span>
      //         <span className="slice_line"></span>
      //         <span className="btn_message">
      //             <i id="Assistant_infoCenter"></i>
      //             <span onClick={this.showMessage}>消息</span>
      //         </span>
      //         <span className="btn_help" onClick={this.toHelp}>帮助</span>
      //         <span className="slice_line"></span>
      //         <div className="user_info" onClick={this.toPerson}>
      //             <i className="user_avatar" style={{
      //                 backgroundImage: `url('${decodeURIComponent(userInfo.photoPath)}')`
      //             }}></i>
      //             <span className="user_name">{decodeURIComponent(userInfo.userName)}</span>
      //             {
      //                 identityInfo.isPreset?
      //                 <img className="user_image" src={identityInfo.identityImg} alt="身份"/>:
      //                 <span className="user_identity" style={{
      //                     backgroundImage: `url('${identityInfo.identityImg}')`
      //                 }} title={identityInfo.identityName}>{identityInfo.identityName}</span>
      //             }
      //         </div>
      //         <i className="quitlogo" onClick={this.quitMethod}></i>
      //     </div>
      //   </div>
      // </div>
      <LgTopBarContainer type="C">
        <SystemInfo {...systemInfo}></SystemInfo>
        <div className={classNames("right")}>
          <BackToOfficialBlock handClick={this.toPlatFrom} />
          <LgSplitLine />
          <span className="top-btn">
            <i id="Assistant_infoCenter"></i>
            <span onClick={this.showMessage}>消息</span>
          </span>
          {/* <MessageBlock handClick={this.showMessage}/> */}
          {/* <LgSplitLine margin={'0 10px'}/> */}
          <span className="btn_help" onClick={this.toHelp}>
            帮助
          </span>
          <LgSplitLine margin={"0 10px"} />
          <div className="user-container" onClick={this.toPerson}>
            <UserBlock
              userImageUrl={userInfo.photoPath}
              userName={userInfo.userName}
            />
          </div>
          {/* {
              identityInfo.isPreset?
              <IdentityBlock identityImgUrl={identityInfo.identityImg}>
              </IdentityBlock>:
              <IdentityBlock identityImgUrl={identityInfo.identityImg}>
                  <span className={(classNames("define-identity"))}>{identityInfo.identityName}</span>
              </IdentityBlock>
          } */}
          <IdentityIcon userType={userInfo.userType}></IdentityIcon>
          <LogoutBlock handClick={this.quitMethod} />
        </div>
      </LgTopBarContainer>
    )
  }
}

export default App
