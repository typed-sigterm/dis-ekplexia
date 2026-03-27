<template>
  <UApp :toaster="{ position: 'top-center' }">
    <DisEkplexia />

    <div class="text-muted mt-4 mx-4 md:mx-12 flex justify-between">
      <p class="text-sm">
        &copy; 2026-present
        <ULink active href="https://typed-sigterm.me/?utm_source=dis-ekplexia.by-ts.top&utm_medium=footer" target="_blank">
          Typed SIGTERM
        </ULink>
      </p>
      <ULink class="text-lg" href="http://github.com/typed-sigterm/dis-ekplexia" target="_blank">
        <UIcon name="i-logos-github-icon" />
      </ULink>
    </div>
  </UApp>
</template>
