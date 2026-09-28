import { User } from "@/db/schema";

type UserSelect = Omit<
  User,
  "passwordHash" | "createdAt" | "updatedAt" | "id" | "avatarUrl"
> & {
  password: string;
  description: string;
};
const adminPassword = "AdminPass123!";
const demoPassword = "DemoPass123!";

export const demoUsers: UserSelect[] = [
  {
    email: "admin@healthinsight.org",
    name: "Dr. Sarah Jenkins",
    role: "ADMIN",
    password: adminPassword,
    description: "Full control & audit logs",
  },
  {
    email: "pm@healthinsight.org",
    name: "Alex Rivera",
    role: "PROGRAMME_MANAGER",
    password: demoPassword,
    description: "Upload & analyze datasets",
  },
  {
    email: "researcher@healthinsight.org",
    name: "Dr. Marcus Vance",
    role: "RESEARCHER",
    password: demoPassword,
    description: "Semantic RAG & compare",
  },
  {
    email: "viewer@healthinsight.org",
    name: "Elena Rostova",
    role: "VIEWER",
    password: demoPassword,
    description: "Read-only AI queries",
  },
];
