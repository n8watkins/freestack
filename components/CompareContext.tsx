"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Service } from "@/lib/types";

export const MAX_COMPARE = 4;

type CompareCtx = {
  selected: Service[];
  ids: Set<string>;
  toggle: (s: Service) => void;
  remove: (id: string) => void;
  clear: () => void;
  isFull: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CompareCtx | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<Service[]>([]);
  const [open, setOpen] = useState(false);

  const ids = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);
  const isFull = selected.length >= MAX_COMPARE;

  const toggle = useCallback((s: Service) => {
    setSelected((cur) => {
      if (cur.some((x) => x.id === s.id)) return cur.filter((x) => x.id !== s.id);
      if (cur.length >= MAX_COMPARE) return cur;
      return [...cur, s];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setSelected((cur) => cur.filter((x) => x.id !== id));
  }, []);

  const clear = useCallback(() => {
    setSelected([]);
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({ selected, ids, toggle, remove, clear, isFull, open, setOpen }),
    [selected, ids, toggle, remove, clear, isFull, open]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCompare() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
