import { signIn } from "@/auth";
import Icon from "@/components/layout/actionComponents/iconComponent";

export function GoogleAuthButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/dashboard" });
      }}
    >
      <button
        type="submit"
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#18181a] px-5 text-sm font-semibold text-white transition hover:bg-[#2a2a2d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#236448]"
      >
        <Icon name="google" className="size-5" />
        Continue with Google
      </button>
    </form>
  );
}
