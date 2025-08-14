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

export async function POST(request) {
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

    const body = await request.json();
    const { templateType, templateId, personalInfo, title, brandName, ...data } = body;

    // Check if user already has a Portfolio 1
    const existingPortfolio = await Portfolio.findOne({
      userId: user.id,
      templateType: 'template1'
    });

    if (existingPortfolio) {
      return NextResponse.json({
        success: false,
        message: 'You already have a Portfolio 1. Use update instead.',
        existingPortfolio: {
          id: existingPortfolio._id,
          slug: existingPortfolio.customSlug || existingPortfolio.slug
        }
      }, { status: 400 });
    }

    // Create new portfolio
    const portfolio = new Portfolio({
      userId: user.id,
      templateId: templateId || 'template1',
      templateType: 'template1',
      title: title || 'My Portfolio',
      brandName,
      personalInfo,
      data: {
        personalInfo,
        title,
        brandName,
        ...data
      }
    });

    await portfolio.save();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://myapp.com';
    const portfolioSlug = portfolio.customSlug || portfolio.slug;

    return NextResponse.json({
      success: true,
      message: 'Portfolio 1 created successfully! 🎉',
      link: `${baseUrl}/portfolio/${portfolioSlug}`,
      data: {
        portfolio: {
          id: portfolio._id,
          slug: portfolioSlug,
          defaultSlug: portfolio.slug,
          customSlug: portfolio.customSlug,
          templateType: portfolio.templateType,
          title: portfolio.title,
          createdAt: portfolio.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
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

    // Get user's Portfolio 1
    const portfolio = await Portfolio.findOne({
      userId: user.id,
      templateType: 'template1'
    });

    if (!portfolio) {
      return NextResponse.json({
        success: false,
        message: 'Portfolio 1 not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        portfolio: {
          id: portfolio._id,
          slug: portfolio.customSlug || portfolio.slug,
          defaultSlug: portfolio.slug,
          customSlug: portfolio.customSlug,
          templateType: portfolio.templateType,
          title: portfolio.title,
          brandName: portfolio.brandName,
          personalInfo: portfolio.personalInfo,
          data: portfolio.data,
          isPublic: portfolio.isPublic,
          views: portfolio.views,
          createdAt: portfolio.createdAt,
          updatedAt: portfolio.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
