import { LgTable, LgPaginationA, lgAlert } from 'lancoo-web-ui';
import React, { Component } from 'react';
import EmptyImg from '../../images/empty.png'
import Loading from '../loading';
import './index.scss'
class App extends Component {
  constructor(props) {
    super(props);
  }
  state = {  }
  render() {
    // columns data
    let { 
      emptyClassName = '',
      emptyTextImg = EmptyImg,
      emptyTextTip = "",
      loading = false,
      loadingText,

      paginationOptions = {}
    } = this.props
    let {
      total = 0,
      currentPage = 0,
      onChangePage = (page) => {},
    } = paginationOptions
    if(loading){
      // return <Loading text={loadingText} height="470px" />
      return <div></div>
    }
    return (
      <div className='myTable_container'>
        <LgTable
          emptyText={() => (
            <div className={`myTable_empty_container ${emptyClassName}`}>
              <img className='myTable_empty_img' src={emptyTextImg} />
              {
                emptyTextTip?
                <p className='myTable_empty_text'>{emptyTextTip}</p>:
                ""
              }
            </div>
          )}
          {...this.props}
        />
        {
          total > 1?
          <LgPaginationA
          className='my_pagination'
          total={total}
          size="normal"
          currentPage={currentPage}
          onChangePage={onChangePage}
          errorPage={() => {
            lgAlert.show({
              content: `最多只有${total}页`,
              tipType: "error"
            })
          }}
          />:
          ""
        }
      </div>
    );
  }
}
 
export default App;