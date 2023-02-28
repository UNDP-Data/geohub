<script lang="ts">
  import Notification from '$components/controls/Notification.svelte'

  export let headerHeight: number
  let isExpanded = true
  let activeSettingTab = 'Geohub'
  let settingsApplied = false

  // Default Settings
  const settings = {
    sideBarPosition: 'left',
  }

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
  }

  let settingsFromCookies = JSON.parse(getCookie('settings') || '{}')
  if (settingsFromCookies) {
    settings.sideBarPosition = settingsFromCookies.sideBarPosition || 'left'
  }
  let sideBarPosition: 'left' | 'right' = JSON.parse(getCookie('settings') || '{}').sideBarPosition || 'left'

  const setSettingsToCookies = () => {
    sessionStorage.setItem('settings', JSON.stringify(settings))
    document.cookie = `settings=${JSON.stringify(settings)}; path=/;`
    settingsApplied = true
  }
  const collapseMiniMenu = () => {
    isExpanded = !isExpanded
  }
</script>

<div
  class="columns is-one-quarter ml-auto mr-auto"
  style="margin-top: {headerHeight}px; z-index:-1">
  <div class="column is-2">
    <aside class="menu">
      <ul class="menu-list">
        <li>
          <a
            on:click={collapseMiniMenu}
            href="#">GeoHub Settings</a>
          <ul style="display: {!isExpanded ? 'none' : ''}">
            <li>
              <a
                class={activeSettingTab === 'Geohub' ? 'selected' : ''}
                on:click={() => (activeSettingTab = 'Geohub')}
                href="#">Map Settings</a>
            </li>
          </ul>
        </li>
      </ul>
    </aside>
  </div>
  <div class="column is-two-fifths m-auto">
    <section
      class="content {activeSettingTab !== 'Geohub' ? 'is-hidden' : ''}"
      id="Geohub">
      <h2>Sidebar Position</h2>
      <p>Change the sidebar position between left and right</p>
      <div class="columns">
        <div
          on:click={() => (settings.sideBarPosition = 'left')}
          class="column sidebar-col {settings.sideBarPosition === 'left' ? 'selected-sidebar' : ''}">
          <div class="card">
            <div class="card-header">
              <p class="card-header-title">Left Sidebar</p>
              <div
                class="card-header-icon"
                aria-label="more options">
                <span class="icon">
                  <i
                    style="transform: rotate(-90deg)"
                    class="fa-regular fa-window-maximize" />
                </span>
              </div>
            </div>
            <div class="card-content">
              <div class="content">
                <img
                  src="/assets/sidebar/left-sidebar.png"
                  alt="left sidebar" />
              </div>
            </div>
          </div>
        </div>
        <div
          on:click={() => (settings.sideBarPosition = 'right')}
          class="column sidebar-col {settings.sideBarPosition === 'right' ? 'selected-sidebar' : ''}">
          <div class="card">
            <div class="card-header">
              <p class="card-header-title">Right Sidebar</p>
              <div
                class="card-header-icon"
                aria-label="more options">
                <span class="icon">
                  <i
                    style="transform: rotate(90deg)"
                    class="fa-regular fa-window-maximize" />
                </span>
              </div>
            </div>
            <div class="card-content">
              <div class="content">
                <img
                  src="/assets/sidebar/right-sidebar.png"
                  alt="right sidebar" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</div>
{#if settingsApplied}
  <Notification
    type="info"
    on:close={() => (settingsApplied = false)}
    showCloseButton={true}>
    <p>Settings Applied Successfully!!</p>
    <a
      class="m-auto"
      href="/">Go To GeoHub</a>
  </Notification>
{/if}
<div
  class="columns m-auto pb-2"
  style="width: fit-content">
  <button
    on:click={setSettingsToCookies}
    class="button is-primary">Apply</button>
</div>

<style lang="scss">
  .content {
    padding: 1rem;
  }
  .content.is-hidden:not(:first-of-type) {
    display: none;
  }
  .menu-list li {
    margin-bottom: 0.5rem;
  }
  .menu-list a.selected {
    background-color: #3273dc;
    color: white;
  }
  .menu-list a {
    cursor: pointer;
  }

  .card {
    z-index: -1;
  }

  .sidebar-col:hover {
    cursor: pointer;
  }

  .selected-sidebar {
    border: 2px solid #3273dc;
  }
</style>
