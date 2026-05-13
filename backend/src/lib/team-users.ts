import type { PrismaClient } from "@prisma/client";

const TEAM_USERS = [
  {
    clerkId: "team-felipe",
    nombre: "Felipe",
    email: "felipe@dacan.local",
    timezone: "America/Santiago",
  },
  {
    clerkId: "team-galie",
    nombre: "Galie",
    email: "galie@dacan.local",
    timezone: "America/Santiago",
  },
  {
    clerkId: "team-alejandro",
    nombre: "Alejandro",
    email: "alejandro@dacan.local",
    timezone: "America/Santiago",
  },
  {
    clerkId: "team-juan-jose",
    nombre: "Juan Jose",
    email: "juan.jose@dacan.local",
    timezone: "Europe/Zurich",
  },
  {
    clerkId: "team-lorenzo",
    nombre: "Lorenzo",
    email: "lorenzo@dacan.local",
    timezone: "America/Santiago",
  },
];

export async function ensureTeamUsers(prisma: PrismaClient) {
  const count = await prisma.usuario.count();
  if (count > 0) return;

  await Promise.all(
    TEAM_USERS.map((user) =>
      prisma.usuario.upsert({
        where: { clerkId: user.clerkId },
        update: {
          nombre: user.nombre,
          email: user.email,
          timezone: user.timezone,
          activo: true,
        },
        create: user,
      })
    )
  );
}
