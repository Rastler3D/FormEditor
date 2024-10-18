import {createSignal} from 'solid-js';
import {
    Combobox,
    ComboboxContent,
    ComboboxControl,
    ComboboxInput,
    ComboboxItem,
    ComboboxItemIndicator,
    ComboboxItemLabel,
    ComboboxTrigger
} from "~/components/ui/combobox";
import {FaSolidCheck} from 'solid-icons/fa';

interface TagSelectorProps {
    tags: string[];
    tagOptions: string[];
    onTagsChange: (tags: string[]) => void;
    id?: string
}

export default function TagSelector(props: TagSelectorProps) {
    const [tagInput, setTagInput] = createSignal('');

    const addTag = (tags: string[]) => {
        props.onTagsChange(tags);
        setTagInput('');
    };

    const removeTag = (tag: string) => {
        props.onTagsChange(props.tags.filter(t => t !== tag));
    };

    const tagOptions = () => {
        let tags = props.tagOptions;
        const selectedTags = props.tags;
        const newTags = selectedTags.filter((item) => !tags.includes(item));
        tags = [...tags, ...newTags];
        const currentTag = tagInput();
        if (currentTag.trim() === '' || tags.includes(currentTag)) {
            return tags;
        }
        return [...tags, currentTag];
    };

    return (
        <Combobox<string>
            id={props.id}
            multiple
            options={tagOptions()}
            value={props.tags}
            onChange={addTag}
            placeholder="Select tags"
            itemComponent={value => props.tagOptions.includes(value.item.rawValue) || props.tags.includes(value.item.rawValue)
                ?
                <ComboboxItem item={value.item} class="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ComboboxItemLabel>{value.item.rawValue}</ComboboxItemLabel>
                    <ComboboxItemIndicator>
                        <FaSolidCheck/>
                    </ComboboxItemIndicator>
                </ComboboxItem>
                : <ComboboxItem item={value.item}
                                class="p-2 cursor-pointer bg-blue-50 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ComboboxItemLabel>Create new tag '<b>{value.item.rawValue}</b>'</ComboboxItemLabel>
                    <ComboboxItemIndicator>
                        <FaSolidCheck/>
                    </ComboboxItemIndicator>
                </ComboboxItem>
            }
        >
            <ComboboxControl<string> aria-label="Tags"
                                     class="flex items-center text-sm ring-offset-background placeholder:text-muted-foreground has-[:focus]:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full p-2 text-left bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded shadow-sm has-[:focus]:outline-none has-[:focus]:ring-2 has-[:focus]:ring-blue-500">
                {state => (
                    <>
                        <div class="flex items-center gap-2 flex-wrap p-2 w-full">
                            {state.selectedOptions().map(option => (
                                <span
                                    onPointerDown={e => e.stopPropagation()}
                                    class="bg-zinc-100 dark:bg-zinc-700 text-sm px-2 py-0.5 rounded inline-flex items-center gap-x-2"
                                >
                    {option}
                                    <button
                                        tabindex="-1"
                                        onClick={() => removeTag(option)}
                                        class="ml-1 text-blue-600 hover:text-blue-800"
                                    >
                      &times;
                    </button>
                  </span>
                            ))}
                            <ComboboxInput onInput={e => setTagInput(e.currentTarget.value)}/>
                        </div>
                        <ComboboxTrigger/>
                    </>
                )}
            </ComboboxControl>
            <ComboboxContent
                class="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded shadow-lg"/>
        </Combobox>
    );
}