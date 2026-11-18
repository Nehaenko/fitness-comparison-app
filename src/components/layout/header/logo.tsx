import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  src: string;
};

export default function Logo({ src }: LogoProps) {
  return (
    <Link href="/dashboard" aria-label="Forma dashboard">
      <span className="relative block h-[42px] w-[124px]">
        <Image
          src={src}
          alt="Forma"
          width={124}
          height={42}
          priority
          className="theme-logo-light"
        />
        <Image
          src="/forma-logo-dark.svg"
          alt=""
          width={124}
          height={42}
          priority
          className="theme-logo-dark"
        />
      </span>
    </Link>
  );
}
