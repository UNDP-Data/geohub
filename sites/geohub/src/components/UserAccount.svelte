<script lang="ts">
  import { signIn, signOut } from '@auth/sveltekit/client'
  import { page } from '$app/stores'
  import { Button } from '@undp-data/svelte-undp-design'
  import chroma from 'chroma-js'
  import { goto } from '$app/navigation'

  let panelWidth = '350px'
  let dropdownActive = false
  let innerWidth = 0

  $: isMobile = innerWidth < 768

  const name = $page.data.session?.user.name
  const names = name?.split(' ') ?? []

  const handleDropdown = () => {
    dropdownActive = !dropdownActive
  }
  const gotToSettings = async () => {
    await goto('/settings')
  }
</script>

<svelte:window bind:innerWidth />
{#if $page.data.session}
  <div class="dropdown is-right {dropdownActive ? 'is-active' : null}">
    <div class="dropdown-trigger">
      <div
        role="button"
        tabindex="0"
        on:click={() => handleDropdown()}
        on:keydown={(e) => {
          if (e.key === 'Enter') {
            handleDropdown()
          }
        }}>
        {#if $page.data.session.user?.image}
          <span
            style="background-image: url('{$page.data.session.user.image}')"
            class="avatar" />
        {:else}
          <span
            class="initial-avator is-flex is-justify-content-center	is-align-items-center"
            style="background-color: {chroma.random()}">
            {#each names as name}
              <p
                class="name"
                style="color: white">
                {name.slice(0, 1)}
              </p>
            {/each}
          </span>
        {/if}
      </div>
    </div>
    <div
      class="dropdown-menu"
      style="max-width: {panelWidth}"
      role="menu">
      <div class="dropdown-content">
        <div class="dropdown-item has-text-centered">
          <p class="title mb-2 is-4">{$page.data.session.user.name}</p>
          {#if $page.data.session.user['jobTitle']}
            <p class="has-text-weight-bold">{$page.data.session.user['jobTitle']}</p>
          {/if}
          <hr class="dropdown-divider" />
          <p>{$page.data.session.user.email}</p>
        </div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          on:click={gotToSettings}
          class="dropdown-item settings-div is-flex is-justify-content-space-between is-align-items-center">
          <div class="is-flex-grow-1">
            <p class="pl-2">Settings</p>
          </div>
          <div class="is-flex-shrink-0">
            <span class="icon is-small">
              <i
                class="fas fa-chevron-right"
                aria-hidden="true" />
            </span>
          </div>
        </div>
        <hr class="dropdown-divider" />
        <div class="dropdown-item">
          <Button
            title="Sign Out"
            isPrimary={false}
            on:clicked={() => signOut('azure-ad')} />
        </div>
      </div>
    </div>
  </div>
{:else}
  <button
    class="button is-primary {isMobile ? 'is-small' : 'is-normal'}"
    on:click={() => signIn('azure-ad')}><b>SIGN IN</b></button>
{/if}

<style lang="scss">
  .avatar {
    border-radius: 2rem;
    float: left;
    height: 2.8rem;
    width: 2.8rem;
    background-color: white;
    background-size: cover;
    background-repeat: no-repeat;
  }

  .initial-avator {
    border-radius: 2rem;
    height: 2.8rem;
    width: 2.8rem;
    background-size: cover;
    background-repeat: no-repeat;

    .name {
      font-size: large;
    }
  }

  .settings-div {
    cursor: pointer;
    &:hover {
      background-color: #f5f5f5;
    }
  }
</style>
