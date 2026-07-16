import { create } from "zustand";
import type { DocumentType } from "./penomoran.schema";
interface State { selected: DocumentType | null; setSelected: (value: DocumentType | null) => void; }
export const usePenomoranStore = create<State>((set) => ({ selected: null, setSelected: (selected) => set({ selected }) }));
