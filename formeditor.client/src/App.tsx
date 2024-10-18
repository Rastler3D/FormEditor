import {lazy} from "solid-js";
import {Router, Route} from "@solidjs/router";
import {AuthProvider} from "~/contexts/AuthContext";
import {ThemeProvider} from "~/contexts/ThemeContext.tsx";
import {LanguageProvider} from "~/contexts/LanguageContext.tsx";
import Layout from "~/components/Layout.tsx";
import AuthorizeRoute from "~/components/AuthorizeRoute.tsx";

const UserTemplatesPage = lazy(() => import("~/pages/UserTemplatesPage.tsx"));
const TemplatePage = lazy(() => import("~/pages/TemplatePage.tsx"));
const TemplateCreationPage = lazy(() => import("~/pages/TemplateCreationPage.tsx"));
const AllTemplatesPage = lazy(() => import("~/pages/AllTemplatesPage.tsx"));
const AllFormsPage = lazy(() => import("~/pages/AllForms.tsx"));
const UserFormsPage = lazy(() => import("~/pages/UserFormsPage.tsx"));
const FormPage = lazy(() => import("~/pages/FormPage.tsx"));
const UserPage = lazy(() => import("~/pages/UserPage.tsx"));
const SearchPage = lazy(() => import("~/pages/SearchPage.tsx"));
const HomePage = lazy(() => import("~/pages/HomePage.tsx"));
const AllUsersPage = lazy(() => import("~/pages/AllUsersPage.tsx"));
const LoginPage = lazy(() => import("~/pages/LoginPage.tsx"));
const RegistrationPage = lazy(() => import("~/pages/RegistrationPage.tsx"));

function App() {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <AuthProvider>
                    <Router root={Layout}>
                        <Route path="/home" component={HomePage}/>
                        <Route path="/search" component={SearchPage}/>
                        <Route path="/login" component={LoginPage}/>
                        <Route path="/registration" component={RegistrationPage}/>

                        <Route path="/templates">
                            <Route path=":id" component={TemplatePage}/>
                            <Route path="/all" component={AuthorizeRoute(["Admin"])}>
                                <Route path="/" component={AllTemplatesPage}/>
                            </Route>
                            <Route component={AuthorizeRoute(["User", "Admin"])}>
                                <Route path="/" component={UserTemplatesPage}/>
                                <Route path="/create" component={TemplateCreationPage}/>
                            </Route>
                        </Route>

                        <Route path="/forms">
                            <Route path=":id" component={FormPage}/>
                            <Route path="/all" component={AuthorizeRoute(["Admin"])}>
                                <Route path="/" component={AllFormsPage}/>
                            </Route>
                            <Route component={AuthorizeRoute(["User", "Admin"])}>
                                <Route path="/" component={UserFormsPage}/>
                            </Route>
                        </Route>

                        <Route path="/users">
                            <Route path=":id" component={UserPage}/>
                            <Route path="/all" component={AuthorizeRoute(["Admin"])}>
                                <Route path="/" component={AllUsersPage}/>
                            </Route>
                        </Route>
                    </Router>
                </AuthProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
}

export default App
