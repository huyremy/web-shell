import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { url, sessionId = 'default', action = 'html' } = await request.json();

  if (!url?.startsWith('http')) {
    return NextResponse.json({ error: 'URL không hợp lệ' }, { status: 400 });
  }

  try {
    // Sử dụng session để giữ cookie & state
    const browserWSEndpoint = `wss://production-sfo.browserless.io?token=${process.env.BROWSERLESS_TOKEN}&session=${sessionId}`;

    const browser = await puppeteer.connect({
      browserWSEndpoint,
      defaultViewport: { width: 1280, height: 900 },
    });

    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36');

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const html = await page.content();
    const cookies = await page.cookies();   // Lấy cookie để debug nếu cần

    await browser.close();   // Hoặc không close nếu muốn giữ session sống

    return new NextResponse(html, {
      headers: { 
        'Content-Type': 'text/html; charset=utf-8',
        'X-Session-Id': sessionId,
      },
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Load trang thất bại' }, { status: 500 });
  }
}
