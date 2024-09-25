import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Keycloak({
            profile: (u) => ({
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
                return { ...token, accessToken: account.access_token, user };
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
