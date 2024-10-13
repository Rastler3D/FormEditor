import {For} from 'solid-js';
import {TemplateInfo} from '~/types/template';
import TemplateCard, {TemplateSkeleton} from "~/components/TemplateCard.tsx";

interface TemplateGalleryProps {
    templates?: TemplateInfo[],
    isLoading: boolean;
}

const TemplateGallery = (props: TemplateGalleryProps) => {

    return (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {props.isLoading ? (
                <For each={Array(8).fill(null)}>
                    {() => <TemplateSkeleton/>}
                </For>
            ) : (
                <For each={props.templates}>
                    {(template) => <TemplateCard template={template}/>}
                </For>
            )}
        </div>
    );
};

export default TemplateGallery;


