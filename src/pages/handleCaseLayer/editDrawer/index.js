import { lgAlert, LgDrawer, LgDatePicker } from 'lancoo-web-ui'
import React, { Component } from 'react'
import { MyAutoComplete } from '../../../components/formComp'
import MyTable from '../../../components/table'
import { regAllSpaceOrNull } from '../../../util/public'
import { showMsgAlert } from '../../../util/showAlertMethod'
import { TimePicker } from 'antd';
import moment from 'moment';
import './index.scss'
class App extends Component {
  constructor(props) {
    super(props)
  }
  state = {
    dataList: [
      {
        departmentName: "添加",
        colSpan: 5
      },
    ],
  }
  tableColumns = [
    {
      title: "事务安排",
      dataIndex: "planContent",
      key: "planContent",
      width: "calc(70% - 120px)",
      align: "left",
      className: "th-alignCenter",
      onCell: (record) => ({
        colSpan: record.colSpan == 5 ? 0 : 1
      }),
      render: (value, record, index) => {
        return <MyAutoComplete
          value={value}
          width="100%"
          maxLength={100}
          list={this.props.caseSuggestList}
          onSelect={(data) => {
            this.handleCase("edit", index, { planContent: data.planContent })
          }}
          onChange={(value) => {
            this.handleCase("edit", index, { planContent: value.slice(0, 100) })
          }}
        />
      }
    },
    {
      title: "时间",
      dataIndex: "time",
      key: "time",
      width: "120px",
      align: "left",
      className: "th-alignCenter",
      onCell: (record) => ({
        colSpan: record.colSpan == 5 ? 0 : 1
      }),
      render: (value, record, index) => {
        return (
          <LgDatePicker type="C" start="06:00" step="00:05" end="23:55" value={moment(value, 'HH:mm').toDate()} placeholder='选择时间' onChange={e => {
            console.log(moment(e).format('HH:mm'))
            this.handleCase("edit", index, { time: moment(e).format('HH:mm') })
          }} />
        );
      }
    },
    {
      title: "地点",
      dataIndex: "place",
      key: "place",
      width: "140px",
      align: "left",
      className: "th-alignCenter",
      onCell: (record) => ({
        colSpan: record.colSpan == 5 ? 0 : 1
      }),
      render: (value, record, index) => {
        return <MyAutoComplete
          value={value}
          width="100%"
          // maxLength={100}
          list={this.props.caseSuggestList}
          onSelect={(data) => {
            console.log(data)
            this.handleCase("edit", index, { place: data.place })
          }}
          onChange={(value) => {
            console.log(value)
            this.handleCase("edit", index, { place: value.slice(0, 10) })
          }}
        />
      }
    },
    {
      title: "部门",
      dataIndex: "departmentName",
      key: "departmentName",
      align: "left",
      width: "19%",
      className: "th-alignCenter",
      onCell: (record) => ({
        colSpan: record.colSpan
      }),
      render: (value, record, index) => {
        if (record.colSpan == 5) {
          return <span className='myTable_addCase_btn' onClick={() => this.handleCase("add")}><i className='myTable_addCase_icon'></i>新增事务</span>
        }
        return <MyAutoComplete
          value={value}
          maxLength={10}
          list={this.props.depSuggestList}
          onSelect={(data) => {
            this.handleCase("edit", index, {
              departmentName: data.departmentName,
              departmentId: data.departmentId
            })
          }}
          onChange={(value) => {
            this.handleCase("edit", index, { departmentName: value.slice(0, 10) })
          }}
        />
      }
    },
    {
      title: "操作",
      key: "operate",
      width: "60px",
      align: "left",
      className: "th-alignCenter",
      onCell: (record) => ({
        colSpan: record.colSpan == 5 ? 0 : 1
      }),
      render: (value, record, index) => {
        return <span className='table_operate_btn table_operate_btn_del' onClick={() => this.handleCase("del", index)}>删除</span>
      }
    },
  ]
  componentDidMount () {
    if (this.props.visible) {
      this.handleDataList(this.props.dataList)
    }
  }
  componentDidUpdate (preProps) {
    if (preProps.visible && !this.props.visible) { // 关闭

    } else if (!preProps.visible && this.props.visible) { // 打开
      this.handleDataList(this.props.dataList)
    }
  }
  // 处理dataList数据
  handleDataList = (dataList) => {
    console.log(dataList)
    if (!dataList) {
      return
    }
    dataList = JSON.parse(JSON.stringify(dataList))
    let list = [
      ...dataList,
      {
        departmentName: "添加",
        colSpan: 5
      }
    ]
    this.setState({
      dataList: list
    })
  }
  // 处理事务操作 新增|删除|编辑
  handleCase = (type, index, editObj) => {
    let list = JSON.parse(JSON.stringify(this.state.dataList))
    switch (type) {
      case "add":
        let addData = {
          ...this.props.fillData,
          departmentName: "",
          planContent: "",
          time: "",
          place: ""
        }
        list.splice(-1, 0, addData)
        break
      case 'del':
        if (list.length == 2) {
          showMsgAlert("至少需要存在一条安排")
          return
        }
        list.splice(index, 1)
        break
      case 'edit':
        let editData = {
          ...list[index],
          ...editObj
        }
        console.log(editData)
        list.splice(index, 1, editData)
        break
      default:
        return
    }
    this.setState({ dataList: list })
  }
  confirm = () => {
    let list = this.state.dataList
    let arr = []
    let spaceArr = []
    let str = ""
    list.forEach((item, index) => {
      // 最后一行为新增事务，不需要校验
      if (index == list.length - 1) return

      if (!item.departmentName) {
        arr.push(`第${index + 1}行的部门名称`)
      } else if (regAllSpaceOrNull(item.departmentName)) {
        spaceArr.push(`第${index + 1}行的部门名称`)
      }

      if (!item.planContent) {
        arr.push(`第${index + 1}行的事务安排`)
      } else if (regAllSpaceOrNull(item.planContent)) {
        spaceArr.push(`第${index + 1}行的事务安排`)
      }
    })
    if (arr.length > 0) {
      str += `请先填写${arr.join("、")}；`
    }
    if (spaceArr.length > 0) {
      str += `${spaceArr.join("、")}不可全为空格。`
    }
    if (str) {
      showMsgAlert(str)
      return
    }
    this.props.checkBtn && this.props.checkBtn(list.slice(0, -1))
  }
  render () {
    let {
      fillData,
      visible,
      closeBtn,
    } = this.props
    let { dataList } = this.state
    return (
      <LgDrawer
        visible={visible}
        width={740}
        type="right"
        className="myDrawer"
        style={{ position: "absolute" }}
        title={<span>编辑事务<span className='myDrawer_subtitle'> - {fillData.dateStr}</span></span>}
        checkBtn={this.confirm}
        closeBtn={closeBtn}
      >
        <p className='tipText'>共<span>{dataList.length - 1}</span>条事务安排</p>
        <MyTable
          columns={this.tableColumns}
          data={dataList}
          bordered
          size="small"
        />
      </LgDrawer>
    )
  }
}

export default App