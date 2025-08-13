import { NextResponse } from 'next/server';
import { checkSurfConditions } from '@/utils/surfCheck';

export async function POST() {
  try {
    console.log('Manual surf check triggered via API');
    
    const result = await checkSurfConditions();
    
    return NextResponse.json({
      success: true,
      message: 'Surf check completed successfully',
      result
    });
    
  } catch (error) {
    console.error('Error in manual surf check:', error.message);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to trigger a manual surf check',
    usage: 'POST /api/surf-check'
  });
}
