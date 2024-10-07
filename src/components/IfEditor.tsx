import type { ReactNode } from "preact/compat";

export default function IfEditor({ children }: { children: ReactNode }) {
  const isEditor = !!localStorage.getItem("auth");
  return isEditor ? children : null;
}
