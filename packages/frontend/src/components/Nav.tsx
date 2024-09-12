import { useLocation } from "@solidjs/router";
import { Show } from "solid-js";
import { useKeycloak } from "~/lib/keycloak";

export default function Nav() {
    const { authenticated, login, logout, user } = useKeycloak();

    const location = useLocation();
    const active = (path: string) =>
        path === location.pathname ? "border-sky-600" : "border-transparent hover:border-sky-600";

    return (
        <div>
            <nav class="bg-sky-800">
                <ul class="container flex items-center p-3 text-gray-200">
                    <li class={`border-b-2 ${active("/")} mx-1.5 sm:mx-6`}>
                        <a href="/">Home</a>
                    </li>
                    <li class={`border-b-2 ${active("/about")} mx-1.5 sm:mx-6`}>
                        <a href="/about">About</a>
                    </li>
                </ul>
            </nav>

            <Show when={authenticated() === false}>
                <button onClick={() => login()} type="button">
                    Login
                </button>
            </Show>

            <Show when={authenticated()}>
                <button onClick={() => logout()} type="button">
                    Log out {user()?.name}
                </button>
            </Show>
        </div>
    );
}
