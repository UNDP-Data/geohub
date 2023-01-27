<script lang="ts">
  import { signIn, signOut } from '@auth/sveltekit/client'
  import { page } from '$app/stores'
  import { slide } from 'svelte/transition'
  import { clickOutside } from 'svelte-use-click-outside'
  import Popper from '$lib/popper'
  import { Button } from '@undp-data/svelte-undp-design'
  import chroma from 'chroma-js'

  let isPanelOpen = false
  let panelWidth = '350px'

  let innerWidth = 0
  $: isMobile = innerWidth < 768 ? true : false

  const name = $page.data.session?.user.name
  const names = name?.split(' ') ?? []

  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper(
    {
      placement: 'bottom-end',
      strategy: 'fixed',
    },
    [0, 45],
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

<svelte:window bind:innerWidth />

{#if $page.data.session}
  <div
    role="button"
    tabindex="0"
    on:click={togglePanel}
    on:keydown={handleKeyDown}
    use:clickOutside={() => (isPanelOpen = false)}
    use:popperRef>
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

  {#if isPanelOpen}
    <div
      id="tooltip"
      data-testid="tooltip"
      style="max-width: {panelWidth};"
      use:popperContent={popperOptions}
      transition:slide>
      <div class="panel container p-4">
        <button
          class="delete close-button"
          aria-label="delete"
          on:click={() => (isPanelOpen = false)} />
        <p class="title is-4">{$page.data.session.user.name}</p>
        {#if $page.data.session.user['jobTitle']}
          <p class="subtitle is-5 mb-2">{$page.data.session.user['jobTitle']}</p>
        {/if}
        <p class="subtitle is-6">{$page.data.session.user.email}</p>

        <Button
          title="Sign Out"
          isPrimary={false}
          on:clicked={() => signOut('azure-ad')} />
      </div>
    </div>
  {/if}
{:else}
  <button
    class="button is-primary {isMobile ? 'is-small' : 'is-normal'}"
    on:click={() => signIn('azure-ad')}><b>SIGN IN</b></button>
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
</style>
