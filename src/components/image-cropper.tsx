"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { Crop, X } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslations } from "./language-provider";
import styles from "./image-cropper.module.css";

export function ImageCropper({
  file,
  payment,
  onCancel,
  onConfirm,
}: {
  file: File;
  payment: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}) {
  const t = useTranslations();
  const dialog = useRef<HTMLDialogElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [ratio, setRatio] = useState("original");
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const source = URL.createObjectURL(file);
    if (image.current) image.current.src = source;
    const element = dialog.current;
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      URL.revokeObjectURL(source);
      element?.close();
      document.body.style.overflow = overflow;
    };
  }, [file]);
  const aspect = dimensions.width / dimensions.height || 1;
  const target = ratio === "square" ? 1 : ratio === "wide" ? 3 : aspect;
  const width = Math.min(1, target / aspect) / zoom;
  const height = Math.min(1, aspect / target) / zoom;
  const left = position.x * (1 - width);
  const top = position.y * (1 - height);
  const ready = dimensions.width > 0 && !error;
  async function confirm() {
    if (!image.current || !ready || busy) return;
    setBusy(true);
    try {
      const sourceWidth = dimensions.width * width;
      const sourceHeight = dimensions.height * height;
      const scale = Math.min(1, 2048 / Math.max(sourceWidth, sourceHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(sourceWidth * scale));
      canvas.height = Math.max(1, Math.round(sourceHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error();
      context.drawImage(
        image.current,
        left * dimensions.width,
        top * dimensions.height,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob || blob.size > 5 * 1024 * 1024) throw new Error();
      onConfirm(new File([blob], "cropped-image.png", { type: "image/png" }));
    } catch {
      setError(
        "Could not crop this image. Try another image or use the original.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="crop-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <header className={styles.header}>
        <h2 id="crop-title">
          <Crop size={20} /> {t("Crop image")}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          disabled={busy}
          aria-label={t("Cancel")}
        >
          <X size={20} />
        </Button>
      </header>
      <p>
        {t(
          payment
            ? "Keep the entire QR code and its white border inside the crop."
            : "Drag the crop area to position your image.",
        )}
      </p>
      <div className={styles.stage}>
        <div className={styles.frame} ref={frame}>
          <img
            ref={image}
            alt={t("Image to crop")}
            draggable={false}
            onLoad={(event) => {
              const { naturalWidth: width, naturalHeight: height } =
                event.currentTarget;
              if (width * height > 16_000_000) {
                setError("Choose an image smaller than 16 megapixels.");
                return;
              }
              setDimensions({ width, height });
            }}
            onError={() => setError("Could not read this image.")}
          />
          {ready && (
            <div
              className={styles.selection}
              style={{
                left: `${left * 100}%`,
                top: `${top * 100}%`,
                width: `${width * 100}%`,
                height: `${height * 100}%`,
              }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                drag.current = {
                  x: event.clientX,
                  y: event.clientY,
                  left,
                  top,
                };
              }}
              onPointerMove={(event) => {
                if (!drag.current || !frame.current) return;
                const rect = frame.current.getBoundingClientRect();
                setPosition({
                  x:
                    width >= 1
                      ? 0.5
                      : Math.max(
                          0,
                          Math.min(
                            1,
                            (drag.current.left +
                              (event.clientX - drag.current.x) / rect.width) /
                              (1 - width),
                          ),
                        ),
                  y:
                    height >= 1
                      ? 0.5
                      : Math.max(
                          0,
                          Math.min(
                            1,
                            (drag.current.top +
                              (event.clientY - drag.current.y) / rect.height) /
                              (1 - height),
                          ),
                        ),
                });
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
              onLostPointerCapture={() => {
                drag.current = null;
              }}
            />
          )}
        </div>
      </div>
      <div className={styles.controls}>
        <label>
          {t("Crop shape")}
          <select
            value={ratio}
            disabled={busy}
            onChange={(event) => {
              setRatio(event.target.value);
              setPosition({ x: 0.5, y: 0.5 });
            }}
          >
            <option value="original">{t("Original")}</option>
            <option value="square">{t("Square")}</option>
            <option value="wide">{t("Wide")}</option>
          </select>
        </label>
        <label>
          {t("Zoom")}
          <input
            type="range"
            min="1"
            max="4"
            step="0.01"
            value={zoom}
            disabled={!ready || busy}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </label>
        <label>
          {t("Horizontal position")}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={position.x}
            disabled={!ready || busy || width >= 1}
            onChange={(event) =>
              setPosition({ ...position, x: Number(event.target.value) })
            }
          />
        </label>
        <label>
          {t("Vertical position")}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={position.y}
            disabled={!ready || busy || height >= 1}
            onChange={(event) =>
              setPosition({ ...position, y: Number(event.target.value) })
            }
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="message error">
          {t(error)}
        </p>
      )}
      <footer className={styles.actions}>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={onCancel}
        >
          {t("Cancel")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => onConfirm(file)}
        >
          {t("Use full image")}
        </Button>
        <Button type="button" disabled={!ready || busy} onClick={confirm}>
          {t(busy ? "Saving..." : "Crop & upload")}
        </Button>
      </footer>
    </dialog>
  );
}
