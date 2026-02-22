import {
  ClipboardListIcon,
  FileTextIcon,
  PlusCircleIcon,
  SettingsIcon,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/lib/components/ui/sidebar'
import { NavMain } from '~/lib/components/ui/nav-main'
import { NavSecondary } from '~/lib/components/ui/nav-secondary'
import { NavUser } from '~/lib/components/ui/nav-user'

interface AppSidebarProps {
  variant?: 'inset' | 'sidebar' | 'floating'
}

const data = {
  user: {
    name: 'Ralf Hitscher',
    email: '',
    avatar: '',
  },
  navMain: [
    {
      title: 'Lieferscheine',
      url: '/delivery-notes/overview',
      icon: FileTextIcon,
    },
    {
      title: 'Neuer Lieferschein',
      url: '/delivery-notes/new',
      icon: PlusCircleIcon,
    },
  ],
  navSecondary: [
    {
      title: 'Einstellungen',
      url: '/settings',
      icon: SettingsIcon,
    },
  ],
}

export function AppSidebar({ variant = 'inset' }: AppSidebarProps) {
  return (
    <Sidebar variant={variant}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/delivery-notes/overview">
                <span className="text-base font-semibold">Lieferschein Hitscher</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <div className="mt-auto flex justify-center">
          <img src="/hitscher_logo.png" alt="Gartenbau Hitscher" className="h-[70%] w-auto" />
        </div>
        <NavSecondary items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
