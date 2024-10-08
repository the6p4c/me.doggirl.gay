import type { ComponentChildren } from "preact";

export default function IfEditor({
  children,
}: {
  children: ComponentChildren;
}) {
  const isEditor = !!localStorage.getItem("auth");
  return isEditor ? children : null;
}
