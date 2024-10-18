import FormManagement from "~/components/FormManagement.tsx";
import {fetchAllForms} from "~/services/api.ts";


const AllFormsPage = () => {
    return <FormManagement templateFetcher={fetchAllForms} name="All Forms" />
}

export default AllFormsPage;