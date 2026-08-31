import { PhoneShell } from "@/components/customer/PhoneShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <PhoneShell>{children}</PhoneShell>;
}
