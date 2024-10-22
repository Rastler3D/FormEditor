import TemplateManagement from "~/components/TemplateManagement.tsx";
import {fetchTemplates} from "~/services/templateService.ts";


const AllTemplatesPage = () => {
    return <TemplateManagement templateFetcher={fetchTemplates} name="All Templates" />
}

export default AllTemplatesPage;