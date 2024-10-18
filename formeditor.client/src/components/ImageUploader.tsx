import {createEffect, createSignal, on, Show} from 'solid-js';
import {createDropzone} from "@solid-primitives/upload";
import {FaSolidUpload} from 'solid-icons/fa';
import {ImCross} from 'solid-icons/im';
import {Label} from "~/components/ui/label.tsx";

interface ImageUploaderProps {
    image?: string | File;
    onImageChange: (image?: string | File) => void;
    id: string
}

export default function ImageUploader(props: ImageUploaderProps) {
    const [dragActive, setDragActive] = createSignal(false);
    const [imagePreview, setImagePreview] = createSignal<string>();

    const {setRef} = createDropzone({
        onDrop: (files) => {
            setDragActive(false);
            handleFiles(files.map(x => x.file));
        },
        onDragEnter: () => {
            setDragActive(true)
        },
        onDragOver: () => {
            setDragActive(true)
        },
        onDragLeave: () => {
            setDragActive(false)
        },
        onDragEnd: () => {
            setDragActive(false)
        },
    });

    const handleFiles = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0];
            props.onImageChange(file);
        }
    };

    const handleImagePreview = (image?: File | string) => {
        if (image instanceof File) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(image);
        } else if (typeof image === "string") {
            setImagePreview(image);
        } else {
            setImagePreview();
        }
    };

    const handleManualUpload = (event: Event) => {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            handleFiles(Array.from(input.files));
        }
    };

    createEffect(on(() => props.image, handleImagePreview));

    return (
        <div
            ref={setRef}
            class={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md transition-colors duration-200 hover:border-blue-500 has-[:focus]:ring-offset-2 has-[:focus]:outline-none has-[:focus]:ring-2 has-[:focus]:ring-blue-500 ${
                dragActive() ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : ''
            }`}
        >
            <div class="space-y-1 text-center">
                <Show
                    when={imagePreview()}
                    fallback={
                        <>
                            <FaSolidUpload class="mx-auto h-12 w-12 text-gray-400"/>
                            <div class="flex text-sm text-gray-600">
                                <Label
                                    for={props.id}
                                    class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                                >
                                    <span>Upload a file</span>
                                    <input id={props.id} name="file-upload" type="file" class="sr-only"
                                           onChange={handleManualUpload} accept="image/*" />
                                </Label>
                                <p class="pl-1">or drag and drop</p>
                            </div>
                            <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </>
                    }
                >
                    <div class="relative">
                        <img
                            src={imagePreview()}
                            alt="Preview"
                            class="mx-auto h-32 w-32 object-cover rounded-md"
                        />
                        <button
                            onClick={() => props.onImageChange()}
                            class="absolute top-0 right-0 rounded-full p-1 text-xs"
                            aria-label="Remove image"
                        >
                            <ImCross/>
                        </button>
                    </div>
                    <p class="text-sm text-gray-500">{(props.image as Image).name}</p>
                </Show>
            </div>
        </div>

    );
}