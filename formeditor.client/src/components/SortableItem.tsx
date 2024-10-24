import { createSortable, transformStyle, useDragDropContext } from '@thisbeyond/solid-dnd';
import {GripVertical} from "lucide-solid";
import { createSignal, JSX } from "solid-js";

const SortableItem = (props: {children: (listener: Listener) => JSX.Element, id: string | number }) => {
    const sortable = createSortable(props.id);
    const [state] = useDragDropContext();
    return (
        <div
            ref={sortable.ref}
            style={transformStyle(sortable.transform)}
            classList={{
                "opacity-25": sortable.isActiveDraggable,
                "transition-transform": !!state.active.draggable,
            }}
        >
            {props.children(sortable.dragActivators)}
        </div>
    );
};

export default SortableItem;