import React, { Component, PropTypes } from 'react'
import selectn from 'selectn'

import classNames from 'classnames'

import Pagination from 'views/components/Navigation/Pagination'

import { MenuItem, SelectField, TextField } from 'material-ui'

import UIHelpers from 'common/UIHelpers'
import IntlService from 'views/services/intl'

const intl = IntlService.instance
/**
 * HOC: Adds pagination to a grid list
 */
export default function withPagination(ComposedFilter, pageSize = 10, pageRange = 10) {
  class PaginatedGridList extends Component {
    static defaultProps = {
      disablePageSize: false,
    }

    static propTypes = {
      appendControls: PropTypes.any, // TODO: set appropriate propType
      disablePageSize: PropTypes.bool,
      fetcher: PropTypes.func.isRequired,
      fetcherParams: PropTypes.object.isRequired,
      metadata: PropTypes.object.isRequired,
    }

    constructor(props, context) {
      super(props, context)

      this.state = {
        pageRange: pageRange,
        initialPageSize: selectn('fetcherParams.pageSize', props) || pageSize,
        currentPageSize: selectn('fetcherParams.pageSize', props) || pageSize,
        currentPageIndex: 1,
      }
      ;['_onPageChange', '_onPageSizeChange', '_onGoToPage', '_getPageSizeControls'].forEach(
        (method) => (this[method] = this[method].bind(this))
      )
    }

    _onPageSizeChange(event, index, value) {
      const currentPageSize = value

      this.props.fetcher(
        Object.assign({}, this.props.fetcherParams, {
          currentPageIndex: this.state.currentPageIndex,
          pageSize: currentPageSize,
        })
      )

      this.setState({ currentPageSize: currentPageSize })
    }

    shouldComponentUpdate() {
      return false
    }

    _changePage(newPageIndex) {
      this.props.fetcher(
        Object.assign({}, this.props.fetcherParams, {
          currentPageIndex: newPageIndex,
          pageSize: this.state.currentPageSize,
        })
      )

      this.setState({ currentPageIndex: newPageIndex })

      // For longer pages, user should be taken to the top when changing pages
      document.body.scrollTop = document.documentElement.scrollTop = 0
    }

    _onPageChange(pagination) {
      this._changePage(pagination.selected + 1)
    }

    _onGoToPage(event) {
      let newPageIndex = event.target.value
      const maxPageIndex = Math.ceil(selectn('resultsCount', this.props.metadata) / this.state.currentPageSize)

      if (newPageIndex > maxPageIndex) {
        newPageIndex = maxPageIndex
      }

      this._changePage(newPageIndex)
    }

    render() {
      const pageSizeControl = this.props.disablePageSize ? null : this._getPageSizeControls()

      return (
        <div>
          <div className="row">
            <div className="col-xs-12">
              <ComposedFilter {...this.state} {...this.props} />
            </div>
          </div>

          <div className="row PrintHide" style={{ marginTop: '15px' }}>
            <div className={classNames('col-md-7', 'col-xs-12')} style={{ paddingBottom: '15px' }}>
              <Pagination
                forcePage={this.props.fetcherParams.currentPageIndex - 1}
                pageCount={selectn('pageCount', this.props.metadata)}
                marginPagesDisplayed={0}
                pageRangeDisplayed={UIHelpers.isViewSize('xs') ? 3 : 10}
                onPageChange={this._onPageChange}
              />
            </div>

            <div className={classNames('col-md-5', 'col-xs-12')} style={{ textAlign: 'right' }}>
              {pageSizeControl}
              {this.props.appendControls}
            </div>

            <div
              className={classNames('col-xs-12')}
              style={{
                textAlign: 'left',
                backgroundColor: '#f1f1f1',
                borderTop: '1px #d8d8d8 solid',
              }}
            >
              Skip to Page:
              <TextField
                style={{ paddingLeft: '5px' }}
                underlineStyle={{ width: '80px' }}
                hintText="Enter #"
                onEnterKeyDown={this._onGoToPage}
              />
            </div>
          </div>
        </div>
      )
    }

    _getPageSizeControls() {
      return (
        <div>
          <label style={{ verticalAlign: '4px', marginRight: '8px' }}>Page:</label>
          <span style={{ verticalAlign: '4px' }}>
            {this.props.fetcherParams.currentPageIndex} /{' '}
            {Math.ceil(selectn('resultsCount', this.props.metadata) / this.state.currentPageSize)}
          </span>
          <label
            style={{
              verticalAlign: '4px',
              marginRight: '8px',
              marginLeft: '8px',
              paddingLeft: '8px',
              borderLeft: '1px solid #e0e0e0',
            }}
          >
            Per Page:
          </label>
          <SelectField
            style={{ width: '45px', marginRight: '8px' }}
            value={this.state.currentPageSize}
            onChange={this._onPageSizeChange}
          >
            <MenuItem value={10} primaryText={10} />
            <MenuItem value={20} primaryText={20} />
            <MenuItem value={50} primaryText={50} />
            <MenuItem value={100} primaryText={100} />
            <MenuItem value={250} primaryText={250} />
            <MenuItem value={500} primaryText={500} />
          </SelectField>
          <label
            style={{
              verticalAlign: '4px',
              marginRight: '8px',
              paddingLeft: '8px',
              borderLeft: '1px solid #e0e0e0',
            }}
          >
            {intl.trans('results', 'Results', 'first')}:
          </label>
          <span style={{ verticalAlign: '4px' }}>{selectn('resultsCount', this.props.metadata)}</span>
        </div>
      )
    }
  }

  return PaginatedGridList
}
