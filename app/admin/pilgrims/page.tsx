import { redirect } from "next/navigation";

export default function AdminPilgrimsRedirectPage() {
  redirect("/admin/operators");
}
