'use client';

import Image from 'next/image';
import Link from 'next/link';
import { TeamMember } from '@/types';
import { ExternalLink, Book, ArrowRight } from 'lucide-react';

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      {/* Profile Image */}
      <div className="aspect-square relative overflow-hidden">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={member.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <div className="w-24 h-24 bg-blue-300 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-700">
                {member.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
        
        {/* Overlay with View Profile Button */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <Link
            href={`/team/${member.id}`}
            className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium inline-flex items-center"
          >
            View Profile
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Name */}
        <Link href={`/team/${member.id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer">
            {member.name}
          </h3>
        </Link>

        {/* Bio Preview */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {member.bio}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            {member.bookLinks && member.bookLinks.length > 0 && (
              <span className="flex items-center">
                <Book className="w-3 h-3 mr-1" />
                {member.bookLinks.length} book{member.bookLinks.length !== 1 ? 's' : ''}
              </span>
            )}
            {member.socialLinks && member.socialLinks.length > 0 && (
              <span className="flex items-center">
                <ExternalLink className="w-3 h-3 mr-1" />
                {member.socialLinks.length} link{member.socialLinks.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {member.bookLinks && member.bookLinks.length > 0 && (
              <Link
                href={`/team/${member.id}#books`}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                Books
              </Link>
            )}
            {member.socialLinks && member.socialLinks.length > 0 && (
              <Link
                href={`/team/${member.id}#connect`}
                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full hover:bg-green-200 transition-colors"
              >
                Connect
              </Link>
            )}
          </div>
          
          <Link
            href={`/team/${member.id}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center"
          >
            View Profile
            <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
} 