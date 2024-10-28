import {createEffect, createSignal} from 'solid-js';
import {ColumnDef} from "@tanstack/solid-table";
import DataTable from '~/components/DataTable';
import {Button} from '~/components/ui/button';
import {getUsers} from '~/services/userService.ts';
import {useAuth, User} from "~/contexts/AuthContext";
import {createTrigger} from "@solid-primitives/trigger"
import {showToast} from "./ui/toast";
import {A, useNavigate} from '@solidjs/router';
import {changeRole, performAction, performBulkAction} from "~/services/userService.ts";
import {Action} from "~/types/types.ts";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "~/components/ui/dropdown-menu.tsx";
import {MoreHorizontal, Eye, Trash, UserX, UserCheck, ShieldOff, Shield} from "lucide-solid";
import {Badge} from "~/components/ui/badge.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "~/components/ui/dialog.tsx";
import {Card, CardContent, CardHeader, CardTitle} from './ui/card';
import {Avatar, AvatarFallback, AvatarImage} from "~/components/ui/avatar.tsx";
import {useLanguage} from "~/contexts/LanguageContext.tsx";


export default function UserManagement() {
    const [selection, setSelection] = createSignal<number[]>([]);
    const [fetchedUsers, setFetchedUsers] = createSignal<User[]>([]);
    const [selectedUsers, setSelectedUsers] = createSignal<User[]>([]);
    const {user, eagerRefreshToken} = useAuth();
    const [track, trigger] = createTrigger();
    const [deleteDialogOpen, setDeleteDialogOpen] = createSignal(false);
    const [userToDelete, setUserToDelete] = createSignal<number | null>(null);
    const {t} = useLanguage();
    const navigate = useNavigate();

    const columns: ColumnDef<User, any>[] = [
        {
            accessorKey: 'avatar',
            header: t('Avatar'),
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
            header: t('Name'),
            cell: (info) => (
                <A href={`/users/${info.row.original.id}`} class="text-primary hover:underline">
                    {info.getValue()}
                </A>
            ),
        },
        {
            accessorKey: 'email',
            header: t('Email'),
        },
        {
            accessorKey: 'role',
            header: t('Role'),
            cell: (info) => (
                <Badge variant={info.getValue() === 'Admin' ? 'default' : 'secondary'}>
                    {info.getValue()}
                </Badge>
            ),
        },
        {
            accessorKey: 'status',
            header: t('Status'),
            cell: (info) => (
                <Badge variant={info.getValue() === 'Active' ? 'success' : 'destructive'}>
                    {info.getValue()}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: t('Actions'),
            cell: (info) => (
                <DropdownMenu>
                    <DropdownMenuTrigger as={Button} variant="ghost" size="sm">
                        <MoreHorizontal class="h-4 w-4"/>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => navigate(`/users/${info.row.original.id}`)}>
                            <Eye class="mr-2 h-4 w-4"/>
                            {t('View')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={() => handleAction(info.row.original.status === 'Active' ? Action.Block : Action.Unblock, info.row.original.id)}>
                            {info.row.original.status === 'Active' ? <UserX class="mr-2 h-4 w-4"/> :
                                <UserCheck class="mr-2 h-4 w-4"/>}
                            {info.row.original.status === 'Active' ? t('Block') : t('Unblock')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={() => handleToggleAdminRole(info.row.original.id, info.row.original.role)}>
                            {info.row.original.role === 'Admin' ? <ShieldOff class="mr-2 h-4 w-4"/> :
                                <Shield class="mr-2 h-4 w-4"/>}
                            {info.row.original.role === 'Admin' ? t('RemoveAdmin') : t('MakeAdmin')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => openDeleteDialog(info.row.original.id)}>
                            <Trash class="mr-2 h-4 w-4"/>
                            {t('Delete')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const handleToggleAdminRole = async (userId: number, currentRole: string) => {
        try {
            const newRole = currentRole === 'Admin' ? 'User' : 'Admin';
            await changeRole(userId, newRole);
            if (userId == user()?.id) {
                await eagerRefreshToken();
            }
            trigger();
            showToast({title: `User role updated to ${newRole}`, variant: "success"});
        } catch (error) {
            showToast({title: "Failed to update user role", variant: "destructive"});
        }
    };

    const handleAction = async (action: Action, userId: number) => {
        try {
            await performAction(action, userId);
            showToast({title: `User ${action.toLowerCase()}ed successfully`, variant: "success"});
            if (userId == user()?.id) {
                await eagerRefreshToken();
            }
            trigger();
        } catch (error) {
            showToast({title: `Failed to ${action.toLowerCase()} user`, variant: "destructive"});
        }
    };

    const handleBulkAction = async (action: Action) => {
        const selectedIds = selection();
        if (selectedIds.length === 0) {
            showToast({title: "No users selected", variant: "destructive"});
            return;
        }

        if (action === Action.Delete) {
            setDeleteDialogOpen(true);
            return;
        }

        try {
            await performBulkAction({ids: selectedIds, action});
            showToast({title: `Selected users ${action.toLowerCase()}ed successfully`, variant: "success"});
            if (user() && selectedIds.includes(user()!.id)) {
                await eagerRefreshToken();
            }
            trigger();
        } catch (error) {
            showToast({title: `Failed to ${action.toLowerCase()} selected users`, variant: "destructive"});
        }
    };

    const openDeleteDialog = (userId: number | null) => {
        setUserToDelete(userId);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        const ids = userToDelete() ? [userToDelete()] : selection();
        try {
            if (ids.length === 1) {
                await performAction(Action.Delete, ids[0]);
            } else {
                await performBulkAction({ids, action: Action.Delete});
            }
            showToast({title: `User(s) deleted successfully`, variant: "success"});
            if (user() && ids.includes(user()!.id)) {
                await eagerRefreshToken();
            }
            trigger();
        } catch (error) {
            showToast({title: "Failed to delete user(s)", variant: "destructive"});
        } finally {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    createEffect(() => {
        const selectedUsersId = selection();
        const users = fetchedUsers();
        if (users) {
            setSelectedUsers(prev => [
                ...prev.filter((user) => selectedUsersId.includes(user.id)),
                ...users.filter((user) => selectedUsersId.includes(user.id))
            ]);
        }
    });

    return (
        <Card class="bg-background">
            <CardHeader>
                <CardTitle>{t('UserManagement')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div class="mb-4 flex flex-wrap gap-2">
                    <Button
                        onClick={() => handleBulkAction(Action.Block)}
                        disabled={selection().length === 0 || selectedUsers().every(user => user.status === "Blocked")}
                    >
                        <UserX class="mr-2 h-4 w-4"/>
                        Block Selected
                    </Button>
                    <Button
                        onClick={() => handleBulkAction(Action.Unblock)}
                        disabled={selection().length === 0 || selectedUsers().every(user => user.status === "Active")}
                    >
                        <UserCheck class="mr-2 h-4 w-4"/>
                        Unblock Selected
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => handleBulkAction(Action.Delete)}
                        disabled={selection().length === 0}
                    >
                        <Trash class="mr-2 h-4 w-4"/>
                        Delete Selected
                    </Button>
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
            </CardContent>
            <Dialog open={deleteDialogOpen()} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure you want to delete?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete
                            the {userToDelete() ? 'selected user' : 'selected users'} and remove their data from our
                            servers.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}