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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://myapp.com';
    const hasCustomSlug = !!portfolio.customSlug;
    const activeSlug = portfolio.customSlug || portfolio.slug;

    return NextResponse.json({
      success: true,
      message: 'Custom slug info retrieved successfully',
      data: {
        hasCustomSlug,
        customSlug: portfolio.customSlug,
        defaultSlug: portfolio.slug,
        activeSlug,
        shareableLink: `/portfolio/${activeSlug}`,
        isCustomLinkEnabled: hasCustomSlug,
        portfolio: {
          id: portfolio._id,
          title: portfolio.title,
          templateType: portfolio.templateType,
          isPublic: portfolio.isPublic,
          views: portfolio.views,
          createdAt: portfolio.createdAt,
          updatedAt: portfolio.updatedAt
        },
        links: {
          customUrl: hasCustomSlug ? `${baseUrl}/portfolio/${portfolio.customSlug}` : null,
          defaultUrl: `${baseUrl}/portfolio/${portfolio.slug}`,
          activeUrl: `${baseUrl}/portfolio/${activeSlug}`,
          apiUrl: `${baseUrl}/portfolio1/${portfolio._id}`
        }
      }
    });

  } catch (error) {
    console.error('Error fetching custom slug info:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
