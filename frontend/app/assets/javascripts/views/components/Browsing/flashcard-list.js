/*
Copyright 2016 First People's Cultural Council

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React, { Component, PropTypes } from 'react'
import { List, Map } from 'immutable'
import selectn from 'selectn'
import IntlService from 'views/services/intl'

export default class FlashcardList extends Component {
  static propTypes = {
    items: PropTypes.oneOfType([PropTypes.array, PropTypes.instanceOf(List)]),
    filteredItems: PropTypes.oneOfType([PropTypes.array, PropTypes.instanceOf(List)]),
    fields: PropTypes.instanceOf(Map),
    columns: PropTypes.array.isRequired,
    type: PropTypes.string,
    theme: PropTypes.string,
    action: PropTypes.func,
    cols: PropTypes.number,
    cellHeight: PropTypes.number,
    wrapperStyle: PropTypes.object,
    style: PropTypes.object,
    flashcardTitle: PropTypes.string,
  }

  static defaultProps = {
    columns: [],
    cols: 3,
    cellHeight: 210,
    wrapperStyle: null,
    style: null,
    flashcardTitle: '',
  }

  intl = IntlService.instance

  constructor(props, context) {
    super(props, context)
    ;['_generateFlashcards'].forEach((method) => (this[method] = this[method].bind(this)))
  }
  componentDidMount() {
    document.body.classList.add('PrintFlashcards')
  }
  componentWillUnmount() {
    document.body.classList.remove('PrintFlashcards')
  }

  render() {
    const { columns } = this.props
    const items = this.props.filteredItems || this.props.items

    if (selectn('length', items) === 0) {
      return (
        <div style={{ margin: '20px 0' }}>
          {this.intl.translate({
            key: 'no_results_found',
            default: 'No Results Found',
            case: 'first',
            append: '.',
          })}
        </div>
      )
    }

    const content = this._generateFlashcards({ items, columns })
    return (
      <div className="FlashcardList">
        <div className="FlashcardListIntroduction alert alert-info PrintHide">
          Note: This simplified presentation is designed for printing Flashcards.
        </div>
        {content}
      </div>
    )
  }

  _generateFlashcards(obj) {
    const { items, columns } = obj
    return (items || []).map((item, i) => (
      <div className={`Flashcard Flashcard${i} ${i % 3 === 0 && i !== 0 ? 'PrintPageBreak' : ''}`} key={i}>
        {(columns || []).map((column, j) => {
          const cellValue = selectn(column.name, item)
          const cellRender = typeof column.render === 'function' ? column.render(cellValue, item, column) : cellValue

          if (column.name === 'title') {
            return (
              <div key={j} className="FlashcardTitle FlashcardData fontAboriginalSans">
                {cellRender}
              </div>
            )
          }
          if (column.name === 'fv:definitions') {
            return (
              <div key={j} className="FlashcardDefinitions FlashcardData">
                <div className="FlashcardDefinitionsMeta">
                  <div className="FlashcardDefinitionsDialect fontAboriginalSans">{this.props.flashcardTitle}</div>
                </div>
                <div className="FlashcardDefinition fontAboriginalSans">{cellRender}</div>
                <div className="FlashcardDefinitionsMeta">
                  <div className="FlashcardDefinitionsUrl">www.firstvoices.com</div>
                </div>
              </div>
            )
          }
          return null
        })}
      </div>
    ))
  }
}
