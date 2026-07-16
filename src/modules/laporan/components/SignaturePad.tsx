"use client";
import { useEffect, useRef, useState } from "react";
import { Eraser, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SignaturePad({ value, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;
    const image = new Image();
    image.onload = () =>
      canvas
        .getContext("2d")
        ?.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.src = value;
  }, [value]);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * event.currentTarget.width) / rect.width,
      y:
        ((event.clientY - rect.top) * event.currentTarget.height) / rect.height,
    };
  };
  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = event.currentTarget.getContext("2d");
    if (!ctx) return;
    const p = point(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
    setDrawing(true);
  };
  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = event.currentTarget.getContext("2d");
    const p = point(event);
    ctx?.lineTo(p.x, p.y);
    ctx?.stroke();
  };
  const finish = () => {
    const canvas = canvasRef.current;
    if (drawing && canvas) onChange(canvas.toDataURL("image/png"));
    setDrawing(false);
  };
  const clear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-bold text-foreground">
          <PenLine className="w-4 h-4" /> Tanda Tangan Pelaksana
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={clear}>
          <Eraser className="w-4 h-4" /> Hapus
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        width={700}
        height={180}
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={finish}
        onPointerLeave={finish}
        className="w-full h-36 bg-white border-2 border-dashed border-border rounded-xl touch-none cursor-crosshair"
      />
      <p className="text-[10px] text-muted-foreground">
        Gambar tanda tangan pada area di atas.
      </p>
    </div>
  );
}
