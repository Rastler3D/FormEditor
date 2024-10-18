import TemplateManagement from "~/components/TemplateManagement.tsx";
import {fetchUserTemplates} from "~/services/api.ts";


const UserTemplatesPage = () => {
    return <TemplateManagement templateFetcher={fetchUserTemplates} name="User Templates" />
}

export default UserTemplatesPage;