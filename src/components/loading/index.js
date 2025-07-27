import React, { Component } from "react";
import { LgLoadingCircleRotation } from "lancoo-web-ui";
import "./index.scss";
class Loading extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		let {
			text = "正在加载...",
			width = "100%",
			height = "100%",
      className = ""
		} = this.props;
		return (
			<div
				className={`my_loading ${className}`}
				style={{
					width,
					height
				}}
			>
        <LgLoadingCircleRotation text={text} />
			</div>
		);
	}
}

export default Loading;
