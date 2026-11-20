// Applies the saved theme before the first paint, so the boot splash shows the day or the night
// sky the app will open in. The app applies it again once it runs (src/app/shell/theme.ts).
;(function () {
  try {
    var saved = localStorage.getItem('kalka:theme') || 'dark'
    var dark = saved === 'auto' ? matchMedia('(prefers-color-scheme: dark)').matches : saved !== 'light'
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  } catch (error) {
    // Storage can be blocked; the splash then follows the system's colour scheme.
  }
})()
