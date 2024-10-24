import Sidebar from "~/components/Sidebar.tsx";
import Header from "~/components/Header.tsx";
import {JSX} from "solid-js";
const Layout = (props: {children?: JSX.Element} ) => {
    
    return (
        <div class="flex h-screen overflow-hidden">
            <Sidebar class="hidden md:flex" />
            <div class="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main class="flex-1 overflow-y-auto p-6">
                    {props.children}
                </main>
            </div>
        </div>
    );
    
};

export default Layout;