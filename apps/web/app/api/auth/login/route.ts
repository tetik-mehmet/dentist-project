import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const apiUrl = process.env.API_URL || 'http://localhost:3001';

  let res: Response;
  try {
    res = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ message: 'Sunucuya bağlanılamadı' }, { status: 503 });
  }

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  // Token'ı response body'den al (Set-Cookie parse etmekten çok daha güvenilir)
  const token: string | undefined = data.accessToken;

  // accessToken'ı browser'a sızdırma, sadece user bilgisini döndür
  const { accessToken: _, ...safeData } = data;
  const response = NextResponse.json(safeData);

  if (token) {
    response.cookies.set('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
  }

  return response;
}
