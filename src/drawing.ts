export enum Mode {
  MICE = "MICE",
  LINE = "LINE",
  RECTANGLE = "RECTANGLE",
  CIRCLE = "CIRCLE",
}

export const ToMode = (mode: string): Mode => {
  if (mode in Mode) {
    return Mode[mode as keyof typeof Mode];
  }
  throw new Error(`Unknown mode "${mode}"`);

  //   switch (mode) {
  //     case "MICE":
  //       return Mode.MICE;
  //     case "LINE":
  //       return Mode.LINE;
  //     case "RECTANGLE":
  //       return Mode.RECTANGLE;
  //     case "CIRCLE":
  //       return Mode.CIRCLE;
  //     default:
  //       throw new Error(`Unknown mode "${mode}"`);
  //   }
};

export type Color = string;

export class Point {
  constructor(public x: number, public y: number) {}

  toString() {
    return `(${this.x}, ${this.y})`;
  }
}

export class Paint {
  constructor(
    private canvas: HTMLCanvasElement,
    private context: CanvasRenderingContext2D,
    private mode: Mode = Mode.MICE,
    private color: Color = "#000000",
    private isDrawing: boolean = false,
    private start: Point | null = null
  ) {}

  toString() {
    return `Is drawing: ${this.isDrawing}\nMode: ${this.mode}\nStart: ${this.start}\nColor: ${this.color}`;
  }

  changeMode(mode: Mode) {
    this.mode = mode;
  }

  getMode() {
    return this.mode;
  }

  setColor(color: Color) {
    this.color = color;
  }

  getColor() {
    return this.color;
  }

  setIsDrawing(drawing: boolean) {
    this.isDrawing = drawing;
  }

  setStart(start: Point) {
    this.start = start;
  }

  brush(end: Point) {
    if (!this.isDrawing || !this.start) return;

    switch (this.mode) {
      case Mode.MICE:
        return this.#drawPixel(end, this.color);
      case Mode.LINE:
        return this.#drawLine(this.start, end, this.color);
      case Mode.RECTANGLE:
        return this.#drawRectangle(this.start, end, this.color);
      case Mode.CIRCLE:
        return this.#drawCircle(this.start, end, this.color);
      default:
        throw new Error(`Unknown mode "${this.mode}"`);
    }
  }

  #drawPixel(start: Point, color: Color = this.getColor()) {
    const radius = 1;

    this.context.fillStyle = color;
    this.context.beginPath();
    this.context.arc(start.x, start.y, radius, 0, Math.PI * 2);
    this.context.closePath();
    this.context.fill();
  }

  #drawLine(start: Point, end: Point, color: Color = this.getColor()) {
    this.context.strokeStyle = color;
    this.context.beginPath();
    this.context.moveTo(start.x, start.y);
    this.context.lineTo(end.x, end.y);
    this.context.closePath();
    this.context.stroke();
  }

  #drawRectangle(start: Point, end: Point, color: Color = this.getColor()) {
    const w = end.x - start.x;
    const h = end.y - start.y;

    this.context.strokeStyle = color;
    this.context.rect(start.x, start.y, w, h);
    this.context.stroke();
  }

  #drawCircle(center: Point, edge: Point, color: Color = this.getColor()) {
    const radius = Math.max(
      Math.abs(edge.x - center.x),
      Math.abs(edge.y - center.y)
    );

    this.context.fillStyle = color;
    this.context.beginPath();
    this.context.arc(center.x, center.y, radius, 0, Math.PI * 2);
    this.context.closePath();
    this.context.fill();
  }

  clear() {
    this.context.fillStyle = "#ffffff";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
