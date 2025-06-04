'use client';

import { useEffect, useState } from 'react';
import { TeamMember } from '@/types';
import { getTeamMembers } from '@/lib/firestore';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Users, ArrowUpRight, Twitter, Instagram, Linkedin, Globe, Facebook, Youtube, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Social platform icon mapping
const socialIcons: Record<string, any> = {
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  facebook: Facebook,
  youtube: Youtube,
  email: Mail,
  website: Globe,
  default: Globe,
};

export default function Home() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        const members = await getTeamMembers();
        setTeamMembers(members);
      } catch (err) {
        setError('Failed to load team members');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamMembers();
  }, []);

  function getSocialIcon(platform: string) {
    const platformLower = platform.toLowerCase();
    const IconComponent = socialIcons[platformLower] || socialIcons.default;
    return IconComponent;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F4F1] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F4F1] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#222222] mb-4">Something went wrong</h2>
          <p className="text-[#3E5E17] mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#DD8D00] text-white rounded-lg hover:bg-[#DD8D00]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4F1]">
      <Header />
      
      <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Eyebrow Text */}
          <div className="text-sm font-medium text-[#74A78E] uppercase tracking-wider mb-4">
            The team
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#222222] mb-6 leading-tight">
            Brilliant Movement{' '}
            <span className="relative">
              Press Kits
              <div className="absolute -bottom-2 left-0 right-0 h-3 bg-[#74A78E]/30 -z-10 rounded-full"></div>
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[#3E5E17] max-w-4xl mx-auto leading-relaxed">
            Welcome to Brilliant Perspectives Press Site, you'll find press releases, brand assets and speaker one-sheets here.
          </p>
        </div>

        {/* Team Members Grid */}
        {teamMembers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-[#E3DDC9] rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-[#74A78E]" />
            </div>
            <h3 className="text-2xl font-bold text-[#222222] mb-4">No Team Members Yet</h3>
            <p className="text-[#3E5E17] mb-8 max-w-md mx-auto">
              Team member profiles will appear here once they are added through the admin panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <Link
                key={member.id}
                href={`/team/${member.id}`}
                className="group relative bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 aspect-[4/5]"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  {member.photoUrl ? (
                    <Image
                      src={member.photoUrl}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#E3DDC9] to-[#74A78E] flex items-center justify-center">
                      <span className="text-6xl font-bold text-[#222222]">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#222222]/70 via-[#222222]/20 to-transparent"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  {/* Top Right Arrow */}
                  <div className="flex justify-end">
                    <div className="w-10 h-10 bg-[#DD8D00]/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Bottom Content */}
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                    <p className="text-lg font-medium text-[#74A78E] mb-3">
                      Author & Speaker
                    </p>
                    <p className="text-sm text-white/80 mb-4 line-clamp-2">
                      {member.bio.length > 100 ? `${member.bio.substring(0, 100)}...` : member.bio}
                    </p>

                    {/* Social Icons and Email */}
                    <div className="flex items-center justify-between">
                      {/* Social Icons */}
                      {member.socialLinks && member.socialLinks.length > 0 && (
                        <div className="flex space-x-3">
                          {member.socialLinks.slice(0, 3).map((social, index) => {
                            const IconComponent = getSocialIcon(social.platform);
                            return (
                              <div
                                key={index}
                                className="w-8 h-8 bg-[#DD8D00]/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#DD8D00]/30 transition-colors"
                                onClick={(e) => {
                                  e.preventDefault();
                                  window.open(social.url, '_blank');
                                }}
                              >
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Connect Email Indicator */}
                      {member.connectEmail && (
                        <div className="w-8 h-8 bg-[#74A78E]/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
