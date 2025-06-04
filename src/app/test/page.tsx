'use client';

import { useState } from 'react';
import { teamMembersApi, uploadApi } from '@/lib/api';

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  async function testCreateMember() {
    try {
      setLoading(true);
      setResult('Creating team member...');
      
      const memberData = {
        name: 'Test Member',
        bio: 'This is a test bio for debugging purposes.',
        photoUrl: 'https://via.placeholder.com/150',
        bookLinks: [
          {
            title: 'Test Book',
            url: 'https://example.com',
            description: 'A test book'
          }
        ],
        socialLinks: [
          {
            platform: 'Twitter',
            url: 'https://twitter.com/test',
            username: '@test'
          }
        ]
      };

      const response = await teamMembersApi.create(memberData);
      setResult(`Success! Created member with ID: ${response.id}`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function testFetchMembers() {
    try {
      setLoading(true);
      setResult('Fetching team members...');
      
      const members = await teamMembersApi.getAll();
      setResult(`Success! Found ${members.length} members: ${JSON.stringify(members, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function testImageUpload() {
    try {
      setLoading(true);
      setResult('Testing image upload...');
      
      // Create a simple test file
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 100, 100);
      }
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'test.png', { type: 'image/png' });
          try {
            const response = await uploadApi.uploadImage(file, 'test-image.png');
            setResult(`Success! Uploaded image: ${response.url}`);
          } catch (error) {
            setResult(`Upload Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error('Upload error:', error);
          } finally {
            setLoading(false);
          }
        }
      }, 'image/png');
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Test error:', error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Firebase API Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={testCreateMember}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Create Member'}
          </button>
          
          <button
            onClick={testFetchMembers}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Fetch Members'}
          </button>
          
          <button
            onClick={testImageUpload}
            disabled={loading}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Image Upload'}
          </button>
        </div>
        
        {result && (
          <div className="mt-8 p-4 bg-white rounded-md shadow">
            <h2 className="text-lg font-semibold mb-2">Result:</h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-700">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 