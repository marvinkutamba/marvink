/**
 * Parses all agent .md files from the repo and generates src/data/agents.json
 * Run with: npm run parse-agents
 */
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')
const outputPath = path.resolve(__dirname, '../src/data/agents.json')

const CATEGORIES = [
  'engineering',
  'design',
  'marketing',
  'product',
  'project-management',
  'support',
  'testing',
  'spatial-computing',
  'game-development',
  'specialized',
  'strategy',
]

interface AgentDefinition {
  id: string
  name: string
  description: string
  color: string
  category: string
  systemPrompt: string
  filename: string
}

const agents: AgentDefinition[] = []

for (const category of CATEGORIES) {
  const dir = path.join(repoRoot, category)
  if (!fs.existsSync(dir)) continue

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))

  for (const filename of files) {
    const filepath = path.join(dir, filename)
    const raw = fs.readFileSync(filepath, 'utf-8')

    try {
      const { data, content } = matter(raw)

      const id = filename.replace('.md', '')
      agents.push({
        id,
        name: String(data.name || id),
        description: String(data.description || ''),
        color: String(data.color || 'default'),
        category,
        systemPrompt: content.trim(),
        filename,
      })
    } catch (err) {
      console.warn(`  Skipping ${filename}: ${err}`)
    }
  }

  console.log(`✓ ${category}: ${files.length} agents`)
}

agents.sort((a, b) => a.name.localeCompare(b.name))

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, JSON.stringify(agents, null, 2))

console.log(`\n✅ Generated ${agents.length} agents → src/data/agents.json`)
