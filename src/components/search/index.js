import React, {
    useState,
} from "react";
import "./index.scss";
import { LgSearch } from 'lancoo-web-ui';
/**
 * 传参：
 * className: 容器类名
 * style: 容器样式
 * placeholder: 输入框默认文字
 * autoSearch: 是否在输入框输入时就开始进行搜索操作
 * searchMethod: 搜索函数
 */
function Search(props) {
    let {
        className,
        placeholder,
        size = "default",
        showSearch = false,
        searchList = [],
        resultsHighlight,
        autoSearch,
        searchMethod
    } = props;
    const [keyword, setKeyword] = useState("");
    const changeValue = (e) => {
        let value = e.target.value;
        if(autoSearch && typeof searchMethod === "function"){
            searchMethod(value);
        }
        setKeyword(value);
    }
    const cancelSearch = () => {
        setKeyword("");
        typeof searchMethod === "function" && searchMethod("");
    }
    const goSearch = () => {
        typeof searchMethod === "function" && searchMethod(keyword);
    }
    return (
      <LgSearch
          className={`my_search ${className}`}
          value={keyword}
          size={size}
          showSearch={showSearch}
          searchList={searchList}
          resultsHighlight={resultsHighlight}
          input={{
            placeholder,
          }}
          onInput={changeValue}
          onSearch={goSearch}
          onClear={cancelSearch}
      />
    )
}
  
export default Search;
  