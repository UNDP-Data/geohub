<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Fa from 'svelte-fa'
  import { faWindowClose } from '@fortawesome/free-solid-svg-icons/faWindowClose'

  const dispatch = createEventDispatcher()

  const handleRemoveBucket = () => {
    dispatch('remove')
  }
  const handleKD = (event: KeyboardEvent) => {
    if (event.key == 'Enter') {
      handleRemoveBucket()
    }
  }
</script>

<a
  class="close-button"
  href="#"
  role="button"
  on:click={handleRemoveBucket}
  on:keydown={handleKD}>
  <Fa
    icon={faWindowClose}
    size="sm" />
</a>

<style lang="scss">
  .close-button {
    color: gray;
    width: 19.5px;
    height: 19.5px;
    cursor: pointer;
  }
</style>
