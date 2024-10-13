import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    FileText,
    HelpCircle,
    Home,
    LogOut,
    LucideProps,
    Settings,
    Users
} from "lucide-solid";
import {Motion, Presence} from "solid-motionone";
import {Button, buttonVariants} from "~/components/ui/button";
import {ScrollArea} from "~/components/ScrollArea";
import {createMemo, createSignal, For, JSX, Show} from "solid-js";
import {Tooltip, TooltipContent, TooltipTrigger} from "~/components/ui/tooltip";
import {Separator} from "~/components/ui/separator";
import {A, useLocation, useResolvedPath} from "@solidjs/router";
import {cn, normalizePath} from "~/lib/utils.ts";

interface SidebarProps {
    isSheet?: boolean
}
const Sidebar = (props: SidebarProps) => {
    const [isExpanded, setIsExpanded] = createSignal(props.isSheet ?? false);

    return (
        <aside>
            <Motion.div
                class={'h-screen flex flex-col border-r group w-16 overflow-x-hidden'}
                data-collapsed={!isExpanded()}
                animate={{width: isExpanded() ? "240px" : "64px"}}
                transition={{duration: props.isSheet? 0 : 0.6}}
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
                        <For each={menuItems}>
                            {item =>
                                <NavItem {...item} isExpanded={isExpanded()}/>
                            }
                        </For>
                    </nav>
                </div>
                <div class="py-2">
                    <nav
                        class="grid gap-1 px-2">
                        <NavItem icon={LogOut} isExpanded={isExpanded()} href={"/logout"} label={"Logout"}/>
                    </nav>
                </div>
            </Motion.div>
        </aside>
    );
};

export default Sidebar;

type NavItemProps = {
    icon: (props: LucideProps) => JSX.Element,
    label: string,
    href: string,
    isExpanded: boolean
};

const menuItems = [
    {icon: Home, label: 'Home', href: "/"},
    {icon: Users, label: 'Team', href: "/template/12"},
    {icon: Calendar, label: 'Schedule', href: "/"},
    {icon: FileText, label: 'Documents', href: "/"},
    {icon: Settings, label: 'Settings', href: "/"},
    {icon: HelpCircle, label: 'Help', href: "/"},
];

const NavItem = (props: NavItemProps) => {
    const to = useResolvedPath(() => props.href);
    const location = useLocation();
    const isActive = createMemo(() => {
        const to_ = to();
        if (to_ === undefined) return [false, false];
        const path = normalizePath(to_.split(/[?#]/, 1)[0]).toLowerCase();
        const loc = decodeURI(normalizePath(location.pathname).toLowerCase());
        return loc === path;
    });
    return (
        <Tooltip openDelay={0} closeDelay={0} placement="right">
            <TooltipTrigger
                as={A}
                href={props.href}
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