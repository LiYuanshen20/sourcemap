import React, { Component } from 'react'
import MyTable from '../../components/table'
import MyPopLayer from '../../components/popLayer'
import FormComp from '../../components/formComp'
import moment from 'moment'
import EditDrawer from './editDrawer'
import { showMsgAlert, showMsgModal } from '../../util/showAlertMethod'
import './index.scss'
import { regAllSpaceOrNull } from '../../util/public'
import { lgAlert } from 'lancoo-web-ui'
moment.locale('zh-cn');
const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
class App extends Component {
  constructor(props) {
    super(props)
  }
  state = {
    loading: false,
    loadingText: "正在获取数据...",
    partitionList: [],
    partitionIndex: 0,
    caseTitle: "",
    dateRange: [],
    tableList: [],
    drawerVisible: false,
    drawerDataList: [],
    drawerFillData: {}, // 给编辑时新增的数据填充的数据对象
    upIndex: 0, // 编辑时最上面的数据的数组下标
    downIndex: 0, // 编辑时最下面的数据的数组下标

    depSuggestList: [], // 部门列表，用于输入框建议
    caseSuggestList: [], // 事务安排列表，用于输入框建议

    autoSaveAlert: null, // 自动保存的alert提示
    autoSaveInterval: null, // 自动保存的interval
  };
  tableColumns = [
    {
      title: "日期",
      dataIndex: "dateStr",
      align: "left",
      width: "20%",
      className: "th-alignCenter",
      onCell: (record) => {
        console.log(record)
        return {
          rowSpan: record.rowSpan,
        }
      },
    },
    {
      title: "事务安排",
      dataIndex: "caseDetail",
      width: "calc(80% - 150px)",
      align: "left",
      className: "th-alignCenter",
      render: (value, record) => {
        return <span className='table_caseDetail'>
          {/* {
            record.departmentName ?
              <span className='table_caseDetail_tag'>{record.departmentName}</span> :
              ""
          } */}
          {record.planContent}
        </span>
      }
    },
    {
      title: "时间",
      dataIndex: "time",
      align: "left",
      width: "100px",
      className: "th-alignCenter",
      render: (value, record) => {
        return <span>{value}</span>
      }
    },
    {
      title: "地点",
      dataIndex: "place",
      align: "left",
      width: "15%",
      className: "th-alignCenter",
      render: (value, record) => {
        return <span>{value}</span>
      }
    },
    {
      title: "主持部门",
      dataIndex: "departmentName",
      align: "left",
      width: "15%",
      className: "th-alignCenter",
      render: (value, record) => {
        return <span>{value}</span>
      }
    },
    {
      title: "操作",
      key: "operate",
      width: "80px",
      align: "left",
      className: "th-alignCenter",
      onCell: (record) => {
        return {
          rowSpan: record.rowSpan,
        }
      },
      render: (value, record) => {
        return <span className='table_operate_btn' onClick={() => this.editCaseItem(record)}>编辑</span>
      }
    },
  ]
  componentDidMount () {
    this.initData()
    this.getDepSuggestList()
  }
  componentDidUpdate (preProps) {
    if (preProps.isOpen && !this.props.isOpen) { // 关闭
      this.initData()

      clearInterval(this.state.autoSaveInterval)
      if (this.state.autoSaveAlert) {
        lgAlert.close(this.state.autoSaveAlert.index)
        this.setState({ autoSaveAlert: null })
      }
    } else if (!preProps.isOpen && this.props.isOpen) { // 打开
      this.getPartitionList().then(() => {
        this.searchAndDelData()
      })

      let intervalNum = setInterval(() => {
        this.autoSaveDataFunc()
      }, 5 * 1000)
      this.setState({ autoSaveInterval: intervalNum })
    }
  }
  // 初始化数据
  initData = () => {
    let startTime = new Date()
    // 当天到周日的天数（把周日转成7)
    let startWeek = 7 - (startTime.getDay() + 7) % 8
    // 计算周日是几号
    let days = startTime.getDate() + startWeek
    let endTime = new Date()
    endTime.setDate(days)
    this.setState({
      caseTitle: "",
      dateRange: [startTime, endTime],
      tableList: [],
      drawerVisible: false
    }, () => {
      this.renderDateTableList()
    })
  }
  // 获取分区列表
  getPartitionList = () => {
    let userInfo = JSON.parse(sessionStorage.getItem("userInfo"))
    let obj = {
      schoolId: userInfo.schoolId,
      schoolLevel: userInfo.schoolLevel,
    }
    this.setState({
      loading: true,
      loadingText: "正在获取数据...",
    })
    return this.$axios
      .get("api/weekly/general/partition/list", {
        params: obj,
      })
      .then((res) => {
        if (res.code == 200 && Array.isArray(res.data) && res.data.length > 0) {
          res.data.forEach((item, index) => {
            item.value = index
            item.label = item.partitionName
          })
          this.setState({
            partitionList: res.data,
            partitionIndex: 0,
            loading: false,
          }, () => {
            if (this.props.id) {
              this.getDetail()
            }
          })
        }
      })
  };
  // 获取编辑详情
  getDetail = () => {
    let obj = {
      weeklyRoutineId: this.props.id
    }
    this.setState({ loading: true })
    this.$axios.get("api/weekly/general/info/detail", {
      params: obj
    }).then(res => {
      if (res.code == 200) {
        let data = res.data
        let partitionList = this.state.partitionList
        let partitionIndex = 0
        for (let key in partitionList) {
          if (data.partitionId == partitionList[key].partitionId) {
            partitionIndex = parseInt(key)
            break
          }
        }
        data.generalWeeklyPlanVoList.forEach(item => {
          console.log(moment(item.planDate).format("M月D日"))
          console.log(new Date(moment(item.planDate).format("M月D日")).getDay())
          item.dateStr = moment(item.planDate).format("M月D日") + `(${ weekdays[new Date(moment(item.planDate).format("yyyy-MM-DD")).getDay()]})`
        })
        this.dealRowSpan(data.generalWeeklyPlanVoList)
        this.setState({
          partitionIndex,
          caseTitle: data.title,
          dateRange: [new Date(data.startDate), new Date(data.endDate)],
          tableList: data.generalWeeklyPlanVoList,

          loading: false
        })
      }
    })
  }
  // 获取部门列表，用于输入框的建议
  getDepSuggestList = () => {
    this.$axios.get("api/common/organize", {
      params: { schoolId: sessionStorage.getItem("schoolId") }
    }).then(res => {
      if (res.code == 200) {
        res.data.forEach(item => {
          item.value = item.departmentName
        })
        this.setState({ depSuggestList: res.data })
      }
    })
  }
  // 获取事务安排列表，用于输入框的建议
  getCaseSuggestList = () => {
    let tableList = this.state.tableList
    let arr = []
    let sameObj = {}
    tableList.forEach(item => {
      if (sameObj[item.planContent]) {
        return
      }
      let planContent = item.planContent
      sameObj[planContent] = true
      let obj = {
        value: planContent,
        planContent: planContent
      }
      arr.push(obj)
    })
    this.setState({ caseSuggestList: arr })
  }
  // 生成表格列表
  renderDateTableList = () => {
    let dateRange = this.state.dateRange
    let diffDays = moment(dateRange[1]).diff(moment(dateRange[0]), "day")
    let list = []
    for (let i = 0; i <= diffDays; i++) {
      let planDate = moment(dateRange[0]).add(i, "days").format("yyyy-MM-DD") + " 00:00:00"
      let { dataList } = this.getSameParamsList({ planDate })
      // 如果之前有值，就添加回去，不加入新的
      if (dataList.length > 0) {
        list.push(...dataList)
        continue
      }
      // 如果没值，添加新的数据
      let obj = {
        planDate: planDate,
        dateStr:  moment(dateRange[0]).add(i, "days").format("M月D日") +  `(${ weekdays[new Date(moment(dateRange[0]).add(i, "days").format("yyyy-MM-DD")).getDay()]})`,
        departmentName: "",
        planContent: "",
        time: "",
        place: ""
      }
      list.push(obj)
    }
    this.dealRowSpan(list)
    this.setState({ tableList: list })
  };
  // 处理合并单元格
  dealRowSpan = (data, nameList = ["planDate"]) => {
    for (var i = 0; i < nameList.length; i++) {
      var name = nameList[i]
      var startRow = 0
      var endRow = data.length
      var mergeNum = 1
      if (endRow != 1) {
        for (var j = startRow; j < endRow; j++) {
          if (j == endRow - 1) {
            //判断是否是最后一个元素
            if (startRow == endRow - 1) {
              data[j]["rowSpan"] = 1
            }
          } else {
            if (data[startRow][name] == data[j + 1][name]) {
              data[j + 1]["rowSpan"] = 0
              mergeNum = mergeNum + 1
              data[startRow]["rowSpan"] = mergeNum
            } else {
              startRow = j + 1
              if (mergeNum > 1) {
                data[startRow]["rowSpan"] = 1
              } else {
                data[j]["rowSpan"] = 1
              }
              mergeNum = 1
            }
          }
        }
      } else {
        data[0]["rowSpan"] = 1
      }
    }
    return data
  };
  // 获取所有与params字段的值相同的行
  getSameParamsList = (data, params = "planDate") => {
    let tableList = this.state.tableList
    let list = []
    let up = -1
    let down = -1
    let paramsStr = data[params]
    for (let key in tableList) {
      if (tableList[key][params] === paramsStr) {
        if (up == -1) {
          up = parseInt(key)
        }
        list.push(tableList[key])
      } else if (up != -1) {
        // up有值，只获取连续的
        down = parseInt(key) - 1
        break
      }
    }
    down = down != -1 ? down : tableList.length - 1
    return {
      dataList: list,
      upIndex: up,
      downIndex: down
    }
  }
  // 修改题目内容
  changeTopic = (obj) => {
    this.setState(obj, () => {
      if (obj.dateRange) {
        this.renderDateTableList()
      }
    })
  };
  // 打开抽屉 编辑事务 drawer
  editCaseItem = (data) => {
    let { dataList, upIndex, downIndex } = this.getSameParamsList(data)
    let fillData = {
      planDate: data.planDate,
      dateStr: data.dateStr
    }
    this.getCaseSuggestList()
    this.setState({
      drawerVisible: true,
      drawerDataList: dataList,
      drawerFillData: fillData,
      upIndex,
      downIndex
    })
  }
  // 确定抽屉 drawer
  confirmDrawer = (dataList) => {
    let { tableList, upIndex, downIndex } = this.state
    tableList = JSON.parse(JSON.stringify(tableList))
    tableList.splice(upIndex, downIndex - upIndex + 1, ...dataList)
    this.dealRowSpan(tableList)
    this.setState({
      tableList
    }, () => {
      this.closeDrawer()
    })
  }
  // 关闭抽屉 drawer
  closeDrawer = () => {
    this.setState({ drawerVisible: false })
  }
  // 确定预处理 popLayer
  preConfirmLayer = () => {
    let {
      partitionIndex,
      partitionList,
      caseTitle,
      dateRange,
      tableList
    } = this.state
    if (!partitionList[partitionIndex]) {
      showMsgAlert("请先选择所属分区")
      return
    }
    if (!caseTitle) {
      showMsgAlert("请先填写标题")
      return
    } else if (regAllSpaceOrNull(caseTitle)) {
      showMsgAlert("标题不可全为空格")
      return
    }
    if (dateRange.length != 2) {
      showMsgAlert("请先选择起止时间")
      return
    }
    let arr = []
    tableList.forEach(item => {
      if (!item.planContent) {
        arr.push(item.dateStr)
      }
    })
    if (arr.length > 0) {
      showMsgAlert(`请先编辑${arr.join("、")}的事务安排。`)
      return
    }
    this.confirm()
  };
  // 确定
  confirm = (autoSave = false) => {
    let {
      partitionIndex,
      partitionList,
      caseTitle,
      dateRange,
      tableList,
    } = this.state
    let userInfo = JSON.parse(sessionStorage.getItem("userInfo"))
    let startTime = moment(dateRange[0]).format("yyyy-MM-DD") + " 00:00:00"
    let endTime = moment(dateRange[1]).format("yyyy-MM-DD") + " 23:59:59"
    let obj = {
      weeklyRoutineId: this.props.id,
      partitionId: partitionList[partitionIndex].partitionId,
      partitionName: partitionList[partitionIndex].partitionName,
      title: caseTitle,
      userId: userInfo.userId,
      userName: userInfo.userName,
      headPicture: userInfo.photo || userInfo.photoPath,
      startDate: startTime,
      endDate: endTime,
      schoolId: userInfo.schoolId,
      saveWeeklyPlanBoList: tableList
    }
    // 自动保存
    if (autoSave) {
      this.$axios.post("api/weekly/general/cache/save", obj).catch(res => {
        console.log("自动保存失败，原因：", res.msg)
        clearInterval(this.state.autoSaveInterval)
      })
      return
    }
    this.setState({
      loading: true,
      loadingText: "正在提交..."
    })
    this.$axios.post("api/weekly/general/created/save", obj).then(res => {
      if (res.code == 200) {
        showMsgAlert("提交成功", "success")
        this.closeLayer()
        this.props.getList && this.props.getList()
        this.props.getPartitionList && this.props.getPartitionList()

      } else {
        showMsgAlert(res.msg || "提交失败")
      }
      this.setState({ loading: false })
    })
  }
  preCloseLayer = () => {
    showMsgModal({
      content: "确定放弃继续编辑吗？",
      description: "确定后所编辑的内容将会被清空",
      tipType: "question",
      onConfirm: () => {
        this.closeLayer()
      }
    })
  }
  // 关闭弹窗 popLayer
  closeLayer = () => {
    this.searchAndDelData(2)
    this.props.onClose && this.props.onClose()
  };
  // 查询（1）和删除（2）保存的数据
  searchAndDelData = (type = 1) => {
    let userInfo = JSON.parse(sessionStorage.getItem("userInfo"))
    let obj = {
      schoolId: userInfo.schoolId,
      userId: userInfo.userId,
      type
    }
    this.$axios.get("api/weekly/general/cache/getAndDel", {
      params: obj
    }).then(res => {
      if (res.code == 200 && type == 1) {
        let data = res.data
        if (!data) {
          return
        }
        let partitionList = this.state.partitionList
        let partitionIndex = 0
        let startTime = data.startDate ? new Date(data.startDate) : new Date()
        let endTime = data.startDate ? new Date(data.endDate) : new Date()
        for (let key in partitionList) {
          if (data.partitionId == partitionList[key].partitionId) {
            partitionIndex = parseInt(key)
            break
          }
        }
        if (data.saveWeeklyPlanBoList) {
          data.saveWeeklyPlanBoList.forEach(item => {
            item.dateStr =  moment(item.planDate).format("M月D日") + `(${ weekdays[new Date(moment(item.planDate).format("yyyy-MM-DD")).getDay()]})`
          })
          this.dealRowSpan(data.saveWeeklyPlanBoList)
        }
        let autoSaveData = {
          partitionIndex,
          caseTitle: data.title,
          dateRange: [startTime, endTime],
          tableList: data.saveWeeklyPlanBoList || [],
        }
        let alert = showMsgAlert("是否继续上次的编辑？", "question", {
          duration: 0,
          isShowCloseBtn: true,
          operateView: <span className='autoSaveBtn' onClick={() => {
            this.setState({
              ...autoSaveData
            })
            lgAlert.close(alert.index)
          }}>继续编辑</span>
        })
        this.setState({ autoSaveAlert: alert })
      }
    })
  }
  // 自动保存数据
  autoSaveDataFunc = () => {
    this.confirm(true)
  }
  render () {
    let { isOpen } = this.props
    let {
      loading,
      loadingText,
      partitionList,
      partitionIndex,
      caseTitle,
      dateRange,
      tableList,
      drawerVisible,
      drawerDataList,
      drawerFillData,

      depSuggestList,
      caseSuggestList,
    } = this.state
    return (
      <MyPopLayer
        isOpen={isOpen}
        loading={false}
        loadingText={loadingText}
        width={920}
        height={654}
        title={"添加周行事历"}
        className="handleCaseLayer"
        isShowBottom={true}
        onConfirm={this.preConfirmLayer}
        onClose={this.preCloseLayer}
        onIconClose={this.preCloseLayer}
        drawerWindow={
          // 编辑抽屉
          <EditDrawer
            visible={drawerVisible}
            dataList={drawerDataList}
            fillData={drawerFillData}
            depSuggestList={depSuggestList}
            caseSuggestList={caseSuggestList}
            checkBtn={this.confirmDrawer}
            closeBtn={this.closeDrawer}
          />
        }
      >
        {
          partitionList.length > 10 ?
            <FormComp
              topicName="所属分区"
              topicType="select"
              keyLabel="partitionName"
              keyValue="value"
              value={partitionIndex}
              list={partitionList}
              onChange={(item) => {
                this.changeTopic({ partitionIndex: item.value })
              }}
            /> :
            <FormComp
              topicName="所属分区"
              topicType="radio"
              value={partitionIndex}
              list={partitionList}
              onChange={(value) => {
                this.changeTopic({ partitionIndex: value })
              }}
            />
        }
        <FormComp
          topicName="标题"
          topicType="input"
          width={400}
          maxLength={30}
          placeholder="输入周行事历标题..."
          value={caseTitle}
          onChange={(e) => {
            this.changeTopic({ caseTitle: e.target.value })
          }}
        />
        <FormComp
          topicName="起止时间"
          topicType="date"
          placeholder="请选择起止时间..."
          type="B"
          value={dateRange}
          min={new Date()}
          format="yyyy/MM/dd"
          onChange={(value) => {
            this.changeTopic({ dateRange: value })
          }}
        />
        <MyTable
          columns={this.tableColumns}
          data={tableList}
          bordered
          emptyTextTip="请选择起止时间"
          size="small"
        />
      </MyPopLayer>
    )
  }
}

export default App