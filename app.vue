<template>
  <div class="flex min-h-[100dvh] bg-[#eceef3] text-slate-900">
    <VerticalNavBar class="shrink-0" />

    <main class="min-w-0 flex-1 overflow-y-auto">
      <NuxtPage />
    </main>

    <aside class="flex w-[360px] h-[920px] max-h-[90dvh] shrink-0 items-stretch p-5">
      <ChatbotInterface class="h-full" />
    </aside>
  </div>
</template>
