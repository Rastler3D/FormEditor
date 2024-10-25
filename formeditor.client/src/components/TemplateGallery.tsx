import {For} from 'solid-js';
import {TemplateInfo} from '~/types/template';
import TemplateCard, {TemplateSkeleton} from "~/components/TemplateCard.tsx";

interface TemplateGalleryProps {
    templates?: TemplateInfo[];
    isLoading: boolean;
}

const TemplateGallery = (props: TemplateGalleryProps) => {
    return (
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <For each={props.isLoading ? Array(8).fill(null) : props.templates}>
                {(template) => (
                    <div class="w-full">
                        {props.isLoading ? <TemplateSkeleton /> : <TemplateCard template={template!} />}
                    </div>
                )}
            </For>
        </div>
    );
};

export default TemplateGallery;


