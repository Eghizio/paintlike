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

const download = (fileName: string, serializedData: string) => {
  const fileToSave = new Blob([serializedData], {
    type: "application/json",
    // type: "octet/stream",
  });

  const url = window.URL.createObjectURL(fileToSave);

  const a = document.createElement("a");
  a.setAttribute("style", "display: none;");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);

  a.click();

  window.URL.revokeObjectURL(url);
  a.remove();
};

const loadCanvasData = (file: File) => {
  const reader = new FileReader();
  reader.addEventListener("load", (event) => {
    if (!event.target) return;
    const data = event.target.result;

    if (!data) return;

    try {
      const canvasData = JSON.parse(data.toString());

      const imgData = new ImageData(canvasData.width, canvasData.height, {
        colorSpace: canvasData.colorSpace,
      });
      imgData.data.set(canvasData.data);

      ctx.putImageData(imgData, 0, 0);
    } catch (error) {
      console.log(error);
    }
  });

  reader.readAsText(file);
};

const downloadCanvasData = (canvas: HTMLCanvasElement) => {
  const timestamp = Date.now();
  const id = Math.ceil(Math.random() * 1_000_000).toString(16);
  const fileName = `canvas_data_${timestamp}_${id}.json`;

  const context = getCanvasContextSafely(canvas);
  const { data, colorSpace, width, height } = context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const payload = {
    data: [...data],
    colorSpace: colorSpace.toString(),
    width: Number(width),
    height: Number(height),
  };

  const serializedPayload = JSON.stringify(payload);

  download(fileName, serializedPayload);
};

document.querySelector("input#upload")?.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement)) return;

  const [file] = [...(event.target.files ?? [])];

  loadCanvasData(file);
});

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
