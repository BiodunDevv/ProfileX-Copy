import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function PUT(req, { params }) {
	const { identifier } = await params;
	const url = `${API_BASE}/portfolio1/${identifier}/manage-slug`;

	const headers = { 'content-type': 'application/json' };
	// forward authorization if present
	const auth = req.headers.get('authorization');
	if (auth) headers['authorization'] = auth;

	try {
		const body = await req.arrayBuffer();
		
		const res = await fetch(url, {
			method: 'PUT',
			headers,
			body,
		});

		const text = await res.text();
		return new NextResponse(text, { 
			status: res.status, 
			headers: { 'content-type': res.headers.get('content-type') || 'application/json' } 
		});
	} catch (error) {
		console.error('Error managing slug:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
