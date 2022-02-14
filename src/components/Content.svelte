
<script lang="ts">
	import { mdiWeatherSunny } from '@mdi/js';
  import Drawer, {
    AppContent,
    Content,
    Header,
    Title,
    Subtitle,
  } from '@smui/drawer';

  import Accordion, { Panel, Header as AccHeader, Content as AccContent } from '@smui-extra/accordion';
  import Paper from '@smui/paper';
  import List, { Item, Text } from '@smui/list';
  import IconButton from '@smui/icon-button'
  export let expanded = false;
  export let open = false;

  import Icon from '@iconify/svelte';
  let active = 'Vector tiles';
  let activeTab= 'Load...';
  //import Tab, { Label } from '@smui/tab';
  import TabBar from '@smui/tab-bar';
  import { Tabs, TabList, TabPanel, Tab } from './tabs.ts';
  function setActive(value: string) {
    active = value;
  }
  
  let panel;
  
</script>
<div class="drawer-container">
  <Drawer variant="dismissible" bind:open >
    
    <!-- <Header>
      <Title>Layers</Title>
    </Header> -->
    
    <Content>
      <div>
<!--        <TabBar tabs={['Load', 'Analyze', 'Docs']} let:tab bind:activeTab >-->
<!--          <Tab {tab}>-->
<!--            <Label>{tab}</Label>-->
<!--          </Tab>-->
<!--        </TabBar>-->

        <Tabs>
          <TabList>
            <Tab>Load data</Tab>
            <Tab>Layers</Tab>
            <Tab>Analyze</Tab>
            
          </TabList>

          <TabPanel>
            
            <p>This is the first tab's content</p>
            <input id="color-input" type="color">
            <label for="color-input">Pick a color</label>
            <input style="background: #007dcf; border: 1px solid #007dcf; color: #ffffff" id="submit-color" type="submit">
          </TabPanel>
          

          
          <TabPanel>
            Available layers
          </TabPanel>
          


          <TabPanel>
            <p>Create vrt layers and band based map algebra</p>
          </TabPanel>
          
          
        </Tabs>
      </div>
      <!-- <List>
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
      </List> -->
    </Content>
  </Drawer>

  <!-- Todo: Create a component for the following -->
  <AppContent class="app-content">
    <main class="main-content">
      <!-- <slot></slot> -->
      <pre class="status">Active: {active}</pre>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Consequuntur ratione tenetur quas minima obcaecati recusandae illo eum nemo, excepturi maiores repellat dicta corporis porro, culpa id omnis, nisi alias vitae. Natus fuga eius sint veniam! Reiciendis alias, veniam quidem sunt optio fugiat qui est obcaecati odio, praesentium aspernatur quia nam soluta facere voluptates deleniti voluptate provident, nisi dicta? Voluptate laborum eum corporis quae consequatur perspiciatis quasi, culpa perferendis quo repudiandae in quis dolores amet aut laudantium dolorum architecto. Ipsam, ea quibusdam? Numquam nemo non rerum dolorum enim? Enim similique minima, perferendis impedit non distinctio maiores officiis consequatur eos? Id ipsam placeat, inventore earum doloribus ex velit quos vel illo neque eveniet laboriosam perferendis reprehenderit autem quaerat! Cumque delectus hic, aliquam ratione unde ut harum quae debitis error facilis, minima quasi inventore! Molestiae, libero, recusandae at optio hic illum, similique ratione esse dignissimos odit placeat nisi fugiat. Laudantium autem neque natus quibusdam esse placeat sed quod magni libero tempore. Voluptate, minus. Nobis omnis at vitae voluptas id excepturi magnam impedit tempore perferendis, sit corporis expedita nisi delectus ea itaque! Eligendi doloremque voluptates eveniet commodi aut voluptatum debitis rem, eos maiores asperiores cum facilis id sapiente similique vel neque, reiciendis eius unde ipsam veniam deleniti est temporibus impedit saepe? Blanditiis nulla, officiis nisi, in autem enim eligendi ex sint provident dolore voluptatem expedita. Excepturi, dolorem molestiae velit facere alias sapiente ipsum modi nam sint non, necessitatibus dignissimos praesentium omnis. Soluta exercitationem ullam debitis doloribus et vel placeat porro error quidem. Nemo asperiores cumque repellendus eius recusandae eaque earum impedit sit? Quia dolores voluptatibus, magni sunt hic veniam dolor odio debitis omnis quidem eaque quos nulla architecto consequatur quis minus sapiente ratione! Adipisci, blanditiis veniam quos enim modi dicta. Harum numquam laborum quia voluptates vitae aperiam voluptate sunt aut nostrum a reprehenderit quod, excepturi quaerat, labore aliquam consequatur. Nemo hic architecto quo excepturi ducimus nesciunt, vitae qui totam similique, nobis, temporibus distinctio? Quia expedita maiores, aliquid ipsa ullam dicta nisi blanditiis? Cumque consequatur dolor eveniet blanditiis, quo sequi ad corporis ipsum aliquam, totam quaerat deserunt, nulla dolores. Explicabo, corporis! Error porro explicabo vero, excepturi in et necessitatibus culpa at doloremque facere id quibusdam inventore illum, rerum, nihil totam! Laborum, animi? Veritatis aspernatur voluptatibus dolorum fugit magni veniam sequi exercitationem nulla quaerat alias voluptatem, tenetur fuga dolorem hic suscipit qui fugiat totam vitae soluta facere ab? Provident totam aliquam laborum distinctio odit consequatur aperiam, asperiores obcaecati dignissimos commodi neque quae eaque magni. Soluta dolorem illum itaque, id nisi iure fugit, odio adipisci pariatur dolorum distinctio eum cum nulla dolor obcaecati incidunt laboriosam cupiditate non animi neque nam molestias quidem. Velit cupiditate sed ab? Animi dicta nemo eum voluptatibus debitis aspernatur blanditiis incidunt minus rem recusandae, necessitatibus ducimus a aliquam voluptate earum optio consequuntur. Eius laboriosam sapiente veritatis a non placeat voluptate nam minima sed rem necessitatibus, consequatur obcaecati praesentium id earum nisi dolor aspernatur corporis voluptatibus, et, eaque atque doloremque facilis accusamus. Odio fugit commodi reiciendis quia mollitia deleniti quis dolorem vel. Asperiores eveniet rerum rem officiis omnis harum dolor! Quo praesentium deleniti ipsa doloremque recusandae consectetur exercitationem consequatur totam aperiam iste pariatur, eos molestias enim assumenda nobis nesciunt, et quibusdam asperiores perferendis quis vitae, explicabo aliquam. Nostrum, eos facere? Soluta expedita nulla ipsum nobis non ea quia fuga natus, pariatur illo quo voluptatibus exercitationem dolores, id quos provident assumenda? Fugit, perspiciatis? Vel rem quos repellat praesentium fugiat possimus officia sequi asperiores perspiciatis repudiandae ratione modi vitae placeat quidem velit nihil tempore, veniam reiciendis, dolorum doloremque consectetur consequuntur quasi autem! Eaque modi delectus illo nisi aliquam necessitatibus vitae, odit sit molestiae commodi doloremque temporibus nulla consequuntur cupiditate id veritatis est nesciunt dicta mollitia eos minima fuga tempora quasi quidem. Ipsum saepe aut, qui labore, cupiditate laborum, amet unde possimus odit perspiciatis exercitationem tenetur dignissimos impedit ab suscipit error eius ratione totam. Voluptatum mollitia sapiente architecto odio cumque nemo eveniet deleniti illum tempore? Error ipsum quo soluta esse, facere beatae earum sequi rem corporis, necessitatibus sunt consectetur corrupti perferendis eveniet ad est deserunt sint ullam. Provident, fugit quo blanditiis, soluta corporis explicabo, rerum libero nam facilis illum architecto nobis sunt voluptate officiis ab. Atque cum dolores, molestias aliquid dolorem vel, iure iste, inventore placeat quia pariatur? Aut rem qui fuga a tempora omnis voluptate laudantium laboriosam sequi debitis totam libero inventore mollitia at dolor quidem, soluta quos sit corporis error. Quod explicabo alias facilis dolore perferendis labore temporibus veritatis? Numquam laboriosam a nam, at hic labore nesciunt. Eos beatae doloremque, earum nostrum adipisci eius enim magnam possimus porro modi animi quia necessitatibus iste odio voluptas quidem mollitia ipsum! Dolorem labore esse earum adipisci assumenda culpa quos, eius laudantium aut nesciunt aliquam ex quasi temporibus corporis, accusantium aperiam, quis rerum modi exercitationem! Voluptatum iure temporibus blanditiis? Reiciendis, magni facere impedit odit debitis quae voluptas mollitia. Similique magnam a cum impedit facilis inventore et quis repudiandae distinctio illo dolore deleniti porro iusto architecto culpa eius, totam in odio, quia ex laboriosam non! Amet tempore nesciunt inventore odio enim ipsam! Ducimus illum perferendis atque enim sapiente deleniti quo, quaerat, doloremque excepturi iste, voluptatibus veritatis animi sunt et ut? Minus harum consequatur rem qui nihil, eligendi repellat sint alias officia sequi! Aspernatur soluta excepturi asperiores explicabo, dolore quas corporis vitae debitis incidunt voluptate inventore laboriosam earum optio beatae nulla accusantium iure qui quo reprehenderit sequi accusamus eveniet aperiam omnis. Alias autem, id et repudiandae ratione fugit consequatur, accusantium modi error deserunt laborum cumque provident unde? Adipisci quisquam vitae enim sit reprehenderit quam quibusdam ea eaque? Facere quaerat reiciendis cumque nesciunt dolores iusto ipsa, reprehenderit amet architecto? At blanditiis ratione reprehenderit cum voluptates quia sequi, unde quis deleniti, ipsa debitis dicta quisquam labore fuga molestiae officiis nobis. Velit, ad recusandae. Facere et repellendus at magnam culpa nostrum necessitatibus blanditiis possimus ea dolore distinctio natus ducimus iusto, sapiente exercitationem obcaecati molestias ipsum aliquam temporibus, quam explicabo soluta suscipit beatae similique! Deserunt quae eligendi ipsum nulla dolorum, eius aperiam ipsa quasi praesentium modi ipsam in quidem quis totam nobis amet vero est.
      

    </main>

    <div class="bottom-drawer" bind:this={panel} class:expanded>
      
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
    
  </AppContent>
  <!-- Todo: Create a component for the following -->
</div>



<style>
  
  /* These classes are only needed because the
      drawer is in a container on the page. */
  .drawer-container {
    position: absolute;
    display: flex;
    height: calc(100vh - 64px);
    /* height:100vh; */
    width: 100%;
    border: 0px solid; 
    /* overflow: hidden; */
    z-index: 0;
    flex-grow: 1;
    box-sizing: border-box;
  }

  /* .app-content {
    flex: auto;
    overflow: auto;
    position: relative;
    flex-grow: 1;
  } */

  .main-content {
    overflow: hidden;
    /* padding: 66px; */
    height: 100%;
    box-sizing: border-box;
    border: 0px solid;
  }
  .bottom-drawer{
    position: absolute;
    bottom: 0;
    left: 0%;
    /* background-color: dodgerblue; */
    width: 100%;
    height: 100%;
    /* border-radius: 5px 50px 50px 5px; */
    flex-grow: 1;
    overflow: auto
  }
  


  .expanded{
    display :inline-block;
    max-height: 250px;
    /* height: 150px; */
    position: absolute;
    bottom: 0;
    left: 0%;
    /* background-color: dodgerblue; */
    width: 100%;
    
  }


  
</style>