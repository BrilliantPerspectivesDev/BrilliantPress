import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyAdminToken } from '@/lib/firebase-admin';
import { TeamMember } from '@/types';

// Helper function to verify authentication
async function verifyAuth(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const idToken = authHeader.substring(7);
  return await verifyAdminToken(idToken);
}

// GET - Fetch all team members (public)
export async function GET() {
  try {
    const snapshot = await adminDb
      .collection('team-members')
      .orderBy('createdAt', 'desc')
      .get();
    
    const teamMembers: TeamMember[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as TeamMember[];

    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST - Create new team member (requires authentication)
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const memberData = await request.json();
    
    const docRef = await adminDb.collection('team-members').add({
      ...memberData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    );
  }
} 