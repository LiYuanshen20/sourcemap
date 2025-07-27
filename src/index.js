import React from "react"
import ReactDOM from "react-dom"
import App from "./pages/app"
import axios from "./util/axios"
import "lancoo-web-ui/style"
import { ErrorBoundaryWrapper } from "lancoo-eyesdk"

// class 类组件中使用 this.$axios()
React.Component.prototype.$axios = axios
// function 函数组件中使用 const $axios = React.$axios
React.$axios = axios

const root = document.getElementById("root")
ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundaryWrapper>
      <App />
    </ErrorBoundaryWrapper>
  </React.StrictMode>,
  root
)
