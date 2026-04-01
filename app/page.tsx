'use client';

import { useState } from 'react';

export default function WebShell() {
  const [url, setUrl] = useState('');
  const [resultHtml, setResultHtml] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setResultHtml('');

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, action: 'html' }),
      });

      if (res.headers.get('content-type')?.includes('text/html')) {
        const html = await res.text();
        setResultHtml(html);
        setCurrentUrl(url);
      } else {
        const data = await res.json();
        if (!data.success) setError(data.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Web Shell (Browserless)</h1>
        <p className="text-gray-400 text-center mb-10">Nhập URL → Xem trang qua headless browser</p>

        <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-blue-600"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-10 py-4 rounded-2xl font-medium transition-all"
          >
            {loading ? 'Đang mở browser...' : 'Mở trang'}
          </button>
        </form>

        {error && (
          <div className="bg-red-900/50 border border-red-700 p-4 rounded-2xl mb-8 text-red-300">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Đang load trang qua Browserless... (có thể mất 5-15 giây)</p>
          </div>
        )}

        {resultHtml && (
          <div className="border border-gray-700 rounded-3xl overflow-hidden shadow-2xl bg-white">
            <iframe
              srcDoc={resultHtml}
              className="w-full h-[85vh] border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              title="Web Shell Preview"
            />
            <div className="p-4 bg-gray-900 text-sm text-gray-400 border-t border-gray-700">
              Đang xem: <span className="text-blue-400 break-all">{currentUrl}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}