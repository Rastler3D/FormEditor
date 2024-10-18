import {Navigate,} from '@solidjs/router';
import {useAuth, User} from '../contexts/AuthContext';
import {JSX, Show} from 'solid-js';


interface AuthorizedRouteProps {
    children?: JSX.Element;
    
}
const AuthorizeRoute = (roles?: User["role"][]) => (props: AuthorizedRouteProps) => {
    const {isAuthenticated, hasRole} = useAuth();

    return (
        <Show when={isAuthenticated()} fallback={<Navigate href="/login"/>}>
            <Show when={hasRole(roles)} fallback={
                <div class="m-auto">You don't have permission to access this page</div>
            }>
                {props.children}
            </Show>
        </Show>
    );
};

export default AuthorizeRoute
