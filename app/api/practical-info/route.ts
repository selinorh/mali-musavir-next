import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export const revalidate = 3600

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('practical_info')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
