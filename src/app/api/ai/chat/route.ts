import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_all_data',
    description: 'Fetch the latest full state of all epics, stories, subtasks, and comments from the database. Call this when you need fresh data.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'create_epic',
    description: 'Create a new epic.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
        assignee: { type: 'string', enum: ['Ali', 'Waleed'] },
        startDate: { type: 'string', description: 'ISO date string e.g. 2024-06-01' },
        endDate: { type: 'string' },
        color: { type: 'string', description: 'Hex color, one of: #3C2415 #4A7C59 #2563eb #7c3aed #db2777 #ea580c #0891b2 #4f46e5' },
        createdBy: { type: 'string' },
      },
      required: ['title', 'createdBy'],
    },
  },
  {
    name: 'update_epic',
    description: 'Update an existing epic by ID.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
        assignee: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        color: { type: 'string' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_epic',
    description: 'Delete an epic and all its stories by ID.',
    input_schema: {
      type: 'object' as const,
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'create_story',
    description: 'Create a new story inside an epic.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
        assignee: { type: 'string', enum: ['Ali', 'Waleed'] },
        epicId: { type: 'string', description: 'The ID of the parent epic' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        createdBy: { type: 'string' },
      },
      required: ['title', 'epicId', 'createdBy'],
    },
  },
  {
    name: 'update_story',
    description: 'Update an existing story by ID.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
        assignee: { type: 'string' },
        epicId: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_story',
    description: 'Delete a story by ID.',
    input_schema: {
      type: 'object' as const,
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'create_subtask',
    description: 'Add a subtask/checklist item to a story.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string' },
        storyId: { type: 'string' },
      },
      required: ['title', 'storyId'],
    },
  },
  {
    name: 'delete_subtask',
    description: 'Delete a subtask by ID.',
    input_schema: {
      type: 'object' as const,
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
]

async function getAllData() {
  const epics = await prisma.epic.findMany({
    include: {
      stories: {
        include: { subtasks: { orderBy: { order: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return epics
}

async function executeTool(name: string, input: Record<string, unknown>): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  try {
    switch (name) {
      case 'get_all_data': {
        const data = await getAllData()
        return { ok: true, data }
      }
      case 'create_epic': {
        const epic = await prisma.epic.create({
          data: {
            title: input.title as string,
            description: (input.description as string) || null,
            status: (input.status as 'TODO') || 'TODO',
            priority: (input.priority as 'MEDIUM') || 'MEDIUM',
            assignee: (input.assignee as string) || null,
            startDate: input.startDate ? new Date(input.startDate as string) : null,
            endDate: input.endDate ? new Date(input.endDate as string) : null,
            color: (input.color as string) || '#3C2415',
            createdBy: input.createdBy as string,
          },
          include: { stories: true },
        })
        return { ok: true, data: epic }
      }
      case 'update_epic': {
        const data: Record<string, unknown> = {}
        if (input.title !== undefined) data.title = input.title
        if (input.description !== undefined) data.description = input.description
        if (input.status !== undefined) data.status = input.status
        if (input.priority !== undefined) data.priority = input.priority
        if (input.assignee !== undefined) data.assignee = input.assignee || null
        if (input.startDate !== undefined) data.startDate = input.startDate ? new Date(input.startDate as string) : null
        if (input.endDate !== undefined) data.endDate = input.endDate ? new Date(input.endDate as string) : null
        if (input.color !== undefined) data.color = input.color
        const epic = await prisma.epic.update({ where: { id: input.id as string }, data })
        return { ok: true, data: epic }
      }
      case 'delete_epic': {
        await prisma.epic.delete({ where: { id: input.id as string } })
        return { ok: true, data: { deleted: input.id } }
      }
      case 'create_story': {
        const story = await prisma.story.create({
          data: {
            title: input.title as string,
            description: (input.description as string) || null,
            status: (input.status as 'TODO') || 'TODO',
            priority: (input.priority as 'MEDIUM') || 'MEDIUM',
            assignee: (input.assignee as string) || null,
            epicId: input.epicId as string,
            startDate: input.startDate ? new Date(input.startDate as string) : null,
            endDate: input.endDate ? new Date(input.endDate as string) : null,
            createdBy: input.createdBy as string,
          },
        })
        return { ok: true, data: story }
      }
      case 'update_story': {
        const data: Record<string, unknown> = {}
        if (input.title !== undefined) data.title = input.title
        if (input.description !== undefined) data.description = input.description
        if (input.status !== undefined) data.status = input.status
        if (input.priority !== undefined) data.priority = input.priority
        if (input.assignee !== undefined) data.assignee = input.assignee || null
        if (input.epicId !== undefined) data.epicId = input.epicId
        if (input.startDate !== undefined) data.startDate = input.startDate ? new Date(input.startDate as string) : null
        if (input.endDate !== undefined) data.endDate = input.endDate ? new Date(input.endDate as string) : null
        const story = await prisma.story.update({ where: { id: input.id as string }, data })
        return { ok: true, data: story }
      }
      case 'delete_story': {
        await prisma.story.delete({ where: { id: input.id as string } })
        return { ok: true, data: { deleted: input.id } }
      }
      case 'create_subtask': {
        const subtask = await prisma.subTask.create({
          data: {
            title: input.title as string,
            storyId: input.storyId as string,
          },
        })
        return { ok: true, data: subtask }
      }
      case 'delete_subtask': {
        await prisma.subTask.delete({ where: { id: input.id as string } })
        return { ok: true, data: { deleted: input.id } }
      }
      default:
        return { ok: false, error: `Unknown tool: ${name}` }
    }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

export async function POST(req: NextRequest) {
  const { messages, user } = await req.json()

  // Load fresh DB snapshot for the system prompt
  const snapshot = await getAllData()
  const totalStories = snapshot.reduce((acc, e) => acc + e.stories.length, 0)

  const systemPrompt = `You are an intelligent project management AI assistant for Deep Skin's internal project board (a Jira-like tool). The current user is ${user}.

You have full read and write access to the project database. You can:
- Answer questions about epics, stories, and progress
- Create, edit, or delete epics and stories
- Add subtasks to stories
- Help plan and break down work into epics and stories
- Give status summaries and insights

Be proactive — if asked to "plan" or "set up" something, think it through properly and create all the relevant epics and stories in one go without asking too many clarifying questions. Use your judgment on priorities, dates, and structure.

Always use the tools to make changes — never just describe what you would do, actually do it.

Current date: ${new Date().toISOString().split('T')[0]}
Current board state: ${snapshot.length} epics, ${totalStories} stories

Full data:
${JSON.stringify(snapshot, null, 2)}`

  type MessageParam = Anthropic.MessageParam
  let currentMessages: MessageParam[] = messages

  const actions: { tool: string; result: unknown }[] = []

  // Tool-use loop — keep going until Claude returns a final text response
  for (let i = 0; i < 10; i++) {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      tools: TOOLS,
      messages: currentMessages,
    })

    if (response.stop_reason === 'end_turn') {
      const text = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')?.text ?? ''
      return NextResponse.json({ role: 'assistant', content: text, actions })
    }

    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const block of toolUseBlocks) {
        const result = await executeTool(block.name, block.input as Record<string, unknown>)
        actions.push({ tool: block.name, result: result.data ?? result.error })
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
        })
      }

      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ]
    }
  }

  return NextResponse.json({ role: 'assistant', content: 'Sorry, I ran into an issue completing that request.', actions })
}
