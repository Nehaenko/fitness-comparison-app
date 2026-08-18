import {auth} from "@/auth";
import {logoutAction} from "@/helpers/authActions";
import Menu from "@/components/layout/header/menu";
import {getAuthenticatedUserProfile} from "@/app/(protected)/profile/data";

import Logo from "./logo";

export default async function Header() {
    const session = await auth();

    if (!session?.user) return null;

    const profile = await getAuthenticatedUserProfile();
    const displayName = profile.displayName;

    const hour = new Date().getHours();
    const result =
        hour < 12 ? "morning" :
            hour < 18 ? "afternoon" :
                "evening";

    return (
        <header className="sticky top-0 z-30 border-b border-border bg-surface">
            <div
                className="mx-auto grid h-19 w-full max-w-[120rem] grid-cols-[1fr_auto] items-center px-5 md:grid-cols-[1fr_auto_1fr] md:px-10">
                <Logo src="/forma-logo.svg"/>

                <div className="hidden text-center md:block">
                    <p className="font-semibold text-primary">
                        Good {result}, {displayName}
                    </p>
                </div>

                <div className="justify-self-end">
                    <Menu
                        user={{
                            name: displayName,
                            email: session.user.email,
                        }}
                        logoutAction={logoutAction}
                    />
                </div>
            </div>
        </header>
    );
}
