import { createEffect, createSignal, For } from 'solid-js';
import { Bold, Italic, List, ListOrdered, Link, Image, Code, Heading, Quote, MoreHorizontal } from 'lucide-solid';
import { Button } from "~/components/ui/button";
import { TextField, TextFieldTextArea } from "~/components/ui/text-field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { SolidMarkdown } from 'solid-markdown';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';

interface MarkdownEditorProps {
    value: string;
    onChange: (text: string) => void;
    id?: string;
    required?: boolean;
}

const MarkdownEditor = (props: MarkdownEditorProps) => {
    const [activeTab, setActiveTab] = createSignal('edit');
    const [selectedStyles, setSelectedStyles] = createSignal({});

    const insertOrRemoveMarkdown = (prefix: string, suffix = '', blockStyle = false) => {
        const textarea = document.getElementById(props.id ?? 'markdown-editor') as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        let newText;
        let newSelectionStart;
        let newSelectionEnd;

        if (blockStyle) {
            const lines = selection.split('\n');
            const allLinesStyled = lines.every(line => line.startsWith(prefix));

            if (allLinesStyled) {
                newText = before + lines.map(line => line.substring(prefix.length)).join('\n') + after;
                newSelectionStart = start;
                newSelectionEnd = end - prefix.length * lines.length;
            } else {
                newText = before + lines.map(line => prefix + line).join('\n') + after;
                newSelectionStart = start + prefix.length;
                newSelectionEnd = end + prefix.length * lines.length;
            }
        } else {
            const isStyled = selection.startsWith(prefix) && selection.endsWith(suffix);

            if (isStyled) {
                newText = before + selection.slice(prefix.length, -suffix.length) + after;
                newSelectionStart = start;
                newSelectionEnd = end - prefix.length - suffix.length;
            } else {
                newText = before + prefix + selection + suffix + after;
                newSelectionStart = start + prefix.length;
                newSelectionEnd = end + prefix.length + suffix.length;
            }
        }

        props.onChange(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
            updateSelectedStyles();
        }, 0);
    };

    const updateSelectedStyles = () => {
        const textarea = document.getElementById(props.id ?? 'markdown-editor') as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selection = text.substring(start, end);
        const lines = selection.split('\n');

        const styles = {
            bold: false,
            italic: false,
            code: false,
            heading: false,
            quote: false,
            orderedList: false,
            unorderedList: false,
        };

        if (start === end) {
            // Check styles at cursor position
            const line = text.substring(0, start).split('\n').pop() || '';
            const cursorPosition = start - (text.substring(0, start).lastIndexOf('\n') + 1);
            styles.bold = /\*\*[^*]*\*\*/.test(line.substring(0, cursorPosition)) && /\*\*[^*]*\*\*/.test(line.substring(cursorPosition));
            styles.italic = /(?<!\*)\*(?!\*)[^*]*\*/.test(line.substring(0, cursorPosition)) && /(?<!\*)\*(?!\*)[^*]*\*/.test(line.substring(cursorPosition));
            styles.code = /`[^`]*`/.test(line.substring(0, cursorPosition)) && /`[^`]*`/.test(line.substring(cursorPosition));
            styles.heading = /^#{1,6}\s/.test(line);
            styles.quote = line.startsWith('> ');
            styles.orderedList = /^\d+\.\s/.test(line);
            styles.unorderedList = line.startsWith('- ');
        } else {
            // Check styles for selection
            styles.bold = /^\*\*.*\*\*$/.test(selection);
            styles.italic = /^(?<!\*)\*(?!\*).*\*$/.test(selection);
            styles.code = /^`.*`$/.test(selection);
            styles.heading = lines.every(line => /^#{1,6}\s/.test(line));
            styles.quote = lines.every(line => line.startsWith('> '));
            styles.orderedList = lines.every(line => /^\d+\.\s/.test(line));
            styles.unorderedList = lines.every(line => line.startsWith('- '));
        }

        setSelectedStyles(styles);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'b':
                    e.preventDefault();
                    insertOrRemoveMarkdown('**', '**');
                    break;
                case 'i':
                    e.preventDefault();
                    insertOrRemoveMarkdown('*', '*');
                    break;
                case 'k':
                    e.preventDefault();
                    insertOrRemoveMarkdown('[', '](url)');
                    break;
            }
        }
    };

    const actions = [
        { icon: Bold, tooltip: 'Bold (Ctrl+B)', action: () => insertOrRemoveMarkdown('**', '**'), style: 'bold' },
        { icon: Italic, tooltip: 'Italic (Ctrl+I)', action: () => insertOrRemoveMarkdown('*', '*'), style: 'italic' },
        { icon: Heading, tooltip: 'Heading', action: () => insertOrRemoveMarkdown('# ', '', true), style: 'heading' },
        { icon: Quote, tooltip: 'Blockquote', action: () => insertOrRemoveMarkdown('> ', '', true), style: 'quote' },
        { icon: List, tooltip: 'Unordered List', action: () => insertOrRemoveMarkdown('- ', '', true), style: 'unorderedList' },
        { icon: ListOrdered, tooltip: 'Ordered List', action: () => insertOrRemoveMarkdown('1. ', '', true), style: 'orderedList' },
        { icon: Link, tooltip: 'Link (Ctrl+K)', action: () => insertOrRemoveMarkdown('[', '](url)') },
        { icon: Image, tooltip: 'Image', action: () => insertOrRemoveMarkdown('![alt text](', ')') },
        { icon: Code, tooltip: 'Inline Code', action: () => insertOrRemoveMarkdown('`', '`'), style: 'code' },
    ];

    createEffect(() => {
        const textarea = document.getElementById(props.id ?? 'markdown-editor') as HTMLTextAreaElement;
        if (textarea) {
            textarea.addEventListener('mouseup', updateSelectedStyles);
            textarea.addEventListener('keyup', updateSelectedStyles);
        }
        return () => {
            if (textarea) {
                textarea.removeEventListener('mouseup', updateSelectedStyles);
                textarea.removeEventListener('keyup', updateSelectedStyles);
            }
        };
    });

    return (
        <div class="w-full border rounded-md overflow-hidden has-[:focus]:outline-none has-[:focus]:ring-2 has-[:focus]:ring-primary">
            <Tabs value={activeTab()} onChange={setActiveTab}>
                <div class="flex justify-between items-center p-2 bg-muted border-b">
                    <div class="flex space-x-2 overflow-x-auto md:overflow-x-visible">
                        <For each={actions.slice(0, 3)}>
                            {(action) => (
                                <Tooltip>
                                    <TooltipTrigger asChild tabIndex={-1}>
                                        <Button
                                            tabIndex={-1}
                                            onClick={action.action}
                                            class={`p-1 bg-transparent hover:bg-gray-200 hover:dark:bg-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white ${
                                                selectedStyles()[action.style] ? 'bg-blue-100 dark:bg-blue-900' : ''
                                            }`}
                                        >
                                            <action.icon size={18} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent class="bg-gray-800 text-white text-sm py-1 px-2 rounded">
                                        {action.tooltip}
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </For>
                        <Popover>
                            <PopoverTrigger asChild tabIndex={-1}>
                                <Button tabIndex={-1} class="p-1 bg-transparent hover:bg-gray-200 hover:dark:bg-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white md:hidden">
                                    <MoreHorizontal size={18} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent class="w-32 p-1.5">
                                <div class="grid grid-cols-3 gap-2">
                                    <For each={actions.slice(3)}>
                                        {(action) => (
                                            <Tooltip>
                                                <TooltipTrigger asChild tabIndex={-1}>
                                                    <Button
                                                        tabIndex={-1}
                                                        onClick={action.action}
                                                        class={`p-1 bg-transparent hover:bg-gray-200 hover:dark:bg-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white ${
                                                            selectedStyles()[action.style] ? 'bg-blue-100 dark:bg-blue-900' : ''
                                                        }`}
                                                    >
                                                        <action.icon size={18} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent class="bg-gray-800 text-white text-sm py-1 px-2 rounded">
                                                    {action.tooltip}
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </For>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <For each={actions.slice(3)} >
                            {(action) => (
                                <Tooltip>
                                    <TooltipTrigger asChild tabIndex={-1}>
                                        <Button
                                            tabIndex={-1}
                                            onClick={action.action}
                                            class={`hidden md:flex p-1 bg-transparent hover:bg-gray-200 hover:dark:bg-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white ${
                                                selectedStyles()[action.style] ? 'bg-blue-100 dark:bg-blue-900' : ''
                                            }`}
                                        >
                                            <action.icon size={18} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent class="text-white text-sm py-1 px-2 rounded">
                                        {action.tooltip}
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </For>
                    </div>
                    <TabsList class="flex" tabIndex={-1}>
                        <TabsTrigger
                            tabIndex={-1}
                            value="edit"
                            class="px-3 py-1 text-sm rounded-l-md focus:ring-1 focus:ring-primary "
                            classList={{
                                'bg-primary z-10': activeTab() === 'edit',
                                'bg-gray-200 dark:bg-gray-700': activeTab() !== 'edit',
                            }}
                        >
                            Edit
                        </TabsTrigger>
                        <TabsTrigger
                            tabIndex={-1}
                            value="preview"
                            class="px-3 py-1 text-sm rounded-r-md focus:ring-1 focus:ring-primary"
                            classList={{
                                'bg-primary z-10': activeTab() === 'preview',
                                'bg-gray-200 dark:bg-gray-700': activeTab() !== 'preview',
                            }}
                        >
                            Preview
                        </TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="edit" class="mt-0">
                    <TextField required={props.required}
                               value={props.value}
                               onChange={(value) => props.onChange(value)}>
                        <TextFieldTextArea
                            id={props.id ?? 'markdown-editor'}
                            onSelect={updateSelectedStyles}
                            onKeyDown={handleKeyDown}
                            class="border-0 mt-0 block w-full rounded-md border-gray-300 shadow-sm ring-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            placeholder="Enter description here..."
                            rows="9"
                        />
                    </TextField>
                </TabsContent>
                <TabsContent value="preview">
                    <div class="w-full h-64 p-4 overflow-y-auto prose dark:prose-invert max-w-none">
                        <SolidMarkdown>{props.value}</SolidMarkdown>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MarkdownEditor;