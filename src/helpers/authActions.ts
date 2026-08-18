import {signOut} from "@/auth";

export const logoutAction = async () => {
    "use server"
    await signOut({redirectTo: "/"});
};