<script lang="ts">
  import { fade } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  import { Button } from '@undp-data/svelte-undp-design'
  import Notification from '$components/controls/Notification.svelte'

  const dispatch = createEventDispatcher()
  export let dialogOpen = false
  export let title
  export let message
  export let messageType: 'warning' | 'info' = 'warning'
  export let target

  const handleCancel = () => {
    dispatch('cancel')
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel()
    }
  }
  const handleContinue = () => {
    dialogOpen = false
    dispatch('continue')
  }
</script>

<div
  class="modal {dialogOpen ? 'is-active' : ''}"
  data-testid="exit-confirmation-layer-view-container"
  transition:fade>
  <div
    class="modal-background"
    on:click={handleCancel}
    on:keydown={handleKeyDown} />
  <div class="modal-card">
    <header class="modal-card-head">
      <span class="modal-card-title">{title}</span>
      <button
        class="delete"
        aria-label="close"
        title="Close Delete Layer Button"
        on:click={handleCancel} />
    </header>
    <section class="modal-card-body has-text-weight-normal">
      <Notification
        type={messageType}
        showCloseButton={false}>
        <div class="has-text-weight-medium">
          {message}
          <br />
          <p>{target ? target : ''}</p>
        </div>
      </Notification>
    </section>
    <footer class="modal-card-foot is-flex is-flex-direction-row is-justify-content-flex-end">
      <div class="footer-button px-2">
        <Button
          title="Cancel"
          isPrimary={false}
          on:clicked={handleCancel} />
      </div>
      <div class="footer-button px-2">
        <Button
          title="Continue"
          isPrimary={true}
          on:clicked={handleContinue} />
      </div>
    </footer>
  </div>
</div>

<style lang="scss">
</style>
