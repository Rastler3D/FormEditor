import {createEffect, createSignal, JSX, on, Show, splitProps, ValidComponent} from 'solid-js';
import {Dynamic} from 'solid-js/web';
import {cn} from "~/lib/utils.ts";

type ImageProps<T extends ValidComponent> = Omit<JSX.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
    src?: File | string;
    as?: T | keyof JSX.HTMLElementTags;
};

const Image = <T extends ValidComponent>(props: ImageProps<T>) => {
    const [imagePreview, setImagePreview] = createSignal<string | undefined>(undefined);
    const [local, others] = splitProps(props, ["src", "as", "class", "style"]);
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

    createEffect(on(() => props.src, handleImagePreview));

    return (
        <Show
            when={local.as}
            fallback={
                <img
                    {...others}
                    src={imagePreview() || props.src as string || ''}
                    alt={props.alt || 'Image'}
                />
            }
        >
            <Dynamic component={local.as}
                     {...others}
                     class={cn("bg-cover bg-center", local.class)}
                     style={`${props.style?? ''} background-image: url("${imagePreview() || props.src as string || ''}");`}
            />
        </Show>
    );
};

export default Image;