"use client";

import { useState, useEffect } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, ListOrdered } from "lucide-react";

export interface ExerciseItem {
  key: string;
  name: string;
  group: string;
}

interface ExerciseReorderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercises: ExerciseItem[];
  onSave: (reorderedKeys: string[]) => void;
}

interface DraggableExerciseProps {
  item: ExerciseItem;
  index: number;
}

function DraggableExercise({ item, index }: DraggableExerciseProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragControls={controls}
      dragListener={false}
      className="list-none"
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
        zIndex: 50,
        borderRadius: "8px",
      }}
      transition={{ type: "spring", stiffness: 500, damping: 38 }}
      layout
    >
      <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg mb-2 group transition-colors hover:border-primary/40">
        {/* Número de orden */}
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 transition-all duration-200">
          {index + 1}
        </div>

        {/* Info del ejercicio */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-tight truncate">{item.name}</p>
          <Badge variant="secondary" className="text-xs mt-1 font-normal">
            {item.group}
          </Badge>
        </div>

        {/* Handle de arrastre */}
        <button
          type="button"
          aria-label="Arrastrar para reordenar"
          className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground/50 hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted shrink-0"
          onPointerDown={(e) => {
            e.preventDefault();
            controls.start(e);
          }}
        >
          <GripVertical className="h-5 w-5" />
        </button>
      </div>
    </Reorder.Item>
  );
}

export function ExerciseReorderModal({
  open,
  onOpenChange,
  exercises,
  onSave,
}: ExerciseReorderModalProps) {
  const [items, setItems] = useState<ExerciseItem[]>(exercises);

  // Sincronizar items cuando el modal se abre
  useEffect(() => {
    if (open) {
      setItems([...exercises]);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    onSave(items.map((i) => i.key));
    onOpenChange(false);
  };

  const handleCancel = () => {
    setItems([...exercises]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full flex flex-col max-h-[85vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ListOrdered className="h-5 w-5 text-primary" />
            Reorganizar Ejercicios
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Arrastra cada ejercicio al orden de ejecución que deseas.
          </p>
        </DialogHeader>

        {/* Divider */}
        <div className="h-px bg-border shrink-0" />

        {/* Lista reordenable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No hay ejercicios para organizar en este día.
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                <GripVertical className="h-3.5 w-3.5" />
                Usa el ícono de la derecha para arrastrar
              </p>
              <Reorder.Group
                axis="y"
                values={items}
                onReorder={setItems}
                className="m-0 p-0"
              >
                {items.map((item, index) => (
                  <DraggableExercise key={item.key} item={item} index={index} />
                ))}
              </Reorder.Group>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border shrink-0" />

        {/* Footer */}
        <DialogFooter className="px-6 py-4 gap-2 shrink-0 flex-row justify-end">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={items.length === 0}>
            Aplicar orden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
