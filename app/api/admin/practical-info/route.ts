import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('practical_info')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const body = await request.json()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('practical_info')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/pratik-bilgiler')
  revalidatePath('/api/practical-info')
  return NextResponse.json(data, { status: 201 })
}
