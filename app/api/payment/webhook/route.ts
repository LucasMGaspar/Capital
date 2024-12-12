import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Responde com 200 OK para qualquer requisição POST
  return NextResponse.json({ message: 'OK' }, { status: 200 });
}
