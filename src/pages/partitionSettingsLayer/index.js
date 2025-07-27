import React, { Component } from 'react';
import MyPopLayer from '../../components/popLayer'
import { MyInput } from '../../components/formComp'
import './index.scss'
import { lgAlert } from 'lancoo-web-ui';
import { showMsgAlert, showMsgModal } from '../../util/showAlertMethod';
class App extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    loading: true,
    isAddPartition: false,
    addPartitionName: "",
    partitionList: [],
  }
  componentDidMount(){
    if(this.props.isOpen){
      this.getPartitionList()
    }
  }
  componentDidUpdate(preProps){
    if(preProps.isOpen && !this.props.isOpen){ // 关闭
      this.handleAddPartition("restore")
    }else if(!preProps.isOpen && this.props.isOpen){ // 打开
      this.getPartitionList()
    }
  }
  // 获取分区列表
  getPartitionList = () => {
    let userInfo = JSON.parse(sessionStorage.getItem("userInfo"))
    let obj = {
      schoolId: userInfo.schoolId,
      schoolLevel: userInfo.schoolLevel
    }
    this.setState({ loading: true })
    this.$axios.get("api/weekly/general/partition/list",{
      params: obj
    }).then(res => {
      if(res.code == 200 && Array.isArray(res.data)){
        this.setState({
          partitionList: res.data,
          loading: false
        })
      }
    })
  }
  // 修改新增分区名称
  changePartitionName = (e) => {
    let value = e.target.value
    this.setState({ addPartitionName: value })
  }
  // 分区管理 确定|删除
  handleAddPartition = (type, item) => {
    let partitionList = this.state.partitionList
    switch(type){
      case "confirm":
        if(partitionList.length >= 30){
          showMsgAlert("最多添加30个分区");
          return
        }
        let userInfo = JSON.parse(sessionStorage.getItem("userInfo"))

        let confirmAlert = showMsgAlert("正在添加分区", "loading")

        this.$axios.post("api/weekly/general/partition/save", {
          partitionName: this.state.addPartitionName,
          schoolId: userInfo.schoolId,
          schoolLevel: userInfo.schoolLevel
        }).then(res => {
          lgAlert.close(confirmAlert.index)
          if(res.code == 200){
            showMsgAlert("添加分区成功", "success")
            this.getPartitionList()
            this.handleAddPartition("restore")
          }else{
            showMsgAlert(res.msg || "添加失败")
          }
        })
        break;
      case "delete":
        if(partitionList.length == 1){
          showMsgAlert("至少需要存在一个分区")
          return
        }
        showMsgModal({
          content: <span>确定要删除"<span style={{color: "#ff6600"}}>{item.partitionName}</span>"分区吗？</span>,
          description: "删除后该分区内的数据将全部删除",
          tipType: "question",
          onConfirm: () => {this.handleAddPartition("deleteConfirm", item)}
        })
        break;
      case "deleteConfirm":
        let deleteAlert = showMsgAlert(`正在删除"${item.partitionName}"分区`, "loading")
        this.$axios.delete("api/weekly/general/partition/del", {
          params: { partitionId: item.partitionId}
        }).then(res => {
          lgAlert.close(deleteAlert.index)
          if(res.code == 200){
            showMsgAlert("删除分区成功", "success")
            this.getPartitionList()
            this.handleAddPartition("restore")
          }else{
            showMsgAlert(res.msg || "删除失败")
          }
        })
        break;
      case "restore":
        this.setState({
          addPartitionName: "",
          isAddPartition: false
        })
        break;
      default:
        return
    }
  }
  // 关闭弹窗
  closeLayer = () => {
    this.props.onClose && this.props.onClose(this.state.partitionList)
  }
  render() {
    let {
      isOpen,
    } = this.props
    let {
      loading,
      isAddPartition,
      addPartitionName,
      partitionList,
    } = this.state
    return (
      <MyPopLayer
      isOpen={isOpen}
      loading={false}
      width={560}
      height={320}
      title="分区设置"
      onIconClose={this.closeLayer}
      >
        {
          isAddPartition?
          <div className='add_partition_container'>
            <MyInput
              className='myInput'
              placeholder='请输入分区名称'
              value={addPartitionName} 
              maxLength={8}
              onChange={this.changePartitionName}
            />
            <i className='handleIcon yesIcon' onClick={() => {this.handleAddPartition("confirm")}}></i>
            <i className='handleIcon' onClick={() => {this.handleAddPartition("restore")}}></i>
          </div>:
          <span className='add_partition_btn' onClick={() => {this.setState({ isAddPartition: true })}}>添加</span>
        }
        <div className='partition_list'>
          {
            partitionList.map(item => {
              return <span className='patition_item'>
                {item.partitionName}
                <i className='partition_delete' onClick={() => {this.handleAddPartition("delete", item)}}></i>
              </span>
            })
          }
        </div>
      </MyPopLayer>
    );
  }
}
 
export default App;