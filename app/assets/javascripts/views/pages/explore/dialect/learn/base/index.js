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
import React, { Component, PropTypes } from 'react';
import Immutable, { List, Set, Map } from 'immutable';
import selectn from 'selectn';
import ProviderHelpers from 'common/ProviderHelpers';
import NavigationHelpers from 'common/NavigationHelpers';
import IntlService from 'views/services/intl';

const intl = IntlService.instance;
const innerUlStyle = {
  fontSize: '0.9em',
  margin: 0,
  padding: '0 15px'
};

/**
 * Learn Base Page
 * TODO: Convert to composition vs. inheritance https://facebook.github.io/react/docs/composition-vs-inheritance.html
 */
export default class PageDialectLearnBase extends Component {
  constructor(props, context) {
    super(props, context);
  }

  _onNavigateRequest(path, absolute = false) {
    if (absolute) {
      NavigationHelpers.navigate(path, this.props.pushWindowPath, false);
    } else {
      if (this.props.hasPagination) {
        NavigationHelpers.navigateForward(
          this.props.splitWindowPath.slice(0, this.props.splitWindowPath.length - 2),
          [path],
          this.props.pushWindowPath
        );
      } else {
        NavigationHelpers.navigateForward(this.props.splitWindowPath, [path], this.props.pushWindowPath);
      }
    }
  }

  _getURLPageProps() {
    let pageProps = {};

    selectn('page', this.props.routeParams)
      ? Object.assign(pageProps, { DEFAULT_PAGE: parseInt(selectn('page', this.props.routeParams)) })
      : null;
    selectn('pageSize', this.props.routeParams)
      ? Object.assign(pageProps, { DEFAULT_PAGE_SIZE: parseInt(selectn('pageSize', this.props.routeParams)) })
      : null;

    return pageProps;
  }

  _handleFilterChange(visibleFilter) {
    this.setState({ visibleFilter });
  }

  // Fetch data on initial render
  componentDidMount() {
    this.fetchData(this.props);
  }

  // Refetch data on URL change
  componentWillReceiveProps(nextProps) {
    if (nextProps.windowPath !== this.props.windowPath) {
      this.fetchData(nextProps);
    }
  }

  _handleFacetSelected(facetField, categoryId, childrenIds, event, checked) {
    let currentCategoryFilterIds = this.state.filterInfo.get('currentCategoryFilterIds');

    let categoryFilter = '';
    let newList;
    let childrenIdsList = new Set(childrenIds);

    // Adding filter
    if (checked) {
      newList = currentCategoryFilterIds.add(categoryId);

      if (childrenIdsList.size > 0) {
        newList = newList.merge(childrenIdsList);
      }
    } else {
      // Removing filter
      newList = currentCategoryFilterIds.delete(currentCategoryFilterIds.keyOf(categoryId));

      if (childrenIdsList.size > 0) {
        newList = newList.filter(function(v, k) {
          return !childrenIdsList.includes(v);
        });
      }
    }

    // Category filter
    if (newList.size > 0) {
      categoryFilter = ` AND ${ProviderHelpers.switchWorkspaceSectionKeys(facetField, this.props.routeParams.area)}/* IN ("${newList.join('","')}")`;
      /* categoryFilter =
        ' AND ' +
        ProviderHelpers.switchWorkspaceSectionKeys(facetField, this.props.routeParams.area) +
        '/* IN ("' +
        newList.join('","') +
        '")';
      */
    }

    let newFilter = this.state.filterInfo.updateIn(['currentCategoryFilterIds'], () => {
      return newList;
    });
    newFilter = newFilter.updateIn(['currentAppliedFilter', 'categories'], () => {
      return categoryFilter;
    });

    // Update filter description based on if categories exist or don't exist
    if (newList.size > 0) {
      newFilter = newFilter.updateIn(['currentAppliedFiltersDesc', 'categories'], () => {
        return " match the categories you've selected ";
      });
    } else {
      newFilter = newFilter.deleteIn(['currentAppliedFiltersDesc', 'categories']);
    }

    // Update page properties to use when navigating away
    this._handlePagePropertiesChange({ filterInfo: newFilter });

    // When facets change, pagination should be reset.
    // In these pages (words/phrase), list views are controlled via URL
    this._resetURLPagination();

    this.setState({ filterInfo: newFilter });
  }

  // Called when facet filters or sort order change.
  // This needs to be stored in the 'store' so that when people navigate away and back, those filters still apply
  _handlePagePropertiesChange(changedProperties) {
    this.props.updatePageProperties({ [this._getPageKey()]: changedProperties });
  }

  _resetURLPagination(pageSize = null) {
    let newPageSize = pageSize || selectn('pageSize', this.props.routeParams);

    // If URL pagination exists, reset
    if (newPageSize) {
      NavigationHelpers.navigateForwardReplaceMultiple(
        this.props.splitWindowPath,
        [newPageSize.toString(), 1],
        this.props.pushWindowPath
      );
    }
  }
}
