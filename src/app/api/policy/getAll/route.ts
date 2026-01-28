import { NextResponse } from 'next/server';

import { getAllPolicies } from '@lib/api/policy';

export async function GET() {
  try {
    const result = await getAllPolicies();
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ result: [], error: 'FAILED_TO_LOAD_POLICIES' }, { status: 500 });
  }
}
