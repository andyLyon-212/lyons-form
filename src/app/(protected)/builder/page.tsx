import { auth } from "@/lib/auth";

export default async function BuilderPage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold">Form Builder</h1>
      <p className="mt-2 text-muted-foreground">
        Building as {session?.user?.name ?? "User"}
      </p>
    </div>
  );
}
