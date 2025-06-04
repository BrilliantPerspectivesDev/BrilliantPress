'use client';

import { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TeamMember } from '@/types';
import { addTeamMember, updateTeamMember, uploadImage } from '@/lib/firestore';
import { X, Plus, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().min(1, 'Bio is required'),
  connectEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  bookLinks: z.array(z.object({
    title: z.string(),
    url: z.string(),
    description: z.string().optional(),
    coverImageUrl: z.string().optional(),
  })).optional(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string(),
    username: z.string().optional(),
  })).optional(),
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

interface TeamMemberFormProps {
  member?: TeamMember | null;
  onClose: () => void;
}

export function TeamMemberForm({ member, onClose }: TeamMemberFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(member?.photoUrl || '');
  const [bookCoverFiles, setBookCoverFiles] = useState<{ [key: number]: File }>({});
  const [bookCoverPreviews, setBookCoverPreviews] = useState<{ [key: number]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bookCoverInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: member?.name || '',
      bio: member?.bio || '',
      connectEmail: member?.connectEmail || '',
      bookLinks: member?.bookLinks || [],
      socialLinks: member?.socialLinks || [],
    },
  });

  const {
    fields: bookFields,
    append: appendBook,
    remove: removeBook,
  } = useFieldArray({
    control,
    name: 'bookLinks',
  });

  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial,
  } = useFieldArray({
    control,
    name: 'socialLinks',
  });

  // Initialize book cover previews from existing data
  useState(() => {
    if (member?.bookLinks) {
      const previews: { [key: number]: string } = {};
      member.bookLinks.forEach((book, index) => {
        if (book.coverImageUrl) {
          previews[index] = book.coverImageUrl;
        }
      });
      setBookCoverPreviews(previews);
    }
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleBookCoverChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setBookCoverFiles(prev => ({ ...prev, [index]: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setBookCoverPreviews(prev => ({ ...prev, [index]: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }

  function removeBookCover(index: number) {
    setBookCoverFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
    setBookCoverPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      return newPreviews;
    });
  }

  async function onSubmit(data: TeamMemberFormData) {
    try {
      setLoading(true);

      let photoUrl = member?.photoUrl || '';

      // Upload new image if selected
      if (imageFile) {
        const imagePath = `${Date.now()}-${imageFile.name}`;
        photoUrl = await uploadImage(imageFile, imagePath);
      }

      // Upload book covers and prepare book links
      const processedBookLinks = await Promise.all(
        (data.bookLinks || []).map(async (book, index) => {
          if (!book.title && !book.url) return null; // Skip empty entries
          
          if (!book.title || !book.url) {
            throw new Error('Please fill in both title and URL for all books');
          }
          
          try {
            new URL(book.url);
          } catch {
            throw new Error('Please enter valid URLs for all books');
          }

          let coverImageUrl = book.coverImageUrl || '';
          
          // Upload new cover if selected
          if (bookCoverFiles[index]) {
            const coverPath = `book-covers/${Date.now()}-${bookCoverFiles[index].name}`;
            coverImageUrl = await uploadImage(bookCoverFiles[index], coverPath);
          }

          return {
            ...book,
            coverImageUrl,
          };
        })
      );

      // Filter out null entries (empty book links)
      const validBookLinks = processedBookLinks.filter(book => book !== null);

      // Process social links
      const validSocialLinks = (data.socialLinks || []).filter(social => {
        if (!social.platform && !social.url) return false; // Skip empty entries
        if (!social.platform || !social.url) {
          throw new Error('Please fill in both platform and URL for all social links');
        }
        try {
          new URL(social.url);
        } catch {
          throw new Error('Please enter valid URLs for all social links');
        }
        return true;
      });

      const memberData = {
        ...data,
        photoUrl,
        bookLinks: validBookLinks,
        socialLinks: validSocialLinks,
      };

      if (member) {
        // Update existing member
        await updateTeamMember(member.id, memberData);
      } else {
        // Add new member
        await addTeamMember(memberData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving team member:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save team member';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {member ? 'Edit Team Member' : 'Add Team Member'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Choose Photo
                </button>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio *
            </label>
            <textarea
              {...register('bio')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter bio..."
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
            )}
          </div>

          {/* Connect Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Connect Email
            </label>
            <input
              {...register('connectEmail')}
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contact email (optional)"
            />
            {errors.connectEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.connectEmail.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              This email will be displayed as a contact option for visitors
            </p>
          </div>

          {/* Book Links */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Books
              </label>
              <button
                type="button"
                onClick={() => appendBook({ title: '', url: '', description: '', coverImageUrl: '' })}
                className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Book
              </button>
            </div>
            <div className="space-y-4">
              {bookFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Book {index + 1}</span>
                    {bookFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBook(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Book Cover Upload */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book Cover
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-20 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
                        {bookCoverPreviews[index] ? (
                          <Image
                            src={bookCoverPreviews[index]}
                            alt="Book cover preview"
                            width={64}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          ref={(el) => { bookCoverInputRefs.current[index] = el; }}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleBookCoverChange(index, e)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => bookCoverInputRefs.current[index]?.click()}
                          className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        >
                          Choose Cover
                        </button>
                        {bookCoverPreviews[index] && (
                          <button
                            type="button"
                            onClick={() => removeBookCover(index)}
                            className="px-3 py-1 text-xs border border-red-300 rounded text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <input
                        {...register(`bookLinks.${index}.title`)}
                        type="text"
                        placeholder="Book title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.bookLinks?.[index]?.title && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.bookLinks[index]?.title?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        {...register(`bookLinks.${index}.url`)}
                        type="url"
                        placeholder="Book URL"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.bookLinks?.[index]?.url && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.bookLinks[index]?.url?.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <input
                      {...register(`bookLinks.${index}.description`)}
                      type="text"
                      placeholder="Description (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Social Links
              </label>
              <button
                type="button"
                onClick={() => appendSocial({ platform: '', url: '', username: '' })}
                className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Link
              </button>
            </div>
            <div className="space-y-3">
              {socialFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Link {index + 1}</span>
                    {socialFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSocial(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <input
                        {...register(`socialLinks.${index}.platform`)}
                        type="text"
                        placeholder="Platform (e.g., Twitter)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.socialLinks?.[index]?.platform && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.socialLinks[index]?.platform?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        {...register(`socialLinks.${index}.url`)}
                        type="url"
                        placeholder="Profile URL"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.socialLinks?.[index]?.url && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.socialLinks[index]?.url?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        {...register(`socialLinks.${index}.username`)}
                        type="text"
                        placeholder="Username (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : member ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 