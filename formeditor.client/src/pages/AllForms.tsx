import FormManagement from "~/components/FormManagement.tsx";
import {getForms} from "~/services/formService.ts";
const AllFormsPage = () => {
    return <FormManagement templateFetcher={getForms} name="All Forms" />
}

export default AllFormsPage;