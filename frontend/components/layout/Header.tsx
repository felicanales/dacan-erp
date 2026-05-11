import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export async function Header() {
  const user = await currentUser();
  if (!user) return null;

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6 shrink-0">
      <p className="text-sm text-gray-500">
        Bienvenido,{" "}
        <span className="font-medium text-gray-900">
          {user.firstName ?? user.emailAddresses[0]?.emailAddress}
        </span>
      </p>
      <UserButton />
    </header>
  );
}
