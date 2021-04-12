<script>
	//import 'bulma/css/bulma.css';
	import Papa from "papaparse";
    import Location from "./Location.svelte";
    import Select from 'svelte-select';
    import { locations } from './stores.js';
        let showLocationModal = false;
        let showSelect = false;
	let location_name;
	/*let locations = ["United Kingdom", "Germany",  "World"]*/

	let showLocation = function(name) {
		location_name = name;
		showLocationModal = true;
	}

	let url = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv"
	let headlines = [];
        let records = [];
	let trends = {};

	let location_by_name = function(data, name) {
		return data.find(n => n.location===name)
	}

	// selects one element from each group
	// key_fn identifies group
	// selector_fn used to compare and select one element to take
	let one_from_group = function(array, key_fn, selector_fn) {
		let selected = {};
		array.forEach(element => {
			let key = key_fn(element);
			selected[key] = key in selected ? selector_fn(element, selected[key]) : element;
		});
		return(Object.values(selected));
	}

        let negate = (f)=>(...args)=>!f(...args);
        let select_countries = (locations)=>(elem)=> {
		return locations.includes(elem["location"])
	}

	// maps values linearly between the floor and ceiling
	let rescale = function(values, floor, ceiling) {
	  let min = Math.min(...values);
	  let max = Math.max(...values);
	  return(values.map(v => { return((v-min)/(max-min) * (ceiling-floor) + floor) }));
	}

	Papa.parse(url, {download:true, header: true, complete: function(results) {
		records = results.data.map(row => {
			row.date = new Date(row.date);
			return(row)
		}).filter(row => {
			return(row.location !== '')
		});


	}});
  const uniq = (sel)=>(accu,elm)=>{
    const prev = accu[accu.length - 1];
    if(prev && sel(prev) === sel(elm)){
      return accu;
    } else {
      return [...accu, elm];
    }
  };
  $: filtered = records.filter(select_countries($locations));
  $: options = records
    .filter(negate(select_countries($locations)))
    .map(({location})=>({label:location,value:location}))
    .reduce(uniq(x=>x.value),[]);
  $: headlines = one_from_group(
            filtered,
            element => { return(element.location) },
            (a,b) => { return(a.date > b.date ? a : b) }
    );
  $: {
    filtered.forEach(({location, daily_vaccinations}) => {
            let value = Number(daily_vaccinations);
            trends[location] = location in trends ? trends[location].concat(value) : [value];
    })

    for(var location in trends) {
            trends[location] = rescale(trends[location],0,100);
            if(isNaN(trends[location][0])) {
                    trends[location] = [];
            }
    }
  };
  const handle_remove = (location)=>(ev)=>{
    $locations = $locations.filter(x=>x!==location);
  };
  const handle_add = (ev)=>{
    showSelect = true;
  };
  const handle_select = (ev)=>{
    $locations = [...$locations, ev.detail.value];
    showSelect = false;
  };
</script>

<section>
        <div class="menu">
        {#if showSelect}
          <Select class="select-add" items={options} on:select={handle_select} bind:isFocused={showSelect}></Select>
        {:else}
          <button class="button-add" on:click|preventDefault|stopPropagation={handle_add}>Add</button>
        {/if}
        </div>
	{#each headlines as { location, total_vaccinations, total_vaccinations_per_hundred, state } (location)}
	<div class="thing" on:click="{showLocation(location)}">
		<svg>
			<g>
				{#each trends[location] as y, i}
				<rect x='{i*100/trends[location].length}%' y='{100-y}%' width='{100/ trends[location].length}%' height='{y}%'></rect>
				{/each}
			</g>
		</svg>
		<h1>
			{location}
		</h1>
		<h2>
			{Number(total_vaccinations).toLocaleString()}
		</h2>
                <button class="button-remove" on:click|preventDefault|stopPropagation={handle_remove(location)}>Remove</button>
	</div>
	{/each}
</section>

<style>
	section {
		position: relative;
	}
        .menu {
		background-color: rgb(118, 173, 194);
		width: 16em;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 1em;
		padding-top: .25em;
		padding-bottom: .25em;
		padding-left: 1em;
		padding-right: 1em;
		border-radius: 1em;
		display: block;
		position: relative;
        }
        .thing > .button-remove {
          border:none;
          color:white;
          background:rgba(0,0,0,0);
          position: absolute;
          display: block;
          top: 1em;
          right: 1em;
          margin: 0;
          padding: 0;
        }
        .button-add {
                margin-left: auto;
                margin-right: auto;
                display: block;
                width: 100%;
                background: rgba(0,0,0,0);
                border:none;
                margin-bottom: 0px;
                margin-top: 0px;
                color: white;
                padding:0;
        }
	.thing {
		background-color: rgb(118, 173, 194);
		color: white;
		width: 16em;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 1em;
		padding: 1em;
		border-radius: 1em;
		display: block;
		position: relative;
		overflow: hidden;
	}

	.thing > * {
		position: relative;
		color: white;
		font-family: "Roboto", sans-serif;
	}

	.thing > h1 {
		text-transform: uppercase;
		font-size: 1em;
		text-align: left;
	}

	.thing > h2 {
		font-family: "Roboto Slab", serif;
		font-size: 3em;
		font-weight: 900;
		text-align: center;
		margin: 0.75em 0 0.75em 0;
	}

	.thing > h3 {
		font-family: "Roboto Mono", monospace;
		font-size: 1.2em;
		text-align: right;
	}

	.thing > svg {
		position: absolute;
		bottom: 0;
		left: 0;
		display: block;
		width: 100%;
		height: 100%;
	}

	.thing > svg > g > rect {
		position: relative;
		fill:rgb(138, 193, 214);
	}
</style>

{#if showLocationModal}
	<Location {...location_by_name(headlines,location_name)} on:close="{() => showLocationModal = false}">
	</Location>
{/if}
