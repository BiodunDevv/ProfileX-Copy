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

// Validate slug format
function validateSlug(slug) {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length >= 2 && slug.length <= 50;
}

// Generate slug from name
function generateSlugFromName(name) {
  if (!name || typeof name !== 'string') {
    return null;
  }
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
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

export async function PUT(request, { params }) {
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
    const body = await request.json();
    const { action, preferredName, customSlug } = body;

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
    let newSlug = null;
    let oldSlug = portfolio.customSlug;

    switch (action) {
      case 'create':
        if (!preferredName) {
          return NextResponse.json({
            success: false,
            message: 'Preferred name is required for create action'
          }, { status: 400 });
        }

        newSlug = generateSlugFromName(preferredName);
        if (!newSlug || !validateSlug(newSlug)) {
          return NextResponse.json({
            success: false,
            message: 'Invalid preferred name. Please use only letters, numbers, and spaces.'
          }, { status: 400 });
        }

        // Check if slug is available
        if (!(await isSlugAvailable(newSlug, portfolio._id))) {
          // Generate suggestions
          const suggestions = [];
          for (let i = 1; i <= 5; i++) {
            const suggestion = `${newSlug}-${i}`;
            if (await isSlugAvailable(suggestion, portfolio._id)) {
              suggestions.push(suggestion);
            }
          }
          
          // Add some creative variations
          const variations = [
            `${newSlug}-portfolio`,
            `${newSlug}-dev`,
            `${newSlug}-2025`,
            `${newSlug}-official`
          ];
          
          for (const variation of variations) {
            if (await isSlugAvailable(variation, portfolio._id)) {
              suggestions.push(variation);
            }
          }

          return NextResponse.json({
            success: false,
            message: `Slug '${newSlug}' is already taken by another user. Please choose another one.`,
            takenSlug: newSlug,
            suggestedAlternatives: suggestions.slice(0, 5)
          }, { status: 409 });
        }

        portfolio.customSlug = newSlug;
        break;

      case 'update':
        if (!customSlug) {
          return NextResponse.json({
            success: false,
            message: 'Custom slug is required for update action'
          }, { status: 400 });
        }

        if (!validateSlug(customSlug)) {
          return NextResponse.json({
            success: false,
            message: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.'
          }, { status: 400 });
        }

        // Check if slug is available
        if (!(await isSlugAvailable(customSlug, portfolio._id))) {
          return NextResponse.json({
            success: false,
            message: `Slug '${customSlug}' is already taken by another user.`
          }, { status: 409 });
        }

        newSlug = customSlug;
        portfolio.customSlug = newSlug;
        break;

      case 'remove':
        portfolio.customSlug = null;
        newSlug = portfolio.slug; // Revert to default slug
        break;

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action. Use: create, update, or remove'
        }, { status: 400 });
    }

    await portfolio.save();

    const currentSlug = portfolio.customSlug || portfolio.slug;
    
    return NextResponse.json({
      success: true,
      message: action === 'remove' 
        ? 'Custom slug removed successfully. Reverted to default slug.'
        : action === 'create'
        ? 'Custom slug created successfully!'
        : 'Custom slug updated successfully!',
      data: {
        portfolio: {
          id: portfolio._id,
          title: portfolio.title,
          oldSlug: oldSlug,
          newSlug: currentSlug,
          defaultSlug: portfolio.slug,
          customSlug: portfolio.customSlug,
          shareableLink: `/portfolio/${currentSlug}`
        },
        links: {
          oldUrl: oldSlug ? `${baseUrl}/portfolio/${oldSlug}` : null,
          newUrl: `${baseUrl}/portfolio/${currentSlug}`,
          defaultUrl: `${baseUrl}/portfolio/${portfolio.slug}`,
          apiUrl: `${baseUrl}/portfolio1/${portfolio._id}`
        }
      }
    });

  } catch (error) {
    console.error('Error managing portfolio slug:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
