﻿import {
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    FileSpreadsheet,
    FileText,
    Home,
    LogOut,
    LucideProps,
    Plus,
    UserCog,
    Users
} from "lucide-solid";
import {Motion, Presence} from "solid-motionone";
import {Button, buttonVariants} from "~/components/ui/button";
import {createSignal, For, JSX, Show} from "solid-js";
import {Tooltip, TooltipContent, TooltipTrigger} from "~/components/ui/tooltip";
import {Separator} from "~/components/ui/separator";
import {A, useMatch} from "@solidjs/router";
import {cn} from "~/lib/utils.ts";
import {useAuth} from "~/contexts/AuthContext.tsx";

interface SidebarProps {
    isSheet?: boolean
}

const Sidebar = (props: SidebarProps) => {
    const [isExpanded, setIsExpanded] = createSignal(props.isSheet ?? false);
    const {user, signOut} = useAuth();

    return (
        <aside>
            <Motion.div
                class={'h-screen flex flex-col border-r group w-16 overflow-x-hidden'}
                data-collapsed={!isExpanded()}
                animate={{width: isExpanded() ? "240px" : "64px"}}
                transition={{duration: props.isSheet ? 0 : 0.6}}
            >
                <nav
                    class="flex items-center justify-center h-16 px-2">
                    {isExpanded() && (
                        <div class="text-xl font-semibold pl-4">
                            MyApp
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded())}
                        class="transition-colors ml-auto"
                        classList={{"hidden": props.isSheet}}
                    >
                        <div class="w-6 justify-center flex">
                            {isExpanded() ? <ChevronLeft class="h-5 w-5"/> : <ChevronRight class="h-5 w-5"/>}
                        </div>
                    </Button>
                </nav>
                <Separator/>
                <div class="flex flex-col flex-grow gap-4 py-2  data-[collapsed=true]:py-2">
                    <nav class="grid gap-1 px-2">
                        <For each={menuItems.filter(item => item.role === 'All' || (user() && item.role === 'User'))}>
                            {item => <NavItem {...item} isExpanded={isExpanded()}/>}
                        </For>
                        <Show when={user() && user()!.role === 'Admin'}>
                            <Separator class="my-2"/>
                            <For each={menuItems.filter(item => item.role === 'Admin')}>
                                {item => <NavItem {...item} isExpanded={isExpanded()}/>}
                            </For>
                        </Show>
                        <For each={menuItems}>
                            {item =>
                                <NavItem {...item} isExpanded={isExpanded()}/>
                            }
                        </For>
                    </nav>
                </div>
                <Show when={user()}>
                    <div class="py-2">
                        <nav
                            class="grid gap-1 px-2">
                            <NavItem icon={LogOut} isExpanded={isExpanded()} onClick={() => signOut()} label={"Logout"}/>
                        </nav>
                    </div>
                </Show>
            </Motion.div>
        </aside>
    );
};

export default Sidebar;

type NavItemProps = {
    icon: (props: LucideProps) => JSX.Element,
    label: string,
    onClick?: (label: string) => void,
    href?: string,
    isExpanded: boolean
};

const menuItems = [
    {icon: Plus, label: 'Create template', href: "/templates/create", role: 'User'},
    {icon: Home, label: 'Home', href: "/", role: 'All'},
    {icon: FileSpreadsheet, label: 'My Templates', href: "/templates", role: 'User'},
    {icon: ClipboardList, label: 'My Forms', href: "/forms", role: 'User'},
    {icon: FileText, label: 'All Templates', href: "/templates/all", role: 'Admin'},
    {icon: Users, label: 'All Forms', href: "/forms/all", role: 'Admin'},
    {icon: UserCog, label: 'User Management', href: "/users/all", role: 'Admin'},
];


const NavItem = (props: NavItemProps) => {
    const match = useMatch(() => (props.href ?? ""));
    const isActive = () => !!props.href && Boolean(match());
    return (
        <Tooltip openDelay={0} closeDelay={0} placement="right">
            <TooltipTrigger
                as={props.href ? A : Button}
                href={props.href}
                onClick={() => props.onClick?.(props.label)}
                class={cn(
                    buttonVariants({
                        variant: isActive() ? "default" : "ghost",
                        size: "sm",
                        class: "text-sm"
                    }),
                    "h-10",
                    "justify-start"
                )}
            >
                <div>
                    <props.icon/>
                </div>
                <span class="sr-only">{props.label}</span>
                <Presence>
                    <Show when={props.isExpanded}>
                        <Motion.div
                            exit={{display: "none"}}
                            transition={{duration: 0.6}}
                            class="ml-3 text-base overflow-hidden">{props.label}</Motion.div>
                    </Show>
                </Presence>
            </TooltipTrigger>
            <TooltipContent class="flex items-center gap-4" classList={{"hidden": props.isExpanded}}>
                {props.label}
            </TooltipContent>
        </Tooltip>
    )

} 