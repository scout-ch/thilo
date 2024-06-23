import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LinksContext } from '../../App';
import Loading from '../Loading';
import Blockquote from './Blockquote';
//@ts-ignore
import Quiz from 'react-quiz-component'
import cx from 'classnames'


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
        return <Blockquote content={children}/>
    },
    // @ts-ignore
    table({node, children, ...props}) {
        return <div className='table-wrapper'><table>{children}</table></div>
    },
    // @ts-ignore
    a({node, children, ...props}) {
        /* eslint-disable */
        const links = useContext(LinksContext)
        const link = props.href
        const [quizData, setQuizData] = useState(null);

        // if links point to a quiz, we load the quiz component. this is subject to change
        if (link.toLowerCase().includes('quiz') && link.toLowerCase().includes('.json')) {

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
            }, []);

            if (!quizData) {
                return <Loading isLoading={true} />
            }

            return (
                <span id={link.split(/.*[\/|\\]/)[1]} className='quiz-container'>
                    <Quiz quiz={quizData} shuffle={true} />
                </span>
            );
        }
        // if link is a mailto link, we render it as a mailto link and prevent default
        var mailto = link.match('(mailto:)')
        if (mailto?.length >= 0 && mailto[1]) {
            return <Link to='#' onClick={(e) => {
                window.location = props.href;
                e.preventDefault();
            }}>{children}</Link>
        }
        // external links begin with http or https
        if(link.match(/^(http|https):/)) {
            return <Link to={link} target='_blank' rel='noopener noreferrer'>{children}</Link>
        } else {
            // internal links are resolved using the links context
            const link = links.find((l) => l.slug === props.href);
            return <Link to={link!.slug || props.href}>{children}</Link> 
        }
    },
    // @ts-ignore
    img({node, children, ...props}) {
        const alt = props.alt
        // we include a custom tag in the alt text to specify the caption and sizing of the image
        /* imitating css syntax: 
            tag: value;
            i.e.:
            caption: text; width: value; height: value;
        */
        
        /* super complicated regex:
        /^(?=.*\b(caption:\s*(.*?))\s*;)(?:(?=.*\b(width:\s*(\d+px))\s*;)|(?=.*\bheight:\s*(\d+px)\s*;))?(?=.*\bcaption:\s*(.*?)\s*;).*?(?:\bwidth:\s*(\d+px)\s*;)?\s*(?:\bheight:\s*(\d+px)\s*;)?$/gm
        matches:
        caption: text; width: value; height: value; // in any order!
        */

        /* much simpler:
        (\w+):\s*([^;]+);
        matches:
        tag: value;
        then just iterate over the matches
        */

        // global regex to match all tag: value; pairs
        const regex = new RegExp(/(\w+):\s*([^;]+);/g);
        var matches = alt.match(regex);

        // initialize styles and caption for typescript compiler
        let styles: any, caption;
        if (matches) {
            // define styles, otherwise can't use styles[tag] = value
            styles = {};
            matches.forEach((match: string) => {
                // split tag: value; into tag and value
                let tag_value = match.split(':');
                if (tag_value) {
                    // remove whitespace and ;
                    let tag = tag_value[0].trim();
                    let value = tag_value[1].replace(';', '').trim();
                    if (tag === 'caption' || tag === 'alt') {
                        caption = value;
                    } else {
                        styles[tag] = value.replace(' ', '');
                    }
                }
            });
            
            const discardNonNum = (str: string) => +str.replace(/[^0-9]/g, '');
            let width  = styles['width'];
            let height = styles['height'];
            if (width)  width = discardNonNum(width);
            if (height) height = discardNonNum(height);
            
            // console.log(styles);
            delete styles['width'];
            delete styles['height'];
            let margin_class = 'mb-2';
            if (styles['float']) {
                if (styles['float'] === 'right') {
                    margin_class = cx(margin_class, 'ml-2');
                } else if (styles['float'] === 'left') {
                    margin_class = cx(margin_class, 'mr-2');
                }
            }
            // console.log(styles);
            return <span className={cx("md-img", margin_class)} style={styles}> 
                <img src={props.src} alt={caption} width={width} height={height}/> <br></br>
                <span className='text-small text-italic'>{caption}</span>
            </span>
        } else {
            return <span className="md-img mb-4"> 
                <img src={props.src} alt={props.alt}/>  <br></br>
                <span className='text-small text-italic'>{props.alt}</span>
            </span>
        }
    }
}
