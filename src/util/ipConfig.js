let ipConfig = {}

const host = window.location.host
const protocol = window.location.protocol
const RootUrl = protocol + "//" + host

if (process.env.NODE_ENV === "development") {
  // let baseUrl = "http://192.168.122.120:10102/office-platform/" // 120

  // let baseUrl = "http://192.168.122.124:22101/office-platform/" // 124
  let baseUrl = "http://192.168.129.115:8071/office-platform/" // 129.1
  // let baseUrl = "http://192.168.129.33:20002/office-platform/"; // 文松
  // let baseUrl = "https://xdtest.aiedu100.com/office-platform/";
  // let baseUrl = "http://iscb.lancooedu.com/office-platform/";

  ipConfig = {
    baseUrl,
  }
} else if (process.env.NODE_ENV === "production") {
  ipConfig = {
    baseUrl: RootUrl + "/office-platform/",
    rootUrl: RootUrl,
  }
  console.log = () => {}
}
window.BasicProxy = ipConfig.baseUrl

export default ipConfig
