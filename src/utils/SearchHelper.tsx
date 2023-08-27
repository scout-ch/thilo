export class SearchHelper {
    // returns true if the given keywords match any of the given values
    static matches(keywords: string, ...values: any[]) {
        if (!keywords) {
            return true;
        }
        else {
            const keywordValues = [] as any[];
            const terms = keywords.split(' ').filter(t => t.length > 0);

            values.forEach(v => {
                this.extractKeywordValues(v, keywordValues);
            });

            return terms.every(term => {
                return keywordValues.some(value => this.contains(value, term));
            });
        }
    }

    // returns true if the given keyword string matches any of the given values exactly
    static matchesExact(keywords: string, ...values: any[]) {
        if (!keywords) {
            return true;
        }
        else {
            const keywordValues = [] as any[];

            values.forEach(v => {
                this.extractKeywordValues(v, keywordValues);
            });

            return keywordValues.some(value => this.contains(value, keywords));
        }
    }

    // get possible values for a given keyword recursively
    private static extractKeywordValues(value: any, keywordValues: any[]) {
        if (value instanceof Object) {
            Object.keys(value).forEach(key => {
                this.extractKeywordValues(value[key], keywordValues);
            });
        }
        else if (value !== undefined && value !== null) {
            keywordValues.push(value);
        }
    }

    // normalize and check if value contains term
    private static contains(value: any, term: string) {
        const str = (value || '').toString() as string;

        return this.normalize(str).includes(this.normalize(term));
    }

    // normalize string
    private static normalize(value: string) {
        return value.toLowerCase()
            .replace(/[éèë]/g, 'e')
            .replace(/[àáäã]/g, 'a')
            .replace(/[òóöõ]/g, 'o')
            .replace(/[ü]/g, 'u');
    }
}
