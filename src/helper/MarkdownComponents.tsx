import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { LinksContext } from '../App';
// import { HashLink } from 'react-router-hash-link';
import Warning from '../components/Warning';

// // @ts-ignore
// remark.macros.img = function (altText, width) {
//     var url = this;
//     return '<img alt="' + altText + '" src="' + url + '" style="width: ' + width + '" />';
//   };

export const LinkComponent = {
    // @ts-ignore
    blockquote({node, children, ...props}) {
        return <Warning content={children}/>
    },
    // @ts-ignore
    a({node, children, ...props}) {
        /* eslint-disable */
        const links = useContext(LinksContext)
        const link = props.href
        var found = link.match('\\$(.*)\\$');
        if (found) {
            //@ts-ignore
            const foundLink = links.find((l) => {return l['key'] == found[1]})
            if (foundLink) {
                if (foundLink['link']) {
                    return <a href={foundLink['link']} target="_blank" rel="noreferrer">{children}</a>
                } else if(foundLink['slug']) {
                    return <HashLink to={foundLink['slug']}>{children}</HashLink>
                } else {
                    return <Link to={props.href || ''}>{children}</Link>
                }
            } else {
               return <Link to={props.href || ''}>{children}</Link>
            }
        } else {
            var mailto = link.match('(mailto:)')
            if (mailto?.length >= 0 && mailto[1]) {
                return <Link to='#' onClick={(e) => {
                    window.location = props.href;
                    e.preventDefault();
                }}>{children}</Link>
            }
            return <Link to={props.href || ''}>{children}</Link>
        }
        /* eslint-enable */
    },
    // @ts-ignore
    img({node, children, ...props}) {
        const alt = props.alt
        /*
        * matches the following:
        * alt: text, size: 50x50
        * or
        * alt: text, width: 50
        * maybe later: alt.match('alt:\\s([\\w\\s\-\_\*]*),?\\s?(size:\\s((\\d*)x(\\d*)))?,?\\s?(width:\\s(\\d*))?,?\\s?(float: (\\w*))?');
        */
        var found = alt.match('alt: (.*), (size: ((\\d*)([a-zA-Z%]{1,4})?x(\\d*)([a-zA-Z%]{1,4})?))?(width: (\\d*)([a-zA-Z%]{1,4})?)?');
        

        let style;
        if (found) {
            if (found[9]) {
                let width = found[9];
                if(found[10]) width+=found[10];
                else width += 'px';
                // TODO: width / height tag do not officially support units. FF and Chrome work with %, but add to style="width: {width};" tag...
                style={width : width}
            } else {
                let width  = found[4];
                let height = found[6];
                if(found[5])  width+=found[5];
                else width += 'px';
                if(found[7]) height+=found[7];
                else height += 'px';
                style={width : width, height : height}
            }
            
            return <span className="md-img"> 
                <img src={props.src} alt={found[1]} style={style} /> <br></br>
                <span>{found[1]}</span>
            </span>
        } else {
            return <span className="md-img"> 
                <img src={props.src} alt={props.alt} style={style} />  <br></br>
                <span>{props.alt}</span>
            </span>
        }
    }
}
