
<script lang="ts">
	import { mdiWeatherSunny } from '@mdi/js';
  import Drawer, {
    AppContent,
    Content,
    Header,
    Title,
    Subtitle,
  } from '@smui/drawer';

  //import LoadData from "./LoadData.svelte"

  import Accordion, { Panel, Header as AccHeader, Content as AccContent } from '@smui-extra/accordion';
  import Paper from '@smui/paper';
  import List, { Item, Text } from '@smui/list';
  import IconButton from '@smui/icon-button'
  export let expanded = true;
  export let open = false;

  import Icon from '@iconify/svelte';
  let active = 'Vector tiles';
  let rlabel;
  let expandedt;
  const tabs = ['Load...', "Layers", 'Analyze']
  let infoICon = expandedt ? '&#9650;':'&#9660;';

  import Tab, { Label } from '@smui/tab';
  import TabBar from '@smui/tab-bar';
  // import { Tabs, TabList, TabPanel, Tab } from '../components/tabs';

  // function setActive(value: string) {
  //   active = value;
  // }
  
  let panel;

  import {wtree}  from '../stores/stores'
  import TreeView from './TreeView.svelte'

</script>
<div class="drawer-container">
  <Drawer variant="dismissible" bind:open >
    <Header>
      <TabBar class="tab-header" tabs={tabs}   let:tab bind:active>
        <!-- Note: the `tab` property is required! -->
        <Tab {tab} class="tab">
          <Label>{tab}</Label>
        </Tab>
      </TabBar>
    </Header>
    
    <Content class="{expanded ? 'contracted-browser' : 'expanded-browser'}">

      {#if active === 'Load...'}
          <TreeView tree={$wtree.tree} bind:label={rlabel} bind:expanded={expandedt} />
      {:else if active === "Layers"}
        Layers
      {:else if active==='Analyze'}
        Analyze
      {/if}
      <div>
        <Accordion class="expanded">
          <Panel bind:open={expanded} color="primary" square>
            <AccHeader>{@html infoICon}</AccHeader>
            <AccContent>
              <div>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium eos et, hic illo itaque iure, libero magnam neque quidem tempore voluptas voluptate, voluptatem! Amet dignissimos illum quam ratione recusandae, repellendus?
              </div>
            </AccContent>
          </Panel>
        </Accordion>
      </div>
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
    </div> -->
    
  </AppContent>
  <!-- Todo: Create a component for the following -->
</div>

<style>
  /*:global(.mdc-tab){*/
  /*  font-size: 0.6rem;*/
  /*  height: 20px;*/
  /*}*/

  :global(.s-k9Xq-arq2lfR){
    font-family: Calibri,serif;
  }

  .tab-header{
    font-size: 2rem;
    height: 30px;
  }
  /*:global(.smui-accordion__header){*/
  /*  height: 40px;*/
  /*  width: 40px;*/
  /*  margin: 0 auto;*/
  /*  background: none;*/
  /*}*/
  .expand {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
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
    height: calc(100vh - 64px);
    /* height:100vh; */
    width: 100%;
    overflow: auto;
    /* overflow: hidden; */
    z-index: 0;
    flex-grow: 1;
    /* box-sizing: border-box; */
  }

  .acordion-container {
    max-height: 350px;
    overflow: auto;
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
    /* box-sizing: border-box; */
    /* border: 30px  whitesmoke; */
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
  .bottom-drawer{
    position: absolute;
    bottom: 0;
    left: 0;
    /* background-color: dodgerblue; */
    width: 100%;
    height: 100%;
    /* border-radius: 5px 50px 50px 5px; */
    flex-grow: 1;
    overflow: auto;
  }

  :global(.expanded){
    display :inline-block;
    max-height: 40%;
    min-height: auto;
    /* height: 150px; */
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
    overflow:auto;
  }

  /*:global(.mdc-drawer__content){*/
  /*  height: 380px;*/
  /*}*/

  /* Todo: The following styles are when the bottom drawer is contracted*/

  /*.expanded-browser{*/
  /*  height: 100%;*/
  /*}*/
</style>