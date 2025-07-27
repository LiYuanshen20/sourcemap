import React, { Component } from 'react'
import './index.scss'
import 'element-theme-default'
import { LgDatePicker, LgRadio, LgSelect } from 'lancoo-web-ui'
import AutoComplete from "../auto-complete"

class App extends Component {
  constructor(props) {
    super(props)
  }
  render () {
    let {
      className = '',
      topicName,
      topicType,
    } = this.props
    return (
      <div className={`topic_label ${className}`}>
        {
          topicName ?
            <div className='label_text'>{topicName}:</div> :
            ""
        }
        <div className='label_formItem'>
          {
            topicType === "input" ?
              <MyInput {...this.props} /> :
              topicType === 'radio' ?
                <MyRadio {...this.props} /> :
                topicType === "select" ?
                  <MySelect {...this.props} /> :
                  topicType === 'date' ?
                    <MyDate {...this.props} /> :
                    topicType === 'autoComplete' ?
                      <MyAutoComplete {...this.props} /> :
                      ""
          }
        </div>
      </div>
    )
  }
}

export class MyInput extends Component {
  constructor(props) {
    super(props)
  }
  render () {
    let {
      width,
      height,
      formClassName = "",
      placeholder = "请输入...",
      value,
      maxLength,
      onChange = (e) => { },
    } = this.props
    return (
      <div className={`myInput_container ${formClassName}`}>
        <input
          className="myInput"
          style={{ width, height }}
          placeholder={placeholder || '请输入内容'}
          value={value}
          maxLength={maxLength}
          onChange={onChange}
        />
        {
          value ?
            <span className='myInput_numTip'>{value.length}/{maxLength}</span> :
            ""
        }
      </div>
    )
  }
}

export class MyRadio extends Component {
  constructor(props) {
    super(props)
  }
  state = {}
  render () {
    let {
      formClassName = "",
      value,
      list = [],
      onChange = (value) => { },
    } = this.props
    return (
      <LgRadio.Group className={`myRadio ${formClassName}`} value={value} onChange={onChange}>
        {
          list.map(item => {
            return <LgRadio value={item.value}>{item.label || "label"}</LgRadio>
          })
        }
      </LgRadio.Group>
    )
  }
}

export class MySelect extends Component {
  constructor(props) {
    super(props)
  }
  state = {
    showList: []
  }
  componentDidMount () {
    this.handleShowList()
    this.handleShowValue()
  }
  componentDidUpdate (preProps) {
    if (preProps.list !== this.props.list) {
      this.handleShowList()
    }
    if (preProps.value !== this.props.value) {
      this.handleShowValue()
    }
  }
  // 处理显示字段
  handleShowList = () => {
    let {
      list,
      keyLabel = "text"
    } = this.props
    let showList = JSON.parse(JSON.stringify(list))
    handleShowText(showList, keyLabel)
    this.setState({ showList })

    function handleShowText (list, keyLabel) {
      if (!Array.isArray(list)) {
        return
      }
      list.forEach(item => {
        item.text = item[keyLabel]
        if (item.sublist) {
          handleShowText(item.sublist, keyLabel)
        }
      })
    }
  }
  // 处理显示value
  handleShowValue = () => {
    let {
      keyValue = "text",
      keyLabel = "text",
      value,
      list
    } = this.props
    for (let key in list) {
      if (list[key][keyValue] === value) {
        this.setState({ showValue: list[key][keyLabel] })
        return
      }
    }
  }
  render () {
    let {
      // list,
      // keyLabel = "text",
      // keyValue = "text",
      // value,
      placeholder = "请选择...",
      onChange = (value) => { },
    } = this.props
    let { showList, showValue } = this.state
    return (
      <LgSelect
        datalist={showList}
        value={showValue}
        placeholder={placeholder}
        SelectOption={onChange}
      />
    )
  }
}

export class MyDate extends Component {
  constructor(props) {
    super(props)
  }
  // 日期禁止选中
  disabledDateFunc = (date) => {
    let min = this.props.min
    if (!min) {
      return false
    }
    // 包含今天
    return date.getTime() < (min - 24 * 60 * 60 * 1000)
  }
  render () {
    let {
      formClassName = "",
      type = "A",
      value = [],
      min = "",
      format = "yyyy-MM-dd",
      placeholder = "请选择...",
      onChange = (value) => { },
    } = this.props
    return (
      <LgDatePicker
        className={`myDate ${formClassName}`}
        type={type}
        value={value}
        format={format}
        onChange={onChange}
        placeholder={placeholder}
        disabledDate={this.disabledDateFunc}
      />
    )
  }
}

// 带输入建议的输入框
export class MyAutoComplete extends Component {
  constructor(props) {
    super(props)
  }
  isInputZh = false
  // 搜索建议
  querySearch = (queryString, cb) => {
    let list = this.props.list || []
    let results = queryString ? list.filter(this.createFilter(queryString)) : list
    // 调用 callback 返回建议列表的数据
    cb(results)
  }
  createFilter = (queryString) => {
    return (list) => {
      return (list.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
    }
  }
  compositionstart = () => {
    this.isInputZh = true
  }
  compositionend = (e) => {
    this.isInputZh = false
    this.props.onChange && this.props.onChange(e.target.value)
  }
  render () {
    let {
      formClassName = "",
      value = [],
      width,
      maxLength,
      placeholder = "请输入...",
      onChange = (value) => { },
      onSelect = (item) => { }
    } = this.props
    value = maxLength ? value.slice(0, maxLength) : value
    return (
      <span className='myAutocomplete'>
        <AutoComplete
          className={`${formClassName}`}
          value={value}
          style={{ width }}
          placeholder={placeholder}
          fetchSuggestions={this.querySearch}
          onSelect={onSelect}
          onChange={(value) => {
            console.log("onChange")
            if (this.isInputZh) {
              return
            }
            onChange(value)
          }}
          onCompositionStart={this.compositionstart}
          onCompositionEnd={this.compositionend}
        />
        {/* {
          value && maxLength ?
            <span className='myAutocomplete_numTip'>{value.length}/{maxLength}</span> :
            ""
        } */}
      </span>
    )
  }
}

export default App