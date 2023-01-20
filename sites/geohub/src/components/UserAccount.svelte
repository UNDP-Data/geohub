<script lang="ts">
  import { signIn, signOut } from '@auth/sveltekit/client'
  import { page } from '$app/stores'
  import { slide } from 'svelte/transition'
  import { clickOutside } from 'svelte-use-click-outside'
  import Popper from '$lib/popper'
  import { Button } from '@undp-data/svelte-undp-design'

  let isPanelOpen = false
  let panelWidth = '350px'

  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper(
    {
      placement: 'bottom-end',
      strategy: 'fixed',
    },
    [0, 50],
  ).init()

  const togglePanel = () => {
    isPanelOpen = !isPanelOpen
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      togglePanel()
    }
  }
</script>

{#if $page.data.session}
  <div
    role="button"
    tabindex="0"
    on:click={togglePanel}
    on:keydown={handleKeyDown}
    use:popperRef>
    {#if $page.data.session.user?.image}
      <span
        style="background-image: url('{$page.data.session.user.image}')"
        class="avatar" />
    {:else}
      <span class="avatar">
        <i class="fa-solid fa-user" />
      </span>
    {/if}
  </div>

  {#if isPanelOpen}
    <div
      id="tooltip"
      data-testid="tooltip"
      style="max-width: {panelWidth};"
      use:popperContent={popperOptions}
      use:clickOutside={() => (isPanelOpen = false)}
      transition:slide>
      <div class="panel container p-4">
        <button
          class="delete close-button"
          aria-label="delete"
          on:click={() => (isPanelOpen = false)} />
        <p class="title is-5">{$page.data.session.user.name}</p>
        <p class="subtitle is-6">{$page.data.session.user.email}</p>

        <Button
          title="Sign Out"
          isPrimary={false}
          on:clicked={() => signOut('azure-ad')} />
      </div>
    </div>
  {/if}
{:else}
  <Button
    title="Sign In"
    isPrimary={true}
    on:clicked={() => signIn('azure-ad')} />
{/if}

<style lang="scss">
  @import '../styles/popper.scss';

  .panel {
    position: relative;
    cursor: default;

    .close-button {
      position: absolute;
      top: 5px;
      right: 5px;
    }
  }

  #tooltip {
    background-color: white;
    margin: 0;
    padding: 0;
    z-index: 20;
  }

  .avatar {
    border-radius: 2rem;
    float: left;
    height: 2.8rem;
    width: 2.8rem;
    background-color: white;
    background-size: cover;
    background-repeat: no-repeat;
  }
</style>
