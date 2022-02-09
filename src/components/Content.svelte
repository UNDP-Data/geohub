
<script lang="ts">
  import Drawer, {
    AppContent,
    Content,
    Header,
    Title,
    Subtitle,
  } from '@smui/drawer';

  //import OpenInFullIcon from '@mui/icons-material/OpenInFull';
  import List, { Item, Text } from '@smui/list';

  import IconButton from '@smui/icon-button'
  export let expanded = false;
  export let open = false;

  import Icon from '@iconify/svelte';
  let active = 'Vector tiles';
  let toggleClicked;
  let initialOff;


  function setActive(value: string) {
    active = value;
  }
  function toggle() {
    expanded = !expanded;
  }
  function collapse(){
    panel.expanded = false;
  }
  function expand(){
    panel.expanded = true;
  }
  let panel;
</script>
<div class="drawer-container">
  <Drawer variant="dismissible" bind:open anchor="right">
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
    <main class="main-content">
      <pre class="status">Active: {active}</pre>
      <h1>Map Area Map Area Map Area Map Area Map Area Map Area Map Area
        Map Area Map Area Map Area Map Area Map Area Map Area Map Area Map Area
        Map Area Map Area Map Area Map Area Map Area Map Area Map Area
        Map Area Map Area Map Area Map Area Map Area Map Area Map Area Map Area
        Map Area Map Area Map Area Map Area Map Area Map Area Map Area
        Map Area Map Area Map Area Map Area Map Area Map Area Map Area Map Area
        Map Area Map Area Map Area Map Area Map Area Map Area Map Area
      </h1>

      <!-- Start here -->
      <!-- End Here -->
      <div class="bottom-drawer" bind:this={panel} class:expanded>
        <div class="bottom-drawer-header">
          <slot name=heading {expanded}>
          <IconButton on:click={toggle} toggle bind:pressed={initialOff}>
            <Icon icon="mdi:expand-all-outline" color="white" />
          </IconButton>
          </slot>
        </div>
        {#if expanded}
          <div class="expandable">
            <slot>
              <div class="content-for-bottom-drawer">
                <h3 class="example-text">One Control</h3>
                <h3 class="example-text">Two Control</h3>
              </div>
            </slot>
          </div>
        {/if}
      </div>
    </main>

  </AppContent>
  <!-- Todo: Create a component for the following -->
</div>



<style>
  /* These classes are only needed because the
      drawer is in a container on the page. */
  .drawer-container {
    position: relative;
    display: flex;
    height: calc(100vh - 80px);
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
    overflow: hidden;
    padding: 16px;
    height: 100%;
    box-sizing: border-box;
  }
  .bottom-drawer{
    position: absolute;
    bottom: 0;
    left: 25%;
    background-color: dodgerblue;
    width: 50%;
    border-radius: 5px 50px 50px 5px;
  }
  .bottom-drawer-header{
    display: inline-flex;
  }

  .expanded{
    height: 150px;
    position: absolute;
    bottom: 0;
    left: 15%;
    background-color: dodgerblue;
    width: 70%;
  }

  /* Todo: Declare styles for a non-expanded drawer here*/

  #expand-icon{
    position: absolute;
    right: 0;
  }
  .example-text{
    color: white;
    font-family: "Bodoni MT",serif;
    padding-left: 50px;
  }

  .content-for-bottom-drawer{
    height: 100%;
  }
</style>