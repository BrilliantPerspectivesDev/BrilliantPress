import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, verifyIdToken, isAdminUser } from '@/lib/firebase-admin';
import { TeamMember } from '@/types';

// Helper function to verify authentication
async function verifyAdmin(idToken: string): Promise<boolean> {
  try {
    const decodedToken = await verifyIdToken(idToken);
    return isAdminUser(decodedToken.email || '');
  } catch {
    return false;
  }
}

// GET - Fetch single team member (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminDb = getAdminDb();
    const doc = await adminDb.collection('team-members').doc(id).get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    const teamMember: TeamMember = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate() || new Date(),
      updatedAt: doc.data()?.updatedAt?.toDate() || new Date(),
    } as TeamMember;

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team member' },
      { status: 500 }
    );
  }
}

// PUT - Update team member (requires authentication)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7);
    const isAuthenticated = await verifyAdmin(idToken);
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const memberData = await request.json();
    
    const adminDb = getAdminDb();
    await adminDb.collection('team-members').doc(id).update({
      ...memberData,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

// DELETE - Delete team member (requires authentication)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7);
    const isAuthenticated = await verifyAdmin(idToken);
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const adminDb = getAdminDb();
    await adminDb.collection('team-members').doc(id).delete();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 }
    );
  }
} 