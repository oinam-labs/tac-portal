Cascade
Skills
Skills help Cascade handle complex, multi-step tasks.

The hardest engineering tasks often take more than just good prompts. They might require reference scripts, templates, checklists, and other supporting files. Skills let you bundle all of these together into folders that Cascade can invoke (read and use).
Skills are a great way to teach Cascade how to execute multi-step workflows consistently.
Cascade uses progressive disclosure to intelligently invoke skills only when they’re relevant to the task at hand. You can also manually invoke skills.
For more details on the Skills specification, visit agentskills.io.
​
How to Create a Skill
​
Using the UI (easiest)
Open the Cascade panel
Click the three dots in the top right of the panel to open up the customizations menu
Click on the Skills section
Click + Workspace to create a workspace (project-specific) skill, or + Global to create a global skill
Name the skill (lowercase letters, numbers, and hyphens only)
​
Manual Creation
Workspace Skill (project-specific):
Create a directory: .windsurf/skills/<skill-name>/
Add a SKILL.md file with YAML frontmatter
Global Skill (available in all workspaces):
Create a directory: ~/.codeium/windsurf/skills/<skill-name>/
Add a SKILL.md file with YAML frontmatter
​
SKILL.md File Format
Each skill requires a SKILL.md file with YAML frontmatter containing the skill’s metadata:
​
Example skill
---
name: deploy-to-production
description: Guides the deployment process to production with safety checks
---

## Pre-deployment Checklist
1. Run all tests
2. Check for uncommitted changes
3. Verify environment variables

## Deployment Steps
Follow these steps to deploy safely...

[Reference supporting files in this directory as needed]
​
Required Frontmatter Fields
name: Unique identifier for the skill (displayed in UI and used for @-mentions)
description: Brief explanation shown to the model to help it decide when to invoke the skill
Examples of valid names: deploy-to-staging, code-review, setup-dev-environment
​
Adding Supporting Resources
Place any supporting files in the skill folder alongside SKILL.md. These files become available to Cascade when the skill is invoked:
.windsurf/skills/deploy-to-production/
├── SKILL.md
├── deployment-checklist.md
├── rollback-procedure.md
└── config-template.yaml
​
Invoking Skills
​
Automatic Invocation
When your request matches a skill’s description, Cascade automatically invokes the skill and uses its instructions and resources to complete the task. This is the most common way skills are used—you simply describe what you want to do, and Cascade determines which skills are relevant.
The description field in your skill’s frontmatter is key: it helps Cascade understand when to invoke the skill. Write descriptions that clearly explain what the skill does and when it should be used.
​
Manual Invocation
You can always explicitly activate a skill by typing @skill-name in the Cascade input. This is useful when you want to ensure a specific skill is used, or when you want to invoke a skill that might not be automatically triggered by your request.
​
Skill Scopes
Scope	Location	Availability
Workspace	.windsurf/skills/	Current workspace/project only
Global	~/.codeium/windsurf/skills/	All workspaces/projects
​
Example Use Cases
​
Deployment Workflow
Create a skill with deployment scripts, environment configs, and rollback procedures:
.windsurf/skills/deploy-staging/
├── SKILL.md
├── pre-deploy-checks.sh
├── environment-template.env
└── rollback-steps.md
​
Code Review Guidelines
Include style guides, security checklists, and review templates:
.windsurf/skills/code-review/
├── SKILL.md
├── style-guide.md
├── security-checklist.md
└── review-template.md
​
Testing Procedures
Bundle test templates, coverage requirements, and CI/CD configs:
.windsurf/skills/run-tests/
├── SKILL.md
├── test-template.py
├── coverage-config.json
└── ci-workflow.yaml
​
Best Practices
Write clear descriptions: The description helps Cascade decide when to invoke the skill. Be specific about what the skill does and when it should be used.
Include relevant resources: Templates, checklists, and examples make skills more useful. Think about what files would help someone complete the task.
Use descriptive names: deploy-to-staging is better than deploy1. Names should clearly indicate what the skill does.
​
Skills vs Rules
Skills and Rules are both ways to customize Cascade’s behavior, but they serve different purposes:
Feature	Skills	Rules
Purpose	Complex tasks with supporting resources	Behavioral guidelines and preferences
Structure	Folder with SKILL.md + resource files	Single .md file
Invocation	Automatic (progressive disclosure) or @-mention	Trigger-based (always-on, glob patterns, or manual)
Best for	Multi-step workflows, deployment procedures, code review processes	Coding style preferences, project conventions, response formatting
Use Skills when you need Cascade to follow a specific procedure with supporting files. Use Rules when you want to influence how Cascade behaves across conversations.
​
Related Documentation
If Skills aren’t what you’re looking for, check out these other Cascade features:
Workflows - Automate repetitive tasks with reusable markdown workflows invoked via slash commands
AGENTS.md - Provide directory-scoped instructions that automatically apply based on file location
Memories & Rules - Persist context across conversations with auto-generated memories and user-defined rules
Memories & Rules
AGENTS.md
Cascade
AGENTS.md
Create AGENTS.md files to provide directory-scoped instructions to Cascade. Instructions automatically apply based on file location in your project.

AGENTS.md files provide a simple way to give Cascade context-aware instructions that automatically apply based on where the file is located in your project. This is particularly useful for providing directory-specific coding guidelines, architectural decisions, or project conventions.
​
How It Works
When you create an AGENTS.md file (or agents.md), Windsurf automatically discovers it and uses its contents as instructions for Cascade. The behavior depends on where the file is placed:
Root directory: When placed at the root of your workspace or git repository, the instructions apply globally to all files (similar to an “always on” rule)
Subdirectories: When placed in a subdirectory, the instructions automatically apply only when working with files in that directory or its children
This location-based scoping makes AGENTS.md ideal for providing targeted guidance without cluttering a single global configuration file.
​
Creating an AGENTS.md File
Simply create a file named AGENTS.md or agents.md in the desired directory. The file uses plain markdown with no special frontmatter required.
​
Example Structure
my-project/
├── AGENTS.md                    # Global instructions for the entire project
├── frontend/
│   ├── AGENTS.md                # Instructions specific to frontend code
│   └── src/
│       └── components/
│           └── AGENTS.md        # Instructions specific to components
├── backend/
│   └── AGENTS.md                # Instructions specific to backend code
└── docs/
    └── AGENTS.md                # Instructions for documentation
​
Example Content
Here’s an example AGENTS.md file for a React components directory:
# Component Guidelines

When working with components in this directory:

- Use functional components with hooks
- Follow the naming convention: ComponentName.tsx for components, useHookName.ts for hooks
- Each component should have a corresponding test file: ComponentName.test.tsx
- Use CSS modules for styling: ComponentName.module.css
- Export components as named exports, not default exports

## File Structure

Each component folder should contain:
- The main component file
- A test file
- A styles file (if needed)
- An index.ts for re-exports
​
Discovery and Scoping
Windsurf automatically discovers AGENTS.md files throughout your workspace:
Workspace scanning: All AGENTS.md files within your workspace and its subdirectories are discovered
Git repository support: For git repositories, Windsurf also searches parent directories up to the git root
Case insensitive: Both AGENTS.md and agents.md are recognized
​
Automatic Scoping
The key benefit of AGENTS.md is automatic scoping based on file location:
File Location	Scope
Workspace root	Applies to all files (always on)
/frontend/	Applies when working with files in /frontend/**
/frontend/components/	Applies when working with files in /frontend/components/**
This means you can have multiple AGENTS.md files at different levels, each providing increasingly specific guidance for their respective directories.
​
Best Practices
To get the most out of AGENTS.md files:
Keep instructions focused: Each AGENTS.md should contain instructions relevant to its directory’s purpose
Use clear formatting: Bullet points, headers, and code blocks make instructions easier for Cascade to follow
Be specific: Concrete examples and explicit conventions work better than vague guidelines
Avoid redundancy: Don’t repeat global instructions in subdirectory files; they inherit from parent directories
​
Content Guidelines
# Good Example
- Use TypeScript strict mode
- All API responses must include error handling
- Follow REST naming conventions for endpoints

# Less Effective Example
- Write good code
- Be careful with errors
- Use best practices
​
Comparison with Rules
While both AGENTS.md and Rules provide instructions to Cascade, they serve different purposes:
Feature	AGENTS.md	Rules
Location	In project directories	.windsurf/rules/ or global
Scoping	Automatic based on file location	Manual (glob, always on, model decision, manual)
Format	Plain markdown	Markdown with frontmatter
Best for	Directory-specific conventions	Cross-cutting concerns, complex activation logic
Use AGENTS.md when you want simple, location-based instructions. Use Rules when you need more control over when and how instructions are applied.
Skills
Workflows
Cascade
Workflows
Automate repetitive tasks in Cascade with reusable workflows defined as markdown files. Create PR review, deployment, testing, and code formatting workflows.

Workflows enable users to define a series of steps to guide Cascade through a repetitive set of tasks, such as deploying a service or responding to PR comments.
These Workflows are saved as markdown files, allowing users and their teams an easy repeatable way to run key processes.
Once saved, Workflows can be invoked in Cascade via a slash command with the format of /[name-of-workflow]
​
How it works
Rules generally provide large language models with guidance by providing persistent, reusable context at the prompt level.
Workflows extend this concept by providing a structured sequence of steps or prompts at the trajectory level, guiding the model through a series of interconnected tasks or actions.

To execute a Workflow, users simply invoke it in Cascade using the /[workflow-name] command.
You can call other Workflows from within a Workflow!

For example, /workflow-1 can include instructions like “Call /workflow-2” and “Call /workflow-3”.
Upon invocation, Cascade sequentially processes each step defined in the Workflow, performing actions or generating responses as specified.
​
How to create a Workflow
To get started with Workflows, click on the Customizations icon in the top right slider menu in Cascade, then navigate to the Workflows panel. Here, you can click on the + Workflow button to create a new Workflow.
Workflows are saved as markdown files within .windsurf/workflows/ directories and contain a title, description, and a series of steps with specific instructions for Cascade to follow.
​
Workflow Discovery
Windsurf automatically discovers workflows from multiple locations to provide flexible organization:
Current workspace and sub-directories: All .windsurf/workflows/ directories within your current workspace and its sub-directories
Git repository structure: For git repositories, Windsurf also searches up to the git root directory to find workflows in parent directories
Multiple workspace support: When multiple folders are open in the same workspace, workflows are deduplicated and displayed with the shortest relative path
​
Workflow Storage Locations
Workflows can be stored in any of these locations:
.windsurf/workflows/ in your current workspace directory
.windsurf/workflows/ in any sub-directory of your workspace
.windsurf/workflows/ in parent directories up to the git root (for git repositories)
When you create a new workflow, it will be saved in the .windsurf/workflows/ directory of your current workspace, not necessarily at the git root.
Workflow files are limited to 12000 characters each.
​
Generate a Workflow with Cascade
You can also ask Cascade to generate Workflows for you! This works particularly well for Workflows involving a series of steps in a particular CLI tool.
​
Example Workflows
There are a myriad of use cases for Workflows, such as:
/address-pr-comments
This is a Workflow our team uses internally to address PR comments:
1. Check out the PR branch: gh pr checkout [id] 

2. Get comments on PR

 bash
 gh api --paginate repos/[owner]/[repo]/pulls/[id]/comments | jq '.[] | {user: .user.login, body, path, line, original_line, created_at, in_reply_to_id, pull_request_review_id, commit_id}'

3. For EACH comment, do the following. Remember to address one comment at a time.
 a. Print out the following: "(index). From [user] on [file]:[lines] — [body]"
 b. Analyze the file and the line range.
 c. If you don't understand the comment, do not make a change. Just ask me for clarification, or to implement it myself.
 d. If you think you can make the change, make the change BEFORE moving onto the next comment.

4. After all comments are processed, summarize what you did, and which comments need the USER's attention.
/git-workflows
Commit using predefined formats and create a pull requests with standardized title and descriptions using the appropriate CLI commands.
/dependency-management
Automate the installation or updating of project dependencies based on a configuration file (e.g., requirements.txt, package.json).
/code-formatting
Automatically run code formatters (like Prettier, Black) and linters (like ESLint, Flake8) on file save or before committing to maintain code style and catch errors early.
/run-tests-and-fix
Run or add unit or end-to-end tests and fix the errors automatically to ensure code quality before committing, merging, or deploying.
/deployment
Automate the steps to deploy your application to various environments (development, staging, production), including any necessary pre-deployment checks or post-deployment verifications.
/security-scan
Integrate and trigger security vulnerability scans on your codebase as part of the CI/CD pipeline or on demand.
​
System-Level Workflows (Enterprise)
Enterprise organizations can deploy system-level workflows that are available globally across all workspaces and cannot be modified by end users without administrator permissions. This is ideal for enforcing organization-wide development processes, deployment procedures, and compliance workflows.
System-level workflows are loaded from OS-specific directories:
macOS:
/Library/Application Support/Windsurf/workflows/*.md
Linux/WSL:
/etc/windsurf/workflows/*.md
Windows:
C:\ProgramData\Windsurf\workflows\*.md
Place your workflow files (as .md files) in the appropriate directory for your operating system. The system will automatically load all .md files from these directories.
​
Workflow Precedence
When workflows with the same name exist at multiple levels, system-level workflows take the highest precedence:
System (highest priority) - Organization-wide workflows deployed by IT
Workspace - Project-specific workflows in .windsurf/workflows/
Global - User-defined workflows
Built-in - Default workflows provided by Windsurf
This means that if an organization deploys a system-level workflow with a specific name, it will override any workspace, global, or built-in workflow with the same name.
In the Windsurf UI, system-level workflows are displayed with a “System” label and cannot be deleted by end users.
Important: System-level workflows should be managed by your IT or security team. Ensure your internal teams handle deployment, updates, and compliance according to your organization’s policies. You can use standard tools and workflows such as Mobile Device Management (MDM) or Configuration Management to do so.
AGENTS.md
Worktrees
ascade
Worktrees
Automatically set up git worktrees for parallel Cascade tasks

Windsurf supports using git worktrees to run Cascade tasks in parallel without interfering with your main workspace.
When using worktrees, each Cascade conversation gets its own session, allowing Cascade to make edits, or build and test code without interfering with your main workspace.
​
Basic worktree usage
The simplest way to get started with using worktrees is switch to the “Worktree” mode in the bottom right corner of the Cascade input.

Currently, you can only switch to a worktree at the beginning of a Cascade session. Conversations cannot be moved to a different worktree once started.
After Cascade makes file changes in the worktree, you have the option of clicking “merge” to incorporate those changes back into your main workspace.

​
Location
Worktrees are organized by repo name inside ~/.windsurf/worktrees/<repo_name>.
Each worktree is given a unique random name.
To see a list of active worktrees, you can run git worktree list from within the repository directory.
​
Setup hook
Each worktree contains a copy of your repository files, but does not include .env files or other packages that aren’t version-controlled.
If you would like to include additional files or packages in each worktree, you can use the post_setup_worktree hook to copy them into the worktree directory.
The post_setup_worktree hook runs after each worktree is created and configured. It is executed inside the new worktree directory.
The $ROOT_WORKSPACE_PATH environment variable points to the original workspace path and can be used to access files or run commands relative to the original repository.
​
Example
Copy environment files and install dependencies when a new worktree is created.
Config (in .windsurf/hooks.json):
{
  "hooks": {
    "post_setup_worktree": [
      {
        "command": "bash $ROOT_WORKSPACE_PATH/hooks/setup_worktree.sh",
        "show_output": true
      }
    ]
  }
}
Script (hooks/setup_worktree.sh):
#!/bin/bash

# Copy environment files from the original workspace
if [ -f "$ROOT_WORKSPACE_PATH/.env" ]; then
    cp "$ROOT_WORKSPACE_PATH/.env" .env
    echo "Copied .env file"
fi

if [ -f "$ROOT_WORKSPACE_PATH/.env.local" ]; then
    cp "$ROOT_WORKSPACE_PATH/.env.local" .env.local
    echo "Copied .env.local file"
fi

# Install dependencies
if [ -f "package.json" ]; then
    npm install
    echo "Installed npm dependencies"
fi

exit 0
This hook ensures each worktree has the necessary environment configuration and dependencies installed automatically.
​
Cleanup
Windsurf automatically cleans up older worktrees when creating a new worktree to prevent excessive disk usage. Each workspace can have up to 20 worktrees.
Worktrees are cleaned up based on when they were last accessed—the oldest ones are removed first. This cleanup happens on a per-workspace basis, ensuring that worktrees from different repositories remain independent of each other.
Additionally, if you manually delete a Cascade conversation, Windsurf will automatically delete the associated worktree.
​
Source Control Panel
By default, Windsurf does not show worktrees created by Cascade in the SCM Panel. You can set git.showWindsurfWorktrees to true in your settings to override this and enable visualizing the worktrees in the SCM Panel.

# Overview

> A simple, open format for giving agents new capabilities and expertise.

export const LogoCarousel = () => {
  const logos = [{
    name: "Gemini CLI",
    url: "https://geminicli.com",
    lightSrc: "/images/logos/gemini-cli/gemini-cli-logo_light.svg",
    darkSrc: "/images/logos/gemini-cli/gemini-cli-logo_dark.svg"
  }, {
    name: "OpenCode",
    url: "https://opencode.ai/",
    lightSrc: "/images/logos/opencode/opencode-wordmark-light.svg",
    darkSrc: "/images/logos/opencode/opencode-wordmark-dark.svg"
  }, {
    name: "Cursor",
    url: "https://cursor.com/",
    lightSrc: "/images/logos/cursor/LOCKUP_HORIZONTAL_2D_LIGHT.svg",
    darkSrc: "/images/logos/cursor/LOCKUP_HORIZONTAL_2D_DARK.svg"
  }, {
    name: "Amp",
    url: "https://ampcode.com/",
    lightSrc: "/images/logos/amp/amp-logo-light.svg",
    darkSrc: "/images/logos/amp/amp-logo-dark.svg",
    width: "120px"
  }, {
    name: "Letta",
    url: "https://www.letta.com/",
    lightSrc: "/images/logos/letta/Letta-logo-RGB_OffBlackonTransparent.svg",
    darkSrc: "/images/logos/letta/Letta-logo-RGB_GreyonTransparent.svg"
  }, {
    name: "Goose",
    url: "https://block.github.io/goose/",
    lightSrc: "/images/logos/goose/goose-logo-black.png",
    darkSrc: "/images/logos/goose/goose-logo-white.png"
  }, {
    name: "GitHub",
    url: "https://github.com/",
    lightSrc: "/images/logos/github/GitHub_Lockup_Dark.svg",
    darkSrc: "/images/logos/github/GitHub_Lockup_Light.svg"
  }, {
    name: "VS Code",
    url: "https://code.visualstudio.com/",
    lightSrc: "/images/logos/vscode/vscode.svg",
    darkSrc: "/images/logos/vscode/vscode-alt.svg"
  }, {
    name: "Claude Code",
    url: "https://claude.ai/code",
    lightSrc: "/images/logos/claude-code/Claude-Code-logo-Slate.svg",
    darkSrc: "/images/logos/claude-code/Claude-Code-logo-Ivory.svg"
  }, {
    name: "Claude",
    url: "https://claude.ai/",
    lightSrc: "/images/logos/claude-ai/Claude-logo-Slate.svg",
    darkSrc: "/images/logos/claude-ai/Claude-logo-Ivory.svg"
  }, {
    name: "OpenAI Codex",
    url: "https://developers.openai.com/codex",
    lightSrc: "/images/logos/oai-codex/OAI_Codex-Lockup_400px.svg",
    darkSrc: "/images/logos/oai-codex/OAI_Codex-Lockup_400px_Darkmode.svg"
  }, {
    name: "Factory",
    url: "https://factory.ai/",
    lightSrc: "/images/logos/factory/factory-logo-light.svg",
    darkSrc: "/images/logos/factory/factory-logo-dark.svg"
  }];
  const [shuffled, setShuffled] = useState(logos);
  useEffect(() => {
    const shuffle = items => {
      const copy = [...items];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };
    setShuffled(shuffle(logos));
  }, []);
  const row1 = shuffled.filter((_, i) => i % 2 === 0);
  const row2 = shuffled.filter((_, i) => i % 2 === 1);
  const row1Doubled = [...row1, ...row1];
  const row2Doubled = [...row2, ...row2];
  return <>
      <div className="logo-carousel">
        <div className="logo-carousel-track" style={{
    animation: 'logo-scroll 50s linear infinite'
  }}>
          {row1Doubled.map((logo, i) => <a key={`${logo.name}-${i}`} href={logo.url} style={{
    textDecoration: 'none',
    border: 'none'
  }}>
              <img className="block dark:hidden object-contain" style={{
    width: logo.width || '150px',
    maxWidth: '100%'
  }} src={logo.lightSrc} alt={logo.name} />
              <img className="hidden dark:block object-contain" style={{
    width: logo.width || '150px',
    maxWidth: '100%'
  }} src={logo.darkSrc} alt={logo.name} />
            </a>)}
        </div>
      </div>
      <div className="logo-carousel">
        <div className="logo-carousel-track" style={{
    animation: 'logo-scroll 60s linear infinite reverse'
  }}>
          {row2Doubled.map((logo, i) => <a key={`${logo.name}-${i}`} href={logo.url} style={{
    textDecoration: 'none',
    border: 'none'
  }}>
              <img className="block dark:hidden object-contain" style={{
    width: logo.width || '150px',
    maxWidth: '100%'
  }} src={logo.lightSrc} alt={logo.name} />
              <img className="hidden dark:block object-contain" style={{
    width: logo.width || '150px',
    maxWidth: '100%'
  }} src={logo.darkSrc} alt={logo.name} />
            </a>)}
        </div>
      </div>
    </>;
};

Agent Skills are folders of instructions, scripts, and resources that agents can discover and use to do things more accurately and efficiently.

## Why Agent Skills?

Agents are increasingly capable, but often don't have the context they need to do real work reliably. Skills solve this by giving agents access to procedural knowledge and company-, team-, and user-specific context they can load on demand. Agents with access to a set of skills can extend their capabilities based on the task they're working on.

**For skill authors**: Build capabilities once and deploy them across multiple agent products.

**For compatible agents**: Support for skills lets end users give agents new capabilities out of the box.

**For teams and enterprises**: Capture organizational knowledge in portable, version-controlled packages.

## What can Agent Skills enable?

* **Domain expertise**: Package specialized knowledge into reusable instructions, from legal review processes to data analysis pipelines.
* **New capabilities**: Give agents new capabilities (e.g. creating presentations, building MCP servers, analyzing datasets).
* **Repeatable workflows**: Turn multi-step tasks into consistent and auditable workflows.
* **Interoperability**: Reuse the same skill across different skills-compatible agent products.

## Adoption

Agent Skills are supported by leading AI development tools.

<LogoCarousel />

## Open development

The Agent Skills format was originally developed by [Anthropic](https://www.anthropic.com/), released as an open standard, and has been adopted by a growing number of agent products. The standard is open to contributions from the broader ecosystem.

[View on GitHub](https://github.com/agentskills/agentskills)

## Get started

<CardGroup cols={3}>
  <Card title="What are skills?" icon="lightbulb" href="/what-are-skills">
    Learn about skills, how they work, and why they matter.
  </Card>

  <Card title="Specification" icon="file-code" href="/specification">
    The complete format specification for SKILL.md files.
  </Card>

  <Card title="Integrate skills" icon="gear" href="/integrate-skills">
    Add skills support to your agent or tool.
  </Card>

  <Card title="Example skills" icon="code" href="https://github.com/anthropics/skills">
    Browse example skills on GitHub.
  </Card>

  <Card title="Reference library" icon="wrench" href="https://github.com/agentskills/agentskills/tree/main/skills-ref">
    Validate skills and generate prompt XML.
  </Card>
</CardGroup>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://agentskills.io/llms.txt

# What are skills?

> Agent Skills are a lightweight, open format for extending AI agent capabilities with specialized knowledge and workflows.

At its core, a skill is a folder containing a `SKILL.md` file. This file includes metadata (`name` and `description`, at minimum) and instructions that tell an agent how to perform a specific task. Skills can also bundle scripts, templates, and reference materials.

```directory  theme={null}
my-skill/
├── SKILL.md          # Required: instructions + metadata
├── scripts/          # Optional: executable code
├── references/       # Optional: documentation
└── assets/           # Optional: templates, resources
```

## How skills work

Skills use **progressive disclosure** to manage context efficiently:

1. **Discovery**: At startup, agents load only the name and description of each available skill, just enough to know when it might be relevant.

2. **Activation**: When a task matches a skill's description, the agent reads the full `SKILL.md` instructions into context.

3. **Execution**: The agent follows the instructions, optionally loading referenced files or executing bundled code as needed.

This approach keeps agents fast while giving them access to more context on demand.

## The SKILL.md file

Every skill starts with a `SKILL.md` file containing YAML frontmatter and Markdown instructions:

```mdx  theme={null}
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents.
---

# PDF Processing

## When to use this skill
Use this skill when the user needs to work with PDF files...

## How to extract text
1. Use pdfplumber for text extraction...

## How to fill forms
...
```

The following frontmatter is required at the top of `SKILL.md`:

* `name`: A short identifier
* `description`: When to use this skill

The Markdown body contains the actual instructions and has no specific restrictions on structure or content.

This simple format has some key advantages:

* **Self-documenting**: A skill author or user can read a `SKILL.md` and understand what it does, making skills easy to audit and improve.

* **Extensible**: Skills can range in complexity from just text instructions to executable code, assets, and templates.

* **Portable**: Skills are just files, so they're easy to edit, version, and share.

## Next steps

* [View the specification](/specification) to understand the full format.
* [Add skills support to your agent](/integrate-skills) to build a compatible client.
* [See example skills](https://github.com/anthropics/skills) on GitHub.
* [Read authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) for writing effective skills.
* [Use the reference library](https://github.com/agentskills/agentskills/tree/main/skills-ref) to validate skills and generate prompt XML.


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://agentskills.io/llms.txt

# Specification

> The complete format specification for Agent Skills.

This document defines the Agent Skills format.

## Directory structure

A skill is a directory containing at minimum a `SKILL.md` file:

```
skill-name/
└── SKILL.md          # Required
```

<Tip>
  You can optionally include [additional directories](#optional-directories) such as `scripts/`, `references/`, and `assets/` to support your skill.
</Tip>

## SKILL.md format

The `SKILL.md` file must contain YAML frontmatter followed by Markdown content.

### Frontmatter (required)

```yaml  theme={null}
---
name: skill-name
description: A description of what this skill does and when to use it.
---
```

With optional fields:

```yaml  theme={null}
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents.
license: Apache-2.0
metadata:
  author: example-org
  version: "1.0"
---
```

| Field           | Required | Constraints                                                                                                       |
| --------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `name`          | Yes      | Max 64 characters. Lowercase letters, numbers, and hyphens only. Must not start or end with a hyphen.             |
| `description`   | Yes      | Max 1024 characters. Non-empty. Describes what the skill does and when to use it.                                 |
| `license`       | No       | License name or reference to a bundled license file.                                                              |
| `compatibility` | No       | Max 500 characters. Indicates environment requirements (intended product, system packages, network access, etc.). |
| `metadata`      | No       | Arbitrary key-value mapping for additional metadata.                                                              |
| `allowed-tools` | No       | Space-delimited list of pre-approved tools the skill may use. (Experimental)                                      |

#### `name` field

The required `name` field:

* Must be 1-64 characters
* May only contain unicode lowercase alphanumeric characters and hyphens (`a-z` and `-`)
* Must not start or end with `-`
* Must not contain consecutive hyphens (`--`)
* Must match the parent directory name

Valid examples:

```yaml  theme={null}
name: pdf-processing
```

```yaml  theme={null}
name: data-analysis
```

```yaml  theme={null}
name: code-review
```

Invalid examples:

```yaml  theme={null}
name: PDF-Processing  # uppercase not allowed
```

```yaml  theme={null}
name: -pdf  # cannot start with hyphen
```

```yaml  theme={null}
name: pdf--processing  # consecutive hyphens not allowed
```

#### `description` field

The required `description` field:

* Must be 1-1024 characters
* Should describe both what the skill does and when to use it
* Should include specific keywords that help agents identify relevant tasks

Good example:

```yaml  theme={null}
description: Extracts text and tables from PDF files, fills PDF forms, and merges multiple PDFs. Use when working with PDF documents or when the user mentions PDFs, forms, or document extraction.
```

Poor example:

```yaml  theme={null}
description: Helps with PDFs.
```

#### `license` field

The optional `license` field:

* Specifies the license applied to the skill
* We recommend keeping it short (either the name of a license or the name of a bundled license file)

Example:

```yaml  theme={null}
license: Proprietary. LICENSE.txt has complete terms
```

#### `compatibility` field

The optional `compatibility` field:

* Must be 1-500 characters if provided
* Should only be included if your skill has specific environment requirements
* Can indicate intended product, required system packages, network access needs, etc.

Examples:

```yaml  theme={null}
compatibility: Designed for Claude Code (or similar products)
```

```yaml  theme={null}
compatibility: Requires git, docker, jq, and access to the internet
```

<Note>
  Most skills do not need the `compatibility` field.
</Note>

#### `metadata` field

The optional `metadata` field:

* A map from string keys to string values
* Clients can use this to store additional properties not defined by the Agent Skills spec
* We recommend making your key names reasonably unique to avoid accidental conflicts

Example:

```yaml  theme={null}
metadata:
  author: example-org
  version: "1.0"
```

#### `allowed-tools` field

The optional `allowed-tools` field:

* A space-delimited list of tools that are pre-approved to run
* Experimental. Support for this field may vary between agent implementations

Example:

```yaml  theme={null}
allowed-tools: Bash(git:*) Bash(jq:*) Read
```

### Body content

The Markdown body after the frontmatter contains the skill instructions. There are no format restrictions. Write whatever helps agents perform the task effectively.

Recommended sections:

* Step-by-step instructions
* Examples of inputs and outputs
* Common edge cases

Note that the agent will load this entire file once it's decided to activate a skill. Consider splitting longer `SKILL.md` content into referenced files.

## Optional directories

### scripts/

Contains executable code that agents can run. Scripts should:

* Be self-contained or clearly document dependencies
* Include helpful error messages
* Handle edge cases gracefully

Supported languages depend on the agent implementation. Common options include Python, Bash, and JavaScript.

### references/

Contains additional documentation that agents can read when needed:

* `REFERENCE.md` - Detailed technical reference
* `FORMS.md` - Form templates or structured data formats
* Domain-specific files (`finance.md`, `legal.md`, etc.)

Keep individual [reference files](#file-references) focused. Agents load these on demand, so smaller files mean less use of context.

### assets/

Contains static resources:

* Templates (document templates, configuration templates)
* Images (diagrams, examples)
* Data files (lookup tables, schemas)

## Progressive disclosure

Skills should be structured for efficient use of context:

1. **Metadata** (\~100 tokens): The `name` and `description` fields are loaded at startup for all skills
2. **Instructions** (\< 5000 tokens recommended): The full `SKILL.md` body is loaded when the skill is activated
3. **Resources** (as needed): Files (e.g. those in `scripts/`, `references/`, or `assets/`) are loaded only when required

Keep your main `SKILL.md` under 500 lines. Move detailed reference material to separate files.

## File references

When referencing other files in your skill, use relative paths from the skill root:

```markdown  theme={null}
See [the reference guide](references/REFERENCE.md) for details.

Run the extraction script:
scripts/extract.py
```

Keep file references one level deep from `SKILL.md`. Avoid deeply nested reference chains.

## Validation

Use the [skills-ref](https://github.com/agentskills/agentskills/tree/main/skills-ref) reference library to validate your skills:

```bash  theme={null}
skills-ref validate ./my-skill
```

This checks that your `SKILL.md` frontmatter is valid and follows all naming conventions.


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://agentskills.io/llms.txt

# Integrate skills into your agent

> How to add Agent Skills support to your agent or tool.

This guide explains how to add skills support to an AI agent or development tool.

## Integration approaches

The two main approaches to integrating skills are:

**Filesystem-based agents** operate within a computer environment (bash/unix) and represent the most capable option. Skills are activated when models issue shell commands like `cat /path/to/my-skill/SKILL.md`. Bundled resources are accessed through shell commands.

**Tool-based agents** function without a dedicated computer environment. Instead, they implement tools allowing models to trigger skills and access bundled assets. The specific tool implementation is up to the developer.

## Overview

A skills-compatible agent needs to:

1. **Discover** skills in configured directories
2. **Load metadata** (name and description) at startup
3. **Match** user tasks to relevant skills
4. **Activate** skills by loading full instructions
5. **Execute** scripts and access resources as needed

## Skill discovery

Skills are folders containing a `SKILL.md` file. Your agent should scan configured directories for valid skills.

## Loading metadata

At startup, parse only the frontmatter of each `SKILL.md` file. This keeps initial context usage low.

### Parsing frontmatter

```
function parseMetadata(skillPath):
    content = readFile(skillPath + "/SKILL.md")
    frontmatter = extractYAMLFrontmatter(content)

    return {
        name: frontmatter.name,
        description: frontmatter.description,
        path: skillPath
    }
```

### Injecting into context

Include skill metadata in the system prompt so the model knows what skills are available.

Follow your platform's guidance for system prompt updates. For example, for Claude models, the recommended format uses XML:

```xml  theme={null}
<available_skills>
  <skill>
    <name>pdf-processing</name>
    <description>Extracts text and tables from PDF files, fills forms, merges documents.</description>
    <location>/path/to/skills/pdf-processing/SKILL.md</location>
  </skill>
  <skill>
    <name>data-analysis</name>
    <description>Analyzes datasets, generates charts, and creates summary reports.</description>
    <location>/path/to/skills/data-analysis/SKILL.md</location>
  </skill>
</available_skills>
```

For filesystem-based agents, include the `location` field with the absolute path to the SKILL.md file. For tool-based agents, the location can be omitted.

Keep metadata concise. Each skill should add roughly 50-100 tokens to the context.

## Security considerations

Script execution introduces security risks. Consider:

* **Sandboxing**: Run scripts in isolated environments
* **Allowlisting**: Only execute scripts from trusted skills
* **Confirmation**: Ask users before running potentially dangerous operations
* **Logging**: Record all script executions for auditing

## Reference implementation

The [skills-ref](https://github.com/agentskills/agentskills/tree/main/skills-ref) library provides Python utilities and a CLI for working with skills.

For example:

**Validate a skill directory:**

```
skills-ref validate <path>
```

**Generate `<available_skills>` XML for agent prompts:**

```
skills-ref to-prompt <path>...
```

Use the library source code as a reference implementation.


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://agentskills.io/llms.txt