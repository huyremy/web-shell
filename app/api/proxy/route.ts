import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';

export const maxDuration = 60;   // Tăng timeout cho Vercel

export async function POST(request: NextRequest) {
  try {
    const { url, action = 'html' } = await request.json();

    if (!url?.startsWith('http')) {
      return NextResponse.json({ error: 'URL phải bắt đầu bằng http hoặc https' }, { status: 400 });
    }

    const browserWSEndpoint = `wss://production-sfo.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`;

    const browser = await puppeteer.connect({
      browserWSEndpoint,
      defaultViewport: { width: 1280, height: 900 },
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
    );

    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    let result;

    if (action === 'screenshot') {
      const screenshot = await page.screenshot({ type: 'png' });
      const base64 = Buffer.from(screenshot).toString('base64');
      result = { success: true, type: 'screenshot', image: `data:image/png;base64,${base64}` };
    } else {
      // Trả về HTML đã render (gần nhất với "truy cập web bình thường")
      const html = await page.content();
      result = { success: true, type: 'html', html, url };
    }

    await browser.close();

    if (result.type === 'html') {
      return new NextResponse(result.html, {
        headers: { 
          'Content-Type': 'text/html; charset=utf-8',
          'X-Original-Url': url 
        },
      });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ 
      success: false, 
      error: 'Không thể load trang. Có thể trang bị chặn hoặc quá chậm.' 
    }, { status: 500 });
  }
}