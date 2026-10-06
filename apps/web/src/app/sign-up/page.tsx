import { redirect } from "next/navigation";

/** Legacy path — the registration form now lives at /registration. */
export default function SignUpRedirect() {
  redirect("/registration");
}
