import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function GET(req, { params }) {
	const { slug } = await params;
	
	// Try custom slug first (p/{slug}), then fall back to default slug (portfolio1/{slug})
	let url = `${API_BASE}/p/${slug}`;
	
	const headers = {};
	// Note: Shareable links are public, so no auth header needed

	try {
		let res = await fetch(url, {
			method: 'GET',
			headers,
		});

		// If custom slug fails, try default slug
		if (!res.ok && res.status === 404) {
			url = `${API_BASE}/portfolio1/${slug}`;
			res = await fetch(url, {
				method: 'GET',
				headers,
			});
		}

		const text = await res.text();
		return new NextResponse(text, { 
			status: res.status, 
			headers: { 'content-type': res.headers.get('content-type') || 'application/json' } 
		});
	} catch (error) {
		console.error('Error fetching shareable portfolio:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
