import {useSearchParams} from "@solidjs/router";
import Search from "~/components/Search.tsx";

const SearchPage = () => {
    const [queryParams, setQueryParams] = useSearchParams();

    return (
        <Search
            query={queryParams.query}
            pageSize={Number(queryParams.pageSize)}
            page={Number(queryParams.page)}
            sorting={queryParams.sort}
            filters={{tags: queryParams.tags?.split(",") ?? [], topics: queryParams.topics?.split(",") ?? []}}
            onQueryChange={query => setQueryParams({query})}
            onPageSizeChange={pageSize => setQueryParams({pageSize})}
            onPageChange={page => setQueryParams({page})}
            onSortingChange={sort => setQueryParams({sort})}
            onFiltersChange={({tags, topics}) => setQueryParams({tags: tags?.join(","), topics: topics?.join(",")})}
        />
    )
}

export default SearchPage;