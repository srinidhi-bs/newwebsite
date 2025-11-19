/**
 * Home Page Component
 * 
 * Landing page that showcases:
 * - Personal introduction with Hero section
 * - Key interest areas (Finance, Tech, Markets)
 * - Quick navigation to main sections
 * 
 * Features:
 * - Modern card-based layout
 * - Responsive design
 * - Dark mode support
 * - Heroicons integration
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../layout/PageWrapper';
import {
  ChartBarIcon,
  CurrencyRupeeIcon,
  CodeBracketIcon,
  GlobeAsiaAustraliaIcon,
  WrenchScrewdriverIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Finance & Planning',
      description: 'Comprehensive tools for tax planning, EMI calculations, and personal finance management.',
      icon: CurrencyRupeeIcon,
      path: '/finance',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Trading & Markets',
      description: 'Deep dive into market analysis, trading strategies, and investment philosophies.',
      icon: ChartBarIcon,
      path: '/trading',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Tech Solutions',
      description: 'Building practical tools and digital solutions to simplify complex problems.',
      icon: CodeBracketIcon,
      path: '/tools',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Travel & Life',
      description: 'Visual stories and experiences from my journeys across India and the world.',
      icon: GlobeAsiaAustraliaIcon,
      path: '/travel',
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  return (
    <PageWrapper>
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl mb-12">
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[length:20px_20px]"></div>
        <div className="relative px-8 py-16 sm:px-12 sm:py-20 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
            Hi, I'm Srinidhi BS
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mb-8">
            Exploring the intersection of <span className="font-semibold text-white">Finance</span>, <span className="font-semibold text-white">Technology</span>, and <span className="font-semibold text-white">Markets</span>.
          </p>
          <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
            <button
              onClick={() => navigate('/contact')}
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-blue-50 transition-colors duration-200"
            >
              Get in Touch
            </button>
            <button
              onClick={() => navigate('/tools')}
              className="px-6 py-3 bg-blue-500 bg-opacity-30 border border-blue-300 text-white font-semibold rounded-lg hover:bg-opacity-40 transition-colors duration-200 backdrop-blur-sm"
            >
              Explore Tools
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="mb-16 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Bridging Tech & Finance
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          I'm an accountant by profession with a passion for coding. I build tools that solve real-world financial problems and share insights from my journey in the stock markets. This website is my digital garden where I cultivate ideas, share knowledge, and document my adventures.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {features.map((feature) => (
          <div
            key={feature.title}
            onClick={() => navigate(feature.path)}
            className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer"
          >
            <div className="p-8">
              <div className={`inline-flex p-3 rounded-lg ${feature.bg} ${feature.color} mb-5`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {feature.description}
              </p>
              <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                Explore <ArrowRightIcon className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tool Access */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Need a quick utility?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Check out the PDF tools and calculators I've built.
            </p>
          </div>
          <button
            onClick={() => navigate('/tools')}
            className="flex items-center px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors shadow-md"
          >
            <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
            Open Tools Dashboard
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Home;
