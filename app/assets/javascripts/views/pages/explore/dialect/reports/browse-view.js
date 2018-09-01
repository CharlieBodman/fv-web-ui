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
import Immutable, { List, Map } from 'immutable';

import classNames from 'classnames';
import provide from 'react-redux-provide';
import selectn from 'selectn';

import ConfGlobal from 'conf/local.json';
import ReportsJson from './reports.json';

import ProviderHelpers from 'common/ProviderHelpers';
import StringHelpers from 'common/StringHelpers';

import AuthorizationFilter from 'views/components/Document/AuthorizationFilter';
import PageDialectLearnBase from 'views/pages/explore/dialect/learn/base';

import RaisedButton from 'material-ui/RaisedButton';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

import GeneralList from 'views/components/Browsing/general-list';
import {CardView} from './list-view';

import withFilter from 'views/hoc/grid-list/with-filter';
import IntlService from 'views/services/intl';

const intl = IntlService.instance;
const DEFAULT_LANGUAGE = 'english';

const FilteredCardList = withFilter(GeneralList);

/**
* Learn songs
*/
@provide
export default class ReportBrowser extends Component {

  static propTypes = {
    properties: PropTypes.object.isRequired,
    windowPath: PropTypes.string.isRequired,
    splitWindowPath: PropTypes.array.isRequired,
    pushWindowPath: PropTypes.func.isRequired,
    computeLogin: PropTypes.object.isRequired, 
    routeParams: PropTypes.object.isRequired,
    style: PropTypes.object,
    fullWidth: PropTypes.bool
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      filteredList: null
    };

    // Bind methods to 'this'
    ['_onNavigateRequest', 'fixedListFetcher'].forEach( (method => this[method] = this[method].bind(this)) );
  }

  fixedListFetcher(list) {
    this.setState({
      filteredList: list
    });
  }

  _onNavigateRequest(path) {
    this.props.pushWindowPath(path);
  }

  render() {

    let listProps = {
      filterOptionsKey: "Reports",
      fixedList: true,
      fixedListFetcher: this.fixedListFetcher,
      filteredItems: this.state.filteredList,
      fullWidth: this.props.fullWidth,
      style: {fontSize: '1.2em', padding: '8px 0 0 30px'},
      wrapperStyle: this.props.style,
      card: <CardView fullWidth={this.props.fullWidth} dialectPath={this.props.routeParams.dialect_path} />,
      area: this.props.routeParams.area,
      items: ReportsJson,
      action: this._onNavigateRequest
    };

    let listView = <FilteredCardList {...listProps} />;
    
    return listView;
  }
}
