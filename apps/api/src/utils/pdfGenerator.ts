import ejs from 'ejs'
import { type Browser, chromium } from 'playwright'

export async function generatePdf(templatePath: string, data: Record<string, unknown>): Promise<Buffer> {
  let browser: Browser | undefined
  try {
    const html = await ejs.renderFile(templatePath, data)

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    })

    const page = await browser.newPage()

    await page.setViewportSize({ width: 1200, height: 800 })

    await page.setContent(html, { waitUntil: 'networkidle' })

    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
      printBackground: true,
      preferCSSPageSize: true,
    })

    return Buffer.from(pdf)
  } catch (error) {
    throw new Error(`Erro ao Gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
