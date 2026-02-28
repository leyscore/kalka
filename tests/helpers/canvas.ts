import type { Page, Locator } from '@playwright/test'

export class CanvasHelper {
  readonly page: Page
  readonly canvas: Locator

  constructor(page: Page) {
    this.page = page
    this.canvas = page.locator('canvas')
  }

  async waitForRender() {
    await this.page.evaluate(() => new Promise(requestAnimationFrame))
  }

  async waitForInit() {
    await this.page.locator('canvas[data-ready="1"]').waitFor({ timeout: 5000 })
  }

  async clearCanvas() {
    await this.selectAll()
    await this.pressKey('Backspace')
    await this.waitForRender()
  }

  async screenshotCanvas() {
    return this.canvas.screenshot()
  }

  private async canvasBounds() {
    return this.canvas.boundingBox().then((b) => b!)
  }

  async click(canvasX: number, canvasY: number) {
    const box = await this.canvasBounds()
    await this.page.mouse.click(box.x + canvasX, box.y + canvasY)
  }

  async drag(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    steps = 10
  ) {
    const box = await this.canvasBounds()
    await this.page.mouse.move(box.x + fromX, box.y + fromY)
    await this.page.mouse.down()
    await this.page.mouse.move(box.x + toX, box.y + toY, { steps })
    await this.page.mouse.up()
  }

  async pressKey(key: string) {
    await this.page.keyboard.press(key)
  }

  async drawRect(x: number, y: number, width: number, height: number) {
    await this.pressKey('r')
    await this.drag(x, y, x + width, y + height)
    await this.waitForRender()
  }

  async drawEllipse(x: number, y: number, width: number, height: number) {
    await this.pressKey('o')
    await this.drag(x, y, x + width, y + height)
    await this.waitForRender()
  }

  async selectTool(tool: 'select' | 'frame' | 'rectangle' | 'ellipse' | 'text' | 'pen' | 'hand') {
    const keys: Record<string, string> = {
      select: 'v',
      frame: 'f',
      rectangle: 'r',
      ellipse: 'o',
      text: 't',
      pen: 'p',
      hand: 'h'
    }
    await this.pressKey(keys[tool])
  }

  async deleteSelection() {
    await this.pressKey('Backspace')
    await this.waitForRender()
  }

  async undo() {
    await this.pressKey('Meta+z')
    await this.waitForRender()
  }

  async redo() {
    await this.pressKey('Meta+Shift+z')
    await this.waitForRender()
  }

  async selectAll() {
    await this.pressKey('Meta+a')
  }

  async duplicate() {
    await this.pressKey('Meta+d')
    await this.waitForRender()
  }
}
