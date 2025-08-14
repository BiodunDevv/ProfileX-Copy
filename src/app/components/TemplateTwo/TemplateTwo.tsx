/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Hero from './Hero';
import About from './About';
import Projects from './Projects';
import Contact from './Contact';

interface TemplateTwoProps {
  portfolioData: any;
  isPreview?: boolean;
}

const TemplateTwo: React.FC<TemplateTwoProps> = ({ 
  portfolioData, 
  isPreview = false 
}) => {
  // Default data structure for TemplateTwo
  const defaultData = {
    hero: {
      firstName: portfolioData?.firstName || 'First',
      lastName: portfolioData?.lastName || 'Last',
      title: portfolioData?.title || 'Your Title Here',
      description: portfolioData?.description || 'About you: Lorem, ipsum dolor sit amet consectetur adipisicing elit.',
      avatar: portfolioData?.avatar,
      socialLinks: portfolioData?.socialLinks || [],
    },
    about: {
      title: portfolioData?.sectionAbout || 'About Me',
      description: portfolioData?.aboutMeDescription || portfolioData?.description || 'Your story here...',
      skills: portfolioData?.skills || [],
      experience: portfolioData?.experience || [],
    },
    portfolio: {
      title: 'My Portfolio',
      projects: portfolioData?.projects?.map((project: any, index: number) => ({
        id: index + 1,
        title: project.title || 'Project Name',
        description: project.description || 'Project description',
        image: project.imageUrl,
        category: project.category || 'Web Development',
        technologies: project.technologies || [],
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
      })) || [],
    },
    services: {
      title: 'My Services',
      items: portfolioData?.services || [
        {
          id: 1,
          title: 'Web Development',
          description: 'Creating responsive and modern web applications',
          icon: '🌐',
        },
        {
          id: 2,
          title: 'Mobile Development',
          description: 'Building cross-platform mobile applications',
          icon: '📱',
        },
        {
          id: 3,
          title: 'UI/UX Design',
          description: 'Designing intuitive and beautiful user experiences',
          icon: '🎨',
        },
      ],
    },
    contact: {
      title: 'Get In Touch',
      description: 'Feel free to reach out for collaborations or just a friendly hello!',
      email: portfolioData?.personalInfo?.email || 'contact@example.com',
      phone: portfolioData?.personalInfo?.phone || '+1 (555) 123-4567',
      location: portfolioData?.personalInfo?.location || 'Your Location',
      socialLinks: portfolioData?.socialLinks || [],
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-gray-900"
    >
      <Hero
        name={`${defaultData.hero.firstName} ${defaultData.hero.lastName}`}
        title={defaultData.hero.title}
        about={defaultData.hero.description}
        heroImage={defaultData.hero.avatar}
        socialLinks={defaultData.hero.socialLinks}
      />
      
      <About
        bio={defaultData.about.description}
        skills={defaultData.about.skills}
        experience={defaultData.about.experience}
      />
      
      <Projects
        projects={defaultData.portfolio.projects}
      />
      
      <Contact
        contactInfo={{
          email: defaultData.contact.email,
          phone: defaultData.contact.phone,
          location: defaultData.contact.location,
        }}
      />
    </motion.div>
  );
};

export default TemplateTwo;
