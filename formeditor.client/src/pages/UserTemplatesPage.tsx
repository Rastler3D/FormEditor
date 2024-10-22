import TemplateManagement from "~/components/TemplateManagement.tsx";
import {fetchUserTemplates} from "~/services/templateService.ts";
import {useAuth} from "~/contexts/AuthContext.tsx";


const UserTemplatesPage = () => {
    const { user } = useAuth();
    
    return <TemplateManagement templateFetcher={(opt) => fetchUserTemplates(user()!.id, opt)} name="User Templates" />
}

export default UserTemplatesPage;