import {AlertCircle, ArrowDown, ArrowUp, ArrowUpDown, Search} from "lucide-solid";
import {TextField, TextFieldInput} from "~/components/ui/text-field.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "~/components/ui/table.tsx";
import {debounce} from '@solid-primitives/scheduled';
import { For, createEffect, on, createSignal, untrack, Show} from "solid-js";
import {
    ColumnDef,
    createSolidTable,
    flexRender,
    getCoreRowModel,
    RowSelectionState,
} from "@tanstack/solid-table";
import {
    Pagination,
    PaginationEllipsis,
    PaginationItem,
    PaginationItems, PaginationNext,
    PaginationPrevious
} from "~/components/ui/pagination.tsx";
import {Skeleton} from "~/components/ui/skeleton.tsx";
import {TableData, TableOption} from "~/types/types.ts";
import {Checkbox} from "./ui/checkbox";
import {createWritableMemo} from "@solid-primitives/memo"
import {createResource} from "~/lib/action.ts";

const selectionColumn: ColumnDef<any, any> = {
    id: 'select',
    header: ({table}) => (
        <Checkbox
            class="cursor-pointer"
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.toggleAllPageRowsSelected}
        />
    ),
    cell: ({row}) => (
        <Checkbox
            class="cursor-pointer"
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.toggleSelected}
        />
    ),
};

interface DataTableProps<TData> {
    columns: ColumnDef<TData, TData[keyof TData]>[];
    isSelectable?: boolean;
    onSelectionChange?: (selection: number[]) => void;
    initialSelection?: number[];
    onRowClick?: (row: TData) => void;
    fetchData: (options: TableOption) => Promise<TableData<TData[]>>;
    onFetchData?: (data: TData[], options: TableOption) => void;
    rowId?: keyof TData;
    refetchTrigger?: () => any;
}

const DataTable = <TData, >(props: DataTableProps<TData>) => {
    const [selection, setSelection] = createWritableMemo(() => (
            props.initialSelection ?? []).reduce((acc, row, index) => ({
            ...acc,
            [props.rowId ? row : index]: true
        }), {} as Record<string, boolean>)
    );

    const [sort, setSort] = createSignal([]);
    const [filter, setFilter] = createSignal('');
    const [pagination, setPagination] = createSignal({
        pageIndex: 0,
        pageSize: 10
    });

    const [response, {refetch}] = createResource(() => ({
        sort: sort(),
        pagination: pagination(),
        filter: filter()
    }), props.fetchData);

    const debouncedFilterInput = debounce((value: string) => table.setGlobalFilter(value), 300);

    const handleRowSelectionChange = (updater: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => {
        setSelection(updater);
        props.onSelectionChange?.(Object.keys(selection()).filter(id => selection()[id]).map(Number));
    };

    createEffect(() => {
        let fetchData = response()?.data;
        if (fetchData) {
            const args = untrack(() => ({
                sort: sort(),
                pagination: pagination(),
                filter: filter()
            }));
            props.onFetchData?.(fetchData, args);
        }
    });

    createEffect(on(() => props.refetchTrigger?.(), refetch));

    const table = createSolidTable({
        get data() {
            return response()?.data ?? [];
        },
        get columns() {
            return props.isSelectable ? [selectionColumn, ...props.columns] : props.columns;
        },
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: handleRowSelectionChange,
        onSortingChange: (sort) => setSort(sort),
        onPaginationChange: (pagination) => setPagination(pagination),
        onGlobalFilterChange: (filter) => setFilter(filter),
        manualSorting: true,
        manualFiltering: true,
        manualPagination: true,
        get enableRowSelection() {
            return props.isSelectable;
        },
        get enableMultiRowSelection() {
            return props.isSelectable;
        },
        getRowId: (row, index) => String(props.rowId ? row?.[props.rowId] : index),
        get rowCount() {
            return response()?.totalRows;
        },
        state: {
            get rowSelection() {
                return selection();
            },
            get sorting() {
                return sort();
            },
            get globalFilter() {
                return filter();
            },
            get pagination() {
                return pagination();
            }
        }
    });

    return (
        <div class="space-y-4">
            <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div class="relative w-full sm:w-64">
                    <Search class="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"/>
                    <TextField onChange={(value) => debouncedFilterInput(value)}
                               class="w-full">
                        <TextFieldInput
                            type="text"
                            placeholder="Search..."
                            class="pl-9 w-full"
                        />
                    </TextField>
                </div>
                <Select<number>
                    value={table.getState().pagination.pageSize}
                    onChange={(value: number) => table.setPageSize(value)}
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
            <div class="rounded-md border">
                <Table>
                    <TableHeader>
                        <For each={table.getHeaderGroups()}>
                            {(headerGroup) => (
                                <TableRow>
                                    <For each={headerGroup.headers}>
                                        {(header) => (
                                            <TableHead classList={{"text-end": header.column.getIsLastColumn()}}>
                                                {header.isPlaceholder ? null : (
                                                    <div
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
                                                    </div>
                                                )}
                                            </TableHead>
                                        )}
                                    </For>
                                </TableRow>
                            )}
                        </For>
                    </TableHeader>
                    <TableBody>
                        {response.loading ? (
                            <For each={Array(pagination().pageSize).fill(null)}>
                                {() => (
                                    <TableRow class="animate-pulse">
                                        <For each={props.columns}>
                                            {() => (
                                                <TableCell>
                                                    <Skeleton class="!h-6 !w-full"/>
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
                                                <TableCell classList={{"text-end": cell.column.getIsLastColumn()}}>
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
            <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div class="text-sm text-muted-foreground">
                    Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} results
                </div>
                <Show when={props.isSelectable}>
                    <div class='flex-1 text-sm text-muted-foreground'>
                        {Object.keys(selection()).filter(id => selection()[id]).length} of{' '}
                        {response()?.totalRows ?? 0} row(s) selected.
                    </div>
                </Show>
                <Show when={response.error}>
                    <div class="text-red-500 flex items-center">
                        <AlertCircle class="w-4 h-4 mr-2"/>
                        {response.error.detail}
                    </div>
                </Show>
                <Pagination
                    count={table.getPageCount()}
                    page={table.getState().pagination.pageIndex + 1}
                    onPageChange={(page) => table.setPageIndex(page - 1)}
                    itemComponent={(props) => <PaginationItem page={props.page}>{props.page}</PaginationItem>}
                    ellipsisComponent={() => <PaginationEllipsis/>}
                    class="flex items-center space-x-2"
                >
                    <PaginationPrevious disabled={!table.getCanPreviousPage()}>

                    </PaginationPrevious>
                    <PaginationItems/>
                    <PaginationNext disabled={!table.getCanNextPage()}>

                    </PaginationNext>
                </Pagination>
            </div>
        </div>
    );
};

export default DataTable;