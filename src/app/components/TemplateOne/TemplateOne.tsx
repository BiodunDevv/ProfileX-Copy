/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Hero from './Hero';
import About from './About';
import Experience from './Experience';
import Contact from './Contact';
import HeroImage from './images/Hero picture.svg';
import Projects from './images/Projects.jpg';

interface TemplateOneProps {
  portfolioData: any;
  isPreview?: boolean;
}

const TemplateOne: React.FC<TemplateOneProps> = ({ 
  portfolioData, 
  isPreview = false 
}) => {
  // Default data structure for TemplateOne
  const defaultData = {
    hero: {
      DevName: portfolioData?.brandName || 'WorkName',
      title: portfolioData?.title || 'Your Name Here',
      description: portfolioData?.description || 'About you: Lorem, ipsum dolor sit amet consectetur adipisicing elit.',
      heroImage: portfolioData?.heroImage || HeroImage,
      Companies: ['Company 1', 'Company 2', 'Company 3', 'Company 4', 'Company 5'],
    },
    about: {
      title: portfolioData?.sectionAbout || 'About Me',
      subtitle: portfolioData?.sectionSubtitle || 'Get to know me better',
      description: portfolioData?.aboutMeDescription || portfolioData?.description || 'Your story here...',
      skills: portfolioData?.skills || [],
      education: [],
    },
    projects: portfolioData?.projects?.map((project: any, index: number) => ({
      id: index + 1,
      type: project.category || 'Web Development',
      typeColor: 'blue',
      name: project.title || 'Project Name',
      description: project.description || 'Project description',
      image: project.imageUrl || Projects,
      sourceLink: project.githubUrl,
      demoLink: project.liveUrl,
    })) || [],
    contact: {
      email: portfolioData?.personalInfo?.email || 'contact@example.com',
      phone: portfolioData?.personalInfo?.phone || '+1 (555) 123-4567',
      socialLinks: portfolioData?.socialLinks || [],
    },
  };

  const colorMap = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-800 dark:text-blue-200',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-800 dark:text-green-200',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900',
      text: 'text-purple-800 dark:text-purple-200',
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'text-red-800 dark:text-red-200',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <Hero
        DevName={defaultData.hero.DevName}
        title={defaultData.hero.title}
        description={defaultData.hero.description}
        heroImage={defaultData.hero.heroImage}
        Companies={defaultData.hero.Companies}
      />
      
      <About
        title={defaultData.about.title}
        subtitle={defaultData.about.subtitle}
        description={defaultData.about.description}
        skills={defaultData.about.skills}
        education={defaultData.about.education}
      />
      
      <Experience 
        projects={defaultData.projects} 
        colorMap={colorMap} 
      />
      
      <Contact
        email={defaultData.contact.email}
        phone={defaultData.contact.phone}
        socialLinks={defaultData.contact.socialLinks}
        portfolioId={portfolioData?._id}
      />
    </motion.div>
  );
};

export default TemplateOne;
