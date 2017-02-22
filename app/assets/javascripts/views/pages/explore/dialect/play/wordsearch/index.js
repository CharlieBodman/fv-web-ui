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
import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import Immutable, { List, Map } from 'immutable';
import provide from 'react-redux-provide';
import selectn from 'selectn';

import PromiseWrapper from 'views/components/Document/PromiseWrapper';
import ProviderHelpers from 'common/ProviderHelpers';

import Game from 'views/pages/explore/dialect/play/wordsearch/wrapper'

/**
* Play games
*/
@provide
export default class Wordsearch extends Component {

  static propTypes = {
    fetchCharacters: PropTypes.func.isRequired,
    computeCharacters: PropTypes.object.isRequired,
    fetchWords: PropTypes.func.isRequired,
    computeWords: PropTypes.object.isRequired,
    routeParams: PropTypes.object.isRequired
  }

  /**
   * Constructor
   */
  constructor(props, context) {
    super(props, context);
  }

  /**
   * componentDidMount
   */
  componentDidMount () {
    // Fetch fetch data
    this.fetchData(this.props);
  }

  /**
   * Fetch list of characters
   */
  fetchData(props, pageIndex, pageSize, sortOrder, sortBy) {
    props.fetchCharacters(props.routeParams.dialect_path + '/Alphabet',
    '&currentPageIndex=0' + 
    '&pageSize=100' + 
    '&sortOrder=asc' + 
    '&sortBy=fvcharacter:alphabet_order');

    // TODO: Add filters to word query.
    props.fetchWords(props.routeParams.dialect_path + '/Dictionary', '&pageSize=19');
  }

  /**
   * Render
   */
  render() {

    let game = '';

    const computeEntities = Immutable.fromJS([{
      'id': this.props.routeParams.dialect_path + '/Alphabet',
      'entity': this.props.computeCharacters
    },
    {
      'id': this.props.routeParams.dialect_path + '/Dictionary',
      'entity': this.props.computeWords
    }])

    const computeCharacters = ProviderHelpers.getEntry(this.props.computeCharacters, this.props.routeParams.dialect_path + '/Alphabet');
    const computeWords = ProviderHelpers.getEntry(this.props.computeWords, this.props.routeParams.dialect_path + '/Dictionary');

    const alphabet_string = (selectn('response.entries', computeCharacters) || []).map(function(char) {
      return selectn('properties.dc:title', char);
    }).join('');

    const word_array = (selectn('response.entries', computeWords) || []).map(function(word) {
      return selectn('properties.dc:title', word);
    });

    const word_obj_array = selectn('response.entries', computeWords);

    console.log(alphabet_string);
    console.log(word_array);
    console.log(word_obj_array);

    if (alphabet_string.length > 0 && word_array.length > 0) {
      game = <Game characters={alphabet_string} words={word_array} />;
    }

    return <PromiseWrapper renderOnError={true} computeEntities={computeEntities}>
            <div className="row">
              <div className="col-xs-12">
                <h1>Word Search</h1>
                {game}
              </div>
            </div>
        </PromiseWrapper>;
  }
}