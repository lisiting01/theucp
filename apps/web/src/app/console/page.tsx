import { MainShell } from "@/components/main-shell";
import { ConsoleContent } from "@/components/console-content";

export default function ConsolePage() {
  // TODO: 实际实现时需要添加权限检查
  // const session = await getServerSession();
  // if (!session?.user?.isAdmin) redirect('/');

  return (
    <MainShell>
      <ConsoleContent />
    </MainShell>
  );
}
