import fs from 'fs'
import path from 'path'

/**
 * Load skill files from the /skills/ directory
 */
export function loadSkills(skillNames: string[]): string {
  const skillTexts: string[] = []

  for (const name of skillNames) {
    const skillPath = path.join(process.cwd(), 'skills', name, 'SKILL.md')
    try {
      const content = fs.readFileSync(skillPath, 'utf-8')
      skillTexts.push(`## Skill: ${name}\n\n${content}`)
    } catch {
      // Skill file not found, skip silently
    }
  }

  return skillTexts.join('\n\n---\n\n')
}

/**
 * Get all available skill names
 */
export function getAvailableSkills(): string[] {
  const skillsDir = path.join(process.cwd(), 'skills')
  try {
    return fs.readdirSync(skillsDir).filter((entry) => {
      const entryPath = path.join(skillsDir, entry)
      return fs.statSync(entryPath).isDirectory() &&
        fs.existsSync(path.join(entryPath, 'SKILL.md'))
    })
  } catch {
    return []
  }
}
