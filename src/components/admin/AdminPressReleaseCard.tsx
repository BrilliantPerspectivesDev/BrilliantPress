'use client';

import { PressRelease } from '@/types';
import { Edit, Trash2, Calendar, Tag, Eye, EyeOff, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';

interface AdminPressReleaseCardProps {
  pressRelease: PressRelease;
  onEdit: (pressRelease: PressRelease) => void;
  onDelete: (id: string) => void;
}

export function AdminPressReleaseCard({ pressRelease, onEdit, onDelete }: AdminPressReleaseCardProps) {
  function formatPublishDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Featured Image */}
      {pressRelease.featuredImageUrl && (
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={pressRelease.featuredImageUrl}
            alt={pressRelease.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header with Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {/* Status and Category */}
            <div className="flex items-center gap-2 mb-2">
              {pressRelease.isPublished ? (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  <Eye className="w-3 h-3 mr-1" />
                  Published
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  <EyeOff className="w-3 h-3 mr-1" />
                  Draft
                </span>
              )}
              {pressRelease.category && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  <Tag className="w-3 h-3 mr-1" />
                  {pressRelease.category}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {pressRelease.title}
            </h3>

            {/* Subtitle */}
            {pressRelease.subtitle && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                {pressRelease.subtitle}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-1 ml-2">
            <button
              onClick={() => onEdit(pressRelease)}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(pressRelease.id)}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {pressRelease.excerpt}
        </p>

        {/* Tags */}
        {pressRelease.tags && pressRelease.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {pressRelease.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {pressRelease.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{pressRelease.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {formatPublishDate(pressRelease.publishDate)}
            </div>
            {pressRelease.author && (
              <span>By {pressRelease.author}</span>
            )}
            {pressRelease.attachments && pressRelease.attachments.length > 0 && (
              <div className="flex items-center">
                <FileText className="w-3 h-3 mr-1" />
                {pressRelease.attachments.length} attachment{pressRelease.attachments.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div className="text-xs text-gray-400 border-t pt-2">
          <p>Created: {formatDate(pressRelease.createdAt)}</p>
          {pressRelease.updatedAt && pressRelease.updatedAt.getTime() !== pressRelease.createdAt.getTime() && (
            <p>Updated: {formatDate(pressRelease.updatedAt)}</p>
          )}
        </div>
      </div>
    </div>
  );
} 