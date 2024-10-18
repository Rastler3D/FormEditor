import FormManagement from "~/components/FormManagement.tsx";
import {fetchUserForms} from "~/services/api.ts";


const UserFormsPage = () => {
    return <FormManagement templateFetcher={fetchUserForms} name="User Forms" />
}

export default UserFormsPage;
