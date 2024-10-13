import {ArrowDown, ArrowUp, ArrowUpDown, Search} from "lucide-solid";
import {TextField, TextFieldInput} from "~/components/ui/text-field.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "~/components/ui/table.tsx";
import {createResource, For} from "solid-js";
import {
    ColumnDef,
    createSolidTable,
    flexRender,
    getCoreRowModel,
    getSortedRowModel, RowSelectionState,
    Updater
} from "@tanstack/solid-table";
import {
    Pagination,
    PaginationEllipsis,
    PaginationItem,
    PaginationItems, PaginationNext,
    PaginationPrevious
} from "~/components/ui/pagination.tsx";
import {Skeleton} from "~/components/ui/skeleton.tsx";
import {TableOption} from "~/types/template.ts";
import {createStore} from "solid-js/store";
import {Checkbox} from "./ui/checkbox";

const selectionColumn = {
    id: 'select',
    header: ({table}) => (
        <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
        />
    ),
    cell: ({row}) => (
        <Checkbox
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
        />
    ),
};

interface DataTableProps<TData> {
    columns: ColumnDef<TData> [];
    isSelectable?: boolean;
    onSelectionChange?: (selection: Updater<RowSelectionState>) => void;
    selection?: RowSelectionState;
    onRowClick?: (row: TData) => void;
    fetchData: (options: TableOption) => Promise<{ data: TData[]; totalPages: number }>;
}

const DataTable = <TData, >(props: DataTableProps<TData>) => {
        const [options, setOptions] = createStore<TableOption>({
            sort: [],
            filter: '',
            pagination: {
                pageIndex: 0,
                pageSize: 10
            }
        });
        const [response] = createResource(options, props.fetchData);

        const table = createSolidTable({
                get data() {
                    return response()?.data ?? [];
                },
                get columns(){ 
                    return props.isSelectable? [selectionColumn, ...props.columns] : props.columns
                },
                getCoreRowModel: getCoreRowModel(),
                getSortedRowModel: getSortedRowModel(),
                onRowSelectionChange: props.onSelectionChange,
                onSortingChange: (sort) => setOptions("sort", sort),
                onPaginationChange: (pagination) => setOptions("pagination", pagination),
                onGlobalFilterChange: (pagination) => setOptions("pagination", pagination),
                manualSorting: true,
                manualFiltering: true,
                manualPagination: true,
                get pageCount() {
                    return response()?.totalPages
                },
                state: {
                    get rowSelection() {
                        return props.selection;
                    },
                    get sorting() {
                        return options.sort;
                    },
                    get globalFilter() {
                        return options.filter;
                    },
                    get pagination() {
                        return options.pagination
                    }
                }
            }
        );

        return (
            <div class="py-4">
                <div class="mb-4 flex justify-between items-center">
                    <div class="flex items-center">
                        <Search class="mr-2 h-4 w-4 text-muted-foreground"/>
                        <TextField>
                            <TextFieldInput
                                type="text"
                                placeholder="Search users..."
                                value={table.getState().globalFilter}
                                onInput={(e) => table.setGlobalFilter(e.currentTarget.value)}
                                class="w-full p-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring"
                            />
                        </TextField>
                    </div>
                    <Select
                        value={table.getState().pagination.pageSize.toString()}
                        onChange={(value) => table.setPageSize(Number(value))}
                        options={[5, 10, 20, 30, 40, 50]}
                        itemComponent={props => (
                            <SelectItem item={props.item}>
                                {props.item.rawValue} per page
                            </SelectItem>
                        )}
                    >
                        <SelectTrigger class="w-[180px]">
                            <SelectValue>{table.getState().pagination.pageSize} per page</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                        </SelectContent>
                    </Select>
                </div>
                <div class="overflow-x-auto max-h-[400px] rounded-md border">
                    <Table>
                        <TableHeader>
                            <For each={table.getHeaderGroups()}>
                                {(headerGroup) => (
                                    <TableRow>
                                        <For each={headerGroup.headers}>
                                            {(header) => (
                                                <TableHead>
                                                    {header.isPlaceholder ? null : <div
                                                        class={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                        {{
                                                            asc: <ArrowUp class="inline ml-1" size={12}/>,
                                                            desc: <ArrowDown class="inline ml-1" size={12}/>,
                                                        }[header.column.getIsSorted()] ?? (
                                                            header.column.getCanSort() ?
                                                                <ArrowUpDown class="inline ml-1" size={12}/> : null
                                                        )}
                                                    </div>}
                                                </TableHead>
                                            )}
                                        </For>
                                    </TableRow>
                                )}
                            </For>
                        </TableHeader>
                        <TableBody>
                            {response.loading ? (
                                <For each={Array(options.pagination.pageSize).fill(null)}>
                                    {() => (
                                        <TableRow class="transition-colors duration-200">
                                            <For each={props.columns}>
                                                {() => (
                                                    <TableCell>
                                                        <Skeleton class="h-6 w-full"/>
                                                    </TableCell>
                                                )}
                                            </For>
                                        </TableRow>
                                    )}
                                </For>
                            ) : (
                                <For each={table.getRowModel().rows}>
                                    {(row) => (
                                        <TableRow 
                                            class="hover:bg-accent transition-colors duration-200"
                                            classList={{"cursor-pointer": !!props.onRowClick}}
                                            onClick={() => props.onRowClick?.(row.original)}
                                        >
                                            <For each={row.getVisibleCells()}>
                                                {(cell) => (
                                                    <TableCell>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                )}
                                            </For>
                                        </TableRow>
                                    )}
                                </For>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div class="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div class="text-sm text-muted-foreground">
                        Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} results
                    </div>
                    <Pagination
                        count={table.getPageCount()}
                        page={table.getState().pagination.pageIndex + 1}
                        onPageChange={(page) => table.setPageIndex(page - 1)}
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
        );
    }
;

export default DataTable;