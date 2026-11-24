import { updateUserName } from "@/app/(protected)/profile/actions";
import { getAuthenticatedUserProfile } from "@/app/(protected)/profile/data";
import Preferences from "@/app/(protected)/profile/preferences";
import { auth } from "@/auth";
import { logoutAction } from "@/helpers/authActions";
import PrimaryButton from "@/components/layout/actionComponents/primaryButton";
import LegalLinks from "@/components/legal/legalLinks";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) return null;

    const profile = await getAuthenticatedUserProfile();
    const userName = profile.displayName;
    const userEmail = session.user.email || "No email available";
    const firstNameLetter = userName.charAt(0).toUpperCase();

    return (
        <main className="flex-1 bg-canvas px-5 py-7 sm:px-8 md:px-12 md:py-14 lg:px-20">
            <div className="w-full max-w-5xl">
                <header>
                    <h1 className="font-display text-display font-bold text-3xl">
                        Profile
                    </h1>
                    <p className="mt-1 text-base text-secondary">
                        Manage your account and preferences
                    </p>

                    <div className="mt-4 flex items-center gap-5 md:mt-5 md:gap-8">
                        <div
                            className="flex size-15 shrink-0 items-center justify-center rounded-3xl bg-brand font-display text-3xl text-on-accent"
                            aria-hidden="true"
                        >
                            {firstNameLetter}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-base font-semibold">
                                {userName}
                            </p>
                            <p className="mt-0.5 truncate text-base text-secondary">
                                {userEmail}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="mt-7 space-y-7 md:mt-10 md:space-y-8">
                    <section className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
                        <h2 className="border-b border-divider px-7 py-6 text-lg font-semibold">
                            Account details
                        </h2>

                        <form action={updateUserName} className="space-y-5 px-7 py-6">
                            <label className="block">
                                <span className="form-label">
                                    Name
                                </span>
                                <input
                                    className="form-control"
                                    name="account-name"
                                    defaultValue={userName}
                                    autoComplete="name"
                                    required
                                    minLength={2}
                                    maxLength={50}
                                />
                            </label>

                            <label className="block">
                                <span className="form-label">
                                    Email
                                </span>
                                <input
                                    className="form-control cursor-not-allowed"
                                    type="email"
                                    value={userEmail}
                                    readOnly
                                    aria-readonly="true"
                                    tabIndex={-1}
                                />
                            </label>

                            <PrimaryButton
                                type="submit"
                                variant="primary"
                                label="Save changes"
                                ariaLabel="Save changes"
                            />
                        </form>
                    </section>

                    <Preferences
                        initialWeightUnit={profile.weightUnit}
                        initialMeasurementUnit={profile.measurementUnit}
                    />

                    <section className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
                        <h2 className="border-b border-divider px-7 py-6 text-lg font-semibold">
                            Security
                        </h2>
                        <div className="px-7 py-6 md:px-8">
                            <form action={logoutAction}>
                                <PrimaryButton
                                    type="submit"
                                    variant="secondary"
                                    label="Log out"
                                    iconName="logout"
                                    ariaLabel="Log out"
                                />
                            </form>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
                        <h2 className="border-b border-divider px-7 py-6 text-lg font-semibold">
                            Legal
                        </h2>
                        <LegalLinks className="px-7 py-6 md:px-8" />
                    </section>
                </div>
            </div>
        </main>
    )
}
