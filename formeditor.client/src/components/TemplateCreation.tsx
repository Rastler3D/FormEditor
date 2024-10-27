import {Card, CardHeader, CardTitle, CardContent} from '~/components/ui/card';
import TemplateSettings from '~/components/TemplateSettings';
import {AccessSetting, TemplateConfiguration} from '~/types/types.ts';
interface TemplateCreationProps {
    isSavingChanges: boolean;
    onSavedChanges: (template: TemplateConfiguration) => void;
}
export default function TemplateCreation(props: TemplateCreationProps) {
    const newTemplate: TemplateConfiguration = {
        name: "",
        description: '',
        questions: [],
        accessSetting: AccessSetting.All,
        tags: [],
        topic: "Education"
    };

    return (
        <div class="container mx-auto p-4">
            <Card class="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle class="text-2xl font-bold">Create New Template</CardTitle>
                </CardHeader>
                <CardContent>
                    <TemplateSettings template={newTemplate} isSavingChanges={props.isSavingChanges} onSaveChanges={props.onSavedChanges} />
                </CardContent>
            </Card>
        </div>
    );
}