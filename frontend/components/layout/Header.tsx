import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export async function Header() {
  const user = await currentUser();
  if (!user) return null;

  const nombre = user.firstName ?? user.emailAddresses[0]?.emailAddress ?? "";

  return (
    <header className="flex min-h-12 shrink-0 items-center justify-between gap-4 border-b border-notion-border bg-notion-bg px-4 py-3 sm:px-6 md:px-8">
      <p className="min-w-0 truncate text-sm text-notion-muted">
        Bienvenido, <span className="font-medium text-notion-text">{nombre}</span>
      </p>
      <div className="shrink-0">
        <UserButton />
      </div>
    </header>
  );
}
