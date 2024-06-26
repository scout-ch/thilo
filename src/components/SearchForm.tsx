import React, { useEffect, useMemo, useState } from 'react';
import { withTranslation } from "react-i18next";
import Loading from './Loading';
import { SearchHelper } from '../utils/SearchHelper';
import { useNavigate, useLocation } from 'react-router';
import type { ChapterT } from '../components/Chapter';
import type { SectionT } from '../components/Section';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import strip_md from 'strip-markdown';
import { remark } from 'remark';

import { LinkComponent } from './markdown/MarkdownComponents';
import SearchInput from './SearchInput';
import { Link } from 'react-router-dom';

// @ts-ignore
// to retain markdown without html:
// import * as strip_html from 'remark-strip-html';

type Props = {
    t: any,
    sections: SectionT[]
    minKeyWordLength?: number
}

type SearchResult = {
    id: number
    title: string
    matchingContents: string[]
    slug_with_section: string
    section: SectionT
}

function SearchForm({ t, sections, minKeyWordLength = 3 }: Props) {
    const location = useLocation();
    const navigate = useNavigate();

    // stateful keyword, search results and timeout id
    const [keyword, setKeyword] = useState<string>('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();
    const [isLoadingResults, setIsLoadingResults] = useState<boolean>(false);

    // memoized searchable chapters
    const searchableSectionChapters = useMemo<ChapterT[]>(
        () => sections.reduce(
            (chapters: ChapterT[], currentSection: SectionT) => 
            chapters.concat(currentSection.chapters), []
        ), [sections]
    );

    // update keyword from route if it changes
    useEffect(() => {
        const routeParams = new URLSearchParams(location.search);
        const keywordFromRoute = routeParams.get('keyword');
        if (keywordFromRoute) {
            setKeyword(keywordFromRoute);
        }
    }, [location.search]);

    // build search results when keyword changes or searchable chapters change
    useEffect(() => {
        const buildSearchResults = () => {
            setIsLoadingResults(true);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            if (!keyword || keyword.length < minKeyWordLength) {
                // only search for keywords with where keyword length is met
                setSearchResults([]);
                setIsLoadingResults(false);
                // else show empty search page
                navigate({ search: '' });
                return;
            }

            // search for keyword in chapters for up to 500ms
            setTimeoutId(
                setTimeout(async () => {
                    const searchResults = await Promise.all(
                        searchableSectionChapters
                            .filter(chapter => SearchHelper.matches(keyword, [chapter.title, chapter.content]))
                            .map(async (chapter) => {
                                const matchingContents = await findMatchingContents(keyword, chapter.content);
                                return {
                                    id: chapter.id,
                                    title: chapter.title,
                                    matchingContents,
                                    slug_with_section: chapter.slug_with_section,
                                    section: sections.find(section => section.id === chapter.section)
                                } as SearchResult;
                            })
                    );
                    setSearchResults(searchResults);
                    setIsLoadingResults(false);

                    // update route if keyword changed
                    const routeParams = new URLSearchParams(location.search);
                    if (routeParams.get('keyword') !== keyword) {
                        routeParams.set('keyword', keyword);
                        navigate({ search: routeParams.toString() });
                    }
                }, 500)
            );
        };
        buildSearchResults();
        // one of the dependencies would constantly cause a rerender, so ignore!
        // eslint-disable-next-line
    }, [keyword, searchableSectionChapters]);

    // update keyword when input changes
    const onChangeKeyword = (e: React.FormEvent<HTMLInputElement>): void => {
        setKeyword(e.currentTarget?.value ?? '');
    }

    // find matching contents in chapter content for keyword
    const findMatchingContents = (keyword: string, content: string): Promise<string[]> => {
        let result = remark().use(strip_md).process(content).then(
            (stripped_content) => {
                const matches = [...String(stripped_content)
                    .matchAll(new RegExp(`[^.!?:;#\n]*(?=${keyword}).*?[.!?\n](?=\s?|$)`, 'gmi')
                )] // eslint-disable-line no-useless-escape
                let result = matches.reduce((searchResults: string[], currentMatches: RegExpMatchArray) => searchResults.concat(currentMatches), [])
                result = [...new Set(result)]
                // highlight matching contents
                result = result.map((e) => {
                    let r = e.replace(new RegExp(keyword, 'gi'), '**$&**')
                    return r
                })
                return result;
            } 
        );
        return result;
    }

    // render search results or loading indicator or no results message or no keyword message
    const searchResultViews = () => {
        if (!isLoadingResults) {
            if (keyword.length >= minKeyWordLength) {
                if (searchResults.length > 0) {
                    // render results
                    return searchResults.map(result => {
                        return <div key={result.id} className='search-result border rounded'>
                            <div className='title-match'  style={{color: result.section.color_primary}}>
                                <Link to={`/${result.section.slug}`} className='color-fg-inherit'> 
                                    {result.section.title}
                                </Link>
                                &nbsp;/&nbsp;
                                <Link to={`/${result.slug_with_section}`}  className='color-fg-inherit'>
                                    {result.title}
                                </Link>
                            </div>
                            {result.matchingContents.length > 0 ?
                                <div className='content-match'>
                                    {result.matchingContents.map((content, idx) => {
                                        return <ReactMarkdown key={idx} 
                                            remarkPlugins={[remarkGfm]} 
                                            components={LinkComponent} 
                                            children={content}
                                            className='border-bottom'
                                        />
                                    })}
                                </div>
                                : null
                            }
                        </div>
                    });
                }
                // show no results message if no results were found or timeout was reached
                return <div>{t('searchPage.noResults')}</div>;
            }
            // show no keyword message if keyword is empty or is too short
            return <div> {t('searchPage.noKeyword', { amountOfCharacters: minKeyWordLength })}</div>;
        }
        return null;
    }

    return (
        <>
            <SearchInput keyword={keyword} onChange={onChangeKeyword} />
            <br />
            <Loading isLoading={isLoadingResults}></Loading>
            <div className='search-results'>
                {searchResultViews()}
            </div>
        </>
    );
}

export default withTranslation()(SearchForm);
