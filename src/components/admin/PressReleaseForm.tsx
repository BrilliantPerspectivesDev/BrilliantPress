'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PressRelease, PressReleaseAttachment } from '@/types';
import { addPressRelease, updatePressRelease, uploadImage, uploadAttachment } from '@/lib/firestore';
import { X, Upload, FileText, Image as ImageIcon, Calendar, Tag, Eye, EyeOff } from 'lucide-react';

const pressReleaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  subtitle: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(1, 'Excerpt is required').max(500, 'Excerpt must be less than 500 characters'),
  publishDate: z.string().min(1, 'Publish date is required'),
  author: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean(),
});

type PressReleaseFormData = z.infer<typeof pressReleaseSchema>;

interface PressReleaseFormProps {
  pressRelease?: PressRelease;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PressReleaseForm({ pressRelease, onSuccess, onCancel }: PressReleaseFormProps) {
  const [loading, setLoading] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(
    pressRelease?.featuredImageUrl || null
  );
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<PressReleaseAttachment[]>(
    pressRelease?.attachments || []
  );
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PressReleaseFormData>({
    resolver: zodResolver(pressReleaseSchema),
    defaultValues: {
      title: pressRelease?.title || '',
      subtitle: pressRelease?.subtitle || '',
      content: pressRelease?.content || '',
      excerpt: pressRelease?.excerpt || '',
      publishDate: pressRelease?.publishDate 
        ? new Date(pressRelease.publishDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      author: pressRelease?.author || '',
      category: pressRelease?.category || '',
      tags: pressRelease?.tags || [],
      isPublished: pressRelease?.isPublished || false,
    },
  });

  const watchedTags = watch('tags') || [];

  useEffect(() => {
    if (pressRelease) {
      reset({
        title: pressRelease.title,
        subtitle: pressRelease.subtitle || '',
        content: pressRelease.content,
        excerpt: pressRelease.excerpt,
        publishDate: new Date(pressRelease.publishDate).toISOString().split('T')[0],
        author: pressRelease.author || '',
        category: pressRelease.category || '',
        tags: pressRelease.tags || [],
        isPublished: pressRelease.isPublished,
      });
    }
  }, [pressRelease, reset]);

  function handleFeaturedImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFeaturedImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleAttachmentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  }

  function removeAttachment(index: number) {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }

  function removeExistingAttachment(index: number) {
    setExistingAttachments(prev => prev.filter((_, i) => i !== index));
  }

  function addTag() {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue('tags', [...watchedTags, tagInput.trim()]);
      setTagInput('');
    }
  }

  function removeTag(tagToRemove: string) {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  }

  function handleTagKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }

  async function onSubmit(data: PressReleaseFormData) {
    try {
      setLoading(true);

      let featuredImageUrl = pressRelease?.featuredImageUrl || '';
      
      // Upload featured image if new one is selected
      if (featuredImage) {
        const timestamp = Date.now();
        const filename = `press-release-${timestamp}-${featuredImage.name}`;
        featuredImageUrl = await uploadImage(featuredImage, filename);
      }

      // Upload new attachments
      const newAttachmentUrls: PressReleaseAttachment[] = [];
      for (const file of attachments) {
        const timestamp = Date.now();
        const filename = `press-release-attachment-${timestamp}-${file.name}`;
        const url = await uploadAttachment(file, filename);
        
        newAttachmentUrls.push({
          name: file.name,
          url,
          type: getFileType(file.name),
          size: file.size,
        });
      }

      // Combine existing and new attachments
      const allAttachments = [...existingAttachments, ...newAttachmentUrls];

      const pressReleaseData: any = {
        ...data,
        publishDate: new Date(data.publishDate),
      };

      // Only add featuredImageUrl if it has a value
      if (featuredImageUrl) {
        pressReleaseData.featuredImageUrl = featuredImageUrl;
      }

      // Only add attachments if there are any
      if (allAttachments.length > 0) {
        pressReleaseData.attachments = allAttachments;
      }

      if (pressRelease) {
        await updatePressRelease(pressRelease.id, pressReleaseData);
      } else {
        await addPressRelease(pressReleaseData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving press release:', error);
      alert('Failed to save press release. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function getFileType(filename: string): PressReleaseAttachment['type'] {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'image';
      case 'doc':
      case 'docx':
      case 'txt':
      case 'rtf':
        return 'document';
      default:
        return 'other';
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {pressRelease ? 'Edit Press Release' : 'Add New Press Release'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              {...register('title')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter press release title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <input
              type="text"
              {...register('subtitle')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter subtitle (optional)"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt *
            </label>
            <textarea
              {...register('excerpt')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief summary for preview (max 500 characters)"
            />
            {errors.excerpt && (
              <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              {...register('content')}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Full press release content (supports markdown-style formatting: ## for headings, ### for subheadings, - ** for bullet points)"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* Meta Information Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Publish Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Publish Date *
              </label>
              <input
                type="date"
                {...register('publishDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.publishDate && (
                <p className="mt-1 text-sm text-red-600">{errors.publishDate.message}</p>
              )}
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author
              </label>
              <input
                type="text"
                {...register('author')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Author name"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                <option value="Company News">Company News</option>
                <option value="Publications">Publications</option>
                <option value="Events">Events</option>
                <option value="Awards">Awards</option>
                <option value="Partnerships">Partnerships</option>
                <option value="Product Updates">Product Updates</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {watchedTags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag and press Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Featured Image
            </label>
            {featuredImagePreview && (
              <div className="mb-4">
                <img
                  src={featuredImagePreview}
                  alt="Featured image preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFeaturedImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Attachments
            </label>
            
            {/* Existing Attachments */}
            {existingAttachments.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Current Attachments:</h4>
                <div className="space-y-2">
                  {existingAttachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">{attachment.name}</span>
                        {attachment.size && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({formatFileSize(attachment.size)})
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingAttachment(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Attachments */}
            {attachments.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">New Attachments:</h4>
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div className="flex items-center">
                        <Upload className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <input
              type="file"
              multiple
              onChange={handleAttachmentChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Published Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('isPublished')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              {watch('isPublished') ? (
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1 text-green-600" />
                  Published (visible to public)
                </span>
              ) : (
                <span className="flex items-center">
                  <EyeOff className="w-4 h-4 mr-1 text-gray-500" />
                  Draft (not visible to public)
                </span>
              )}
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : pressRelease ? 'Update Press Release' : 'Create Press Release'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 