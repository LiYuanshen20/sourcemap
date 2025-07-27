//获取url参数
export function getQueryVariable(variable) {
  // var query =
  // window.location.search.substring(1) ||
  // window.location.href.split("?")[1] ||
  // window.location.href;
  return getUrlQueryVariable(window.location.href, variable);
  // var vars = query.split("&");
  // for (var i = 0; i < vars.length; i++) {
  //   var pair = vars[i].split("=");
  //   if (pair[0] === variable) {
  //     return pair[1];
  //   }
  // }
  // return false;
}

//获取url参数
/**
 * @description: 通过参数url查询是否存在variable键
 * @param {*url：链接，variable：所查询的键}
 * @return {*boolean}
 */
export function getUrlQueryVariable(url, variable) {
  if (typeof url === "string" && !url.includes("?")) {
    //判断是否为字符串和包含？，不是则返回false
    return false;
  }
  let { urlSearch } = divideUrl(url);
  var vars = urlSearch.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] === variable) {
      return pair[1];
    }
  }
  return false;
}
/**
 * @description: location去除指定键值,可
 * @param {*param:string 所去除的键，url：string,要处理的url}
 * @return {*success返回url}
 */
export function removeParam(url, param) {
  if (typeof url !== "string") {
    console.error("url类型应该为String");
    return url;
  }
  url = decodeURIComponent(url); //解码
  if (url.indexOf(param) === -1 || url.indexOf("?") === -1) {
    //不存在，直接返回
    return url;
  }
  let { urlHash, urlPath, urlSearch } = divideUrl(url);
  urlSearch = noHashUrl(urlSearch, param);
  return urlPath + "?" + urlSearch + "#/" + urlHash;
}
/**
 * @description: 处理url，分为三段，path,search,hash
 * @param {*}
 * @return {*}
 */
const divideUrl = (url) => {
  let urlSearch = "";
  let urlHash = "";
  let urlPath = "";
  let hashIndex = url.indexOf("#/"); //hash 的位置,查询是否有哈希，有先分离，后面加回来
  let searchIndex = url.indexOf("?"); //参数的位置
  if (hashIndex !== -1) {
    //不存在hash
    if (hashIndex < searchIndex) {
      //哈希在前面，直接切
      urlSearch = url.split("#/")[1].split("?")[1];
      urlPath = url.split("#/")[0];
      urlHash = url.split("#/")[1].split("?")[0];
    } else {
      //在后面，需要先去掉哈希
      urlSearch = url.split("#/")[0].split("?")[1];
      urlPath = url.split("#/")[0].split("?")[0];
      urlHash = url.split("#/")[1];
    }
  } else {
    urlSearch = url.split("?")[1];
    urlPath = url.split("?")[0];
  }
  return {
    urlHash,
    urlPath,
    urlSearch,
  };
};
function noHashUrl(urlSearch, param) {
  let params = urlSearch.split("&");
  let search = [];
  for (let i = 0; i < params.length; i++) {
    let pair = params[i].split("=");
    if (pair[0] !== param) {
      search.push(params[i]);
    }
  }
  return search.join("&");
}

/**
 * 同步引入动态js和css函数
 * @param {Array} urlArr 需要引入的地址列表
 */
export function loadScriptOrCss(urlArr, num) {
  //同步引入动态js和css函数
  if (!num) {
    num = urlArr.length;
  }
  //正则判断是否是css;
  var reg = RegExp(/.css/);
  var scriptOrCss;

  if (reg.test(urlArr[num - 1])) {
    // 动态生成css
    scriptOrCss = document.createElement("link");
    scriptOrCss.type = "text/css";
    scriptOrCss.async = "async";
    scriptOrCss.href = urlArr[num - 1];
    scriptOrCss.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(scriptOrCss);
  } else {
    // 动态生成js
    scriptOrCss = document.createElement("script");
    scriptOrCss.type = "text/javascript";
    scriptOrCss.async = "async";
    scriptOrCss.src = urlArr[num - 1];
    document.body.appendChild(scriptOrCss);
  }
  if (scriptOrCss.readyState) {
    //IE下
    scriptOrCss.onreadystatechange = function() {
      if (
        scriptOrCss.readyState == "complete" ||
        scriptOrCss.readyState == "loaded"
      ) {
        scriptOrCss.onreadystatechange = null;
        num--;
        if (num == 0) {
        } else {
          loadScriptOrCss(urlArr, num);
        }
      }
    };
  } else {
    //其他浏览器
    scriptOrCss.onload = function() {
      num--;
      if (num == 0) {
      } else {
        loadScriptOrCss(urlArr, num);
      }
    };
  }
};

export function regAllSpaceOrNull(str){
  if(str && typeof(str) !== "string"){
    throw Error("regAllSpaceOrNull函数的参数必须为String字符串类型")
  }
  if(!str || /^\s*$/.test(str)){
    return true
  }
  return false
}