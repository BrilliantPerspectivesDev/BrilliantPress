'use client';

import { useEffect, useState } from 'react';
import { TeamMember } from '@/types';
import { getTeamMembers, deleteTeamMember } from '@/lib/firestore';
import { signOutAdmin } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TeamMemberForm } from '@/components/admin/TeamMemberForm';
import { AdminTeamMemberCard } from '@/components/admin/AdminTeamMemberCard';
import { LoginForm } from '@/components/auth/LoginForm';
import { Plus, Users, LogOut, Shield } from 'lucide-react';

export default function AdminPage() {
  const { user, isAuthenticated, isAdminUser, loading: authLoading } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (isAuthenticated && isAdminUser) {
      fetchTeamMembers();
    }
  }, [isAuthenticated, isAdminUser]);

  async function fetchTeamMembers() {
    try {
      setLoading(true);
      const members = await getTeamMembers();
      setTeamMembers(members);
    } catch (err) {
      setError('Failed to load team members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this team member?')) {
      return;
    }

    try {
      await deleteTeamMember(id);
      setTeamMembers(prev => prev.filter(member => member.id !== id));
    } catch (err) {
      console.error('Error deleting team member:', err);
      alert('Failed to delete team member');
    }
  }

  function handleEdit(member: TeamMember) {
    setEditingMember(member);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingMember(null);
    fetchTeamMembers(); // Refresh the list
  }

  async function handleSignOut() {
    try {
      await signOutAdmin();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show login form if not authenticated or not admin
  if (!isAuthenticated || !isAdminUser) {
    return <LoginForm onSuccess={() => {}} />;
  }

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Panel
                </h1>
              </div>
              <p className="text-gray-600">
                Manage team member profiles and media kit content
              </p>
              {user && (
                <p className="text-sm text-gray-500 mt-1">
                  Signed in as: {user.email}
                </p>
              )}
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Team Member
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Team Members Grid */}
        {teamMembers.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Team Members</h3>
              <p className="text-gray-600 mb-6">
                Get started by adding your first team member profile.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Team Member
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <AdminTeamMemberCard
                key={member.id}
                member={member}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Team Member Form Modal */}
        {showForm && (
          <TeamMemberForm
            member={editingMember}
            onClose={handleFormClose}
          />
        )}
      </main>
    </div>
  );
} 