/**
 * @description 获取当前主题色
 * @author wenjiahui
 * @returns [defaultColor,hoverColor,clickColor]
 * 2023-11-13
 */

import { useEffect,useState } from "react"
import BG_s1 from './images/s1_bg.png'
import BG_s2 from './images/s2_bg.png'
import BG_s3 from './images/s3_bg.png'
import BG_s4 from './images/s4_bg.png'
import BG_s5 from './images/s5_bg.png'
import BG_s6 from './images/s6_bg.png'

export const SKIN_DEFAULT_COLOR={
    "s1":'#083E79',
    "s2":'#0290FD',
    "s3":'#003CB2',
    "s4":'#036638',
    "s5":'#4C40AB',
    "s6":'#A60808'
}

export const SKIN_HOVER_COLOR={
    "s1":'#396594',
    "s2":'#35a6fe',
    "s3":'#3363c2',
    "s4":'#358560',
    "s5":'#7066bc',
    "s6":'#b83939'
}

export const SKIN_CLICK_COLOR={
    "s1":'#063261',
    "s2":'#0273cb',
    "s3":'#00308f',
    "s4":'#358560',
    "s5":'#3d3389',
    "s6":'#b83939'
}

export const SKIN_BG={
    "s1":BG_s1,
    "s2":BG_s2,
    "s3":BG_s3,
    "s4":BG_s4,
    "s5":BG_s5,
    "s6":BG_s6
}

export const SKIN_BG_COLOR={
    "s1":'#F4F6F9',
    "s2":'#F1F7FF',
    "s3":'#F4F6FB',
    "s4":'#F4F8F6',
    "s5":'#F8F7FB',
    "s6":'#FAF4F4',
}

var SKIN_BORDER_COLOR={
    "s1":'#c3d1df',
    "s2":'#b2d4ff',
    "s3":'#c2d0ed',
    "s4":'#c2dacf',
    "s5":'#d4d1eb',
    "s6":'#e6c3c4'
}

const INIT_STATE={
    defaultColor:SKIN_DEFAULT_COLOR['s2'],
    hoverColor:SKIN_HOVER_COLOR['s2'],
    clickColor:SKIN_CLICK_COLOR['s2'],
    borderColor:SKIN_BORDER_COLOR['s2'],
    bgColor:SKIN_BG_COLOR['s2'],
    bg:SKIN_BG['s2']
}

export default function useGetThem(type){
    const [them, setThem] = useState(INIT_STATE)

    useEffect(() => { 
        const defaultColor=SKIN_DEFAULT_COLOR[type]
        const hoverColor=SKIN_HOVER_COLOR[type]
        const clickColor=SKIN_CLICK_COLOR[type]
        const bgColor=SKIN_BG_COLOR[type]
        const bg=SKIN_BG[type]
        const borderColor=SKIN_BORDER_COLOR[type]
        them['defaultColor']=defaultColor
        them['hoverColor']=hoverColor
        them['clickColor']=clickColor
        them['bgColor']=bgColor
        them['bg']=bg
        them['borderColor']=borderColor
        setThem(them)
     },[type])

    return them
}