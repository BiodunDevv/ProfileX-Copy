import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function POST(req) {
  try {
    const body = await req.json();
    const { portfolioId, slug } = body;
    
    if (!portfolioId || !slug) {
      return NextResponse.json({ 
        success: false, 
        message: 'Portfolio ID and slug are required' 
      }, { status: 400 });
    }

    const url = `${API_BASE}/portfolio1/${portfolioId}/manage-slug`;
    
    const headers = { 'content-type': 'application/json' };
    const auth = req.headers.get('authorization');
    if (auth) headers['authorization'] = auth;

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ slug, action: 'update' })
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { 'content-type': response.headers.get('content-type') || 'application/json' }
    });
  } catch (error) {
    console.error('Error updating slug:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}