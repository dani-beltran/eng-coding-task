<script setup lang="ts">
import {
  AvatarFallback,
  AvatarRoot,
  ToolbarButton,
  ToolbarRoot,
  ToolbarSeparator,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'reka-ui'
import { ref } from 'vue'
import bookIcon from '~/assets/icons/book.svg'
import calendarIcon from '~/assets/icons/calendar.svg'
import feedbackIcon from '~/assets/icons/feedback.svg'
import homeIcon from '~/assets/icons/home.svg'
import jobIcon from '~/assets/icons/job.svg'
import routeIcon from '~/assets/icons/route.svg'
import searchIcon from '~/assets/icons/search.svg'
import homeLogo from '~/assets/logos/home-logo.png'

type NavItem = 'home' | 'search' | 'integrations' | 'workspace' | 'docs' | 'projects' | 'feedback'

const activeItem = ref<NavItem>('workspace')

const setActiveItem = (item: NavItem) => {
  activeItem.value = item
}

const buttonClasses = (item: NavItem) => {
  const baseClasses = 'flex h-16 w-16 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3794ff]/50'

  if (activeItem.value === item) {
    return `${baseClasses} bg-[#f4f4f2] text-[#2f75d6] shadow-[inset_0_0_0_1px_rgba(47,117,214,0.18)]`
  }

  return `${baseClasses} text-[#858b94] hover:bg-white/70`
}
</script>

<template>
  <aside class="flex h-[100dvh] w-[112px] flex-col items-center bg-[#eceef3] px-4 py-7">
    <div class="mb-9 flex h-24 w-24 items-center justify-center" aria-hidden="true">
      <img :src="homeLogo" alt="Logo" class="h-12 w-12">
    </div>

    <TooltipProvider :delay-duration="120">
      <ToolbarRoot orientation="vertical" class="flex h-full w-full flex-col items-center">
        <TooltipRoot>
          <TooltipTrigger as-child>
            <ToolbarButton
              aria-label="Home"
              :class="buttonClasses('home')"
              @click="setActiveItem('home')"
            >
              <img :src="homeIcon" alt="" class="h-5 w-5" aria-hidden="true">
            </ToolbarButton>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side="right" :side-offset="10" class="rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-sm">
              Home
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>

        <ToolbarSeparator class="my-6 h-px w-14 bg-[#d6d8dc]" />

        <TooltipRoot>
          <TooltipTrigger as-child>
            <ToolbarButton
              aria-label="Search"
              :class="buttonClasses('search')"
              @click="setActiveItem('search')"
            >
              <img :src="searchIcon" alt="" class="h-5 w-5" aria-hidden="true">
            </ToolbarButton>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side="right" :side-offset="10" class="rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-sm">
              Search
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>

        <TooltipRoot>
          <TooltipTrigger as-child>
            <ToolbarButton
              aria-label="Integrations"
              :class="buttonClasses('integrations')"
              @click="setActiveItem('integrations')"
            >
              <img :src="routeIcon" alt="" class="h-5 w-5" aria-hidden="true">
            </ToolbarButton>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side="right" :side-offset="10" class="rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-sm">
              Integrations
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>

        <TooltipRoot>
          <TooltipTrigger as-child>
            <ToolbarButton
              aria-label="Workspace"
              :class="buttonClasses('workspace')"
              @click="setActiveItem('workspace')"
            >
              <img :src="calendarIcon" alt="" class="h-5 w-5" aria-hidden="true">
            </ToolbarButton>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side="right" :side-offset="10" class="rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-sm">
              Workspace
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>

        <TooltipRoot>
          <TooltipTrigger as-child>
            <ToolbarButton
              aria-label="Docs"
              :class="buttonClasses('docs')"
              @click="setActiveItem('docs')"
            >
              <img :src="bookIcon" alt="" class="h-5 w-5" aria-hidden="true">
            </ToolbarButton>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side="right" :side-offset="10" class="rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-sm">
              Docs
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>

        <ToolbarSeparator class="my-6 h-px w-14 bg-[#d6d8dc]" />

        <TooltipRoot>
          <TooltipTrigger as-child>
            <ToolbarButton
              aria-label="Projects"
              :class="buttonClasses('projects')"
              @click="setActiveItem('projects')"
            >
              <img :src="jobIcon" alt="" class="h-5 w-5" aria-hidden="true">
            </ToolbarButton>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side="right" :side-offset="10" class="rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-sm">
              Projects
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>

        <div class="flex-1" />

        

        <TooltipRoot>
          <TooltipTrigger as-child>
            <ToolbarButton
              aria-label="Feedback"
              :class="buttonClasses('feedback')"
              @click="setActiveItem('feedback')"
            >
              <img :src="feedbackIcon" alt="" class="h-5 w-5" aria-hidden="true">
            </ToolbarButton>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side="right" :side-offset="10" class="rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-sm">
              Feedback
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>

        <AvatarRoot class="mt-3 inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-[#3794ff] bg-[#d0d6dd]">
          <AvatarFallback class="text-sm font-semibold text-slate-700">
            <img src="/assets/placeholder-picture.png" alt="User Avatar" class="h-9 w-9 rounded-full">
          </AvatarFallback>
        </AvatarRoot>

        
      </ToolbarRoot>
    </TooltipProvider>
  </aside>
</template>
