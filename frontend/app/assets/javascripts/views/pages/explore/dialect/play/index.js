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
import React, {Component} from 'react';
import classNames from 'classnames';
import IntlService from 'views/services/intl';

const intl = IntlService.instance;

/**
 * Play games
 */
export default class Play extends Component {

    constructor(props, context) {
        super(props, context);
    }

    render() {

        const isKidsTheme = this.props.routeParams.theme === 'kids';

        const cellStyle = {
            border: '1px solid #000'
        }
        return <div>
            <div className="row">
                <div className="col-xs-12">
                    <h1 className={classNames({'hidden': isKidsTheme})}>{intl.trans('games', 'Games', 'first')}</h1>
                    <div className="flex-container">
                        <div className="grid">
                            <div className="cell" style={cellStyle}>
                                <a href="./play/jigsaw"><img src="/assets/games/jigsaw/assets/images/preview.png"
                                                             className="responsive-image"/></a>
                            </div>
                            {/* <div className="cell" style={cellStyle}>
                                <a href="./play/colouringbook"><img
                                    src="/assets/games/colouring-book/assets/images/preview.png"
                                    className="responsive-image"/></a>
                            </div> */}
                            <div className="cell" style={cellStyle}>
                                <a href="./play/wordsearch"><img
                                    src="/assets/games/wordsearch/assets/images/preview.png"
                                    className="responsive-image"/></a>
                            </div>
                            <div className="cell" style={cellStyle}>
                                <a href="./play/wordscramble"><img src="/assets/images/preview-wordscramble.png"
                                                                   className="responsive-image"/></a>
                            </div>
                            {/* <div className="cell" style={cellStyle}>
                                <a href="./play/picturethis"><img
                                    src="/assets/games/picturethis/assets/images/preview.png"
                                    className="responsive-image"/></a>
                            </div> */}
                            <div className="cell" style={cellStyle}>
                                <a href="./play/hangman"><img src="/assets/games/hangman/assets/images/preview.png"
                                                              className="responsive-image"/></a>
                            </div>
                            <div className="cell" style={cellStyle}>
                                <a href="./play/concentration"><img src="/assets/games/memory/assets/images/preview.png"
                                                                    className="responsive-image"/></a>
                            </div>
                            <div className="cell" style={cellStyle}>
                                <a href="./play/quiz"><img src="/assets/images/preview-quiz.png"
                                                           className="responsive-image"/></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}