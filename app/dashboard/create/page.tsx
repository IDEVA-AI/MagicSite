import { redirect } from "next/navigation"

export default function CreateProjectPage() {
  redirect("/app/projects/new/wizard")
}
