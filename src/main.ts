import { type Color, Paint, Point, Mode, ToMode } from "./drawing";
import "./style.css";

const getElementSafely = <K extends keyof HTMLElementTagNameMap>(tag: K) => {
  const element = document.querySelector(tag);
  if (!element) throw new Error(`No "${tag}"`);
  return element;
};

const getCanvasContextSafely = (
  canvas: HTMLCanvasElement
): CanvasRenderingContext2D => {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("No context");
  return context;
};

const getColor = (): Color => getElementSafely("input").value;

const downloadCanvasData = (canvas: HTMLCanvasElement) => {
  const context = getCanvasContextSafely(canvas);
  const data = context.getImageData(0, 0, canvas.width, canvas.height);

  const timestamp = Date.now();
  const id = Math.ceil(Math.random() * 1_000_000).toString(16);
  const fileName = `canvas_data_${timestamp}_${id}.json`;

  const fileToSave = new Blob([JSON.stringify(data)], {
    type: "application/json",
    // type: "octet/stream",
  });

  const a = document.createElement("a");
  a.setAttribute("style", "display: none;");
  document.body.appendChild(a);
  const url = window.URL.createObjectURL(fileToSave);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
};

const canvas = getElementSafely("canvas");
const ctx = getCanvasContextSafely(canvas);
const { width, height } = canvas.getBoundingClientRect();
ctx.canvas.width = width;
ctx.canvas.height = height;

const paint = new Paint(canvas, ctx, Mode.MICE);

const isHtmlButtonElement = (element: unknown): element is HTMLElement =>
  Boolean(element) &&
  element instanceof HTMLButtonElement &&
  element.tagName === "BUTTON";

getElementSafely("nav").addEventListener("click", (event) => {
  const btn = event.target;
  if (!isHtmlButtonElement(btn)) return;

  const label = btn.id.toUpperCase();
  if (label === "DOWNLOAD") return downloadCanvasData(canvas);

  const currentMode = ToMode(label);
  paint.changeMode(currentMode);

  [...document.querySelectorAll("button")].forEach((btn) =>
    btn.classList.remove("active")
  );
  btn.classList.add("active");
});

getElementSafely("input").addEventListener("change", () =>
  paint.setColor(getColor())
);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    paint.clear();
  }
});

const drawPixel = ({ offsetX: x, offsetY: y }: MouseEvent) => {
  if (paint.getMode() === "MICE") {
    paint.brush(new Point(x, y));
  }
};

canvas.addEventListener("mousedown", ({ offsetX: x, offsetY: y }) => {
  paint.setIsDrawing(true);
  paint.setStart(new Point(x, y));
});

canvas.addEventListener("mousemove", drawPixel);
canvas.addEventListener("click", drawPixel);

canvas.addEventListener("mouseup", ({ offsetX: x, offsetY: y }) => {
  paint.brush(new Point(x, y));
  paint.setIsDrawing(false);
});
