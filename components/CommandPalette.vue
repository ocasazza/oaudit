<template>
  <TransitionRoot :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel
            class="mx-auto max-w-2xl transform divide-y divide-gray-100 overflow-hidden bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all"
          >
            <Combobox @update:modelValue="executeCommand">
              <div class="relative">
                <MagnifyingGlassIcon
                  class="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                <ComboboxInput
                  class="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search users, apps, groups, or type a command..."
                  @change="query = $event.target.value"
                  @keydown="handleKeydown"
                />
              </div>

              <ComboboxOptions
                v-if="filteredCommands.length > 0"
                static
                class="max-h-80 scroll-py-2 divide-y divide-gray-100 overflow-y-auto"
              >
                <li v-for="group in groupedCommands" :key="group.title" class="p-2">
                  <h2 v-if="group.title" class="mb-2 mt-4 px-3 text-xs font-semibold text-gray-500">
                    {{ group.title }}
                  </h2>
                  <ul class="text-sm text-gray-700">
                    <ComboboxOption
                      v-for="command in group.commands"
                      :key="command.id"
                      :value="command"
                      as="template"
                      v-slot="{ active }"
                    >
                      <li
                        :class="[
                          'flex cursor-default select-none items-center px-3 py-2',
                          active && 'bg-primary-600 text-white'
                        ]"
                      >
                        <component
                          :is="command.icon"
                          :class="[
                            'h-6 w-6 flex-none',
                            active ? 'text-white' : 'text-gray-400'
                          ]"
                          aria-hidden="true"
                        />
                        <div class="ml-3 flex-auto">
                          <p :class="[active ? 'text-white' : 'text-gray-900']">
                            {{ command.title }}
                          </p>
                          <p :class="[active ? 'text-primary-200' : 'text-gray-500']">
                            {{ command.description }}
                          </p>
                        </div>
                        <div v-if="command.shortcut" class="ml-3 flex-none text-xs">
                          <kbd
                            :class="[
                              'font-sans',
                              active
                                ? 'text-primary-200'
                                : 'text-gray-400'
                            ]"
                          >
                            {{ command.shortcut }}
                          </kbd>
                        </div>
                      </li>
                    </ComboboxOption>
                  </ul>
                </li>
              </ComboboxOptions>

              <div v-if="query !== '' && filteredCommands.length === 0" class="px-6 py-14 text-center text-sm sm:px-14">
                <ExclamationTriangleIcon class="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
                <p class="mt-4 font-semibold text-gray-900">No results found</p>
                <p class="mt-2 text-gray-500">
                  No commands found for this search term. Try "user John", "app Salesforce", or "trace access".
                </p>
              </div>
            </Combobox>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/vue'
import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  ShareIcon
} from '@heroicons/vue/24/outline'

interface Command {
  id: string
  title: string
  description: string
  icon: any
  action: () => void
  category: string
  shortcut?: string
  keywords: string[]
}

const isOpen = ref(false)
const query = ref('')

// Define available commands
const commands = ref<Command[]>([
  // Navigation commands
  {
    id: 'nav-dashboard',
    title: 'Go to Dashboard',
    description: 'View the main audit dashboard',
    icon: ChartBarIcon,
    action: () => navigateTo('/'),
    category: 'Navigation',
    shortcut: '⌘D',
    keywords: ['dashboard', 'home', 'overview']
  },
  {
    id: 'nav-users',
    title: 'View All Users',
    description: 'Browse all Okta users',
    icon: UserIcon,
    action: () => navigateTo('/users'),
    category: 'Navigation',
    keywords: ['users', 'people', 'accounts']
  },
  {
    id: 'nav-applications',
    title: 'View All Applications',
    description: 'Browse all Okta applications',
    icon: BuildingOfficeIcon,
    action: () => navigateTo('/applications'),
    category: 'Navigation',
    keywords: ['applications', 'apps', 'software']
  },
  {
    id: 'nav-groups',
    title: 'View All Groups',
    description: 'Browse all Okta groups',
    icon: UserGroupIcon,
    action: () => navigateTo('/groups'),
    category: 'Navigation',
    keywords: ['groups', 'teams', 'roles']
  },
  {
    id: 'nav-logs',
    title: 'View Audit Logs',
    description: 'Browse system audit logs',
    icon: DocumentTextIcon,
    action: () => navigateTo('/logs'),
    category: 'Navigation',
    keywords: ['logs', 'audit', 'events', 'history']
  },

  // Search commands
  {
    id: 'search-user',
    title: 'Find User',
    description: 'Search for a specific user',
    icon: UserIcon,
    action: () => {
      const userName = extractSearchTerm(query.value, ['user', 'find user'])
      if (userName) {
        navigateTo(`/users?search=${encodeURIComponent(userName)}`)
      } else {
        navigateTo('/users')
      }
    },
    category: 'Search',
    keywords: ['user', 'find user', 'search user', 'person']
  },
  {
    id: 'search-app',
    title: 'Find Application',
    description: 'Search for a specific application',
    icon: BuildingOfficeIcon,
    action: () => {
      const appName = extractSearchTerm(query.value, ['app', 'application', 'find app'])
      if (appName) {
        navigateTo(`/applications?search=${encodeURIComponent(appName)}`)
      } else {
        navigateTo('/applications')
      }
    },
    category: 'Search',
    keywords: ['app', 'application', 'find app', 'software']
  },
  {
    id: 'search-group',
    title: 'Find Group',
    description: 'Search for a specific group',
    icon: UserGroupIcon,
    action: () => {
      const groupName = extractSearchTerm(query.value, ['group', 'find group'])
      if (groupName) {
        navigateTo(`/groups?search=${encodeURIComponent(groupName)}`)
      } else {
        navigateTo('/groups')
      }
    },
    category: 'Search',
    keywords: ['group', 'find group', 'search group', 'team']
  },

  // Audit commands
  {
    id: 'trace-access',
    title: 'Trace User Access',
    description: 'Trace how a user gets access to an application',
    icon: ShareIcon,
    action: () => {
      // Parse "trace user X app Y" or "why user X has Y"
      const match = query.value.match(/(?:trace|why)\s+user\s+([^"]+?)(?:\s+(?:app|has|to)\s+(.+))?$/i)
      if (match) {
        const userName = match[1].trim()
        const appName = match[2]?.trim()
        if (userName && appName) {
          navigateTo(`/trace?user=${encodeURIComponent(userName)}&app=${encodeURIComponent(appName)}`)
        } else if (userName) {
          navigateTo(`/users?search=${encodeURIComponent(userName)}&action=trace`)
        }
      } else {
        navigateTo('/trace')
      }
    },
    category: 'Audit',
    keywords: ['trace', 'why', 'access', 'permission', 'how', 'user has app']
  },
  {
    id: 'graph-view',
    title: 'Graph View',
    description: 'Show access relationships as a graph',
    icon: ShareIcon,
    action: () => {
      const userName = extractSearchTerm(query.value, ['graph', 'graph view'])
      if (userName) {
        navigateTo(`/graph?user=${encodeURIComponent(userName)}`)
      } else {
        navigateTo('/graph')
      }
    },
    category: 'Audit',
    keywords: ['graph', 'graph view', 'relationships', 'visual', 'network']
  },

  // Settings
  {
    id: 'settings',
    title: 'Settings',
    description: 'Configure application settings',
    icon: CogIcon,
    action: () => navigateTo('/settings'),
    category: 'Settings',
    shortcut: '⌘,',
    keywords: ['settings', 'config', 'preferences']
  }
])

// Filter commands based on query
const filteredCommands = computed(() => {
  if (query.value === '') {
    return commands.value.slice(0, 10) // Show top 10 commands when no query
  }

  const searchTerm = query.value.toLowerCase()
  return commands.value.filter(command => {
    return (
      command.title.toLowerCase().includes(searchTerm) ||
      command.description.toLowerCase().includes(searchTerm) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    )
  }).slice(0, 20) // Limit to 20 results
})

// Group commands by category
const groupedCommands = computed(() => {
  const groups: { [key: string]: Command[] } = {}

  filteredCommands.value.forEach(command => {
    if (!groups[command.category]) {
      groups[command.category] = []
    }
    groups[command.category].push(command)
  })

  return Object.entries(groups).map(([title, commands]) => ({
    title,
    commands
  }))
})

// Extract search term from natural language query
function extractSearchTerm(query: string, prefixes: string[]): string | null {
  for (const prefix of prefixes) {
    const regex = new RegExp(`${prefix}\\s+["']?([^"']+?)["']?(?:\\s|$)`, 'i')
    const match = query.match(regex)
    if (match) {
      return match[1].trim()
    }
  }
  return null
}

// Execute selected command
function executeCommand(command: Command | null) {
  if (command) {
    command.action()
    closeModal()
  }
}

// Open/close modal
function openModal() {
  isOpen.value = true
  query.value = ''
}

function closeModal() {
  isOpen.value = false
  query.value = ''
}

// Handle keyboard shortcuts
function handleKeydown(event: KeyboardEvent) {
  // Handle Escape to close
  if (event.key === 'Escape') {
    closeModal()
  }
}

function handleGlobalKeydown(event: KeyboardEvent) {
  // Handle Cmd+K / Ctrl+K to open
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    openModal()
  }
}

// Setup global keyboard listeners
onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

// Expose methods for parent components
defineExpose({
  openModal,
  closeModal
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
