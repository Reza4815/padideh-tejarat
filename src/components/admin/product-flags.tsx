"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleProductFlag } from "@/app/admin/actions";
import { Toggle } from "@/components/admin/table-widgets";

export function ProductFlags({
  id,
  field,
  value,
}: {
  id: string;
  field: "featured" | "active";
  value: boolean;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(value);
  const [, startTransition] = useTransition();

  return (
    <Toggle
      checked={current}
      onChange={(v) => {
        setCurrent(v);
        startTransition(async () => {
          await toggleProductFlag(id, field, v);
          router.refresh();
        });
      }}
    />
  );
}
