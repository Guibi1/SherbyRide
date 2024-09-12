import Keycloak, { type KeycloakLoginOptions, type KeycloakLogoutOptions } from "keycloak-js";
import { type Accessor, type JSXElement, createContext, createSignal, onCleanup, useContext } from "solid-js";
import { isDev, isServer } from "solid-js/web";

export type User = {
    email: string;
    email_verified: boolean;
    family_name: string;
    given_name: string;
    name: string;
    preferred_username: string;
    sub: string;
};

const KeycloakContext = createContext<{
    authenticated: Accessor<boolean>;
    token: Accessor<string>;
    user: Accessor<User | undefined>;
    login: (options?: KeycloakLoginOptions) => Promise<void>;
    logout: (options?: KeycloakLogoutOptions) => Promise<void>;
}>({
    authenticated: () => false,
    token: () => "",
    user: () => undefined,
    login: async () => {},
    logout: async () => {},
});

export function KeycloakProvider(props: { children: JSXElement }) {
    const [kc, setKc] = createSignal<Keycloak>();
    const [token, setToken] = createSignal<string>("");
    const [user, setUser] = createSignal<User>();
    const authenticated = () => user() !== undefined;

    if (!isServer) {
        const keycloak = new Keycloak({
            url: isDev ? "http://localhost:8180" : "TODO", // Keycloak URL
            realm: "api",
            clientId: "frontend",
        });

        keycloak
            .init({ onLoad: "check-sso", checkLoginIframe: true })
            .then((authenticated) => {
                if (authenticated && keycloak.token) {
                    setToken(keycloak.token);
                } else {
                    console.log("User not authenticated");
                }
            })
            .catch((err) => {
                console.error("Keycloak initialization failed:", err);
            });

        keycloak.onAuthRefreshSuccess = () => setToken(keycloak.token ?? "");
        keycloak.onAuthLogout = () => setToken(keycloak.token ?? "");
        keycloak.onAuthSuccess = () => {
            setToken(keycloak.token ?? "");
            keycloak.loadUserInfo().then(setUser);
        };
        keycloak.onAuthError = (e) => {
            console.error(e);
            setToken(keycloak.token ?? "");
        };
        setKc(keycloak);

        // Refresh token periodically
        const id = setInterval(() => {
            if (authenticated()) {
                keycloak
                    .updateToken(70)
                    .then((refreshed) => {
                        if (refreshed && keycloak.token) {
                            setToken(keycloak.token);
                        }
                    })
                    .catch(() => {
                        console.error("Failed to refresh token");
                        keycloak.logout();
                    });
            }
        }, 6000); // Refresh every minute
        onCleanup(() => clearInterval(id));
    }

    return (
        <KeycloakContext.Provider
            value={{
                authenticated,
                token,
                user,
                logout: kc()?.logout ?? (async () => {}),
                login: kc()?.login ?? (async () => {}),
            }}
        >
            {props.children}
        </KeycloakContext.Provider>
    );
}

export function useKeycloak() {
    return useContext(KeycloakContext);
}
