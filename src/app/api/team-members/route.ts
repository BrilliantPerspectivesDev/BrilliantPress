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

// GET - Fetch all team members (public)
export async function GET() {
  try {
    const adminDb = getAdminDb();
    const snapshot = await adminDb
      .collection('team-members')
      .orderBy('createdAt', 'desc')
      .get();
    
    const teamMembers: TeamMember[] = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
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

    const memberData = await request.json();
    const adminDb = getAdminDb();
    
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