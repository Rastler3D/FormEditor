import TemplateManagement from "~/components/TemplateManagement.tsx";
import {fetchAllTemplates} from "~/services/api.ts";


const AllTemplatesPage = () => {
    return <TemplateManagement templateFetcher={fetchAllTemplates} name="All Templates" />
}

export default AllTemplatesPage;