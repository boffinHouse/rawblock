import React from 'react';
import createRbReactIsland from '../utils/react-island';

export default class ArticleMain extends React.PureComponent {

    render() {
        const { elemId, options } = this.props;

        return (
            <article className="mod_articlemain">
                some content {elemId}
                <p>
                    <pre>
                        {JSON.stringify(options, null, '\t')}
                    </pre>
                </p>
            </article>

        );
    }
}

createRbReactIsland('articlemain', ArticleMain, {name: ''});
