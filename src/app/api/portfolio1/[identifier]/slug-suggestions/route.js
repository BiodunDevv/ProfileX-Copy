import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function GET(req, { params }) {
	const { identifier } = await params;
	const url = `${API_BASE}/portfolio1/${identifier}/slug-suggestions`;

	const headers = {};
	// forward authorization if present
	const auth = req.headers.get('authorization');
	if (auth) headers['authorization'] = auth;

	try {
		const res = await fetch(url, {
			method: 'GET',
			headers,
		});

		const text = await res.text();
		return new NextResponse(text, { 
			status: res.status, 
			headers: { 'content-type': res.headers.get('content-type') || 'application/json' } 
		});
	} catch (error) {
		console.error('Error fetching slug suggestions:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
