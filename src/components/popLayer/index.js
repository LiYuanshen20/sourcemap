import React, { Component } from 'react';
import { LgPopLayer } from "lancoo-web-ui";
import Loading from '../loading'
import './index.scss'
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {  }
  }
  render() { 
    let {
      children,
      loading = false,
      loadingText = '加载中...',

      width,
      height,
      title,
      zIndex = 1050,
      className,
      copy = false,
      isOpen = false,
      isCoverLayerClickClose = false,
      isShowBottom = false,
      confirmText,
      cancelText,
      closeText,
      drawerWindow,
      onConfirm = () => {},
      onClose = () => {},
      onIconClose = () => {},
      onShowLayer = () => {},
    } = this.props
    return (
      <LgPopLayer
      width={width}
      height={height}
      title={title}
      zIndex={zIndex}
      copy={copy}
      drawerWindow={drawerWindow}
      className={`${className} myLgPopLayer`}
      isOpen={isOpen}
      isCoverLayerClickClose={isCoverLayerClickClose}
      isShowBottom={isShowBottom}
      confirmText={confirmText}
      cancelText={cancelText}
      closeText={closeText}
      onConfirm={onConfirm}
      onClose={onClose}
      onIconClose={onIconClose}
      onShowLayer={onShowLayer}
    >
      {
        loading?
        <Loading className="popLayer_loading" text={loadingText} />:
        ""
      }
      <div className='popLayer_children'>
        { children }
      </div>
    </LgPopLayer>
    );
  }
}
 
export default App;