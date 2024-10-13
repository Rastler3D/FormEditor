
import {Router, Route} from "@solidjs/router";
import {AuthProvider} from "~/contexts/AuthContext";
import Layout from "~/components/Layout.tsx";
import TemplateManager from "~/components/TemplateManager.tsx";
import {ThemeProvider} from "~/contexts/ThemeContext.tsx";
import {LanguageProvider} from "~/contexts/LanguageContext.tsx";

function App() {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <AuthProvider>
                    <Router root={Layout}>
                        <Route path="/template/:id" component={TemplateManager}/>
                        {/*<Route path="/" element={<MyTemplates />} />*/}
                        {/*<Route path="/my-templates" element={<MyTemplates />} />*/}
                        {/*<Route path="/my-forms" element={<MyForms />} />*/}
                        {/*<Route path="/all-templates" element={<AllTemplates />} />*/}
                        {/*<Route path="/all-forms" element={<AllForms />} />*/}
                        {/*<Route path="/login" element={<Login />} />*/}
                    </Router>
                </AuthProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
}

export default App
