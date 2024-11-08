import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Keycloak({
            profile: async (u) => ({
                id: u.id,
                cip: u.preferred_username,
                name: u.name,
                givenName: u.given_name,
                familyName: u.family_name,
                email: u.email,
                emailVerified: u.email_verified,
                image: u.image,
            }),
        }),
    ],
    callbacks: {
        jwt({ token, account, user }) {
            if (account) {
                return {
                    ...token,
                    provider: account.provider,
                    id_token: account.id_token,
                    accessToken: account.access_token,
                    user,
                };
            }
            return { ...token };
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            // @ts-expect-error
            session.user = token.user;
            return session;
        },
    },
    events: {
        async signOut(message) {
            console.log("logout", message);
            if ("token" in message && message.token?.provider === "keycloak") {
                const issuerUrl = process.env.AUTH_KEYCLOAK_ISSUER;
                const logOutUrl = new URL(`${issuerUrl}/protocol/openid-connect/logout`);
                logOutUrl.searchParams.set("id_token_hint", message.token.id_token as string);
                await fetch(logOutUrl);
            }
        },
    },
});

declare module "next-auth" {
    interface Session {
        accessToken: string;
        user: User;
    }
}

export type User = {
    id: string;
    cip: string;
    name: string;
    givenName: string;
    familyName: string;
    email: string;
    emailVerified: boolean;
    image?: string;
};
