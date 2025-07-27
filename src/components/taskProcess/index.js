// import { Modal } from 'antd'
import { Button, Modal } from 'antd'
import React, { Component } from 'react'
import Scrollbars from "react-custom-scrollbars"
import "./index.scss"
import "antd/dist/antd.min.css"
// import flowChartImg from './images/flowChart.png'
class App extends Component {
  constructor(props) {
    super(props)
  }
  state = {
    tipShow: false,
    modalVisible: false
  }
  // 控制弹窗显示
  changeModalVisible = (boolean) => {
    this.setState({
      modalVisible: boolean,
      tipShow: false
    })
  }
  render () {
    let {
      visible = true,
      width = 900,
      title = "任务流程 title",
      subtitle = "副标题 subtitle",
      description = "描述 description"
    } = this.props
    let { tipShow, modalVisible } = this.state
    return (
      <>
        <div
          className={`task_process_tip ${tipShow ? "show" : ""}`}
          style={{ visibility: visible ? "visible" : "hidden" }}
          onMouseEnter={tipShow ? null : () => this.setState({ tipShow: true })}
          onMouseLeave={() => this.setState({ tipShow: false })}
        >
          {
            tipShow ?
              <>
                <svg onClick={() => this.setState({ tipShow: false })} className="closelogo" xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8">
                  <path id="联合_350" data-name="联合 350" d="M-10386-2590.2l-3.2,3.2-.8-.8,3.2-3.2-3.2-3.2.8-.8,3.2,3.2,3.2-3.2.8.8-3.2,3.2,3.2,3.2-.8.8Z" transform="translate(10390.001 2594.999)" fill="#678ab4" />
                </svg>
                <p className="tip_title">{title}</p>
                <p className="tip_info">让您一张图预览{title}</p>
                <div className="detail_btn" onClick={() => this.changeModalVisible(true)}>了解一下</div>
              </> :
              <span className='vertical_text'>{title}</span>
          }
        </div>
        {/* <Modal title="Basic Modal" visible={true}>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Modal> */}
        <Modal
          width={parseInt(width) + 180}
          className="task_process_modal"
          visible={modalVisible}
          maskClosable={false}
          footer={null}
          centered={true}
          bodyStyle={{ height: '600px' }}
          onCancel={() => this.changeModalVisible(false)}
        >
          <p className='modal_title'>{title}</p>
          <Scrollbars autoHeight autoHeightMax={470}>
            <p className='modal_subtitle'>{subtitle}</p>
            <div className='modal_description'>{description}</div>
            <p className='modal_subtitle'>{title}图解</p>
            <div className='flowChartImg'></div>
            <div className='modal_btn' onClick={() => this.changeModalVisible(false)}>我知道了</div>
          </Scrollbars>
        </Modal>
      </>
    )
  }
}

export default App