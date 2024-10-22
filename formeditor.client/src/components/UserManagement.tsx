import {createEffect, createSignal} from 'solid-js';
import {ColumnDef} from "@tanstack/solid-table";
import DataTable from '~/components/DataTable';
import {Button} from '~/components/ui/button';
import {getUsers} from '~/services/userService.ts';
import {useAuth, User} from "~/contexts/AuthContext";
import {createTrigger} from "@solid-primitives/trigger"
import {showToast} from "./ui/toast";
import {A} from '@solidjs/router';
import {changeRole, performAction, performBulkAction} from "~/services/userService.ts";
import {Action} from "~/types/template.ts";

export default function UserManagement() {
    const [selection, setSelection] = createSignal<number[]>([]);
    const [fetchedUsers, setFetchedUsers] = createSignal<User[]>([]);
    const [selectedUsers, setSelectedUsers] = createSignal<User[]>([]);
    const {user, refreshToken} = useAuth();
    const columns: ColumnDef<User, any>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: (info) => <A href={`/users/${info.row.original.id}`}
                               class="text-primary hover:underline">{info.getValue()}</A>,
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
                    <Button as={A} href={`/users/${info.row.original.id}`} size="sm">
                        View
                    </Button>
                    <Button size="sm" variant={info.row.original.status === 'Active' ? 'destructive' : 'default'}
                            onClick={() => handleAction(info.row.original.status === 'Active' ? Action.Block : Action.Unblock, info.row.original.id)}>
                        {info.row.original.status === 'Active' ? 'Block' : 'Unblock'}
                    </Button>
                    <Button size="sm" variant={info.row.original.role === 'Admin' ? 'destructive' : 'default'}
                            onClick={() => handleToggleAdminRole(info.row.original.id, info.row.original.role)}>
                        {info.row.original.role === 'Admin' ? 'Remove Admin' : 'Make Admin'}
                    </Button>
                    <Button size="sm" variant="destructive"
                            onClick={() => handleAction(Action.Delete, info.row.original.id)}>
                        Delete
                    </Button>
                </div>
            ),
        },
    ];


    const handleToggleAdminRole = async (userId: number, currentRole: string) => {
        try {
            const newRole = currentRole === 'Admin' ? 'User' : 'Admin';
            await changeRole(userId, newRole);
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
    const handleAction = async (action: Action, userId: number) => {
        try {
            switch (action) {
                case Action.Block:
                    await performAction(action, userId);
                    showToast({title: "Selected users blocked successfully", variant: "default"});
                    break;
                case Action.Unblock:
                    await performAction(action, userId);
                    showToast({title: "Selected users unblocked successfully", variant: "default"});
                    break;
                case Action.Delete:
                    if (confirm("Are you sure you want to delete the selected users? This action cannot be undone.")) {
                        await performAction(action, userId);
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
    };

    const handleBulkAction = async (action: Action) => {
        const selectedIds = selection();
        if (selectedIds.length === 0) {
            showToast({title: "No users selected", variant: "destructive"});
            return;
        }

        try {
            switch (action) {
                case Action.Block:
                    await performBulkAction(action, { ids: selectedIds });
                    showToast({title: "Selected users blocked successfully", variant: "default"});
                    break;
                case Action.Unblock:
                    await performBulkAction(action, { ids: selectedIds });
                    showToast({title: "Selected users unblocked successfully", variant: "default"});
                    break;
                case Action.Delete:
                    if (confirm("Are you sure you want to delete the selected users? This action cannot be undone.")) {
                        await performBulkAction(action, { ids: selectedIds });
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
                    onClick={() => handleBulkAction(Action.Block)}
                    disabled={selection().length === 0 || selectedUsers().every(user => user.status === "Blocked")}
                >Block</Button>
                <Button
                    onClick={() => handleBulkAction(Action.Unblock)}
                    disabled={selection().length === 0 || selectedUsers().every(user => user.status === "Active")}
                >Unblock</Button>
                <Button
                    variant="destructive"
                    onClick={() => handleBulkAction(Action.Delete)}
                    disabled={selection().length === 0}
                >Delete</Button>
            </div>
            <DataTable
                columns={columns}
                fetchData={getUsers}
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