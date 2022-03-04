<script lang="ts">
  import Drawer, {
    AppContent,
    Content,
    Header,
  } from '@smui/drawer';
  import LayerList from './LayerList.svelte';
  import Tab, { Label } from '@smui/tab';
  import TabBar from '@smui/tab-bar';
  import {wtree}  from '../stores/stores'
  import TreeView from './TreeView.svelte'

  export let expanded = true;
  export let open = false;
  let active = 'Load';
  let rlabel;
  let expandedt;
  const tabs = ['Load...', "Layers", 'Analyze']
  let infoICon = expandedt ? '&#9650;':'&#9660;';



  
  let panel;


  let combine:boolean = false;
</script>

<div class="drawer-container">
  
  <Drawer variant="dismissible" bind:open >
    
    <Header>
      <TabBar tabs={['Load data', 'Layers']}   let:tab bind:active>
        <!-- Note: the `tab` property is required! -->
        <Tab {tab} class="tab">
          <Label>{tab}</Label>
        </Tab>
      </TabBar>
    </Header>
    
    <Content>

      {#if active === 'Load data'}
          <!-- <div style="position:fixed, top:0, left:0, width:100%; border: 1px solid red">
            <label>
              <input  title="Combine??" type=checkbox bind:checked={combine}>
              Combine layers???
            </label>
          </div> -->
          <TreeView tree={$wtree.tree}   />
      {:else if active === 'Layers'}
        <LayerList/>
      {:else if active === 'Analyze'}
      <!--{:else if active === 'Analyze'}-->
        Analyze
      {/if}

    </Content>
  </Drawer>

  <!-- Todo: Create a component for the following -->
  <AppContent class="app-content " >
    <main class="main-content">
      <slot></slot>
    </main>
    <!-- a LARGE  bottom ionfo panel covering the map
    use as an alternative to placing the info panel in the side bar
    -->
    <!-- <div  bind:this={panel} class:expanded>
      
      {#if expanded}
      <div class="accordion-container">
        <Accordion>
          <Panel bind:open={expanded} color="primary">
            <AccHeader>Info Panel</AccHeader>
            <AccContent>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolores error consequatur neque enim mollitia earum, obcaecati consectetur in corporis inventore. Minima doloribus dicta quas nostrum nemo porro animi sit tempore earum maxime similique quam temporibus voluptatum neque ad, aspernatur hic odit. Totam, ad autem doloribus veniam numquam, quod non commodi reiciendis excepturi consectetur explicabo dolorum. Quasi perferendis minima itaque, similique at sed asperiores iure repudiandae id qui minus. Rem dolore vitae non debitis voluptatem quam dignissimos ad, tenetur illo ducimus porro quibusdam adipisci eligendi aspernatur, neque nemo veritatis sit assumenda ut impedit voluptates dolorum eum ex consequuntur. Molestias iure nam, provident, repellendus sint sit earum quod aliquid rerum eos exercitationem harum placeat aliquam illum. Consectetur amet neque saepe accusamus ea quas. Officia saepe voluptatibus et quasi doloremque, mollitia iste maxime debitis dolorem consequatur laborum dolorum aut labore voluptates est corporis? Nihil aliquid porro nam? Nam eveniet voluptate repudiandae debitis molestias pariatur magni eos. Debitis enim voluptatem tempora omnis dolore commodi dolorem consequatur sequi, fugit, possimus est sed velit, provident ipsam. Facilis, omnis impedit! Quia saepe eligendi harum rerum voluptate dolorum ipsum ea. Id quam quibusdam, delectus ipsa porro doloribus, sequi odio asperiores cumque voluptatum inventore nemo, libero rerum unde consectetur.
            </AccContent>
          </Panel>
          
        </Accordion>
      </div>
      {/if}
    </div>
    </main> -->
    
    
  </AppContent>
  <!-- Todo: Create a component for the following -->
</div>

<style>

  :global(.s-k9Xq-arq2lfR){
    font-family: Calibri,serif;
  }



  .tab{
    border: 1px solid rebeccapurple;
    margin: 0;
  }
  /* These classes are only needed because the
      drawer is in a container on the page. */
  .drawer-container {
    position: absolute;
    display: flex;
    height: calc(100vh - calc(64px+48px));

    width: 100%;
    overflow: auto;
    z-index: 0;
    flex-grow: 1;
    /* box-sizing: border-box; */
  }


  * :global(.app-content) {
    flex: auto;
    overflow: auto;
    position: relative;
    flex-grow: 1;
  }

  .main-content {
    overflow: hidden;
    display: flex;
    height: 100%;
    flex-grow: 1;
    z-index: -1;
    flex-direction: row;
    flex-wrap: wrap;
  }
/* Tip
Toggle between .mdc_drawer__content height == 380px and height == 100%
When the bottom drawer expanded == True, .mdc_drawer__content height == 380
When the bottom drawer expanded == False, mdc_drawer__content height == 100%
Create a class in the component that checks for the expanded state*/

  :global(.contracted-browser){
    height: 60%;
  }
  :global(.expanded-browser){
    height: 100%;
  }

  :global(.expanded){
    display :inline-block;
    max-height: 40%;
    min-height: auto;

    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
    overflow:auto;
  }

</style>