import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

async function proxyToId(req, id) {
	const url = `${API_BASE}/portfolio1/${id}`;

	const headers = {};
	// forward authorization if present
	const auth = req.headers.get('authorization');
	if (auth) headers['authorization'] = auth;

	const method = req.method;
	const body = method === 'GET' || method === 'HEAD' ? undefined : await req.arrayBuffer();

	const res = await fetch(url, {
		method,
		headers,
		body,
	});

	const text = await res.text();
	return new NextResponse(text, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } });
}

export async function GET(req, { params }) {
	const { identifier } = await params;
	return proxyToId(req, identifier);
}

export async function PUT(req, { params }) {
	const { identifier } = await params;
	return proxyToId(req, identifier);
}

export async function DELETE(req, { params }) {
	const { identifier } = await params;
	return proxyToId(req, identifier);
}
