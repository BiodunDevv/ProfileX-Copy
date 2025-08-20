import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function POST(req, { params }) {
	const { identifier } = await params;
	const url = `${API_BASE}/portfolio1/${identifier}/contact`;

	const headers = { 'content-type': 'application/json' };
	// Note: Contact endpoint is public, so no auth header needed

	try {
		const body = await req.arrayBuffer();
		const res = await fetch(url, {
			method: 'POST',
			headers,
			body,
		});

		const text = await res.text();
		return new NextResponse(text, { 
			status: res.status, 
			headers: { 'content-type': res.headers.get('content-type') || 'application/json' } 
		});
	} catch (error) {
		console.error('Error sending contact message:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
