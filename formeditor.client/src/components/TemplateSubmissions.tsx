import {Card, CardContent, CardHeader} from "~/components/ui/card.tsx";
import {Form, FormInfo, QuestionTypes, Template} from "~/types/template.ts";
import DataTable from "./DataTable";
import {getSubmittedForms} from "../services/formService.ts";
import {useNavigate} from "@solidjs/router";
import {ColumnDef} from "@tanstack/solid-table";

const defaultColumns: ColumnDef<FormInfo, any>[] = [
    {
        accessorKey: 'submittedBy',
        header: 'User Name',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: 'fillingDate',
        header: 'Filling Date',
        cell: (info) => info.getValue(),
    },
];

interface TemplateSubmissionsProps {
    template: Template;
}

const TemplateSubmissions = (props: TemplateSubmissionsProps) => {
    const navigate = useNavigate();
    const columns: ColumnDef<Form, any>[] = [
        ...defaultColumns,
        ...props.template.questions
            .filter(q => q.displayInTable)
            .map(q => ({
                accessorKey: `answers.${q.id}`,
                header: q.title,
                cell: (info) => {
                    if (!info.getValue()) {
                        return "-"
                    } else if (q.type == QuestionTypes.Integer) {
                        return info.getValue().numericValue
                    } else if (q.type == QuestionTypes.Checkbox) {
                        return info.getValue().booleanValue ? "Yes" : "No"
                    } else {
                        return info.getValue().stringValue
                    }

                },
            })),
        // ... actions column
    ];

    return (
        <Card class="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
            <div class="space-y-6">
                <CardHeader>
                    <h2 class="text-2xl font-bold mb-4">Submitted Applications</h2>
                </CardHeader>
                <CardContent>
                    <DataTable<Form>
                        columns={columns}
                        fetchData={(opt) => getSubmittedForms(props.template.id, opt)}
                        onRowClick={(form) => navigate(`/forms/${form.id}`)}
                        rowId="id"
                    />
                </CardContent>
            </div>
        </Card>
    )
}

export default TemplateSubmissions;

/*
<div class="mb-4 flex justify-between items-center">
        <div class="flex items-center">
            <Search class="mr-2 h-4 w-4 text-muted-foreground"/>
            <TextField>
                <TextFieldInput
                    type="text"
                    placeholder="Search all columns..."
                    value={globalFilter() ?? ''}
                    onInput={(e) => setGlobalFilter(e.currentTarget.value)}
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
    <div class="overflow-x-auto">
        <Table>
            <TableHeader>
                <For each={table.getHeaderGroups()}>
                    {(headerGroup) => (
                        <TableRow>
                            <For each={headerGroup.headers}>
                                {(header) => (
                                    <TableHead>
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
                                                    asc: <ArrowUp class="inline ml-1"
                                                                  size={12}/>,
                                                    desc: <ArrowDown class="inline ml-1"
                                                                     size={12}/>,
                                                }[header.column.getIsSorted()] ?? (
                                                    header.column.getCanSort() ?
                                                        <ArrowUpDown class="inline ml-1"
                                                                     size={12}/> : null
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
                <For each={table.getRowModel().rows}>
                    {(row) => (
                        <TableRow class="hover:bg-accent transition-colors duration-200">
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
            </TableBody>
        </Table>
    </div>
    <div class="mt-4">
        <Pagination
            count={table.getPageCount()}
            page={table.getState().pagination.pageIndex + 1}
            onPageChange={(page) => table.setPageIndex(page - 1)}
            itemComponent={(props) => <PaginationItem
                page={props.page}>{props.page}</PaginationItem>}
            ellipsisComponent={() => <PaginationEllipsis/>}
        >
            <PaginationPrevious/>
            <PaginationItems/>
            <PaginationNext/>
        </Pagination>
    </div> 
  */