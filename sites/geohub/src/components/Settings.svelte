<script lang="ts">
  import { Header, Footer, type HeaderLink } from '@undp-data/svelte-undp-design'
  import { Accordion } from '@undp-data/svelte-undp-design'
  import UserAccount from '$components/UserAccount.svelte'
  import { footerItems } from '$lib/constants'
  import { createHeaderLinks } from '$lib/helper'
  let isExpanded = false
  let headerHeight: number
  let activeSettingTab = 'Geohub'
  let links: HeaderLink[] = createHeaderLinks(['home', 'dashboard', 'userguide'])
</script>

<Header
  region="UNDP's one stop shop for spatial data and analytics"
  siteTitle="GeoHub"
  url="https://geohub.data.undp.org"
  logoUrl="assets/undp-images/undp-logo-blue.svg"
  bind:height={headerHeight}
  bind:links
  isPositionFixed={true}>
  <div slot="custom-button">
    <UserAccount />
  </div>
</Header>

<div
  class="columns is-half"
  style="margin-top: {headerHeight}px">
  <div class="column is-2">
    <aside class="menu">
      <p class="menu-label">GeoHub Settings</p>
      <ul class="menu-list">
        <li>
          <a
            on:click={() => (activeSettingTab = 'Geohub')}
            class={activeSettingTab === 'Geohub' ? 'selected' : ''}
            data-content="Geohub">GeoHub</a>
        </li>
        <!--                <li><a on:click={() => activeSettingTab = 'notifications'} class="{activeSettingTab === 'notifications' ? 'selected' : ''}" data-content="notifications">Notifications</a></li>-->
        <!--                <li><a on:click={() => activeSettingTab = 'privacy'} class="{activeSettingTab === 'privacy' ? 'selected' : ''}" data-content="privacy">Privacy</a></li>-->
        <!--                <li><a on:click={() => activeSettingTab = 'billing'} class="{activeSettingTab === 'billing' ? 'selected' : ''}" data-content="billing">Billing</a></li>-->
      </ul>
    </aside>
  </div>
  <div class="column">
    <section
      class="content {activeSettingTab !== 'Geohub' ? 'is-hidden' : ''}"
      id="Geohub">
      <h2>Sedebar Settings</h2>
      <p>Change the sidebar position between left and right</p>
      <div class="columns">
        <div class="column">
          <div class="card">
            <header class="card-header">
              <p class="card-header-title">Left</p>
            </header>
            <div class="card-image">
              <figure class="image is-4by3">
                <img
                  src="https://bulma.io/images/placeholders/1280x960.png"
                  alt="Placeholder image" />
              </figure>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="card">
            <header class="card-header">
              <p class="card-header-title">Right</p>
              <button
                class="card-header-icon"
                aria-label="more options">
                <span class="icon">
                  <i
                    class="fas fa-angle-down"
                    aria-hidden="true" />
                </span>
              </button>
            </header>
          </div>
        </div>
      </div>
    </section>
    <section
      class="content {activeSettingTab !== 'notifications' ? 'is-hidden' : ''}"
      id="notifications">
      <h2>Notification Settings</h2>
      <p>Here you can update your notification settings.</p>
    </section>
    <section
      class="content {activeSettingTab !== 'privacy' ? 'is-hidden' : ''}"
      id="privacy">
      <h2>Privacy Settings</h2>
      <p>Here you can update your privacy settings.</p>
    </section>
    <section
      class="content {activeSettingTab !== 'billing' ? 'is-hidden' : ''}"
      id="billing">
      <h2>Billing Settings</h2>
      <p>Here you can update your billing settings.</p>
    </section>
  </div>
</div>
<Footer
  logoUrl="assets/undp-images/undp-logo-white.svg"
  {footerItems} />

<style lang="scss">
  /* Add some padding to the content */
  .content {
    padding: 1rem;
  }

  /* Hide all content sections except for the first one */
  .content.is-hidden:not(:first-of-type) {
    display: none;
  }

  /* Add some margin to the menu items */
  .menu-list li {
    margin-bottom: 0.5rem;
  }

  /* Set the background color and text color of the selected menu item */
  .menu-list a.selected {
    background-color: #3273dc;
    color: white;
  }

  /* Change the content section when a menu item is clicked */
  .menu-list a {
    cursor: pointer;
  }
</style>
