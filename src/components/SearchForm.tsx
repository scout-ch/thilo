import React, { useEffect, useMemo, useState } from 'react'
import { withTranslation } from "react-i18next"
import Loading from './Loading'
import { SearchHelper } from '../utils/SearchHelper';
import { useNavigate, useLocation, createPath } from 'react-router';
import type { ChapterT } from '../components/Chapter';
import type { SectionT } from '../components/Section';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LinkComponent } from '../utils/MarkdownComponents';
import SearchInput from './SearchInput';

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
}


function SearchForm(props: Props) {
    const location = useLocation()
    const navigate = useNavigate()
    const { t, sections } = props;
    
    // stateful keyword, search results and timeout id
    const [keyword, setKeyword] = useState<string>('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>()
    const [isLoadingResults, setIsLoadingResults] = useState<boolean>(false)
    
    // memoized searchable chapters
    const searchableSectionChapters = useMemo<ChapterT[]>(() => sections.reduce((chapters: ChapterT[], currentSection: SectionT) => chapters.concat(currentSection.chapters), []), [sections]);
    
    // minimum keyword length
    const minKeywordLength = props.minKeyWordLength ?? 3;

    // update keyword from route if it changes
    useEffect(() => {
        const routeParams = new URLSearchParams(location.search)
        const keywordFromRoute = routeParams.get('keyword')
        if (keywordFromRoute) {
            setKeyword(keywordFromRoute)
        }
    }, [location.search])

    // build search results when keyword changes or searchable chapters change
    useEffect(() => {
        const buildSearchResults = () => {
            setIsLoadingResults(true)
            if (timeoutId) {
                clearTimeout(timeoutId)
            }

            if (!keyword || keyword.length < minKeywordLength) {
                // only search for keywords with where keyword length is met
                setSearchResults([])
                setIsLoadingResults(false)
                // else show empty search page
                navigate({ search: '' })
                return
            }

            // search for keyword in chapters for up to 500ms
            setTimeoutId(setTimeout(() => {
                const searchResults = searchableSectionChapters
                    .filter(chapter => SearchHelper.matches(keyword, [chapter.title, chapter.content]))
                    .map(chapter => {
                        return {
                            id: chapter.id,
                            title: chapter.title,
                            matchingContents: findMatchingContents(keyword, chapter.content),
                            slug_with_section: chapter.slug_with_section
                        } as SearchResult
                    })
                setSearchResults(searchResults)
                setIsLoadingResults(false)

                // update route if keyword changed
                const routeParams = new URLSearchParams(location.search)
                if (routeParams.get('keyword') !== keyword) {
                    routeParams.set('keyword', keyword)
                    navigate({ search: routeParams.toString() })
                }
            }, 500))
        }
        buildSearchResults()
    }, [keyword, searchableSectionChapters])  // eslint-disable-line react-hooks/exhaustive-deps

    // update keyword when input changes
    const onChangeKeyword = (e: React.FormEvent<HTMLInputElement>): void => {
        setKeyword(e.currentTarget?.value ?? '')
    }

    // find matching contents in chapter content for keyword
    const findMatchingContents = (keyword: string, content: string): string[] => {
        const matches = Array.from(content.matchAll(new RegExp(`[^.!?:;#\n]*(?=${keyword}).*?[.!?](?=\s?|\p{Lu}|$)`, 'gmi'))) // eslint-disable-line no-useless-escape
        return matches.reduce((searchResults: string[], currentMatches: RegExpMatchArray) => searchResults.concat(currentMatches), [])
    }

    // render search results or loading indicator or no results message or no keyword message
    const searchResultViews = () => {
        if (!isLoadingResults) {
            if (keyword.length >= minKeywordLength) {
                if (searchResults.length > 0) {
                    // render results
                    return searchResults.map(result => {
                        return <div key={result.id} className='search-result'>
                            <div className='title-match'>
                                <a href={createPath({ pathname: '#/' + result.slug_with_section })}>{result.title}</a>
                            </div>
                            {result.matchingContents.length > 0 ?
                                <div className='content-match'>
                                    {result.matchingContents.map((content, idx) => {
                                        return <ReactMarkdown key={idx} remarkPlugins={[remarkGfm]} components={LinkComponent}>{content}</ReactMarkdown>
                                    })}
                                </div>
                                : null
                            }
                        </div>
                    })
                }
                // show no results message if no results were found or timeout was reached
                return <div>{t('searchPage.noResults')}</div>
            }
            // show no keyword message if keyword is empty or is too short
            return <div> {t('searchPage.noKeyword', { amountOfCharacters: minKeywordLength })}</div>
        }
        return null
    }

    return <>
        <SearchInput keyword={keyword} onChange={onChangeKeyword} />
        <br />
        <Loading isLoading={isLoadingResults}></Loading>
        <div className='search-results'>
            {searchResultViews()}
        </div>
    </>
}
export default withTranslation()(SearchForm)
