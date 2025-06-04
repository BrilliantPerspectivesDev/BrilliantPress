'use client';

import Image from 'next/image';
import { TeamMember } from '@/types';
import { Edit, Trash2, ExternalLink, Book } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AdminTeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
}

export function AdminTeamMemberCard({ member, onEdit, onDelete }: AdminTeamMemberCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Profile Image */}
      <div className="aspect-square relative overflow-hidden">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={member.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-gray-600">
                {member.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name and Actions */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {member.name}
          </h3>
          <div className="flex space-x-1 ml-2">
            <button
              onClick={() => onEdit(member)}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(member.id)}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bio Preview */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {member.bio}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-3">
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

        {/* Timestamps */}
        <div className="text-xs text-gray-400 border-t pt-2">
          <p>Created: {formatDate(member.createdAt)}</p>
          {member.updatedAt && member.updatedAt.getTime() !== member.createdAt.getTime() && (
            <p>Updated: {formatDate(member.updatedAt)}</p>
          )}
        </div>
      </div>
    </div>
  );
} 