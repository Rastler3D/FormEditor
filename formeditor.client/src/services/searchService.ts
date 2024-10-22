import {searchClient} from "~/lib/meilisearch.ts";

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

    const results = await searchClient.index('templates').search(query, {
        page: page,
        hitsPerPage: pageSize,
        filter: filterString,
        sort: [sorting],
    });

    return results;
}