import { cn } from "~/lib/utils"
import {JSX, splitProps} from "solid-js";

export interface ScrollAreaProps extends JSX.HTMLAttributes<HTMLDivElement> {}
export function ScrollArea(props: ScrollAreaProps) {
    const [, rest] = splitProps(props, ["class"])
    return (
        <div
            class={cn("relative overflow-hidden", props.class)}
            {...rest}
        >
            <div
                class="h-full overflow-auto scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-accent scrollbar-track-transparent flex-column">
                {props.children}
            </div>
        </div>
    )
}