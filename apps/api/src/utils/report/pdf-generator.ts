import chromium from '@sparticuz/chromium'
import ejs from 'ejs'
import { type Browser, chromium as playwrightChromium } from 'playwright-core'

import { ApiError } from '@/utils/api-error'

type GeneratePdfOptions = {
  landscape?: boolean
}

export async function generatePdfFromTemplate(
  templatePath: string,
  data: Record<string, unknown>,
  options: GeneratePdfOptions = {},
): Promise<Buffer> {
  let browser: Browser | undefined

  try {
    const html = await ejs.renderFile(templatePath, data)

    browser = await playwrightChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    })

    const page = await browser.newPage()
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.setContent(html, { waitUntil: 'networkidle' })

    const pdf = await page.pdf({
      format: 'A4',
      landscape: options.landscape ?? false,
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
    throw new ApiError(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 500)
  } finally {
    if (browser) await browser.close()
  }
}
