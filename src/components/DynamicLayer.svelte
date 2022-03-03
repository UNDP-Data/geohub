<Dialog
  bind:open
  aria-labelledby="large-scroll-title"
  aria-describedby="large-scroll-content"
  surface$style="width: 850px; max-width: calc(100vw - 32px);"
>
  <Title id="large-scroll-title">Create a new combined/dynamic layer</Title>
  <Content id="large-scroll-content">
    {#each Array(3) as _item}
      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tempora, labore.
    {/each}
  </Content>
  <Actions>
    <Button action="accept">
      <Label>Done</Label>
    </Button>
  </Actions>
</Dialog>
<div style="display:flex, align-self:center">
    <Button on:click={() => (open = true)}>
        <Label>New layer from selection..</Label>
      </Button>
      
</div>

<script lang="ts">
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  
  let open = false;
</script>
