import TemplateManagement from "~/components/TemplateManagement.tsx";
import {fetchAllTemplates} from "~/services/templateService.ts";


const AllTemplatesPage = () => {
    return <TemplateManagement templateFetcher={fetchAllTemplates} name="All Templates" />
}

export default AllTemplatesPage;