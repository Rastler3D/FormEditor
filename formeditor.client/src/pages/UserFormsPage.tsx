import FormManagement from "~/components/FormManagement.tsx";
import {fetchUserForms, fetchUserTemplates} from "~/services/templateService.ts";
import {useAuth} from "~/contexts/AuthContext.tsx";
const UserFormsPage = () => {
    const { user } = useAuth();
    
    return <FormManagement templateFetcher={(opt) => fetchUserForms(user()!.id, opt)} name="User Forms" />
}

export default UserFormsPage;
