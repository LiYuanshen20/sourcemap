import React, { Component } from "react"
import MyPopLayer from "../../components/popLayer"
import MyTable from "../../components/table"
import moment from "moment"
import "./index.scss"

const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
class App extends Component {
  constructor(props) {
    super(props)
  }
  state = {
    loading: true,
    detail: {},
  }
  tableColumns = [
    {
      title: "日期",
      dataIndex: "dateStr",
      align: "left",
      width: "20%",
      className: "th-alignCenter",
      onCell: (record) => {
        return {
          rowSpan: record.rowSpan,
        }
      },
    },
    {
      title: "事务安排",
      dataIndex: "caseDetail",
      width: "calc(80% - 100px)",
      align: "left",
      className: "th-alignCenter",
      render: (value, record) => {
        return (
          <span className="table_caseDetail">
            {/* {
            record.departmentName ?
              <span className='table_caseDetail_tag'>{record.departmentName}</span> :
              ""
          } */}
            {record.planContent}
          </span>
        )
      },
    },
    {
      title: "时间",
      dataIndex: "time",
      align: "left",
      width: "100px",
      className: "th-alignCenter",
      render: (value, record) => {
        return <span>{value}</span>
      },
    },
    {
      title: "地点",
      dataIndex: "place",
      align: "left",
      width: "15%",
      className: "th-alignCenter",
      render: (value, record) => {
        return <span>{value}</span>
      },
    },
    {
      title: "主持部门",
      dataIndex: "departmentName",
      align: "left",
      width: "15%",
      className: "th-alignCenter",
      render: (value, record) => {
        return <span>{value}</span>
      },
    },
  ]
  componentDidMount() {
    if (this.props.isOpen) {
      this.getDetail()
    }
    let testNum = null
    if (testNum.length > 1) {
      console.log("报错")
    }
    // console.log(a)
  }
  componentDidUpdate(preProps) {
    if (!preProps.isOpen && this.props.isOpen) {
      // 打开
      this.getDetail()
    }
  }
  // 获取编辑详情
  getDetail = () => {
    let obj = {
      weeklyRoutineId: this.props.id,
    }
    this.setState({ loading: true })
    this.$axios
      .get("api/weekly/general/info/detail", {
        params: obj,
      })
      .then((res) => {
        if (res.code == 200) {
          let data = res.data
          data.dateRange =
            moment(data.startDate).format("yyyy/MM/DD") +
            " ~ " +
            moment(data.endDate).format("yyyy/MM/DD")
          data.generalWeeklyPlanVoList.forEach((item) => {
            item.dateStr =
              moment(item.planDate).format("M月D日") +
              `(${
                weekdays[
                  new Date(moment(item.planDate).format("yyyy-MM-DD")).getDay()
                ]
              })`
          })
          this.dealRowSpan(data.generalWeeklyPlanVoList)
          this.setState({
            detail: data,
            loading: false,
          })
        }
      })
  }
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
  }
  // 关闭弹窗
  closeLayer = () => {
    this.props.onClose && this.props.onClose()
  }
  render() {
    let { isOpen } = this.props
    let {
      loading,
      detail: {
        partitionName = "",
        title = "",
        dateRange = "",
        headPicture = "",
        userName = "",
        generalWeeklyPlanVoList = [],
      },
    } = this.state
    return (
      <MyPopLayer
        isOpen={isOpen}
        loading={loading}
        width={920}
        height={630}
        title="详情"
        className="detailLayer"
        onIconClose={this.closeLayer}
      >
        <div className="detailLayer_top">
          <span className="top_partition">{partitionName}</span>
          <b className="top_title" title={title}>
            {title}
          </b>
        </div>
        <div className="detailLayer_second">
          <span className="second_dateRange">
            <i className="dateIcon"></i>
            {dateRange}
          </span>
          <span className="second_userInfo">
            由
            <span
              className="userInfo_avatar"
              style={{ backgroundImage: `url(${headPicture})` }}
            ></span>
            {userName}发布
          </span>
        </div>
        <MyTable
          columns={this.tableColumns}
          data={generalWeeklyPlanVoList}
          bordered
          emptyTextTip="请选择起止时间"
        />
      </MyPopLayer>
    )
  }
}

export default App
