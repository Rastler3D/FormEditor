import {TemplateInfo} from "../types/template";

export const searchTemplate = async (params: {
    query: string,
    page: number,
    pageSize: number,
    filters: Record<string, string[]>,
    sorting: string,
}) => {
    const {query, page, pageSize, filters, sorting} = params;
    const filterString = Object.entries(filters)
        .map(([key, value]) => `${key} IN [${value.join(', ')}]`)
        .join(' AND ');

    const results = await meiliSearchClient.index('templates').search(query, {
        limit: pageSize,
        offset: (page - 1) * pageSize,
        filter: filterString,
        sort: [`${sorting.field}:${sorting.direction}`],
    });

    return {
        hits: results.hits as TemplateInfo[],
        totalHits: results.nbHits,
        totalPages: Math.ceil(results.nbHits / pageSize),
        page: results.page,
        hitsPerPage: results.hitsPerPage,
        
    };
}