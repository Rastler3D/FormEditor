import {createSignal, createEffect} from 'solid-js';
import {ColumnDef} from "@tanstack/solid-table";
import DataTable from '~/components/DataTable';
import {Button} from '~/components/ui/button';
import {
    fetchUsers,
    blockUser,
    deleteUser,
    updateUserRole,
    bulkBlockUsers,
    bulkDeleteUsers,
    bulkUnblockUsers
} from '~/services/templateService.ts';
import {useAuth, User} from "~/contexts/AuthContext";
import {createTrigger} from "@solid-primitives/trigger"
import {showToast} from "./ui/toast";

export default function UserManagement() {
    const [selection, setSelection] = createSignal<number[]>([]);
    const [fetchedUsers, setFetchedUsers] = createSignal<User[]>([]);
    const [selectedUsers, setSelectedUsers] = createSignal<User[]>([]);
    const {user, refreshToken} = useAuth();
    const columns: ColumnDef<User, any>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'role',
            header: 'Role',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info) => (
                <span class={`px-2 py-1 rounded-full text-xs ${info.getValue() === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {info.getValue()}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: (info) => (
                <div class="flex gap-2">
                    <Button size="sm" variant={info.row.original.status === 'Active' ? 'destructive' : 'default'}
                            onClick={() => handleAction(info.row.original.status === 'Active' ? "block" : "unblock", info.row.original.id)}>
                        {info.row.original.status === 'Active' ? 'Block' : 'Unblock'}
                    </Button>
                    <Button size="sm" variant={info.row.original.role === 'Admin' ? 'destructive' : 'default'}
                            onClick={() => handleToggleAdminRole(info.row.original.id, info.row.original.role)}>
                        {info.row.original.role === 'Admin' ? 'Remove Admin' : 'Make Admin'}
                    </Button>
                    <Button size="sm" variant="destructive"
                            onClick={() => handleAction("delete", info.row.original.id)}>
                        Delete
                    </Button>
                </div>
            ),
        },
    ];


    const handleToggleAdminRole = async (userId: number, currentRole: string) => {
        try {
            const newRole = currentRole === 'Admin' ? 'User' : 'Admin';
            await updateUserRole(userId, newRole);
            if (userId == user()?.id) {
                await refreshToken();
            }
            trigger();
            showToast({title: `User role updated to ${newRole}`, variant: "default"});
        } catch (error) {
            showToast({title: "Failed to update user role", variant: "destructive"});
        }
    };
    const [track, trigger] = createTrigger();
    const handleAction = async (action: 'block' | 'unblock' | 'delete', userId: number) => {
        try {
            switch (action) {
                case 'block':
                    await blockUser(userId);
                    showToast({title: "Selected users blocked successfully", variant: "default"});
                    break;
                case 'unblock':
                    await unblockUsers(userId);
                    showToast({title: "Selected users unblocked successfully", variant: "default"});
                    break;
                case 'delete':
                    if (confirm("Are you sure you want to delete the selected users? This action cannot be undone.")) {
                        await deleteUsers(userId);
                        showToast({title: "Selected users deleted successfully", variant: "default"});
                    }
                    break;
            }
            if (userId == user()?.id) {
                await refreshToken();
            }
            trigger();
            // Refresh the data after bulk action
            // You might need to adjust this based on how your DataTable component handles refreshing
        } catch (error) {
            showToast({title: `Failed to ${action} selected users`, variant: "destructive"});
        }
        if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            try {
                await deleteUser(userId);
                showToast({title: "User deleted successfully", variant: "default"});
            } catch (error) {
                showToast({title: "Failed to delete user", variant: "destructive"});
            }
        }
    };

    const handleBulkAction = async (action: 'block' | 'unblock' | 'delete') => {
        const selectedIds = selection();
        if (selectedIds.length === 0) {
            showToast({title: "No users selected", variant: "destructive"});
            return;
        }

        try {
            switch (action) {
                case 'block':
                    await bulkBlockUsers(selectedIds);
                    showToast({title: "Selected users blocked successfully", variant: "default"});
                    break;
                case 'unblock':
                    await bulkUnblockUsers(selectedIds);
                    showToast({title: "Selected users unblocked successfully", variant: "default"});
                    break;
                case 'delete':
                    if (confirm("Are you sure you want to delete the selected users? This action cannot be undone.")) {
                        await bulkDeleteUsers(selectedIds);
                        showToast({title: "Selected users deleted successfully", variant: "default"});
                    }
                    break;
            }
            if (user() && selectedIds.includes(user()!.id)) {
                await refreshToken();
            }
            trigger();
            // Refresh the data after bulk action
            // You might need to adjust this based on how your DataTable component handles refreshing
        } catch (error) {
            showToast({title: `Failed to ${action} selected users`, variant: "destructive"});
        }
    };

    createEffect(() => {
        const selectedUsersId = selection();
        const users = fetchedUsers();
        if (users) {
            setSelectedUsers(prev => [
                ...prev.filter((user) => selectedUsersId[user.id]),
                ...users.filter((user) => selectedUsersId[user.id])
            ]);

        }
    })

    return (
        <div class="container mx-auto p-4">
            <h1 class="text-3xl font-bold mb-4">User Management</h1>
            <div class="mb-4 flex gap-2">
                <Button
                    onClick={() => handleBulkAction('block')}
                    disabled={selection().length === 0 || selectedUsers().every(user => user.status === "Blocked")}
                >Block</Button>
                <Button
                    onClick={() => handleBulkAction('unblock')}
                    disabled={selection().length === 0 || selectedUsers().every(user => user.status === "Active")}
                >Unblock</Button>
                <Button
                    variant="destructive"
                    onClick={() => handleBulkAction('delete')}
                    disabled={selection().length === 0}
                >Delete</Button>
            </div>
            <DataTable
                columns={columns}
                fetchData={fetchUsers}
                isSelectable={true}
                rowId="id"
                initialSelection={selection()}
                onSelectionChange={setSelection}
                onFetchData={setFetchedUsers}
                refetchTrigger={track}
            />
        </div>
    );
}