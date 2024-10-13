import { createSortable } from '@thisbeyond/solid-dnd';
import { FaSolidGripVertical } from 'solid-icons/fa';

const SortableItem = (props) => {
    const sortable = createSortable(props.id);
    return (
        <div
            use:sortable
            class="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-2 transition-all duration-200 hover:shadow-md"
        >
            <div class="cursor-move text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                <FaSolidGripVertical />
            </div>
            <div class="flex-grow">{props.children}</div>
        </div>
    );
};

export default SortableItem;