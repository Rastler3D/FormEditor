import { createSignal, Show } from 'solid-js';
import { createDropzone } from "@solid-primitives/upload";
import { FaSolidUpload } from 'solid-icons/fa';
import { ImCross } from 'solid-icons/im';

interface ImageUploaderProps {
    image: string | null;
    onImageChange: (image: string | null) => void;
}

export default function ImageUploader(props: ImageUploaderProps) {
    const [dragActive, setDragActive] = createSignal(false);
    const [imagePreview, setImagePreview] = createSignal<string | null>(null);

    const { setRef, files } = createDropzone({
        accept: "image/*",
        multiple: false,
        onDrop: (files) => {
            setDragActive(false);
            handleFiles(files.map(x => x.file));
        },
        onDragEnter: () => setDragActive(true),
        onDragOver: () => setDragActive(true),
        onDragLeave: () => setDragActive(false),
        onDragEnd: () => setDragActive(false),
    });

    const handleFiles = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
                props.onImageChange(file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleManualUpload = (event: Event) => {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            handleFiles(Array.from(input.files));
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        props.onImageChange(null);
    };

    return (
        <div>
            <label htmlFor="image" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Image</label>
            <div
                ref={setRef}
                class={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md transition-colors duration-200 hover:border-blue-500 has-[:focus]:ring-offset-2 has-[:focus]:outline-none has-[:focus]:ring-2 has-[:focus]:ring-blue-500 ${
                    dragActive() ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : ''
                }`}
            >
                <div class="space-y-1 text-center">
                    <Show
                        when={imagePreview() || props.image}
                        fallback={
                            <>
                                <FaSolidUpload class="mx-auto h-12 w-12 text-gray-400" />
                                <div class="flex text-sm text-gray-600">
                                    <label
                                        htmlFor="file-upload"
                                        class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                                    >
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" class="sr-only" onChange={handleManualUpload} accept="image/*" />
                                    </label>
                                    <p class="pl-1">or drag and drop</p>
                                </div>
                                <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </>
                        }
                    >
                        <div class="relative">
                            <img
                                src={imagePreview() || props.image || ''}
                                alt="Preview"
                                class="mx-auto h-32 w-32 object-cover rounded-md"
                            />
                            <button
                                onClick={removeImage}
                                class="absolute top-0 right-0 rounded-full p-1 text-xs"
                                aria-label="Remove image"
                            >
                                <ImCross />
                            </button>
                        </div>
                        <p class="text-sm text-gray-500">{props.image}</p>
                    </Show>
                </div>
            </div>
        </div>
    );
}