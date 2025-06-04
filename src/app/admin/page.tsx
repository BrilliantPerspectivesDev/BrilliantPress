'use client';

import { useEffect, useState } from 'react';
import { TeamMember, PressRelease } from '@/types';
import { getTeamMembers, deleteTeamMember, getPressReleases, deletePressRelease } from '@/lib/firestore';
import { signOutAdmin } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TeamMemberForm } from '@/components/admin/TeamMemberForm';
import { PressReleaseForm } from '@/components/admin/PressReleaseForm';
import { AdminTeamMemberCard } from '@/components/admin/AdminTeamMemberCard';
import { AdminPressReleaseCard } from '@/components/admin/AdminPressReleaseCard';
import { LoginForm } from '@/components/auth/LoginForm';
import { Plus, Users, LogOut, Shield, FileText } from 'lucide-react';

type ActiveTab = 'team-members' | 'press-releases';

export default function AdminPage() {
  const { user, isAuthenticated, isAdminUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('team-members');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTeamMemberForm, setShowTeamMemberForm] = useState(false);
  const [showPressReleaseForm, setShowPressReleaseForm] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [editingPressRelease, setEditingPressRelease] = useState<PressRelease | null>(null);

  useEffect(() => {
    if (isAuthenticated && isAdminUser) {
      fetchData();
    }
  }, [isAuthenticated, isAdminUser]);

  async function fetchData() {
    try {
      setLoading(true);
      const [membersData, releasesData] = await Promise.all([
        getTeamMembers(),
        getPressReleases(false) // Get all press releases including drafts for admin
      ]);
      setTeamMembers(membersData);
      setPressReleases(releasesData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTeamMember(id: string) {
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

  async function handleDeletePressRelease(id: string) {
    if (!confirm('Are you sure you want to delete this press release?')) {
      return;
    }

    try {
      await deletePressRelease(id);
      setPressReleases(prev => prev.filter(release => release.id !== id));
    } catch (err) {
      console.error('Error deleting press release:', err);
      alert('Failed to delete press release');
    }
  }

  function handleEditTeamMember(member: TeamMember) {
    setEditingTeamMember(member);
    setShowTeamMemberForm(true);
  }

  function handleEditPressRelease(release: PressRelease) {
    setEditingPressRelease(release);
    setShowPressReleaseForm(true);
  }

  function handleTeamMemberFormClose() {
    setShowTeamMemberForm(false);
    setEditingTeamMember(null);
    fetchData(); // Refresh the list
  }

  function handlePressReleaseFormClose() {
    setShowPressReleaseForm(false);
    setEditingPressRelease(null);
    fetchData(); // Refresh the list
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
        {/* Admin Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-gray-600">Welcome back, {user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('team-members')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'team-members'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                Team Members ({teamMembers.length})
              </button>
              <button
                onClick={() => setActiveTab('press-releases')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'press-releases'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5 inline mr-2" />
                Press Releases ({pressReleases.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'team-members' && (
              <>
                {/* Team Members Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
                  <button
                    onClick={() => setShowTeamMemberForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Team Member
                  </button>
                </div>

                {/* Team Members Grid */}
                {error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                      onClick={fetchData}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
                    <p className="text-gray-600 mb-6">Get started by adding your first team member.</p>
                    <button
                      onClick={() => setShowTeamMemberForm(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Team Member
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamMembers.map((member) => (
                      <AdminTeamMemberCard
                        key={member.id}
                        member={member}
                        onEdit={handleEditTeamMember}
                        onDelete={handleDeleteTeamMember}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'press-releases' && (
              <>
                {/* Press Releases Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Press Releases</h2>
                  <button
                    onClick={() => setShowPressReleaseForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Press Release
                  </button>
                </div>

                {/* Press Releases Grid */}
                {error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                      onClick={fetchData}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : pressReleases.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No press releases yet</h3>
                    <p className="text-gray-600 mb-6">Get started by creating your first press release.</p>
                    <button
                      onClick={() => setShowPressReleaseForm(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Press Release
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pressReleases.map((release) => (
                      <AdminPressReleaseCard
                        key={release.id}
                        pressRelease={release}
                        onEdit={handleEditPressRelease}
                        onDelete={handleDeletePressRelease}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Forms */}
      {showTeamMemberForm && (
        <TeamMemberForm
          member={editingTeamMember}
          onClose={handleTeamMemberFormClose}
        />
      )}

      {showPressReleaseForm && (
        <PressReleaseForm
          pressRelease={editingPressRelease || undefined}
          onSuccess={handlePressReleaseFormClose}
          onCancel={handlePressReleaseFormClose}
        />
      )}
    </div>
  );
} 