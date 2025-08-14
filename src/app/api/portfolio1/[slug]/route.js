import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Portfolio from '@/lib/models/Portfolio';

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    
    await connectDB();

    // Find portfolio by custom slug first, then by default slug
    let portfolio = await Portfolio.findOne({
      $or: [
        { customSlug: slug },
        { slug: slug }
      ],
      isPublic: true // Only return public portfolios
    });

    if (!portfolio) {
      return NextResponse.json({
        success: false,
        message: 'Portfolio 1 not found'
      }, { status: 404 });
    }

    // Increment view count
    await Portfolio.findByIdAndUpdate(portfolio._id, {
      $inc: { views: 1 }
    });

    const foundBy = portfolio.customSlug === slug ? 'by custom slug' : 'by default slug';

    return NextResponse.json({
      success: true,
      foundBy,
      data: {
        portfolio: {
          id: portfolio._id,
          slug: portfolio.customSlug || portfolio.slug,
          defaultSlug: portfolio.slug,
          customSlug: portfolio.customSlug,
          templateType: portfolio.templateType,
          templateId: portfolio.templateId,
          title: portfolio.title,
          brandName: portfolio.brandName,
          personalInfo: portfolio.personalInfo,
          data: portfolio.data,
          isPublic: portfolio.isPublic,
          views: portfolio.views + 1, // Return incremented count
          createdAt: portfolio.createdAt,
          updatedAt: portfolio.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Error fetching portfolio by slug:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
