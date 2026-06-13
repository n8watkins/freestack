"use client";

import type { ServicesData } from "@/lib/types";
import { CompareProvider } from "./CompareContext";
import { Directory } from "./Directory";
import { CompareTray } from "./CompareTray";
import { CompareModal } from "./CompareModal";

/**
 * Client island that wires the compare state to the directory grid, the bottom
 * tray, and the comparison modal.
 */
export function AppShell({ data }: { data: ServicesData }) {
  return (
    <CompareProvider>
      <Directory data={data} />
      <CompareTray />
      <CompareModal />
    </CompareProvider>
  );
}
