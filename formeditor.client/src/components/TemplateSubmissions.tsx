import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card.tsx";
import {Form,  QuestionTypes, Template} from "~/types/types.ts";
import DataTable from "./DataTable";
import {deleteForm, getSubmittedForms} from "../services/formService.ts";
import {useNavigate} from "@solidjs/router";
import {ColumnDef} from "@tanstack/solid-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "~/components/ui/dropdown-menu.tsx";
import {Clock, Eye, MoreHorizontal, Trash, User} from "lucide-solid";
import {Button} from "~/components/ui/button.tsx";
import {Badge} from "~/components/ui/badge.tsx";
import {showToast} from "~/components/ui/toast.tsx";
import {createTrigger} from "@solid-primitives/trigger";

interface TemplateSubmissionsProps {
    template: Template;
}

const TemplateSubmissions = (props: TemplateSubmissionsProps) => {
    const navigate = useNavigate();
    const [track, trigger] = createTrigger();

    const defaultColumns: ColumnDef<Form, any>[] = [
        {
            accessorKey: 'submittedBy',
            header: 'User Name',
            cell: (info) => (
                <div class="flex items-center space-x-2">
                    <User class="h-4 w-4 text-muted-foreground"/>
                    <span>{info.getValue()}</span>
                </div>
            )
        },
        {
            accessorKey: 'fillingDate',
            header: 'Filling Date',
            cell: (info) => (
                <div class="flex items-center space-x-2">
                    <Clock class="h-4 w-4 text-muted-foreground"/>
                    <span>{new Date(info.getValue() as string).toLocaleString()}</span>
                </div>
            ),
        },
        {
            accessorKey: 'submittedAt',
            header: 'Submitted At',
            cell: (info) => (
                <div class="flex items-center space-x-2">
                    <Clock class="h-4 w-4 text-muted-foreground"/>
                    <span>{new Date(info.getValue() as string).toLocaleString()}</span>
                </div>
            ),
        },
    ];

    const actionColumn: ColumnDef<Form, any> = {
        header: 'Actions',
        id: 'actions',
        cell: (info) => (
            <DropdownMenu>
                <DropdownMenuTrigger as={Button} variant="ghost" size="sm">
                    <MoreHorizontal class="h-4 w-4"/>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => navigate(`/forms/${info.row.original.id}`)}>
                        <Eye class="mr-2 h-4 w-4"/>
                        View
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleDeleteForm(info.row.original.id)}>
                        <Trash class="mr-2 h-4 w-4"/>
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    };

    const columns: ColumnDef<Form, any>[] = [
        ...defaultColumns,
        ...props.template.questions
            .filter(q => q.displayInTable)
            .map(q => ({
                accessorKey: `answers.${q.id}`,
                header: q.title,
                enableSorting: false,
                cell: (info) => {
                    if (!info.getValue()) {
                        return (<Badge variant="warning">-</Badge>);
                    } else if (q.type == QuestionTypes.Integer) {
                        return (<Badge variant="default">{info.getValue().numericValue}</Badge>)
                    } else if (q.type == QuestionTypes.Checkbox) {
                        return (
                            <Badge variant={info.getValue().booleanValue ? "success" : "secondary"}>
                                {info.getValue().booleanValue ? "Yes" : "No"}
                            </Badge>
                        );
                    } else {
                        return (<Badge> {info.getValue().stringValue}</Badge>);
                    }
                },
            })),
        actionColumn
    ];

    const handleDeleteForm = async (formId: number) => {
        try {
            await deleteForm(formId);
            trigger();
            showToast({title: `Deleted form ${formId}`, variant: "success"});
        } catch (error) {
            showToast({title: "Failed to delete form", variant: "destructive"});
        }
    };

    return (
        <Card class="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
            <CardHeader>
                <CardTitle class="text-2xl font-bold">Submitted Applications</CardTitle>
            </CardHeader>
            <CardContent>
                <DataTable<Form>
                    columns={columns}
                    refetchTrigger={track}
                    fetchData={(opt) => getSubmittedForms(props.template.id, opt)}
                    onRowClick={(form) => navigate(`/forms/${form.id}`)}
                    rowId="id"
                />
            </CardContent>
        </Card>
    );
};

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