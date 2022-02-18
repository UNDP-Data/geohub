<script>
    import TreeView from './TreeView.svelte'

    const tree = {
        label: "USA", children: [
            {label: "Florida", children: [
                    {label: "Jacksonville"},
                    {label: "Orlando", children: [
                            {label: "Disney World"},
                            {label: "Universal Studio"},
                            {label: "Sea World"},
                        ]},
                    {label: "Miami"},
                ]},
            {label: "California", children: [
                    {label: "San Francisco"},
                    {label: "Los Angeles"},
                    {label: "Sacramento"},
                ]},
        ],
    }
</script>

<div id="load-data-div">
<TreeView {tree}/>
</div>

<style>
    #load-data-div{
        margin-top: 10px;
    }
</style>