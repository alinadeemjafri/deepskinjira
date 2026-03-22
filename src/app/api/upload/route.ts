import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const epicId = formData.get('epicId') as string | null
  const storyId = formData.get('storyId') as string | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const blob = await put(`attachments/${Date.now()}-${file.name}`, file, {
    access: 'public',
  })

  const attachment = await prisma.attachment.create({
    data: {
      filename: file.name,
      url: blob.url,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      epicId: epicId || null,
      storyId: storyId || null,
    },
  })

  return NextResponse.json(attachment)
}
