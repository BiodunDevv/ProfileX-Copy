import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Portfolio from '@/lib/models/Portfolio';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to verify JWT token
function verifyToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Check if slug is available
async function isSlugAvailable(slug, excludePortfolioId = null) {
  const query = {
    $or: [
      { slug: slug },
      { customSlug: slug }
    ]
  };
  
  if (excludePortfolioId) {
    query._id = { $ne: excludePortfolioId };
  }
  
  const existing = await Portfolio.findOne(query);
  return !existing;
}

export async function GET(request, { params }) {
  try {
    // Verify authentication
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const base = searchParams.get('base') || '';

    // Find portfolio and verify ownership
    const portfolio = await Portfolio.findOne({
      _id: id,
      userId: user.id
    });

    if (!portfolio) {
      return NextResponse.json({
        success: false,
        message: 'Portfolio not found or access denied'
      }, { status: 404 });
    }

    if (!base || base.length < 2) {
      return NextResponse.json({
        success: false,
        message: 'Base slug must be at least 2 characters long'
      }, { status: 400 });
    }

    const suggestions = [];

    // Check if the base slug itself is available
    const isBaseAvailable = await isSlugAvailable(base, portfolio._id);
    suggestions.push({
      slug: base,
      available: isBaseAvailable,
      isOriginal: true
    });

    // Generate numbered variations
    for (let i = 1; i <= 5; i++) {
      const numberedSlug = `${base}-${i}`;
      const available = await isSlugAvailable(numberedSlug, portfolio._id);
      suggestions.push({
        slug: numberedSlug,
        available,
        isOriginal: false
      });
    }

    // Generate creative variations
    const variations = [
      `${base}-portfolio`,
      `${base}-dev`,
      `${base}-2025`,
      `${base}-official`,
      `${base}-pro`
    ];

    for (const variation of variations) {
      const available = await isSlugAvailable(variation, portfolio._id);
      suggestions.push({
        slug: variation,
        available,
        isOriginal: false
      });
    }

    // If base contains multiple words, try some combinations
    if (base.includes('-')) {
      const parts = base.split('-');
      if (parts.length >= 2) {
        const firstLast = `${parts[0]}-${parts[parts.length - 1]}`;
        const available = await isSlugAvailable(firstLast, portfolio._id);
        suggestions.push({
          slug: firstLast,
          available,
          isOriginal: false
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Slug suggestions retrieved successfully',
      data: {
        baseSlug: base,
        suggestions: suggestions.slice(0, 10), // Limit to 10 suggestions
        currentCustomSlug: portfolio.customSlug,
        currentDefaultSlug: portfolio.slug,
        totalSuggestions: suggestions.length,
        note: 'These suggestions are globally unique across all portfolio types'
      }
    });

  } catch (error) {
    console.error('Error generating slug suggestions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
