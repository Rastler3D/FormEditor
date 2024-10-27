import {createResource, createSignal, For, Match, Show, Switch} from "solid-js";
import {TextField, TextFieldInput} from "~/components/ui/text-field";
import {Oval} from "solid-spinner";
import {debounce} from '@solid-primitives/scheduled';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select";
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card";
import {
    Combobox,
    ComboboxContent,
    ComboboxControl,
    ComboboxInput,
    ComboboxItem,
    ComboboxItemIndicator,
    ComboboxItemLabel,
    ComboboxTrigger
} from "~/components/ui/combobox";
import {Button} from "~/components/ui/button";
import {Grid, LayoutGrid, Search as SearchIcon, Filter, X} from "lucide-solid";
import {
    Pagination,
    PaginationEllipsis,
    PaginationItem,
    PaginationItems,
    PaginationNext,
    PaginationPrevious
} from "~/components/ui/pagination";
import {fetchTags, fetchTopics} from "~/services/templateService";
import {searchTemplate} from "~/services/searchService";
import {TemplateInfo} from "~/types/types";
import TemplateTable from "~/components/TemplateTable";
import TemplateGallery from "~/components/TemplateGallery";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "~/components/ui/sheet.tsx";


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
    const [isFilterOpen, setIsFilterOpen] = createSignal(false);

    const [searchResults] = createResource(
        () => ({
            query: props.query ?? "",
            page: props.page ?? 0,
            pageSize: props.pageSize ?? 12,
            filters: props.filters ?? {},
            sorting: props.sorting ?? "createdAt:desc",
        }),
        searchTemplate
    );

    return (
        <div class="container mx-auto px-4 py-6 space-y-8">
            <div class="flex flex-col space-y-6">
                <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 class="text-3xl font-bold tracking-tight">Search Templates</h1>
                    <ViewToggle view={view()} onToggle={setView}/>
                </div>

                <div class="flex flex-col lg:flex-row gap-4">
                    <div class="w-full lg:flex-1">
                        <SearchInput value={props.query} onInput={props.onQueryChange}/>
                    </div>
                    <div class="flex gap-2 self-end">
                        <Sheet open={isFilterOpen()} onOpenChange={setIsFilterOpen}>
                            <SheetTrigger as={Button} variant="outline" class="lg:hidden relative">
                                <Filter class="h-4 w-4 mr-2"/>
                                Filters
                                <Show when={Object.keys(props.filters ?? {}).length > 0}>
                  <span
                      class="absolute -top-2 -right-2 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center">
                    {Object.values(props.filters ?? {}).flat().length}
                  </span>
                                </Show>
                            </SheetTrigger>
                            <SheetContent position="left" class="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle>Filters</SheetTitle>
                                </SheetHeader>
                                <div class="mt-6">
                                    <FilterPanel
                                        filters={props.filters}
                                        onFilterChange={(filters) => {
                                            props.onFiltersChange?.(filters);
                                            setIsFilterOpen(false);
                                        }}
                                        tags={tags()}
                                        isTagsLoading={tags.loading}
                                        topics={topics()}
                                        isTopicsLoading={topics.loading}
                                    />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>

            <div class="flex flex-col lg:flex-row gap-6">
                <div class="hidden lg:block w-72 flex-shrink-0">
                    <FilterPanel
                        filters={props.filters}
                        onFilterChange={props.onFiltersChange}
                        tags={tags()}
                        isTagsLoading={tags.loading}
                        topics={topics()}
                        isTopicsLoading={topics.loading}
                    />
                </div>

                <div class="flex-1 space-y-6">
                    <div
                        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-lg">
                        <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <SortingDropdown value={props.sorting} onChange={props.onSortingChange}/>
                            <PageSizeSelector pageSize={props.pageSize} onPageSizeChange={props.onPageSizeChange}/>
                        </div>
                        <Show when={searchResults()}>
                            {(result) => (
                                <p class="text-sm text-muted-foreground whitespace-nowrap">
                                    {((result().page - 1) * result().hitsPerPage) + 1}-
                                    {Math.min((result().page * result().hitsPerPage), searchResults()?.totalHits || 0)} of {searchResults()?.totalHits}
                                </p>
                            )}
                        </Show>
                    </div>

                    <Switch>
                        <Match when={view() === 'table'}>
                            <div class="overflow-x-auto">
                                <TemplateTable templates={searchResults()?.hits} isLoading={searchResults.loading}/>
                            </div>
                        </Match>
                        <Match when={view() === 'gallery'}>
                            <TemplateGallery templates={searchResults()?.hits} isLoading={searchResults.loading}/>
                        </Match>
                    </Switch>

                    <Pagination
                        count={searchResults()?.totalPages || 1}
                        page={props.page}
                        onPageChange={(page) => props.onPageChange?.(page)}
                        itemComponent={(props) => (
                            <PaginationItem
                                page={props.page}
                                class="hidden sm:inline-flex"
                            >
                                {props.page}
                            </PaginationItem>
                        )}
                        ellipsisComponent={() => <PaginationEllipsis class="hidden sm:inline-flex"/>}
                        class="flex items-center justify-center gap-1 sm:gap-2"
                    >
                        <PaginationPrevious/>
                        <PaginationItems/>
                        <PaginationNext/>
                    </Pagination>
                </div>
            </div>
        </div>
    );
}

function SearchInput(props: { value?: string; onInput?: (value: string) => void }) {
    const debouncedOnInput = debounce((value: string) => props.onInput?.(value), 300);

    return (
        <div class="relative w-full">
            <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
            <TextField value={props.value} onChange={(value) => debouncedOnInput(value)}>
                <TextFieldInput
                    type="text"
                    placeholder="Search templates..."
                    class="pl-10 w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
            </TextField>
        </div>
    );
}

function ViewToggle(props: { view: string; onToggle: (view: string) => void }) {
    return (
        <div class="flex items-center bg-muted rounded-lg p-1">
            <Button
                variant={props.view === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => props.onToggle('table')}
                class="rounded-md"
            >
                <Grid class="h-4 w-4 mr-2"/>
                <span class="hidden sm:inline">Table</span>
                <span class="sr-only">Table view</span>
            </Button>
            <Button
                variant={props.view === 'gallery' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => props.onToggle('gallery')}
                class="rounded-md"
            >
                <LayoutGrid class="h-4 w-4 mr-2"/>
                <span class="hidden sm:inline">Gallery</span>
                <span class="sr-only">Gallery view</span>
            </Button>
        </div>
    );
}

function SortingDropdown(props: { value?: string; onChange?: (value: string) => void }) {
    const options = {
        "createdAt:desc": "Newest First",
        "createdAt:asc": "Oldest First",
        "filledCount:desc": "Most Popular",
        "filledCount:asc": "Least Popular",
        "name:asc": "Name (A-Z)",
        "name:desc": "Name (Z-A)"
    } as Record<string, string>;

    return (
        <Select
            value={props.value}
            onChange={(value) => props.onChange?.(value ?? "createdAt:desc")}
            options={Object.keys(options)}
            itemComponent={(props) => (
                <SelectItem item={props.item} class="cursor-pointer">
                    {options[props.item.rawValue]}
                </SelectItem>
            )}
        >
            <SelectTrigger class="w-full sm:w-[200px]">
                <SelectValue>{(state) => options[state.selectedOption()]}</SelectValue>
            </SelectTrigger>
            <SelectContent class="min-w-[200px]"/>
        </Select>
    );
}

function PageSizeSelector(props: { pageSize?: number; onPageSizeChange?: (pageSize: number) => void }) {
    const options = [12, 24, 48, 96];

    return (
        <Select<number>
            value={props.pageSize}
            onChange={(pageSize) => props.onPageSizeChange?.(pageSize ?? 12)}
            options={options}
            itemComponent={(props) => (
                <SelectItem item={props.item} class="cursor-pointer">
                    {props.item.rawValue} per page
                </SelectItem>
            )}
        >
            <SelectTrigger class="w-full sm:w-[150px]">
                <SelectValue>{(state) => `${state.selectedOption()} per page`}</SelectValue>
            </SelectTrigger>
            <SelectContent/>
        </Select>
    );
}

function FilterPanel(props: {
    tags?: string[];
    topics?: string[];
    isTagsLoading: boolean;
    isTopicsLoading: boolean;
    filters?: Record<string, string[]>;
    onFilterChange?: (filters: Record<string, string[]>) => void;
}) {
    return (
        <Card class="border-0 shadow-none bg-muted/30">
            <CardHeader class="px-4 pb-3">
                <CardTitle class="text-lg font-medium">Filters</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6 px-4">
                <div>
                    <h4 class="font-medium mb-3 text-sm">Tags</h4>
                    <Show when={!props.isTagsLoading} fallback={
                        <div class="flex items-center justify-center p-4">
                            <Oval width="24" height="24"/>
                        </div>
                    }>
                        <FilterCombobox
                            options={props.tags ?? []}
                            value={props.filters?.tags || []}
                            onChange={(value) => props.onFilterChange?.({...props.filters, tags: value})}
                            placeholder="Select tags"
                        />
                    </Show>
                </div>
                <div>
                    <h4 class="font-medium mb-3 text-sm">Topics</h4>
                    <Show when={!props.isTopicsLoading} fallback={
                        <div class="flex items-center justify-center p-4">
                            <Oval width="24" height="24"/>
                        </div>
                    }>
                        <FilterCombobox
                            options={props.topics ?? []}
                            value={props.filters?.topic || []}
                            onChange={(value) => props.onFilterChange?.({...props.filters, topic: value})}
                            placeholder="Select topics"
                        />
                    </Show>
                </div>
            </CardContent>
        </Card>
    );
}

function FilterCombobox(props: {
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder: string;
}) {
    return (
        <Combobox<string>
            options={props.options}
            value={props.value}
            onChange={props.onChange}
            placeholder={props.placeholder}
            multiple
            itemComponent={(props) => (
                <ComboboxItem item={props.item} class="cursor-pointer hover:bg-primary/10 px-2 py-1 rounded">
                    <ComboboxItemLabel>{props.item.rawValue}</ComboboxItemLabel>
                    <ComboboxItemIndicator/>
                </ComboboxItem>
            )}
        >
            <ComboboxControl<string>
                aria-label={props.placeholder}
                class="flex items-center text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full p-2 text-left bg-background border border-input rounded-lg"
            >
                {state => (
                    <>
                        <div class="flex flex-wrap gap-2 p-1">
                            <For each={state.selectedOptions()}>
                                {(option) => (
                                    <span
                                        class="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full inline-flex items-center gap-2 transition-colors hover:bg-primary/20">
                    
                    {option}
                                        <button
                                            type="button"
                                            onClick={() => state.remove(option)}
                                            class="hover:bg-secondary-foreground/20 rounded-full p-1"
                                        >
                      <X class="h-3 w-3"/>
                    </button>
                  </span>
                                )}
                            </For>
                            <ComboboxInput class="flex-1 outline-none bg-transparent text-sm min-w-[120px]"/>
                        </div>
                        <ComboboxTrigger
                            class="ml-2 text-secondary-foreground hover:text-primary cursor-pointer transition"/>
                    </>
                )}
            </ComboboxControl>

            <ComboboxContent
                class="bg-popover text-popover-foreground border border-input rounded-md shadow-md mt-1 max-h-60 overflow-auto z-50">
                   
            </ComboboxContent>
        </Combobox>
    );
}

export default Search;