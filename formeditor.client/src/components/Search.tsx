import {createResource, createSignal, For, Match, Show, Switch} from "solid-js";
import {TextField, TextFieldInput} from "~/components/ui/text-field.tsx";

interface SearchProps {
    query?: string;
    filters?: Record<string, string[]>;
    sorting?: string;
    pageSize?: number;
    page: number;
    onQueryChange?: (query: string) => void;
    onFiltersChange?: (filters: Record<string, string[]>) => void;
    onSortingChange?: (sort?: string) => void;
    onPageSizeChange?: (pageSize: number) => void;
    onPageChange?: (page: number) => void;
}

function Search(props: SearchProps) {
    const [view, setView] = createSignal<'table' | 'gallery'>('table');
    const [tags] = createResource(fetchTags);
    const [topics] = createResource(fetchTopics);

    const [searchResults] = createResource(
        () => ({
            query: props.query ?? "",
            page: props.page ?? 0,
            pageSize: props.pageSize ?? 12,
            filters: props.filters ?? {},
            sorting: props.sorting ?? "createdAt:desc",
        }),

}

)
;

return (
    <div class="container mx-auto p-4">
        <h1 class="text-3xl font-bold mb-4">Search Templates</h1>
        <div class="flex flex-col md:flex-row gap-4 mb-4">
            <div class="w-full md:w-3/4">
                <SearchInput value={props.query} onInput={props.onQueryChange}/>
            </div>
            <div class="w-full md:w-1/4">
                <ViewToggle view={view()} onToggle={setView}/>
            </div>
        </div>
        <div class="flex flex-col md:flex-row gap-4">
            <div class="w-full md:w-1/4">
                <FilterPanel
                    filters={props.filters}
                    onFilterChange={props.onFiltersChange}
                    tags={tags()}
                    isTagsLoading={tags.loading}
                    topics={topics()}
                    isTopicsLoading={tags.loading}/>
            </div>
            <div class="w-full md:w-3/4">
                <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div class="mb-4">
                        <SortingDropdown value={props.sorting} onChange={props.onSortingChange}/>
                    </div>
                    <div class="flex items-center gap-2">
                        <PageSizeSelector pageSize={props.pageSize} onPageSizeChange={props.onPageSizeChange}/>
                    </div>
                    <Show when={searchResults()}>
                        {(result) => (
                            <p class="text-sm text-gray-500">
                                Showing {((result.page() - 1) * props.hitsPerPage()) + 1} - {Math.min((result.page() * props.hitsPerPage()), searchResults()?.totalHits || 0)} of {searchResults()?.totalHits} results
                            </p>
                        )}
                    </Show>
                </div>
                <Switch>
                    <Match when={view() === 'table'}>
                        <TemplateTable templates={searchResults()?.hits} isLoading={searchResults.loading}}/>
                    </Match>
                    <Match when={view() === 'gallery'}>
                        <TemplateGallery templates={searchResults()?.hits} isLoading={searchResults.loading}}/>
                    </Match>
                </Switch>
                <Pagination
                    count={searchResults()?.totalPages || 1}
                    page={props.page}
                    onPageChange={(page) => props.onPageChange?.(page)}
                    itemComponent={(props) => <PaginationItem page={props.page}>{props.page}</PaginationItem>}
                    ellipsisComponent={() => <PaginationEllipsis/>}
                    class="flex items-center space-x-2"
                >
                    <PaginationPrevious/>
                    <PaginationItems/>
                    <PaginationNext/>
                </Pagination>
            </div>
        </div>
    </div>
)
    ;
}

export default Search;

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "~/components/ui/dropdown-menu.tsx";
import {Button} from "~/components/ui/button.tsx";
import {ArrowDown, ArrowUp, Grid, LayoutGrid} from "lucide-solid";

export const ViewToggle = (props: {
    view: string;
    onToggle: (view: string) => void;
}) => {

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    {props.view === 'table' ? <Grid class="h-4 w-4"/> : <LayoutGrid class="h-4 w-4"/>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => props.onToggle('table')}>
                    <Grid class="mr-2 h-4 w-4"/> Таблица
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => props.onToggle('gallery')}>
                    <LayoutGrid class="mr-2 h-4 w-4"/> Плитки
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
};

import {debounce} from '@solid-primitives/scheduled';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card.tsx";
import {Combobox} from "@kobalte/core/combobox";
import {ProgressCircle} from "~/components/ui/progress-circle.tsx";
import {
    ComboboxContent,
    ComboboxControl,
    ComboboxInput,
    ComboboxItem, ComboboxItemIndicator, ComboboxItemLabel,
    ComboboxTrigger
} from "~/components/ui/combobox.tsx";
import {fetchTags, fetchTopics} from "~/services/api.ts";
import TemplateTable from "~/components/TemplateTable.tsx";
import TemplateGallery from "~/components/TemplateGallery.tsx";
import {
    Pagination,
    PaginationEllipsis,
    PaginationItem,
    PaginationItems,
    PaginationNext,
    PaginationPrevious
} from "./ui/pagination";

export const SearchInput = (props: {
    value?: string;
    onInput?: (value: string) => void;
}) => {
    const debouncedOnInput = debounce((value: string) => props.onInput?.(value), 300);

    return (
        <TextField value={props.value} onChange={(value) => debouncedOnInput(value)}>
            <TextFieldInput
                type="search"
                placeholder={'Search templates...'}
                class="h-9 w-full border rounded p-2"
            />
        </TextField>
    );
};

export const SortingDropdown = (props: {
    value?: string;
    onChange?: (value: string) => void;
}) => {
   

    const options = {
        "createdAt:desc": "Newest First",
        "createdAt:asc": "Oldest First",
        "filledCount:desc": "Popular First",
        "filledCount:asc": "Unpopular First",
        "name:asc": "Name (A-Z)",
        "name:desc": "Name (Z-A)"
    } as Record<string, string>

    return (
        <Select
            value={props.value}
            onChange={(value) => props.onChange?.(value ?? "createdAt:desc")}
            options={Object.keys(options)}
            itemComponent={(props) => (
                <SelectItem item={props.item} class="p-2 cursor-pointer hover:bg-accent">
                    <SelectValue>{options[props.item.rawValue]}</SelectValue>
                </SelectItem>
            )}
        >
            <SelectTrigger>
                <SelectValue<string>>{(state)=> options[state.selectedOption()]}</SelectValue>
            </SelectTrigger>
            <SelectContent/>
        </Select>
    );
};

export const PageSizeSelector = (props: {
    pageSize?: number;
    onPageSizeChange?: (pageSize: number) => void;
}) => {
    const options = [12, 24, 48, 96]

    return (
        <Select<number>
            value={props.pageSize}
            onChange={(pageSize) => props.onPageSizeChange?.(pageSize ?? 0)}
            options={options}
            itemComponent={(props) => (
                <SelectItem item={props.item} class="p-2 cursor-pointer hover:bg-accent">
                    <SelectValue>{props.item.rawValue} per page</SelectValue>
                </SelectItem>
            )}
        >
            <SelectTrigger>
                <SelectValue>{props.pageSize} per page</SelectValue>
            </SelectTrigger>
            <SelectContent/>
        </Select>
    );
}

export const FilterPanel = (props: {
    tags?: string[];
    topics?: string[];
    isTagsLoading: boolean;
    isTopicsLoading: boolean;
    filters?: Record<string, string[]>;
    onFilterChange?: (filters: Record<string, string[]>) => void;
}) => {

    return (
        <Card class="w-full lg:w-1/4">
            <CardHeader>
                <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div>
                    <h4 class="font-bold mb-2">Tags</h4>
                    <Show when={!props.isTagsLoading} fallback={<ProgressCircle showAnimation/>}>
                        <Combobox<string>
                            options={props.tags ?? []}
                            value={props.filters?.tags || []}
                            onChange={(value) => props.onFilterChange?.({...props.filters, tags: value})}
                            placeholder="Select tags"
                            multiple
                            itemComponent={(props) => (
                                <ComboboxItem item={props.item}>
                                    <ComboboxItemLabel>{props.item.rawValue}</ComboboxItemLabel>
                                    <ComboboxItemIndicator/>
                                </ComboboxItem>
                            )}
                        >
                            <ComboboxControl<string> aria-label="Tags"
                                                     class="flex items-center text-sm ring-offset-background placeholder:text-muted-foreground has-[:focus]:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full p-2 text-left bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded shadow-sm has-[:focus]:outline-none has-[:focus]:ring-2 has-[:focus]:ring-blue-500">
                                {state => (
                                    <>
                                        <div class="flex items-center gap-2 flex-wrap p-2 w-full">
                                            <For each={state.selectedOptions()}>
                                                {(option) => (
                                                    <span onPointerDown={e => e.stopPropagation()}
                                                          class="bg-zinc-100 dark:bg-zinc-700 text-sm px-2 py-0.5 rounded inline-flex items-center gap-x-2">
                                                    {option}
                                                        <button tabIndex="-1" onClick={() => state.remove(option)}
                                                                class="ml-1 text-blue-600 hover:text-blue-800">&times;</button>
                                                    </span>
                                                )}
                                            </For>
                                            <ComboboxInput/>
                                        </div>
                                        <ComboboxTrigger/>
                                    </>
                                )}
                            </ComboboxControl>
                            <ComboboxContent
                                class="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded shadow-lg"/>
                        </Combobox>
                    </Show>

                </div>
                <div>
                    <h4 class="font-bold mb-2">Topics</h4>
                    <Show when={!props.isTopicsLoading} fallback={<ProgressCircle showAnimation/>}>
                        <Combobox<string>
                            options={props.topics ?? []}
                            value={props.filters?.topics || []}
                            onChange={(value) => props.onFilterChange?.({...props.filters, topics: value})}
                            placeholder="Select tags"
                            multiple
                            itemComponent={(props) => (
                                <ComboboxItem item={props.item}>
                                    <ComboboxItemLabel>{props.item.rawValue}</ComboboxItemLabel>
                                    <ComboboxItemIndicator/>
                                </ComboboxItem>
                            )}
                        >
                            <ComboboxControl<string> aria-label="Tags"
                                                     class="flex items-center text-sm ring-offset-background placeholder:text-muted-foreground has-[:focus]:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full p-2 text-left bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded shadow-sm has-[:focus]:outline-none has-[:focus]:ring-2 has-[:focus]:ring-blue-500">
                                {state => (
                                    <>
                                        <div class="flex items-center gap-2 flex-wrap p-2 w-full">
                                            <For each={state.selectedOptions()}>
                                                {(option) => (
                                                    <span onPointerDown={e => e.stopPropagation()}
                                                          class="bg-zinc-100 dark:bg-zinc-700 text-sm px-2 py-0.5 rounded inline-flex items-center gap-x-2">
                                                    {option}
                                                        <button tabIndex="-1" onClick={() => state.remove(option)}
                                                                class="ml-1 text-blue-600 hover:text-blue-800">&times;</button>
                                                    </span>
                                                )}
                                            </For>
                                            <ComboboxInput/>
                                        </div>
                                        <ComboboxTrigger/>
                                    </>
                                )}
                            </ComboboxControl>
                            <ComboboxContent
                                class="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded shadow-lg"/>
                        </Combobox>
                    </Show>

                </div>
            </CardContent>
        </Card>

    );
};