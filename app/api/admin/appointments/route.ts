import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE() {
  const supabase = createAdminClient()
  // Delete all rows by matching every record
  const { error } = await supabase
    .from('appointments')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
