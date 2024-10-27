import {useSearchParams} from "@solidjs/router";
import Search from "~/components/Search.tsx";

const SearchPage = () => {
    const [queryParams, setQueryParams] = useSearchParams();

    return (
        <Search
            query={queryParams.query ?? ""}
            pageSize={Number(queryParams.pageSize ?? 12)}
            page={Number(queryParams.page ?? 1)}
            sorting={queryParams.sort ?? "createdAt:desc" }
            filters={{tags: queryParams.tags?.split(",") ?? [], topic: queryParams.topic?.split(",") ?? []}}
            onQueryChange={query => setQueryParams({query})}
            onPageSizeChange={pageSize => setQueryParams({pageSize})}
            onPageChange={page => setQueryParams({page})}
            onSortingChange={sort => setQueryParams({sort})}
            onFiltersChange={({tags, topic}) => setQueryParams({tags: tags?.join(","), topic: topic?.join(",")})}
        />
    )
}

export default SearchPage;