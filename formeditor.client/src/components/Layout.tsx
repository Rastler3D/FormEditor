import { useAuth } from '~/contexts/AuthContext';
import Sidebar from "~/components/Sidebar.tsx";
import Header from "~/components/Header.tsx";
import {JSX} from "solid-js";
const Layout = (props: {children?: JSX.Element} ) => {
    const { signIn } = useAuth()!;
    signIn('admin','password');
    
    return (
        <div class="flex h-screen ">
            <div class="hidden md:flex">
                <Sidebar/>
            </div>
            <div class="flex flex-col flex-1">
                <Header/>
                <main class="flex-1 p-6 ">
                    {props.children}
                </main>
            </div>
        </div>
    );
};

export default Layout;