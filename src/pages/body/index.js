import React, { Component } from 'react'
import { lgAlert } from 'lancoo-web-ui'
import BtnScrollSelect from '../../components/BtnScrollSelect'
import MyTable from '../../components/table'
import Search from '../../components/search'
import PartitionSettingsLayer from '../partitionSettingsLayer'
import HandleCaseLayer from '../handleCaseLayer'
import DetailLayer from '../detailLayer'
import './index.scss'
import { showMsgAlert, showMsgModal } from '../../util/showAlertMethod'
import { getQueryVariable } from '../../util/public'

class App extends Component {
  constructor(props) {
    super(props)
  }
  state = {
    pageType: getQueryVariable("pageType"),

    currentPage: 1,
    pageSize: 8,
    total: 0,
    keyword: "",
    currentPartitionId: "",
    partitionList: [], // 分区列表
    tableList: [], // 表格列表
    tableLoading: true,
    partSetVisible: false, // 分区设置弹窗显隐
    handleCaseVisible: false, // 添加/编辑 周行事历弹窗显隐
    handleCaseLayerId: "", // 传进周行事历弹窗的id
    detailVisible: false, // 详情弹窗显隐
    detailId: "", // 传进详情弹窗的id
    schoolLevel: '', // 1为大学，2为中小学
  }
  tableColumns = [
    {
      dataIndex: "index",
      align: "center",
      width: 60,
      className: "table_index",
    },
    {
      title: "标题",
      dataIndex: "title",
      width: "calc(40% - 60px)",
      align: "left",
      ellipsis: true,
      className: "paddingNone",
      render: (value, record) => {
        return <div className='table_title' onClick={() => { this.openCaseDetail(record) }}>{value}</div>
      }
    },
    {
      title: "时间",
      dataIndex: "dateRange",
      width: "20%",
      align: "center",
      className: "table_dateRange",
    },
    {
      title: "创建者",
      dataIndex: "userInfo",
      width: "25%",
      align: "left",
      ellipsis: true,
      className: "table_th_userInfo",
      render: (value, record) => {
        return <span className='table_userInfo'>
          <span className="table_userInfo_avatar" style={{ backgroundImage: `url(${record.headPicture})` }}></span>
          <span className='table_userInfo_userName' title={`${record.userName}(${record.userId})`}>
            {record.userName}
            <span className='table_userInfo_userId'>({record.userId})</span>
          </span>
        </span>
      }
    },
    {
      title: "操作",
      dataIndex: "operate",
      width: "15%",
      align: "left",
      render: (value, record) => {
        return <span className='table_operate'>
          {
            this.state.pageType === "admin" ?
              <>
                <span className='table_operate_btn' onClick={() => this.openHandleCaseLayer(record.weeklyRoutineId)}>编辑</span>
                <span className='table_operate_split'></span>
                <span className='table_operate_btn table_operate_btn_del' onClick={() => this.deleteCase(record)}>删除</span>
              </> :
              <span className='table_operate_btn' onClick={() => this.openCaseDetail(record)}>详情</span>
          }
        </span>
      }
    },
  ]
  componentDidMount () {
    this.getPartitionList()

    // 不能删，首次打开LgAlert会有问题，会不显示
    let alert = showMsgAlert("进入页面")
    lgAlert.close(alert.index)
  }
  // 获取分区列表
  getPartitionList = () => {
    let userInfo = JSON.parse(sessionStorage.getItem("userInfo"))
    this.setState({
      schoolLevel: userInfo.schoolLevel
    })
    let obj = {
      schoolId: userInfo.schoolId,
      schoolLevel: userInfo.schoolLevel
    }
    this.$axios.get("api/weekly/general/partition/list", {
      params: obj
    }).then(res => {
      if (res.code == 200 && Array.isArray(res.data) && res.data.length > 0) {
        this.setState({
          partitionList: res.data,
          currentPartitionId: this.state.currentPartitionId || res.data[0].partitionId
        }, () => {
          this.getList()
        })
      }
    })
  }
  // 获取表格列表
  getList = () => {
    let {
      pageSize,
      currentPage,
      keyword,
      currentPartitionId
    } = this.state
    let obj = {
      pageSize,
      pageNum: currentPage,
      keyword,
      partitionId: currentPartitionId,
      schoolId: sessionStorage.getItem("schoolId")
    }
    this.setState({ tableLoading: true })
    this.$axios.get("api/weekly/general/list/page", {
      params: obj
    }).then(res => {
      if (res.code == 200 && Array.isArray(res.data)) {
        res.data.forEach((item, index) => {
          item.index = (currentPage - 1) * pageSize + index + 1
          item.dateRange = `${item.startDate.slice(0, 10).replaceAll("-", "/")
            } ~ ${item.endDate.slice(0, 10).replaceAll("-", "/")
            }`
        })
        this.setState({
          tableList: res.data,
          total: parseInt(res.total),
          tableLoading: false,
        })
      }
    })
  }
  // 修改筛选条件
  changeFilter = (obj) => {
    this.setState(obj, () => {
      this.getList()
    })
  }
  // 删除事例
  deleteCase = (data) => {
    showMsgModal({
      content: <span>确定要删除"<span style={{ color: "#ff6600" }}>{data.title}</span>"事例吗？</span>,
      description: "删除后数据将无法恢复",
      tipType: "question",
      onConfirm: () => {
        let alert = showMsgAlert("正在删除...", "loading")
        this.$axios.delete("api/weekly/general/manage/del", {
          params: { weeklyRoutineId: data.weeklyRoutineId }
        }).then(res => {
          lgAlert.close(alert.index)
          if (res.code == 200) {
            showMsgAlert("删除成功", "success")
            if (this.state.schoolLevel === '1') {
              this.getPartitionList()
            } else {
              this.getList()
            }
            if (this.state.total === 11) {
              this.setState({
                currentPage: 1
              })
              this.getList()
            }
          } else {
            showMsgAlert(res.msg || "删除失败")
          }
        })
      }
    })
  }
  // 关闭 分区设置 弹窗
  closePartitionSettingsLayer = (partitionList) => {
    let partitionId = this.state.currentPartitionId
    let havePart = false
    partitionList.forEach(item => {
      if (partitionId === item.partitionId) {
        havePart = true
      }
    })
    this.setState({
      partSetVisible: false,
      currentPartitionId: havePart ? partitionId : partitionList[0].partitionId,
      partitionList
    }, () => {
      if (!havePart) {
        this.getList()
      }
    })
  }
  // 打开 添加/编辑周行事历 弹窗
  openHandleCaseLayer = (id = "") => {
    this.setState({
      handleCaseVisible: true,
      handleCaseLayerId: id
    })
  }
  // 关闭 添加/编辑周行事历 弹窗
  closeHandleCaseLayer = () => {
    this.setState({ handleCaseVisible: false })
  }
  // 打开 事例详情 弹窗
  openCaseDetail = (data) => {
    this.setState({
      detailVisible: true,
      detailId: data.weeklyRoutineId
    })
  }
  render () {
    let {
      pageType,

      currentPartitionId,
      total,
      currentPage,
      pageSize,
      partitionList,
      tableList,
      tableLoading,
      partSetVisible,
      handleCaseVisible,
      handleCaseLayerId,
      detailVisible,
      detailId,
      schoolLevel,
    } = this.state
    let totalPage = Math.ceil(total / pageSize)
    return (
      <div className='my_body'>
        <div className='body_top'>
          <div className='top_left'>
            {schoolLevel === '1' ?
              <BtnScrollSelect
                schoolLevel={schoolLevel}
                data={partitionList}
                keyValue="partitionId"
                keyLabel="partitionName"
                value={currentPartitionId}
                onChange={(item) => { this.changeFilter({ currentPartitionId: item.partitionId }) }}
              /> : <BtnScrollSelect
                data={partitionList}
                keyValue="partitionId"
                keyLabel="partitionName"
                value={currentPartitionId}
                onChange={(item) => { this.changeFilter({ currentPartitionId: item.partitionId }) }}
              />
            }
            <p style={{marginLeft: '12px', color: '#999999'}} className={schoolLevel === '1' ? 'tipText' : 'tipText2'}>共<span style={{color: '#333333'}}>{total}</span>条</p>
          </div>
          <div className='top_right'>
            <Search
              searchMethod={value => { this.changeFilter({ keyword: value }) }}
              placeholder="搜索标题..."
            />
            {
              pageType === "admin" ?
                <>
                  <div className='right_btn partition_btn' onClick={() => { this.setState({ partSetVisible: true }) }}>分区设置</div>
                  <div className='right_btn' onClick={() => { this.openHandleCaseLayer() }}>添加周行事历</div>
                </> :
                ""
            }
          </div>
        </div>
        <MyTable
          className={schoolLevel === '1' ? 'my_table university_margin' : 'my_table'}
          columns={this.tableColumns}
          data={tableList}
          loading={tableLoading}
          paginationOptions={{
            num: total,
            total: totalPage,
            currentPage,
            onChangePage: (page) => { this.changeFilter({ currentPage: page }) }
          }}
        />

        {/* 分区设置 */}
        <PartitionSettingsLayer
          isOpen={partSetVisible}
          onClose={this.closePartitionSettingsLayer}
        />

        {/* 添加/编辑 周行事历 */}
        <HandleCaseLayer
          isOpen={handleCaseVisible}
          id={handleCaseLayerId}
          getList={this.getList}
          getPartitionList={schoolLevel === '1' ? this.getPartitionList : null}
          onClose={this.closeHandleCaseLayer}
        />

        {/* 详情 */}
        <DetailLayer
          isOpen={detailVisible}
          id={detailId}
          onClose={() => { this.setState({ detailVisible: false }) }}
        />

      </div>
    )
  }
}

export default App