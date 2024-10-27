import FormManagement from "~/components/FormManagement.tsx";
import {getUserForms} from "~/services/formService.ts";
import {useAuth} from "~/contexts/AuthContext.tsx";
const UserFormsPage = () => {
    const { user } = useAuth();
    
    return <FormManagement formFetcher={(opt) => getUserForms(user()!.id, opt)}  name="User Forms" />
}

export default UserFormsPage;
