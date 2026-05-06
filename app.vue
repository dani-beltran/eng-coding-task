<template>
  <div class="flex min-h-[100dvh] bg-[#eceef3] text-slate-900">
    <VerticalNavBar class="shrink-0" />

    <main class="min-w-0 flex-1 overflow-y-auto">
      <NuxtPage />
    </main>

    <aside class="flex w-[360px] h-[50dvh] shrink-0 items-stretch border-l border-slate-300/70 bg-[#f1f3f6] p-5">
      <ChatbotInterface class="h-full" />
    </aside>
  </div>
</template>
