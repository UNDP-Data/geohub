
<script lang="ts">
  import Drawer, {
    AppContent,
    Content,
    Header,
    Title,
    Subtitle,
  } from '@smui/drawer';

  import Button, { Label } from '@smui/button';
  import List, { Item, Text } from '@smui/list';

  export let open = false;
  let active = 'Vector tiles';

  function setActive(value: string) {
    active = value;
  }
</script>
<div class="drawer-container">
  <Drawer variant="dismissible" bind:open >
    <Header>
      <Title>Layers</Title>
      <Subtitle>Operations with Layers</Subtitle>
    </Header>
    <Content>
      <List>
        <Item
          href="javascript:void(0)"
          on:click={() => setActive('Vector tiles')}
          activated={active === 'Vector tiles'}
        >
          <Text>Vector tiles</Text>
        </Item>
        <Item
          href="javascript:void(0)"
          on:click={() => setActive('A Space Rocket')}
          activated={active === 'A Space Rocket'}
        >
          <Text>A Space Rocket</Text>
        </Item>
        <Item
          href="javascript:void(0)"
          on:click={() => setActive('100 Pounds of Gravel')}
          activated={active === '100 Pounds of Gravel'}
        >
          <Text>100 Pounds of Gravel</Text>
        </Item>
        <Item
          href="javascript:void(0)"
          on:click={() => setActive('All of the Shrimp')}
          activated={active === 'All of the Shrimp'}
        >
          <Text>All of the Shrimp</Text>
        </Item>
        <Item
          href="javascript:void(0)"
          on:click={() => setActive('A Planet with a Mall')}
          activated={active === 'A Planet with a Mall'}
        >
          <Text>A Planet with a Mall</Text>
        </Item>
      </List>
    </Content>
  </Drawer>

  <!-- Todo: Create a component for the following -->
  <AppContent class="app-content">
    
    <pre class="status">Active: {active}</pre>


    
    <slot></slot>
    <p>bottom drawer comes herer as well</p>
  </AppContent>
  <!-- Todo: Create a component for the following -->
</div>



<style>
  /* These classes are only needed because the
      drawer is in a container on the page. */
  .drawer-container {
    position: relative;
    display: flex;
    height: calc(100vh - 65px);
    width: 100%;
    /*border: 1px solid;*/
    overflow: hidden;
    z-index: 0;
  }

  * :global(.app-content) {
    flex: auto;
    overflow: auto;
    position: relative;
    flex-grow: 1;
  }

  .main-content {
    overflow: auto;
    padding: 16px;
    height: 100%;
    box-sizing: border-box;
  }
</style>