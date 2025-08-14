import { NextRequest, NextResponse } from 'next/server';

// Your backend is hosted, frontend is local
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://profilexbackend.onrender.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    console.log(`Fetching portfolio for slug: ${slug}`);
    console.log(`Using API_BASE_URL: ${API_BASE_URL}`);

    // Fetch from your hosted backend API using the exact endpoint structure you provided
    const response = await fetch(`${API_BASE_URL}/portfolio1/${slug}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`API Response Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log('Successfully fetched portfolio:', data);
      return NextResponse.json(data);
    } else {
      const errorData = await response.text();
      console.log(`API Error Response:`, errorData);
      
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error fetching portfolio by slug:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
