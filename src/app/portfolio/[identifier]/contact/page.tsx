'use client';

import { useParams } from 'next/navigation';
import ContactForm from '../../../components/Contact/ContactForm';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/UI/card';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/UI/button';
import Link from 'next/link';

export default function PublicContactPage() {
  const params = useParams();
  const portfolioSlug = params.slug as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/portfolio/${portfolioSlug}`}>
            <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portfolio
            </Button>
          </Link>
        </div>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white flex items-center justify-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-400" />
              Contact Me
            </CardTitle>
            <p className="text-gray-300 text-lg">
              Send me a message and I'll get back to you as soon as possible
            </p>
          </CardHeader>
          <CardContent>
            <ContactForm portfolioSlug={portfolioSlug} />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            This contact form is powered by ProfileX - Professional portfolio contact system
          </p>
        </div>
      </div>
    </div>
  );
}
