import FormManagement from "~/components/FormManagement.tsx";
import {getForms} from "~/services/formService.ts";
const AllFormsPage = () => {
    return <FormManagement formFetcher={getForms} name="All Forms" />
}

export default AllFormsPage;