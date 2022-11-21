<script lang="ts">
  interface Category {
    name: string
    icon: string
    url: string
  }

  let selectedCategories: Category[] = []

  let categories: Category[] = [
    {
      name: 'SDG',
      icon: '/sdgs/SDG Wheel_WEB.png',
      url: '/tags?key=sdg_goal',
    },
  ]

  let subCategories: Category[] = []

  const handleSelectCategory = async (category: Category) => {
    selectedCategories = [category]

    const res = await fetch(category.url)
    const json = await res.json()
    const values: string[] = json[Object.keys(json)[0]]
    console.log(values)
    if (category.name === 'SDG') {
      const num_values: number[] = values.map((v) => Number(v)).sort((a, b) => a - b)
      console.log(num_values)
      subCategories = num_values.map((num) => {
        return {
          name: `SDG${num}`,
          icon: `/sdgs/${num}.png`,
          url: `/datasets?sdg_goal=${num}`,
        }
      })
      console.log(subCategories)
    }
  }

  const handleSelectSubcategory = async (category: Category) => {
    return category
  }
</script>

{#if selectedCategories && selectedCategories.length > 0}
  <nav
    class="breadcrumb has-arrow-separator m-2"
    aria-label="breadcrumbs">
    <ul>
      {#each selectedCategories as category, index}
        {#if index === 0}
          <li>
            <a
              on:click={() => {
                selectedCategories = []
              }}>{category.name}</a>
          </li>
        {:else}
          <li><a>{category.name}</a></li>
        {/if}
      {/each}
    </ul>
  </nav>
{/if}

<div class="columns m-1 is-multiline is-centered category-container">
  {#if selectedCategories && selectedCategories.length === 0}
    {#each categories as category}
      <div
        class="column is-one-third m-0 p-1 category"
        on:click={() => {
          handleSelectCategory(category)
        }}>
        <div class="border p-2">
          <figure class="image is-64x64 center">
            <img
              src={category.icon}
              alt="{category.name}_image" />
          </figure>
          <p class="title is-4 center">{category.name}</p>
        </div>
      </div>
    {/each}
  {:else}
    {#each subCategories as category}
      <div
        class="column is-one-third m-0 p-1 category"
        on:click={() => {
          handleSelectSubcategory(category)
        }}>
        <div class="border p-2">
          <figure class="image is-64x64 center">
            <img
              src={category.icon}
              alt="{category.name}_image" />
          </figure>
          <p class="title is-4 center">{category.name}</p>
        </div>
      </div>
    {/each}
  {/if}
</div>

<style lang="scss">
  .category-container {
    height: 100%;

    .category {
      cursor: pointer;
    }

    .border {
      border: 0.1em solid #000000;

      .center {
        text-align: center;
        display: block;
        margin: 0 auto;
      }
    }
  }
</style>
