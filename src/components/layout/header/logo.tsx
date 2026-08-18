import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  src: string;
};

export default function Logo({ src }: LogoProps) {
  return (
    <Link href="/dashboard" aria-label="Forma dashboard">
      <Image src={src} alt="Forma" width={124} height={42} priority />
    </Link>
  );
}
