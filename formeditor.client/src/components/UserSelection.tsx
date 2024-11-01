﻿import {ColumnDef} from "@tanstack/solid-table";
import {User} from "~/contexts/AuthContext.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "~/components/ui/dialog.tsx";
import DataTable from "~/components/DataTable.tsx";
import {getUsers} from "~/services/userService.ts";
import {createSignal} from "solid-js";
import {Button} from "~/components/ui/button.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "~/components/ui/avatar.tsx";
import {Badge} from "~/components/ui/badge.tsx";
import { A } from "@solidjs/router";

interface UserSelectionProps {
    onClose: () => void;
    onSave: (selectedUsers: number[]) => void;
    initialSelectedUsers: number[];
}

const UserSelection = (props: UserSelectionProps) => {
    const [selectedUsers, setSelectedUsers] = createSignal(props.initialSelectedUsers);
    const columns: ColumnDef<User, any>[] = [
        {
            accessorKey: 'avatar',
            header: 'Avatar',
            enableSorting: false,
            cell: (info) => (
                <Avatar class="w-10 h-10 rounded-full">
                    <AvatarImage src={info.getValue()} alt={info.row.original.name}/>
                    <AvatarFallback>{info.row.original.name.split(" ", 2).map((n) => n.charAt(0)).join("").toUpperCase()}</AvatarFallback>
                </Avatar>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: (info) => (
                <A href={`/users/${info.row.original.id}`} class="text-primary hover:underline">
                    {info.getValue()}
                </A>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: (info) => (
                <Badge variant={info.getValue() === 'Admin' ? 'default' : 'secondary'}>
                    {info.getValue()}
                </Badge>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info) => (
                <Badge variant={info.getValue() === 'Active' ? 'success' : 'destructive'}>
                    {info.getValue()}
                </Badge>
            ),
        }
    ];
    // const columns: ColumnDef<User, any>[] = [
    //     {
    //         accessorKey: 'name',
    //         header: 'Name',
    //     },
    //     {
    //         accessorKey: 'email',
    //         header: 'Email',
    //     },
    //     {
    //         accessorKey: 'role',
    //         header: 'Role',
    //     },
    // ];


    return (
        <Dialog open={true} onOpenChange={props.onClose}>
            <DialogContent class="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Select Users</DialogTitle>
                    <DialogDescription>
                        Choose users who will have access to this template.
                    </DialogDescription>
                </DialogHeader>
                <DataTable
                    columns={columns}
                    initialSelection={selectedUsers()}
                    fetchData={getUsers}
                    isSelectable
                    rowId="id"
                    onSelectionChange={setSelectedUsers}
                />
                <DialogFooter>
                    <Button variant="outline" onClick={props.onClose}>Cancel</Button>
                    <Button onClick={() => props.onSave(selectedUsers())}>Save</Button>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    )
}

export default UserSelection;
// export const mockUsers = [
//     { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
//     { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor' },
//     { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Viewer' },
//     { id: 4, name: 'Emily Brown', email: 'emily@example.com', role: 'Editor' },
//     { id: 5, name: 'Alex Lee', email: 'alex@example.com', role: 'Viewer' },
//     { id: 6, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Admin' },
//     { id: 7, name: 'Tom Harris', email: 'tom@example.com', role: 'Editor' },
//     { id: 8, name: 'Lisa Chen', email: 'lisa@example.com', role: 'Viewer' },
//     { id: 9, name: 'David Kim', email: 'david@example.com', role: 'Editor' },
//     { id: 10, name: 'Emma Davis', email: 'emma@example.com', role: 'Viewer' },
// ];

// const UserTableList = (props: { onClose: () => void, onSave: (selectedUsers: number[]) => void, initialSelectedUsers: number[] }) => {
//     const [globalFilter, setGlobalFilter] = createSignal('');
//     const [rowSelection, setRowSelection] = createSignal(
//         props.initialSelectedUsers.reduce((acc, id) => ({ ...acc, [id]: true }), {})
//     );
//
//     const columns = [
//         {
//             id: 'select',
//             header: ({ table }) => (
//                 <Checkbox.Root
//                     checked={table.getIsAllRowsSelected()}
//                     indeterminate={table.getIsSomeRowsSelected()}
//                     onChange={table.getToggleAllRowsSelectedHandler()}
//                 >
//                     <Checkbox.Input />
//                     <Checkbox.Control class="w-4 h-4 border border-input rounded bg-background">
//                         <Checkbox.Indicator>
//                             <svg viewBox="0 0 8 8"><path d="M1,4 L3,6 L7,2" stroke="currentColor" stroke-width="1" fill="none" /></svg>
//                         </Checkbox.Indicator>
//                     </Checkbox.Control>
//                 </Checkbox.Root>
//             ),
//             cell: ({ row }) => (
//                 <Checkbox.Root
//                     checked={row.getIsSelected()}
//                     indeterminate={row.getIsSomeSelected()}
//                     onChange={row.getToggleSelectedHandler()}
//                 >
//                     <Checkbox.Input />
//                     <Checkbox.Control class="w-4 h-4 border border-input rounded bg-background">
//                         <Checkbox.Indicator>
//                             <svg viewBox="0 0 8 8"><path d="M1,4 L3,6 L7,2" stroke="currentColor" stroke-width="1" fill="none" /></svg>
//                         </Checkbox.Indicator>
//                     </Checkbox.Control>
//                 </Checkbox.Root>
//             ),
//         },
//         {
//             accessorKey: 'name',
//             header: 'Name',
//             cell: (info) => info.getValue(),
//         },
//         {
//             accessorKey: 'email',
//             header: 'Email',
//             cell: (info) => info.getValue(),
//         },
//         {
//             accessorKey: 'role',
//             header: 'Role',
//             cell: (info) => info.getValue(),
//         },
//     ];
//
//     const table = createSolidTable({
//         get data() {
//             return mockUsers;
//         },
//         columns,
//         state: {
//             get rowSelection() {
//                 return rowSelection();
//             },
//             get globalFilter() {
//                 return globalFilter();
//             },
//         },
//         onRowSelectionChange: setRowSelection,
//         onGlobalFilterChange: setGlobalFilter,
//         getCoreRowModel: getCoreRowModel(),
//         getSortedRowModel: getSortedRowModel(),
//         getPaginationRowModel: getPaginationRowModel(),
//         getFilteredRowModel: getFilteredRowModel(),
//         initialState: {
//             pagination: {
//                 pageSize: 5,
//             },
//         },
//     });
//
//     const handleSave = () => {
//         const selectedUserIds = Object.keys(rowSelection()).map(Number);
//         props.onSave(selectedUserIds);
//         props.onClose();
//     };
//
//     return (
//         <Dialog open={true} onOpenChange={props.onClose}>
//             <DialogContent class="sm:max-w-[800px]">
//                 <DialogHeader>
//                     <DialogTitle>Select Users</DialogTitle>
//                     <DialogDescription>
//                         Choose users who will have access to this template.
//                     </DialogDescription>
//                 </DialogHeader>
//                 <div class="py-4">
//                     <div class="mb-4 flex justify-between items-center">
//                         <div class="flex items-center">
//                             <Search class="mr-2 h-4 w-4 text-muted-foreground" />
//                             <TextField>
//                                 <TextFieldInput
//                                     type="text"
//                                     placeholder="Search users..."
//                                     value={globalFilter() ?? ''}
//                                     onInput={(e) => setGlobalFilter(e.currentTarget.value)}
//                                     class="w-full p-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring"
//                                 />
//                             </TextField>
//                         </div>
//                         <Select
//                             value={table.getState().pagination.pageSize.toString()}
//                             onChange={(value) => table.setPageSize(Number(value))}
//                             options={[5,10,20,30,40,50]}
//                             itemComponent={props => (
//                                 <SelectItem item={props.item}>
//                                     {props.item.rawValue} per page
//                                 </SelectItem>
//                             )}
//                         >
//                             <SelectTrigger class="w-[180px]">
//                                 <SelectValue>{table.getState().pagination.pageSize} per page</SelectValue>
//                             </SelectTrigger>
//                             <SelectContent>
//                             </SelectContent>
//                         </Select>
//                     </div>
//                     <div class="overflow-x-auto max-h-[400px]">
//                         <Table>
//                             <TableHeader>
//                                 <For each={table.getHeaderGroups()}>
//                                     {(headerGroup) => (
//                                         <TableRow>
//                                             <For each={headerGroup.headers}>
//                                                 {(header) => (
//                                                     <TableHead>
//                                                         {header.isPlaceholder ? null : (
//                                                             <div
//                                                                 class={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
//                                                                 onClick={header.column.getToggleSortingHandler()}
//                                                             >
//                                                                 {flexRender(
//                                                                     header.column.columnDef.header,
//                                                                     header.getContext()
//                                                                 )}
//                                                                 {{
//                                                                     asc: <ArrowUp class="inline ml-1" size={12} />,
//                                                                     desc: <ArrowDown class="inline ml-1" size={12} />,
//                                                                 }[header.column.getIsSorted()] ?? (
//                                                                     header.column.getCanSort() ? <ArrowUpDown class="inline ml-1" size={12} /> : null
//                                                                 )}
//                                                             </div>
//                                                         )}
//                                                     </TableHead>
//                                                 )}
//                                             </For>
//                                         </TableRow>
//                                     )}
//                                 </For>
//                             </TableHeader>
//                             <TableBody>
//                                 <For each={table.getRowModel().rows}>
//                                     {(row) => (
//                                         <TableRow class="hover:bg-accent transition-colors duration-200">
//                                             <For each={row.getVisibleCells()}>
//                                                 {(cell) => (
//                                                     <TableCell>
//                                                         {flexRender(
//                                                             cell.column.columnDef.cell,
//                                                             cell.getContext()
//                                                         )}
//                                                     </TableCell>
//                                                 )}
//                                             </For>
//                                         </TableRow>
//                                     )}
//                                 </For>
//                             </TableBody>
//                         </Table>
//                     </div>
//                     <div class="mt-4 flex items-center justify-between">
//                         <div class="text-sm text-muted-foreground">
//                             Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} results
//                         </div>
//                         <Pagination
//                             count={table.getPageCount()}
//                             page={table.getState().pagination.pageIndex + 1}
//                             onPageChange={(page) => table.setPageIndex(page - 1)}
//                             itemComponent={(props) => <PaginationItem page={props.page}>{props.page}</PaginationItem>}
//                             ellipsisComponent={() => <PaginationEllipsis />}
//                             class="flex items-center space-x-2"
//                         >
//                             <PaginationPrevious />
//                             <PaginationItems />
//                             <PaginationNext />
//                         </Pagination>
//                     </div>
//                 </div>
//                 
//         </Dialog>
//     );
// };

