declare module 'color-thief' {
  export default class ColorThief {
    getColor(sourceImage: HTMLImageElement | HTMLCanvasElement): [number, number, number];
    getPalette(
      sourceImage: HTMLImageElement | HTMLCanvasElement,
      colorCount?: number,
      quality?: number
    ): [number, number, number][];
  }
}
