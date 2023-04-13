import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LinksContext } from '../App';
import Loading from '../components/Loading';
import Warning from '../components/Warning';
const QuizI = require('react-quiz-component');
const Quiz = QuizI.default;


// // @ts-ignore
// remark.macros.img = function (altText, width) {
//     var url = this;
//     return '<img alt="' + altText + '" src="' + url + '" style="width: ' + width + '" />';
//   };


// this is the component that renders the markdown content
export const LinkComponent = {
    // blockquotes used for warnings
    // @ts-ignore
    blockquote({node, children, ...props}) {
        return <Warning content={children}/>
    },

    // @ts-ignore
    a({node, children, ...props}) {
        /* eslint-disable */
        const links = useContext(LinksContext)
        const link = props.href

        // if links point to a quiz, we load the quiz component. this is subject to change
        if (link.toLowerCase().includes('quiz') && link.toLowerCase().includes('.json')) {
            const [quizData, setQuizData] = useState(null);

            useEffect(() => {
                const fetchQuizData = async () => {
                try {
                    const response = await fetch(link);
                    const data = await response.json();
                    setQuizData(data);
                    } catch (error) {
                    console.error('Failed to fetch quiz data', error);
                }
                };

                fetchQuizData();
            }, [quizData]);

            if (!quizData) {
                return <Loading isLoading={true} />
            }

            return (
                <span id={link.split(/.*[\/|\\]/)[1]} className='quiz-container'>
                    <Quiz quiz={quizData} shuffle={true} />
                </span>
            );
        }

        var found = link.match('\\$(.*)\\$');
        // if link is a link to another page, we render a react router link
        if (found) {
            //@ts-ignore
            const foundLink = links.find((l) => {return l['key'] == found[1]})
            if (foundLink) {
                if (foundLink['link']) {
                    return <a href={foundLink['link']} target="_blank" rel="noreferrer">{children}</a>
                } else if(foundLink['slug']) {
                    return <Link to={foundLink['slug']}>{children}</Link>
                } else {
                    return <Link to={props.href || ''}>{children}</Link>
                }
            } else {
               return <Link to={props.href || ''}>{children}</Link>
            }
        } else {
            // if link is a mailto link, we render it as a mailto link and prevent default
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
        // we include a custom tag in the alt text to specify the size of the image
        /*
        * matches the following:
        * alt: text, size: 50x60 or alt: text, size: 50%x60px 
        * or
        * alt: text, width: 50vh
        * maybe later: alt.match('alt:\\s([\\w\\s\-\_\*]*),?\\s?(size:\\s((\\d*)x(\\d*)))?,?\\s?(width:\\s(\\d*))?,?\\s?(float: (\\w*))?');
        */
        // the regex captures the following groups:
        // 1: alt text
        // 2: size: 50x60
        // 3: 50% x 60px
        // 4: 50
        // 5: %
        // 6: 60
        // 7: px
        // 8: width: 50vh
        // 9: 50
        // 10: vh
        var found = alt.match('alt: (.*), (size: ((\\d*)([a-zA-Z%]{1,4})?x(\\d*)([a-zA-Z%]{1,4})?))?(width: (\\d*)([a-zA-Z%]{1,4})?)?');
        
        // if we found a match, we add the size to the style tag
        let style;
        if (found) {
            // if we found a width tag, we use that
            if (found[9]) {
                let width = found[9];
                if(found[10]) width+=found[10];
                else width += 'px';
                // TODO: width / height tag do not officially support units. FF and Chrome work with %, but add to style="width: {width};" tag...
                style={width : width}
            // else it is a width x height tag and we use the respective units
            } else {
                let width  = found[4];
                let height = found[6];
                if(found[5])  width+=found[5];
                else width += 'px';
                if(found[7]) height+=found[7];
                else height += 'px';
                style={width : width, height : height}
            }
            
            return <span className="md-img" style={style}> 
                <img src={props.src} alt={found[1]}/> <br></br>
                <span>{found[1]}</span>
            </span>
        } else {
            return <span className="md-img" style={style}> 
                <img src={props.src} alt={props.alt}/>  <br></br>
                <span>{props.alt}</span>
            </span>
        }
    }
}
