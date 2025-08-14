import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import TemplateOne from '@/app/components/TemplateOne/TemplateOne';
import TemplateTwo from '@/app/components/TemplateTwo/TemplateTwo';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://profilexbackend.onrender.com';

interface Portfolio {
  _id: string;
  templateType: string;
  brandName: string;
  heroImage: string;
  title: string;
  description: string;
  sectionAbout: string;
  sectionSubtitle: string;
  aboutMeDescription: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    bio?: string;
    tagline?: string;
  };
  socialLinks: Array<{
    platform: string;
    url: string;
    icon: string;
  }>;
  skills: Array<{
    name: string;
    level: number;
    category?: string;
    color: string;
    _id?: string;
  }>;
  experience: Array<{
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    achievements?: string[];
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    liveUrl?: string;
    githubUrl?: string;
    featured: boolean;
    imageUrl?: string;
  }>;
  theme: string;
  isPublic: boolean;
  customUrl?: string;
  slug?: string;
  isPasswordProtected?: boolean;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getPortfolioBySlug(slug: string): Promise<Portfolio | null> {
  try {
    // Use your backend API endpoint for fetching portfolio by slug
    const response = await fetch(
      `${API_BASE_URL}/portfolio1/${slug}`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data?.portfolio) {
        return result.data.portfolio;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const portfolio = await getPortfolioBySlug(slug);

  if (!portfolio) {
    return {
      title: 'Portfolio Not Found',
      description: 'The requested portfolio could not be found.',
    };
  }

  // Safely extract name and title with fallbacks
  const portfolioName = portfolio.personalInfo?.fullName || 
                        portfolio.brandName || 
                        portfolio.title || 
                        'Portfolio';
  const portfolioTitle = portfolio.title || 'Professional Portfolio';
  const portfolioDescription = portfolio.description || 
                               portfolio.aboutMeDescription || 
                               'Professional portfolio showcase';

  return {
    title: `${portfolioName} - ${portfolioTitle}`,
    description: portfolioDescription,
    openGraph: {
      title: `${portfolioName} - ${portfolioTitle}`,
      description: portfolioDescription,
      images: portfolio.heroImage ? [portfolio.heroImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${portfolioName} - ${portfolioTitle}`,
      description: portfolioDescription,
      images: portfolio.heroImage ? [portfolio.heroImage] : [],
    },
  };
}

export default async function PortfolioPage({ params }: PageProps) {
  const { slug } = await params;
  const portfolio = await getPortfolioBySlug(slug);

  if (!portfolio) {
    notFound();
  }

  // Debug: Log the portfolio data to understand the structure
  console.log('Portfolio data:', {
    isPublic: portfolio.isPublic,
    isPublicType: typeof portfolio.isPublic,
    visibility: (portfolio as any).visibility,
    status: (portfolio as any).status,
    allKeys: Object.keys(portfolio)
  });

  // Check if portfolio is public - be more explicit about the check
  // If isPublic is explicitly false, then it's private
  // If isPublic is true or undefined/null, default to public
  const isPublic = portfolio.isPublic !== false;

  // Check if portfolio is public or password protected
  if (!isPublic && portfolio.isPasswordProtected) {
    // TODO: Implement password protection component
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Password Protected</h1>
          <p className="text-gray-400">This portfolio is password protected.</p>
        </div>
      </div>
    );
  }

  if (!isPublic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Private Portfolio</h1>
          <p className="text-gray-400">This portfolio is private and not accessible.</p>
        </div>
      </div>
    );
  }

  // Render the appropriate template based on templateType
  switch (portfolio.templateType) {
    case 'template1':
    case 'templateOne':
      return <TemplateOne portfolioData={portfolio} />;
    
    case 'template2':
    case 'templateTwo':
      return <TemplateTwo portfolioData={portfolio} />;
    
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Template Not Found</h1>
            <p className="text-gray-400">
              The portfolio template "{portfolio.templateType}" is not supported.
            </p>
          </div>
        </div>
      );
  }
}
