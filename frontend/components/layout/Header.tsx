import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export async function Header() {
  const user = await currentUser();
  if (!user) return null;

  const nombre = user.firstName ?? user.emailAddresses[0]?.emailAddress ?? "";

  return (
    <header className="h-12 bg-notion-bg border-b border-notion-border flex items-center justify-between px-8 shrink-0">
      <p className="text-sm text-notion-muted">
        Bienvenido, <span className="font-medium text-notion-text">{nombre}</span>
      </p>
      <UserButton />
    </header>
  );
}
