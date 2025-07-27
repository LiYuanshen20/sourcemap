
/**
 * @props { Array } data 数据列表
 * @props { String } value 选中的value
 * @props { String } keyValue 默认为“value”，value的字段名
 * @props { String } keyLabel 默认为“label”，显示的字段名称
 * @props { Function } onChange 点击的回调 (item) => {}
*/
import React, { Component } from 'react'
import './index.scss'
class BtnScrollSelect extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentPage: 1,
            data: [],
            schoolLevel: props.schoolLevel,
            total: props.total
        }
    }
    componentWillReceiveProps (nextProps) {
        let obj = {
            ...nextProps
        }
        obj.keyValue = obj.keyValue || 'value'
        obj.keyLabel = obj.keyLabel || "label"
        obj.pageSize = obj.pageSize ? parseInt(obj.pageSize) : 4
        if (nextProps.data != this.state.data) {
            obj.currentPage = 1
        }
        this.setState(obj)
    }
    // 左翻页
    pageLeft () {
        if (this.state.currentPage == 1) {
            return
        }
        this.setState({
            currentPage: this.state.currentPage - 1
        })
    }
    // 右翻页
    pageRight () {
        let {
            data,
            pageSize
        } = this.state
        if (this.state.currentPage == Math.ceil(data.length / pageSize)) {
            return
        }
        this.setState({
            currentPage: this.state.currentPage + 1
        })
    }
    itemClick (item) {
        if (typeof this.props.onChange === 'function') {
            this.props.onChange(item)
        }
    }
    render () {
        let {
            data,
            keyValue,
            keyLabel,
            value,
            currentPage,
            pageSize,
            itemStyle,
            schoolLevel,
        } = this.state
        if (schoolLevel === '1') {
            pageSize = 20
        }
        if (!Array.isArray(data)) {
            return ''
        }
        let RenderData = []
        for (let i = (currentPage - 1) * pageSize; i < currentPage * pageSize && i < data.length; i++) {
            RenderData.push(data[i])
        }
        return (<div
            className="BtnScrollSelect"
        // style={data.length > pageSize?{width: 85 * pageSize + 35 + 'px'}: {}}
        >
            {schoolLevel === '1' ?
                <div className='leftSelectBox'>
                    <ul className='ulBox'>
                        {
                            RenderData.map((item, index) => {
                                return <li
                                    className={` leftListItem ${item[keyValue] === value ? 'universityActive' : ''} ${(index == pageSize - 1) || (index == data.length - 1) ? 'lastChild' : ''}`}
                                    style={itemStyle ? { ...itemStyle } : {}}
                                    title={item[keyLabel]}
                                    onClick={() => { this.itemClick(item) }}
                                >
                                    <div className='text'>
                                        <p className={`${item[keyValue] === value ? 'activeRound' : 'round'}`}></p>
                                        <p className='label'>{item[keyLabel]}<span className='num'>({item.count})</span></p>
                                    </div>
                                </li>
                            })
                        }
                    </ul>
                    {
                        data.length > 20 ?
                            <div className="change_btn university_btn">
                                <i
                                    className={`leftlogo ${currentPage == 1 ? 'disable' : ''}`}
                                    onClick={() => { this.pageLeft() }}
                                ></i>
                                <i
                                    className={`rightlogo ${currentPage == Math.ceil(data.length / pageSize) ? 'disable' : ''}`}
                                    onClick={() => { this.pageRight() }}
                                ></i>
                            </div> :
                            ''
                    }
                </div> : <div>
                    {
                        RenderData.map((item, index) => {
                            return <div
                                className={`btn_item ${item[keyValue] === value ? 'active' : ''} ${(index == pageSize - 1) || (index == data.length - 1) ? 'lastChild' : ''}`}
                                style={itemStyle ? { ...itemStyle } : {}}
                                title={item[keyLabel]}
                                onClick={() => { this.itemClick(item) }}
                            >
                                <div className="label">{item[keyLabel]}</div>
                                <div className="sharp"></div>
                            </div>
                        })
                    }
                    {
                        data.length > pageSize ?
                            <div className={schoolLevel === '1' ? 'change_btn university_btn' : 'change_btn'}>
                                <i
                                    className={`leftlogo ${currentPage == 1 ? 'disable' : ''}`}
                                    onClick={() => { this.pageLeft() }}
                                ></i>
                                <i
                                    className={`rightlogo ${currentPage == Math.ceil(data.length / pageSize) ? 'disable' : ''}`}
                                    onClick={() => { this.pageRight() }}
                                ></i>
                            </div> :
                            ''
                    }
                </div>}
        </div>)
    }
}

export default BtnScrollSelect